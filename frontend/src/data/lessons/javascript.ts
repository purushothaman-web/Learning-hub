import type { Lesson } from '../../types/curriculum';

export const javascriptLessons: Lesson[] = [
  {
    id: 'js_0',
    title: 'Execution Context & The Call Stack',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'JavaScript is a single-threaded, synchronous language. This means it can only do one thing at a time. The **Execution Context** is the "environment" where your code is evaluated and executed.',
      'When the JS engine starts, it creates a "Global Execution Context". Every time you call a function, it creates a new context and pushes it onto the **Call Stack**. The engine only executes the context that is currently at the top of the stack.',
      'Understanding the Call Stack explains why "Maximum call stack size exceeded" errors happen (too much recursion) and how the engine keeps track of where it is in a complex program. It is the "brain" of the JS runtime.'
    ],
    code: `function multiply(a, b) {
  return a * b; // 3. multiply runs and returns
}

function square(n) {
  return multiply(n, n); // 2. square calls multiply
}

function printSquare(n) {
  const result = square(n); // 1. printSquare calls square
  console.log(result);
}

printSquare(4);

// ── Call Stack Visualization ──
// [ multiply ]    <-- Top (Executing)
// [ square ]
// [ printSquare ]
// [ (global) ]`
  },
  {
    id: 'js_1',
    title: 'Variables, Scope & Shadowing',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Variables created with `let` and `const` have **Block Scope** — they only exist inside the pair of curly braces `{}` they were created in. Variables created with `var` are **Function Scoped**, which leads to many bugs and is generally avoided in modern JS.',
      'The **Scope Chain** is how JS looks for a variable. If it\'s not in the current block, it looks in the parent, and so on, up to the global scope. This allows inner blocks to "see" variables from outer blocks.',
      '**Shadowing** happens when you declare a variable with the same name inside a block. The inner variable "shadows" (hides) the outer variable for that block. This is powerful but can lead to confusion if overused.'
    ],
    code: `const user = "Global User"; // Outer scope

{
  const user = "Local User"; // Shadowing!
  console.log(user); // "Local User"
  
  const age = 25; // Block scoped
}

console.log(user); // "Global User"
// console.log(age); // ❌ Error: age is not defined outside the block`
  },
  {
    id: 'js_2',
    title: 'The Event Loop & Async JS',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'If JS is single-threaded, how can it fetch data while the page stays interactive? The **Event Loop** is the answer. It handles "delegating" slow tasks (like timers or API calls) to the browser\'s background APIs.',
      'When an async task finishes, it goes to the **Callback Queue** (specifically the Macro-task or Micro-task queue). The Event Loop waits for the Call Stack to be empty, then it pushes the next waiting task onto the stack.',
      'Micro-tasks (like `Promises`) have higher priority than Macro-tasks (like `setTimeout`). This is why a `.then()` callback will almost always run before a `setTimeout` even if the time is 0ms.'
    ],
    code: `console.log("1. Start");

setTimeout(() => {
  console.log("4. Macro-task (Timer)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Micro-task (Promise)");
});

console.log("2. End");

// ── Output Order ──
// 1. Start
// 2. End
// 3. Micro-task (Promise)
// 4. Macro-task (Timer)

// Why? Promise (Micro-task) has priority over setTimeout (Macro-task).`
  },
  {
    id: 'js_3',
    title: 'Closures & Power Patterns',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      'A **Closure** is a function that "remembers" its outer scope even after that outer scope has finished executing. It is a fundamental "superpower" of JavaScript.',
      'Closures are used to create "Private Data". Since variables inside a function can\'t be accessed from the outside, but can be accessed by an inner function, you can create objects that expose methods but hide their internal state.',
      'Every time you use a hook in React (like `useState`), you are relying on closures. The state is "closed over" by your component function, allowing React to preserve it between re-renders.'
    ],
    code: `function createCounter() {
  let count = 0; // Private variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
// console.log(count); // ❌ Error: count is private!`
  },
  {
    id: 'js_4',
    title: 'Prototypes & Inheritance',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'JavaScript uses **Prototypal Inheritance**. Every object has a "prototype" — another object it inherits properties and methods from. If you look for a method on an object and it\'s not there, JS looks for it on its prototype.',
      'This is significantly different from "Classical Inheritance" (Java/C++). In JS, we link objects together rather than copying classes. The `Array.prototype` object is where methods like `.map()` and `.filter()` actually live.',
      'Modern `class` syntax is just "Syntactic Sugar" over prototypes. It looks like Java, but under the hood, it\'s still creating a prototype link. Understanding this makes debugging performance and complex libraries much easier.'
    ],
    code: `const animal = {
  eat() { console.log("Eating..."); }
};

const dog = Object.create(animal);
dog.bark = () => console.log("Woof!");

dog.bark(); // "Woof!"
dog.eat();  // "Eating..." (Found on the prototype!)

// ── Verification ──
console.log(Object.getPrototypeOf(dog) === animal); // true`
  },
  {
    id: 'js_5',
    title: 'Higher-Order Functions & Callbacks',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'A **Higher-Order Function** is a function that either takes another function as an argument, returns a function, or both. This is the foundation of functional programming in JavaScript.',
      'Callbacks are the functions passed as arguments. When you use `.map()`, `.filter()`, or `.reduce()`, you are using higher-order functions. The logic of "what" to do is separated from the logic of "how" to iterate.',
      'This pattern allows for incredibly concise and readable code. Instead of writing complex `for` loops with manual counters and push operations, you declare your intent and let the higher-order function handle the execution.'
    ],
    code: `const numbers = [1, 2, 3, 4, 5];

// .map() is a higher-order function
// (num) => num * 2 is the callback
const doubled = numbers.map(num => num * 2);

// .filter() is a higher-order function
const evens = numbers.filter(num => num % 2 === 0);

// Using a custom HOF to create "logger" functions
function createLogger(prefix) {
  return (message) => console.log(\`[\${prefix}] \${message}\`);
}

const errorLogger = createLogger("ERROR");
errorLogger("Database connection failed"); // [ERROR] Database connection failed`
  },
  {
    id: 'js_6',
    title: 'Async/Await & Error Handling',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      '**Async/Await** is a way to write asynchronous code that looks and behaves like synchronous code. It is built on top of Promises but provides a much cleaner syntax avoiding "Promise chaining" or "Callback Hell".',
      'The `await` keyword pauses the execution of the async function until the Promise resolves. This makes the logic flow much easier to follow, especially when multiple async operations depend on each other.',
      '**Error Handling** is handled with standard `try/catch` blocks. This allows you to catch errors from both synchronous and asynchronous operations in the same place, making your code more resilient and easier to debug.'
    ],
    code: `async function fetchUserDashboard(userId) {
  try {
    // These look like sync calls but are non-blocking!
    const user = await api.getUser(userId);
    const posts = await api.getPosts(user.id);
    
    return { user, posts };
  } catch (error) {
    console.error("Failed to load dashboard:", error.message);
    throw error; // Rethrow or handle gracefully
  }
}

// Parallel execution with Promise.all
async function fetchMultiple(ids) {
  const requests = ids.map(id => api.getData(id));
  return await Promise.all(requests);
}`
  },
  {
    id: 'js_7',
    title: 'Project Execution: Real-time Data Filter',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will build a search and filter system for a list of data using High-Order Functions. You will implement a "debounce" closure to prevent the search from firing on every single keystroke, improving performance.',
      'The goal is to demonstrate mastery of array methods (`filter`, `includes`, `sort`) and async data fetching. You must also handle the "Loading" and "Error" states gracefully to provide a professional user experience.',
      '**Studio Task**: Build the JobTrackr dashboard filter. Implement a debounced search bar that filters the job list by title or company, but only fires after 300ms of user inactivity.'
    ],
    code: `// ── Debounce Closure Pattern ──
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce((query) => {
  console.log("Searching for:", query);
  // Fetch and filter logic here
}, 300);

// Usage in an input:
// <input onChange={(e) => handleSearch(e.target.value)} />`
  },
  {
  id: 'js_8',
  title: 'DOM Manipulation & Traversal',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'JavaScript becomes powerful when it interacts with the DOM. The DOM is a tree of elements that you can query, modify, and listen to.',
    '`document.querySelector` and `querySelectorAll` are the modern ways to select elements. Once selected, you can change text, styles, attributes, or structure.',
    'Efficient DOM updates are important. Avoid unnecessary reflows by batching updates or using `classList` instead of inline styles.'
  ],
  code: `const title = document.querySelector('h1');
title.textContent = "Updated Title";

const btn = document.querySelector('.btn');
btn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});`
},
{
  id: 'js_9',
  title: 'Event System: Bubbling & Delegation',
  badge: 'Deep Dive',
  badgeClass: 'badge-concept',
  content: [
    'Events in JavaScript propagate in two phases: capturing (top-down) and bubbling (bottom-up). By default, most handlers run during bubbling.',
    'Event Delegation is a powerful pattern where you attach a single event listener to a parent instead of multiple children.',
    'This improves performance and works well for dynamic content.'
  ],
  code: `document.querySelector('.list').addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    console.log('Item clicked:', e.target.textContent);
  }
});`
},
{
  id: 'js_10',
  title: 'The "this" Keyword Deep Dive',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '`this` refers to the object that is calling the function. Its value depends on how the function is invoked, not where it is defined.',
    'In regular functions, `this` is dynamic. In arrow functions, `this` is lexically inherited from the surrounding scope.',
    'Understanding `this` is crucial when working with classes, event handlers, and frameworks like React.'
  ],
  code: `const user = {
  name: "Naresh",
  greet() {
    console.log(this.name);
  }
};

user.greet(); // "Naresh"

const greet = user.greet;
greet(); // undefined (lost context)`
},
{
  id: 'js_11',
  title: 'ES Modules & Code Structure',
  badge: 'Practice',
  badgeClass: 'badge-practice',
  content: [
    'Modern JavaScript uses ES Modules to organize code. Instead of one large file, you split logic into reusable modules.',
    '`export` exposes functions or variables, and `import` allows you to use them elsewhere.',
    'This improves maintainability, readability, and scalability of large applications.'
  ],
  code: `// utils.js
export function add(a, b) {
  return a + b;
}

// app.js
import { add } from './utils.js';
console.log(add(2, 3));`
},
{
  id: 'js_12',
  title: 'Fetching APIs & Data Handling',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    'Most real-world apps depend on APIs. The `fetch` API allows you to make HTTP requests from the browser.',
    'Always handle loading, success, and error states. Network failures and server errors must be handled gracefully.',
    'Parsing JSON responses and validating data is critical to avoid runtime bugs.'
  ],
  code: `async function getUsers() {
  try {
    const res = await fetch('/api/users');
    
    if (!res.ok) throw new Error('Failed request');
    
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err.message);
  }
}`
},
{
  id: 'js_13',
  title: 'Memory Management & Performance',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'JavaScript uses automatic garbage collection, but memory leaks can still happen when references are unintentionally kept alive.',
    'Common causes include unused event listeners, closures holding large data, or global variables.',
    'Optimizing performance involves minimizing unnecessary re-renders, avoiding heavy computations in loops, and cleaning up resources.'
  ],
  code: `// Memory leak example
function attach() {
  const bigData = new Array(1000000).fill('*');
  
  document.body.addEventListener('click', () => {
    console.log(bigData.length);
  });
}

// Fix: remove listener when not needed`
}
];
