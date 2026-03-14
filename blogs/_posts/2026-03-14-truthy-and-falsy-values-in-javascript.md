---
layout: blog
title: "The Interview That Revealed a Crucial JavaScript Gap: Truthy and Falsy Values"
category: Tech
---

I recently had the opportunity to interview a candidate from TCS (Tata Consultancy Services) for a fullstack engineering role at <a href="https://cricbuzz.com" target="_blank" rel="noopener noreferrer"><strong>Cricbuzz</strong></a>. While interviewing, I sometimes like to dive into the seemingly simple parts of JavaScript, as they often reveal how deeply a developer understands the core behaviors of the language. 

<br>
During our conversation, I asked him a basic question about JavaScript objects: *"If you try to access a key that does not exist in an object, what would be the value returned?"*
<br>
<br>
He confidently answered, *"undefined"*. 
<br>
<br>
That is correct. But to probe a little deeper, I followed up with: *"Why is it `undefined` and not `null`?"*
<br>
<br>
At this point, he got visibly confused. To help him out, I shifted the line of questioning to see if he grasped the relationship between the two. 
<br>
<br>
*"Is `null === undefined`?"* I asked.
<br>
<br>
He said, *"No,"* but upon asking why, he couldn't explain it. 
<br>
<br>
I then asked him two simple boolean logic questions: 
<br>
<br>
*"What is the negation (`!`) of `undefined`?"* 
<br>
<br>
He correctly answered, *"true"*. 
<br>
<br>
*"And what is the negation of `null`?"* 
<br>
<br>
Again, he correctly answered, *"true"*.
<br>
<br>
Then I asked the trap question: *"If the negation of both `null` and `undefined` is `true`, does that imply `null` is equal to `undefined`?"*
<br>
<br>
He paused, thought for a moment, and said, *"Yes."*
<br>
<br>
This interaction highlighted a major gap in his JavaScript knowledge. He had memorized certain behaviors—like the fact that `!null` is true—but he fundamentally missed the underlying concept of **truthy** and **falsy** values. He assumed that because two values coerce to the same boolean result when negated, they must be fundamentally equal. This is a crucial concept in JavaScript that dictates how conditions and type coercions work under the hood.

<br>
---

## **Understanding Truthy and Falsy Values**

<br>

In JavaScript, a value is considered **truthy** if it translates to `true` when evaluated in a boolean context. Conversely, a value is **falsy** if it translates to `false`. 
<br>
<br>
JavaScript uses type coercion in boolean contexts, such as `if` statements, loops (`while`, `for`), and logical operations (`&&`, `||`, `!`). When JavaScript expects a boolean, it will quietly convert whatever value you give it into a boolean.

<br>
### **The Falsy Values**
<br>
It's easiest to memorize the falsy values because there are only a few of them. In JavaScript, there are exactly **8 falsy values**:
<br>
<br>
1. `false` (The boolean false itself)
2. `0` (The number zero)
3. `-0` (Negative zero)
4. `0n` (BigInt zero)
5. `""` (Empty string)
6. `null` (The intentional absence of any object value)
7. `undefined` (A variable that has not been assigned a value)
8. `NaN` (Not a Number)
<br>
<br>
If a value is not on this list, it is **truthy**. 
This means empty arrays (`[]`), empty objects (`{}`), spaces in strings (`" "`), and even the string `"false"` are all truthy!
<br>
<br>
### **Revisiting the Interview Question**
<br>
Why is `!undefined` true and `!null` true? Because both `undefined` and `null` are on the falsy list. The logical NOT operator (`!`) coerces the value to a boolean and then flips it. Since they are falsy (`false`), flipping them results in `true`.
<br>
<br>
But does that mean `null == undefined`? 
Interestingly, `null == undefined` *is* actually `true` in JavaScript due to the language's specific rules for loose equality (`==`). However, `null === undefined` (strict equality) is `false` because they are of different types (`object` vs `undefined`). They are definitely not equal *because* their negations are both true. By the candidate's logic, `!0` is true and `!""` is true, so `0` must equal `""` (which loosely it does, but for different coercion reasons, not because both are falsy). 
<br>
<br>

## **Why Are Truthy and Falsy Values Important?**

<br>

Understanding truthy and falsy values isn't just for passing interviews—it's essential for writing clean, concise, and bug-free JavaScript.

<br>
### **1. Concise Conditionals**
<br>
Instead of explicitly checking if a variable exists, is not null, and is not an empty string, you can simply rely on its truthiness:

```javascript
// The verbose way
if (userName !== null && userName !== undefined && userName !== "") {
    console.log("Welcome, " + userName);
}

// The clean (truthy) way
if (userName) {
    console.log("Welcome, " + userName);
}
```

### **2. Default Values with Logical OR (`||`)**
<br>
The `||` operator doesn't actually return a boolean; it returns the first **truthy** value it encounters.

```javascript
// If 'user.name' is undefined, null, or "", it falls back to "Guest"
const displayName = user.name || "Guest"; 
```
[*Note: If `0` or `false` are valid values (like a score of 0), you should use the Nullish Coalescing Operator (`??`) instead, which only checks for `null` or `undefined`.*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)

<br>
### **3. Short-Circuiting with Logical AND (`&&`)**
<br>
Similarly, the `&&` operator returns the first **falsy** value it encounters, or the last truthy value. This is heavily used in React for conditional rendering:

```javascript
// If isLoggedIn is truthy, the <Dashboard /> component renders.
// If it's falsy, the rendering short-circuits and nothing is rendered.
{isLoggedIn && <Dashboard />}
```

<br>

## **The Takeaway**
<br>
The difference between a junior developer and a seasoned engineer often lies in these foundational concepts. Memorizing what happens when you type `!null` is easy, but understanding *why* it happens allows you to debug complex applications, write cleaner code, and avoid unexpected edge cases.

Next time you write an `if` statement, remember the truthy and falsy rules. They are the invisible gears making your JavaScript logic turn!
