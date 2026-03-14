---
layout: blog
title: "Scaling Next.js at Cricbuzz: Cleaning up the Mess with Design Patterns"
category: Tech
---

Maintaining a fast-growing React/Next.js application is like tending to a garden; without a proper structure, everything eventually turns into a tangled mess of spaghetti code. At **Cricbuzz**, as our features expanded, we reached a point where our components were doing too much—handling UI, managing state, making API calls, and transforming complex data all in one place.
<br>
<br>
The result? Components that were impossible to test, business logic scattered everywhere, and a codebase that felt increasingly fragile.
<br>
<br>
In this post, I’ll walk you through how we cleaned up our Next.js project by implementing a robust data layer inspired by **Clean Architecture** and **DDD-lite**.

<br>

## **The Pain of Maintenance**

<br>

In a standard "messy" React app, you often find:

<br>

- **Fat Components**: UI components containing 200+ lines of `useEffect` hooks and API fetching logic.
<br>
- **Leaky Abstractions**: API response structures bleeding directly into the UI.
<br>
- **Duplication**: The same data transformation logic being copied across multiple pages.
<br>
- **Testing Nightmares**: Trying to unit test a component that requires mocking 5 global states and 3 API calls.

<br>

To solve this, we moved the "brain" of our application out of the components and into a dedicated `core` folder.

<br>

## **The Architecture: Entities, Services, and Factories**

<br>

Our new data layer lives in a `core` directory, structured to separate concerns strictly. Here is how it breaks down:

<br>

### **1. Service Layer Pattern (The Communicators)**

<br>
The `services/` folder is the ONLY place where we interact with the outside world. Whether it's a REST or some other API endpoint, services handle the networking.
- **Responsibility**: Fetching data, handling HTTP headers, and basic error catching.
- **Benefit**: If we switch from Fetch to Axios, we only change it in the service layer. Although we use a tailored HTTP service but thats a talk for some other day.

<br>
### **2. Domain / Entity Pattern (The Brains)**

<br>
The `entities/` folder contains the "smart" objects of our application. An entity represents a business concept (like a `Match` or a `Player`).
- **Responsibility**: Entities call the service methods to get raw data. They encapsulate the business logic.
- **Example**: Instead of a component calling `api.getMatch(id)`, it calls `MatchEntity.getMatchData(id)`.

<br>
### **3. Factory & Data Mapper Pattern (The Translators)**

<br>
The `factory/` folder is where the magic happens. API responses are often messy and optimized for the backend, not the UI. 
- **Responsibility**: We use the **Data Mapper Pattern** within our factories to transform raw API responses into clean, typed objects that the UI actually wants to use.
- **Benefit**: The UI never sees the "snake_case" or deeply nested structures from the API. It gets flat, clean objects.

<br>

## **Visualizing the Flow**

<br>
To better understand how these layers interact, here is the architectural blueprint we followed:

![Clean Architecture for Next.js](/assets/images/nextjs-clean-architecture.png)

<br>

### **The Request-Response Lifecycle**

<br>
1. **User Action**: A user clicks "Refresh Score" on a Match Page.
2. **Entity Action**: The `MatchEntity` calls its `refresh()` method.
3. **Service Call**: The `MatchEntity` triggers the `MatchService.fetchById()`.
4. **Data Transformation**: The raw JSON from the API is passed to the `MatchFactory`.
5. **Mapping**: The `MatchFactory` maps the backend response to a clean `Match` domain model.
6. **UI Update**: The React component receives the clean, typed object and re-renders beautifully.

<br>

## **Why This Architecture Wins**

<br>
### **1. Separation of Concerns**

<br>
Your components now focus 100% on **Rendering**. They don't care if the data comes from a REST API, a Firebase database, or local storage. They just ask an Entity for data.

<br>
### **2. Easier Testing**

<br>
Since our business logic (Entities) and transformations (Factories) are pure JavaScript/TypeScript, we can write unit tests for them without ever mounting a React component or using JSDOM.

<br>
### **3. Reusable Services**

<br>
Need the same API call on the Home screen and the Search screen? Just call the same Service method. No more duplicated `fetch()` calls.

<br>
### **4. Consistent Data Transformation**

<br>
By using Factories, we ensure that a `Match` object looks exactly the same everywhere in the app, regardless of which API endpoint provided it. This eliminates "undefined" errors when the API slightly changes its response format.

<br>

## **Clean Architecture & DDD-lite**
<br>
If this structure feels familiar, it’s because it’s a lightweight version of **Domain-Driven Design (DDD)** and **Clean Architecture**. 

<br>

We’ve essentially created:
- **Infrastructure Layer**: Services
- **Domain Layer**: Entities
- **Application Logic**: Factories

<br>

By treating the frontend like a serious application rather than just a "UI wrapper," we’ve made our Next.js project at **Cricbuzz** scalable, predictable, and—most importantly—fun to work in again.

<br>

**Happy Structuring!**
