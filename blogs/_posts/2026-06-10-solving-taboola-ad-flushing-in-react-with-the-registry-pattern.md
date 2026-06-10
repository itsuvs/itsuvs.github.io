---
layout: blog
title: "Solving Taboola Ad Flushing in React with the Registry Pattern"
category: Tech
---

Integrating third-party script tags and ad networks in a modern single-page application (SPA) or framework like Next.js is rarely straightforward. Traditional script tags assume a static HTML world where everything loads sequentially. In React, components mount asynchronously, routes change dynamically, and rendering is decentralized.

<br>
Recently, we faced a particularly tricky challenge with **Taboola Ads**. The issue wasn't just about loading the script, but *how* the ad slots had to be registered and flushed to the network.

<br>
In this post, we'll dive into why Taboola's API requirements clashed with React's component lifecycle, and how we solved it using a clean implementation of the classic **Registry Pattern**.

<br>
---

## **The Problem: The Taboola Flush Constraint**

<br>
To understand the solution, we first need to understand how Taboola expects to receive ad slots. Taboola uses a global queue called `window._taboola`. To render ads on a page, you need to push each placement configuration to this queue and then trigger a final `flush` command:

<br>
```javascript
// 1. Push placements
window._taboola.push({ mode: 'grid', container: 'taboola-below-article', placement: 'Below Article' });
window._taboola.push({ mode: 'thumbs', container: 'taboola-right-sidebar', placement: 'Right Sidebar' });

// 2. Flush them all together
window._taboola.push({ flush: true });
```

<br>
Here's the catch: **Taboola requires all ad slots on a page to be flushed together in a single operation.** 

<br>
If you try to push and flush them one by one as individual components render:
- The first ad slot mounts, pushes itself to the queue, and triggers `{ flush: true }`.
- Taboola processes the queue, renders the first slot, and freezes the page's ad environment.
- The remaining ad slots mount later, push themselves to the queue, but subsequent flushes fail or result in broken, unrendered ad containers because Taboola expects a single flush event for the page view.

<br>
In a component-driven architecture like React, this is a major problem. If you have several `<TaboolaAdUnit />` components scattered across your component tree, each component has its own lifecycle. By default, they don't know about each other, and they don't know when the "last" ad unit has mounted.

<br>
How do we gather all the ad slots on the page first, push them together, and trigger a single flush only when the page is ready?

<br>
---

## **The Solution: The Registry Pattern**

<br>
The **Registry Pattern** is a well-known design pattern that provides a centralized place to store and retrieve objects or state. Instead of trying to coordinate between decentralized React components using global state managers or complex prop drilling, we can use a simple, vanilla JavaScript class that acts as a registry.

<br>
Here is how the architecture works:
1. **The Registry** is a singleton class that holds an array of all active ad placements.
2. **The Ad Units** (`TaboolaAdUnit`) register their placement configuration (mode, container, placement name) to the Registry during their mount phase (`useEffect`).
3. **The Coordinator** (`TaboolaAdProvider` or parent page controller) waits for the page structure to be ready, reads all registered placements from the Registry, pushes them in bulk to `window._taboola`, and triggers a single `{ flush: true }`.
4. **Cleanup** happens on navigation or unmount, clearing the registry and resetting the flush state.

<br>
Let’s look at the implementation.

<br>
---

## **Step 1: The Taboola Registry**

<br>
We define a lightweight `TaboolaRegistry` class. This class is instantiated once (as a singleton) and exported so both components and providers can access it.

<br>
```typescript
class TaboolaRegistry {
    private placements: Placement[] = [];

    add(p: Placement) {
        this.placements.push(p);
    }

    getAll() {
        return this.placements;
    }

    clear() {
        this.placements = [];
    }
}

// Export a singleton instance
export const taboolaRegistry = new TaboolaRegistry();
```

<br>
The registry is extremely simple, keeping it free of framework-specific overhead. It just accumulates placement configurations.

<br>
---

## **Step 2: Self-Registering Ad Units**

<br>
Each individual ad slot is rendered using a `<TaboolaAdUnit />` component. Instead of immediately pushing itself to `window._taboola` on mount, it registers its configuration to our singleton registry.

<br>
```tsx
export const TaboolaAdUnit = ({ mode, container, placement, isSideRails }: Props) => {

    const [showTaboola, setShowTaboola] = useState(true);

    useEffect(() => {

        if (isSideRails && window.innerWidth < 1024) {
            setShowTaboola(false);
        }else{
            taboolaRegistry.add({ mode, container, placement });
        }

    }, []);
```

<br>
Notice that we still control visibility locally (e.g., hiding side-rails on mobile viewports). If the ad is not supposed to show, we do not add it to the registry.

<br>
---

## **Step 3: The Coordinator (TaboolaAdProvider)**

<br>
The coordinator component (typically a wrapper around the layout or a page-level provider) handles the execution of pushing and flushing. It runs a single `useEffect` that executes *after* child components have finished mounting and registering themselves.

<br>
```typescript
useEffect(() => {

        if (isTaboolaEnabled) {

            if (!window._taboola) {
                window._taboola = [];
            }

            if (hasFlushed.current) return;

            // 1. Read all placements from TaboolaAdUnit defined in the page
            const placements = taboolaRegistry.getAll();

            // 2. Push all placements to window._taboola
            placements.forEach((p) => {
                window._taboola.push({
                    mode: p.mode,
                    container: p.container,
                    placement: p.placement,
                    target_type: "mix",
                });
            });

            // 3. Single flush
            window._taboola.push({ flush: true });

            hasFlushed.current = true;

        }

        // 4. Cleanup for next navigation
        return () => {
            taboolaRegistry.clear();
            hasFlushed.current = false;
        };
    }, [brand, pathname, isTaboolaEnabled]);
```

<br>
---

## **How the Lifecycle Syncs Up**

<br>
Because of how React’s rendering engine works, child components mount and run their `useEffect` hooks **before** the parent’s `useEffect` runs. 

<br>
Here is the sequence of execution:
1. The `TaboolaAdProvider` renders, followed by child `<TaboolaAdUnit>` components.
2. Each `<TaboolaAdUnit>` mounts and runs its `useEffect`, calling `taboolaRegistry.add()`.
3. Once all children are mounted, the `TaboolaAdProvider`'s `useEffect` runs.
4. The provider calls `taboolaRegistry.getAll()`, fetching every ad configuration registered on the page.
5. The provider pushes them all sequentially and issues a single `flush` call to Taboola.
6. When the user navigates to a new route, the cleanup function runs, clearing the registry and resetting `hasFlushed` for the next page view.

<br>
---

## **Why This Pattern Wins**

<br>
1. **Solves the Timing Issue**: It completely avoids race conditions by decoupling "defining where an ad goes" (the unit component) from "initiating the network flush" (the provider).
2. **Framework Independent**: The registry itself is pure JS/TS, making it testable and easy to migrate if we ever change frameworks.
3. **No Global State Overhead**: We didn't need to bloat our Redux store or React Context with transient ad unit configurations. A simple registry singleton was all it took.
4. **Clean Navigation Lifecycles**: Handling dynamic routing in Next.js/SPAs becomes trivial since we can clear the registry and reset the flushing state during unmount cleanup.

<br>
When dealing with old-school, imperative third-party script APIs in a modern, declarative React app, the Registry Pattern is a lifesaver. It bridges the gap between decentralized components and centralized coordination, keeping your code clean and your ads rendering perfectly.
