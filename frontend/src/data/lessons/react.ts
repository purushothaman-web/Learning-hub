import type { Lesson } from '../../types/curriculum';

export const reactLessons: Lesson[] = [
  {
    id: 're_0',
    title: 'Thinking in React',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'React is a declarative, component-based library for building user interfaces. Instead of manually updating the DOM, you describe the **State** of your application, and React automatically updates the UI to match.',
      'The core philosophy is **Component Composition**. You build small, reusable pieces (buttons, cards, inputs) and combine them to create complex layouts. This "Lego block" approach makes large apps easy to maintain.',
      'Unidirectional Data Flow: Data in React moves in one direction — from parent to child via **Props**. This makes the data flow predictable and debugging much easier compared to systems where data can change from anywhere.'
    ],
    code: `// ── A Simple Declarative Component ──
function WelcomeCard({ name, isAdmin }) {
  return (
    <div className="card">
      <h1>Welcome back, {name}!</h1>
      {isAdmin && <span className="badge">Admin</span>}
      <p>Here is what's new in your dashboard today.</p>
    </div>
  );
}

// Usage:
// <WelcomeCard name="Puru" isAdmin={true} />`
  },
  {
    id: 're_1',
    title: 'The Power of hooks (useState)',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**State** is the "memory" of a component. It allows React to remember things between re-renders, like whether a modal is open or what text is in a search bar.',
      '`useState` is the most important hook. It returns two things: the current state value, and a function to update it. When you call the setter function, React re-renders the component with the new data.',
      'Crucially, state updates are asynchronous and batched for performance. You should never update state directly (e.g., `state.count = 5`); always use the setter function provided by the hook.'
    ],
    code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`
  },
  {
    id: 're_2',
    title: 'The Component Lifecycle (useEffect)',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '`useEffect` allows your components to synchronise with external systems. This includes fetching data from an API, setting up a WebSocket connection, or manually changing the DOM.',
      'The **Dependency Array** is the most important part of `useEffect`. It tells React when to re-run the effect. If the array is empty `[]`, the effect runs only once after the component mounts.',
      'Cleanup is vital. If your effect sets up a timer or a subscription, you must return a "cleanup function" from the hook to prevent memory leaks and ghost behavior after the component is removed.'
    ],
    code: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    api.fetchUser(userId).then(data => {
      if (isMounted) setUser(data);
    });

    return () => {
      isMounted = false; // Cleanup to prevent state update on unmounted component
    };
  }, [userId]); // Only re-run if userId changes

  if (!user) return <LoadingSpinner />;
  return <div>{user.name}</div>;
}`
  },
  {
    id: 're_3',
    title: 'Virtual DOM & Reconciliation',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Updating the real browser DOM is slow. React solves this by using a **Virtual DOM** — a fast, lightweight copy of the UI kept in memory.',
      'When state changes, React creates a new Virtual DOM tree and compares it (diffs) with the previous one. This process is called **Reconciliation**. It then calculates the *minimal* set of changes needed and applies them to the real DOM.',
      'This "Diffing Algorithm" is why React is so fast. It ensures that if you change one character in a list of 10,000 items, only that one text node is updated, rather than re-rendering the whole table.'
    ],
    code: `// ── How React sees your UI ──
const virtualNode = {
  type: 'button',
  props: {
    className: 'btn-primary',
    children: 'Click Me',
    onClick: () => console.log('clicked')
  }
};

// React diffs these objects, not the actual HTML.
// This is why React can run in environments without a DOM (like mobile/Native).`
  },
  {
    id: 're_4',
    title: 'Props, Children & Composition',
    badge: 'Layout',
    badgeClass: 'badge-concept',
    content: [
      '**Composition** is the act of combining simple components to build complex ones. The `children` prop is the key to this — it allows you to pass generic HTML or other components into a wrapper.',
      'Instead of creating a `SuccessModal`, `ErrorModal`, and `InfoModal`, you create a generic `Modal` component and use composition to fill it with different content.',
      'Think of your UI as a tree. Data flows down (Props), and events flow up (Callbacks). This clear separation of concerns makes your components reusable and easy to test in isolation.'
    ],
    code: `function Card({ title, children }) {
  return (
    <div className="card-border">
      <div className="card-header">{title}</div>
      <div className="card-body">
        {children} {/* 👈 Can be anything! */}
      </div>
    </div>
  );
}

// Usage:
function App() {
  return (
    <Card title="User Settings">
      <form>
        <input type="text" />
        <button>Save</button>
      </form>
    </Card>
  );
}`
  },
  {
    id: 're_5',
    title: 'Form Handling & Ref Patterns',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'In React, forms are usually **Controlled Components**. This means React state is the "single source of truth" for the input values. Every keystroke updates the state, and the state drives the value of the input.',
      '**Refs** (`useRef`) provide a way to access DOM nodes directly. Use these sparingly — usually for things like focusing an input, managing scroll position, or integrating with non-React libraries (like a d3 chart).',
      'Unlike state, changing a ref does **not** trigger a re-render. This makes them perfect for storing values that need to persist but don\'t affect the visual UI directly.'
    ],
    code: `function LoginForm() {
  const [email, setEmail] = useState('');
  const passwordRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit:", email, passwordRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Controlled Input */}
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      
      {/* Uncontrolled Input with Ref */}
      <input ref={passwordRef} type="password" />
      
      <button type="submit">Login</button>
    </form>
  );
}`
  },
  {
    id: 're_6',
    title: 'Context API: Global State',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'When you have data that many components need (like a user\'s theme, language, or auth status), passing it through every level of the tree (**Prop Drilling**) becomes painful.',
      'The **Context API** allows you to "teleport" data to any component in the tree, bypassing the middle-men. You wrap your app in a `Provider` and any child can "consume" the value.',
      'Warning: Context should be used for *global* data. If you use it for everything, your components become tightly coupled and harder to reuse. For complex, frequently changing data, libraries like Redux or Zustand are more efficient.'
    ],
    code: `const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Dashboard />
    </ThemeContext.Provider>
  );
}

function Sidebar() {
  // Any deeply nested component can listen:
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}`
  },
  {
    id: 're_7',
    title: 'Project Execution: JobTrackr Dashboard',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this final task, you will build the core dashboard for JobTrackr. You will fetch a list of job applications from a mock API, display them in a grid of cards, and allow the user to toggle between "ListView" and "GridView".',
      'You must use a `ThemeContext` to support dark mode, `useEffect` for data fetching with loading states, and component composition to keep the code clean.',
      '**Studio Task**: Build the JobBoard component. It must fetch data on mount, handle error states if the API fails, and use a Transition animation when switching between layout modes.'
    ],
    code: `// ── Final Project Blueprint ──
function JobBoard() {
  const [view, setView] = useState('grid');
  const { jobs, loading, error } = useJobs(); // Custom hook logic

  if (loading) return <SkeletonGrid />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <main>
      <ViewToggle current={view} onToggle={setView} />
      <div className={view === 'grid' ? 'grid-layout' : 'list-layout'}>
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </main>
  );
}`
  },
  {
  id: 're_8',
  title: 'Re-renders & Performance Basics',
  badge: 'Deep Dive',
  badgeClass: 'badge-concept',
  content: [
    'React re-renders a component whenever its state or props change. However, parent re-renders can also cause unnecessary child re-renders.',
    'Understanding when React re-renders is key to optimizing performance. Every render recalculates JSX and can affect performance in large apps.',
    'Avoid unnecessary renders by keeping state minimal and colocated. Use memoization techniques when needed.'
  ],
  code: `function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>+</button>
      <Child />
    </>
  );
}

// Child re-renders even if props didn't change`
},
{
  id: 're_9',
  title: 'useMemo & useCallback',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '`useMemo` memoizes computed values, preventing expensive recalculations on every render.',
    '`useCallback` memoizes functions, preventing unnecessary re-creation and helping avoid re-renders in child components.',
    'These should be used only when needed — overusing them can make code harder to read without real benefits.'
  ],
  code: `const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

const handleClick = useCallback(() => {
  console.log("Clicked");
}, []);`
},
{
  id: 're_10',
  title: 'Custom Hooks (Reusable Logic)',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    'Custom hooks allow you to extract and reuse logic across components. They are just functions that use other hooks.',
    'This keeps your components clean and separates concerns (UI vs logic).',
    'Naming convention: always start with "use" (e.g., useFetch, useAuth).'
  ],
  code: `function useFetch(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData);
  }, [url]);

  return data;
}`
},
{
  id: 're_11',
  title: 'Advanced Form Handling',
  badge: 'Practice',
  badgeClass: 'badge-practice',
  content: [
    'Handling multiple inputs requires managing state efficiently using objects.',
    'Validation should be handled at both UI and logic levels.',
    'Libraries like React Hook Form simplify complex forms, but understanding the basics is essential.'
  ],
  code: `function Form() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <input name="email" onChange={handleChange} />
      <input name="password" onChange={handleChange} />
    </>
  );
}`
},
{
  id: 're_12',
  title: 'Error Boundaries',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'Error Boundaries catch JavaScript errors in components and prevent the entire app from crashing.',
    'They are implemented using class components.',
    'Useful for isolating failures in large applications.'
  ],
  code: `class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <h1>Something went wrong</h1>;
    return this.props.children;
  }
}`
},
{
  id: 're_13',
  title: 'Code Splitting & Lazy Loading',
  badge: 'Performance',
  badgeClass: 'badge-practice',
  content: [
    'Large React apps can become slow if everything loads at once. Code splitting allows loading components only when needed.',
    '`React.lazy` and `Suspense` are used for dynamic imports.',
    'This improves initial load time significantly.'
  ],
  code: `const Dashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}`
},
{
  id: 're_14',
  title: 'Project Structure & Architecture',
  badge: 'Professional',
  badgeClass: 'badge-concept',
  content: [
    'A scalable React app needs a clear folder structure: components, hooks, services, and utils.',
    'Separate UI from business logic. Keep API calls in services and reusable logic in hooks.',
    'Consistency in structure improves collaboration and maintainability.'
  ],
  code: `src/
  components/
  hooks/
  services/
  utils/
  pages/
`
}
];
