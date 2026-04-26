---
layout: blog
title: "How a Recursive setTimeout and Improper Response Handling Broke Our Analytics"
category: Tech
---

At <a href="https://cricbuzz.com" target="_blank" rel="noopener noreferrer"><strong>Cricbuzz</strong></a>, we deal with massive traffic, especially during live matches. Maintaining a seamless user experience while handling millions of concurrent connections requires robust background services. One such service we have is responsible for polling to authenticate users at regular intervals. 

<br>
It seemed like a straightforward task: keep the user session alive by pinging an authentication endpoint every few minutes. However, a small oversight in recursion and a "clever" fix for an edge case ended up nearly blinding our analytics.

<br>
---

## **The Recursive Poll**

<br>
When implementing polling, I chose a **recursive `setTimeout`** over a standard `setInterval`. The reasoning was sound: `setInterval` triggers at fixed intervals regardless of when the previous request finished, which can lead to a "queue" of requests if the network is slow. A recursive `setTimeout` ensures that the next poll only starts *after* the current one has completed.

<br>
The code looked something like this:

```javascript
function pollAuthService() {
    authenticateUser()
        .then(() => {
            // Wait for the interval before polling again
            setTimeout(pollAuthService, POLLING_INTERVAL);
        })
        .catch((err) => {
            console.error("Auth failed", err);
            // Even on failure, we were retrying
            setTimeout(pollAuthService, POLLING_INTERVAL);
        });
}
```

<br>
It worked perfectly... until it didn't.

<br>
---

## **The Edge Case: The "Zombie" Tab**

<br>
I had overlooked a very common user behavior: the unclosed browser tab. 

<br>
Cricket fans often keep a Cricbuzz tab open for days, even after a match is over. They might lock their laptops or just forget about the tab entirely. Because my recursion had no "kill switch" or maximum retry limit for idle sessions, these tabs kept firing authentication requests indefinitely. 

<br>
As the number of these "zombie" tabs grew, the traffic to our auth service started to spike. It wasn't a DDoS attack, but it was starting to feel like one.

<br>
---

## **The "Fix" That Made It Worse**

<br>
To solve the unclosed tab issue, I thought I’d be smart. I decided that if a session had been active for too long without any user interaction, the server would start returning a **4XX status code**. 

<br>
The idea was that the client-side code would see the 4XX, recognize the session as "stale," and finally break the recursion. 

<br>
However, I forgot one crucial thing: **infrastructure-level logging.**

<br>
Our Docker containers and load balancers were configured to log every non-200 response by default. Suddenly, our log servers were flooded. Between the relentless recursive requests from thousands of open tabs and the server now spitting out 4XX errors for all of them, our logs exploded.

<br>
At one point, **nearly 80% of our total logs** were just these "unclosed tab" authentication errors.

<br>
---

## **The Analytics Meltdown**

<br>
When 80% of your logs are noise, your analytics become useless. 

<br>
It became nearly impossible to identify real user behavior patterns or spot meaningful issues. Our dashboards were showing massive "error rates" that weren't actually errors—they were just our own session-killing logic screaming into the void. We couldn't tell if a spike in 4XX was a genuine auth failure or just more people forgetting to close their tabs.

<br>
We had essentially "broken" our own ability to see what was happening on the platform.

<br>
---

## **The Resolution**

<br>
Luckily, the issue began to resolve itself as users naturally started closing those old tabs after a few days. But the real fix came from a change in perspective.

<br>
I realized that using HTTP error codes (4XX) for a "business logic" event like a stale session was the wrong approach for our scale. I refactored the response handling to pass **200 OK** status codes even for these stale states, but with a specific payload (e.g., `{ "status": "session_expired" }`). This allowed the client to stop the recursion gracefully without triggering the infrastructure-level error logging.

<br>
---

## **The Moral**

<br>
The lesson here is that **code doesn't exist in a vacuum.** 

<br>
As developers, we often focus solely on the logic: *"Does the recursion stop? Yes."* But we must also consider the side effects. Every request, every response code, and every log entry has a cost. When building at scale, "clever" solutions can often become your biggest bottlenecks if they don't play well with your infrastructure and analytics.

<br>
Always remember: **Clean code is great, but clean logs are just as important for a healthy production environment.**
