import type { Lesson } from '../../types/curriculum';

export const htmlCssLessons: Lesson[] = [
  {
    id: 'hc_0',
    title: 'Modern HTML Architecture',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'HTML (HyperText Markup Language) is the bone structure of the web. Modern HTML5 isn\'t just about tags; it\'s about **Semantics**. Using `<article>`, `<section>`, `<nav>`, and `<aside>` instead of generic `<div>` tags tells search engines and screen readers exactly what your content means.',
      'Accessibility (a11y) starts here. Proper heading hierarchy (`h1` through `h6`) and `aria-label` attributes aren\'t "extras" — they are core requirements for professional web development. A site that looks beautiful but can\'t be navigated by a screen reader is a failed project.',
      'The DOM (Document Object Model) is the tree-like structure the browser creates from your HTML. Understanding that every tag is an "Element" in this tree is the key to mastering both CSS and JavaScript. You aren\'t just writing text; you are constructing a live, interactive data structure.'
    ],
    code: `<!-- ── Semantic HTML Structure ── -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>The Future of Web Semantics</h1>
    <p>Semantic tags improve SEO and accessibility...</p>
    
    <section aria-labelledby="comments-title">
      <h2 id="comments-title">User Comments</h2>
      <!-- Comment items -->
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2024 Learning Hub</p>
</footer>`
  },
  {
    id: 'hc_1',
    title: 'The CSS Box Model & Flexbox',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Every single element on a webpage is a rectangular box. The **Box Model** consists of: Content (the text/image), Padding (space inside the border), Border (the edge), and Margin (space outside the border). 90% of layout bugs come from misunderstanding how these relate.',
      '**Flexbox** is the modern engine for 1-dimensional layouts (rows or columns). It solved the "nightmare of centering" that plagued web development for 20 years. By setting `display: flex` on a parent, you gain total control over the alignment and distribution of its children.',
      'The most important Flexbox properties: `justify-content` (aligns along the main axis) and `align-items` (aligns along the cross axis). Mastering these two properties alone allows you to build complex, responsive navbars and cards with ease.'
    ],
    code: `/* ── The Box Model ── */
.card {
  width: 300px;
  padding: 20px;    /* Space inside */
  border: 1px solid #ddd;
  margin: 10px;     /* Space outside */
  box-sizing: border-box; /* 👈 ESSENTIAL: include padding in width */
}

/* ── Flexbox Centering ── */
.container {
  display: flex;
  justify-content: center; /* Horizontally centered */
  align-items: center;     /* Vertically centered */
  height: 100vh;
  gap: 1.5rem;             /* Space between items */
}

.item {
  flex: 1; /* Grow to fill available space */
}`
  },
  {
    id: 'hc_2',
    title: 'CSS Variables & Theme Systems',
    badge: 'Design',
    badgeClass: 'badge-practice',
    content: [
      'Hardcoding colors like `#3b82f6` everywhere makes maintenance impossible. **CSS Variables** (Custom Properties) allow you to define a single source of truth for your design tokens.',
      'By defining sets of variables at the `:root` level, you can implement Dark Mode with just a few lines of code. Instead of changing every color individually, you just swap the variable values.',
      'Modern design systems use naming conventions like `--bg-surface`, `--text-primary`, and `--accent`. This abstracts the "role" of a color from its specific value, making your UI much more flexible and scalable.'
    ],
    code: `:root {
  /* Design Tokens */
  --primary: #3b82f6;
  --bg-base: #ffffff;
  --text-main: #1f2937;
}

[data-theme='dark'] {
  --bg-base: #0f172a;
  --text-main: #f8fafc;
}

body {
  background-color: var(--bg-base);
  color: var(--text-main);
  transition: background-color 0.3s ease;
}

.btn {
  background-color: var(--primary);
  /* Hover effect using modern color-mix */
  &:hover {
    filter: brightness(0.9);
  }
}`
  },
  {
    id: 'hc_3',
    title: 'Responsive Design & Media Queries',
    badge: 'Layout',
    badgeClass: 'badge-concept',
    content: [
      'The web is no longer "desktop only". **Responsive Design** ensures your site looks great on anything from an iPhone to a 50-inch TV. The core tool here is the **Media Query**.',
      'Always use a **Mobile-First** approach: write your base CSS for small screens first, then use media queries to add layout complexity for larger screens. This prevents "bloated" mobile experiences.',
      'Viewport units (`vw`, `vh`, `vmin`) and relative units (`rem`, `em`) are your best friends. Avoid pixel-perfect layouts; instead, build "fluid" layouts that adapt to their container\'s size using percentages and `clamp()`.'
    ],
    code: `/* Mobile-First: Base styles for phone */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 4 columns */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Responsive Typography */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}`
  },
  {
    id: 'hc_4',
    title: 'CSS Grid: 2D Layout Mastery',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      'While Flexbox is great for rows **or** columns, **CSS Grid** is the powerhouse for rows **and** columns (2D layouts). It allows you to build complex magazine-style layouts that were previously impossible without deeply nested HTML.',
      'Grid introduces the `fr` (fractional) unit, which intelligently handles remaining space. You can define track sizes, name grid areas, and position elements anywhere in the grid without changing the HTML order.',
      'The most powerful grid feature is `grid-template-areas`. It turns your CSS into a visual map of your page, making it incredibly intuitive to rearrange entire sections of your site for different screen sizes.'
    ],
    code: `.dashboard {
  display: grid;
  /* Visual mapping of the section! */
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

header  { grid-area: header; }
aside   { grid-area: sidebar; }
main    { grid-area: main; }
footer  { grid-area: footer; }

/* Responsive swap for mobile */
@media (max-width: 600px) {
  .dashboard {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}`
  },
  {
    id: 'hc_5',
    title: 'Modern CSS Frameworks (Tailwind)',
    badge: 'Industry Standard',
    badgeClass: 'badge-practice',
    content: [
      'While custom CSS is essential, modern teams often use **Utility-First frameworks** like Tailwind CSS. Instead of writing separate style files, you apply pre-defined classes directly to your HTML: `flex`, `p-4`, `bg-blue-500`.',
      'The advantage is **speed and consistency**. You don\'t have to name a thousand different classes (is it `.card-inner` or `.card-body`?), and you are limited to a strict design system (padding only comes in specific 4px increments).',
      'PurgeCSS integration ensures that only the classes you actually use are shipped in your production bundle, keeping your CSS file incredibly small (often < 10KB) even for massive enterprise applications.'
    ],
    code: `<!-- ── Tailwind Utility Classes ── -->
<div class="flex flex-col md:flex-row gap-6 p-8 bg-slate-900 rounded-2xl shadow-xl">
  <div class="flex-1 space-y-4">
    <h2 class="text-3xl font-bold text-white tracking-tight">
      Utility-First Design
    </h2>
    <p class="text-slate-400 leading-relaxed">
      Rapidly build modern websites without ever leaving your HTML.
    </p>
    <button class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all">
      Get Started
    </button>
  </div>
</div>`
  },
  {
    id: 'hc_6',
    title: 'CSS Transitions & Animations',
    badge: 'Code',
    badgeClass: 'badge-code',
    content: [
      'Motion isn\'t just eye-candy; it provides **visual cues** that tell the user what is happening. **Transitions** smoothly change an element from one state to another (like a button changing color on hover).',
      '**Keyframe Animations** allow for more complex, multi-step movements. You can define exactly what an element should do at 0%, 50%, and 100% of the animation duration.',
      'Always respect user preferences. Many people have "Reduce Motion" enabled in their OS. Use the `prefers-reduced-motion` media query to disable or simplify your animations for these users.'
    ],
    code: `/* ── Simple Transition ── */
.btn {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:active {
  transform: scale(0.95);
}

/* ── Complex Keyframes ── */
@keyframes float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.floating-icon {
  animation: float 3s ease-in-out infinite;
}

/* ── Accessibility First ── */
@media (prefers-reduced-motion: reduce) {
  .floating-icon {
    animation: none;
  }
}`
  },
  {
    id: 'hc_7',
    title: 'Project Execution: Semantic Dashboard',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will build a semantic, responsive dashboard layout using CSS Grid for the main structure and Flexbox for the inner components. The layout must pass an accessibility audit (Aria-labels and correct hierarchy).',
      'The goal is to move away from "div-soup" and build a professional architecture that is easy to maintain. Focus on using CSS Variables for the color palette so that dark mode can be enabled by changing one parent class.',
      '**Studio Task**: Build the "DevDesk" sidebar and header. Use `grid-template-areas` for the main layout. Ensure the sidebar collapses into a hamburger menu on mobile using only CSS media queries.'
    ],
    code: `/* ── Project Structure: DevDesk Core ── */
:root {
  --sidebar-w: 260px;
  --header-h: 64px;
}

.layout {
  display: grid;
  grid-template-areas:
    "nav   nav"
    "side  main";
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-rows: var(--header-h) 1fr;
}

@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "nav"
      "main";
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none; /* Mobile menu hidden by default */
  }
}`
  },
  {
  id: 'hc_8',
  title: 'HTML Forms & Validation',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'Forms are the backbone of user interaction on the web — login, signup, checkout, search — everything depends on them. A poorly built form directly impacts UX and conversion rates.',
    'Always pair inputs with `<label>` for accessibility. Screen readers rely on this relationship. Use semantic input types like `email`, `password`, and `number` to get built-in validation and better mobile keyboards.',
    'Native browser validation (`required`, `pattern`, `minlength`) should be your first layer. JavaScript validation comes after — not instead of it.'
  ],
  code: `<!-- ── Accessible Form ── -->
<form>
  <div>
    <label for="email">Email Address</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required 
      placeholder="you@example.com"
    />
  </div>

  <div>
    <label for="password">Password</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      minlength="6"
      required 
    />
  </div>

  <button type="submit">Login</button>
</form>`
},
{
  id: 'hc_9',
  title: 'CSS Positioning & Stacking Context',
  badge: 'Deep Dive',
  badgeClass: 'badge-concept',
  content: [
    'Positioning controls how elements are placed in the layout. `relative` keeps the element in normal flow, while `absolute` removes it and positions it relative to the nearest positioned ancestor.',
    '`fixed` sticks to the viewport (used in navbars), and `sticky` toggles between relative and fixed based on scroll position.',
    '`z-index` only works within stacking contexts. Many bugs happen because developers don’t realize new stacking contexts are created by properties like `position`, `opacity`, or `transform`.'
  ],
  code: `/* ── Positioning Example ── */
.card {
  position: relative;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* Sticky Header */
.header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}`
},
{
  id: 'hc_10',
  title: 'Browser Rendering & Performance',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'When a browser loads a page, it follows the Critical Rendering Path: HTML → DOM, CSS → CSSOM, then combines them into a Render Tree.',
    'CSS is render-blocking. If your CSS is large or unoptimized, your page appears slow even if your JS is fast.',
    'Avoid layout thrashing. Changing layout properties (like width/height) triggers reflow, which is expensive. Prefer transforms (`translate`, `scale`) for animations.'
  ],
  code: `/* ── Performance Tip ── */
.box {
  /* Bad: causes reflow */
  width: 200px;
}

/* Better: GPU optimized */
.box {
  transform: scale(1.1);
}

/* Avoid excessive CSS */
@media (min-width: 768px) {
  /* Load only when needed */
}`
},
{
  id: 'hc_11',
  title: 'Common UI Patterns',
  badge: 'Practice',
  badgeClass: 'badge-practice',
  content: [
    'Real-world development is about combining small techniques into reusable patterns like navbars, cards, modals, and dashboards.',
    'A navbar typically uses Flexbox for alignment, while cards use consistent padding, shadows, and responsive grids.',
    'Reusable UI patterns reduce cognitive load and make your design system scalable across large applications.'
  ],
  code: `/* ── Navbar Pattern ── */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

/* ── Card Pattern ── */
.card {
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}`
},
{
  id: 'hc_12',
  title: 'Debugging CSS & DevTools',
  badge: 'Professional',
  badgeClass: 'badge-code',
  content: [
    'Debugging is a core skill. Most layout issues come from overflow, incorrect flex/grid usage, or unexpected margins.',
    'Use browser DevTools to inspect elements, visualize box model, and toggle styles live. This is faster than guessing in code.',
    'A common trick: apply `outline: 1px solid red` to see layout boundaries instantly.'
  ],
  code: `/* ── Debugging Trick ── */
* {
  outline: 1px solid red;
}

/* Overflow fix */
.container {
  overflow: hidden;
}

/* DevTools workflow:
1. Inspect element
2. Check computed styles
3. Toggle properties */
`
}
];
