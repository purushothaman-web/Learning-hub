import type { Lesson } from '../../types/curriculum';

export const reactAdvancedLessons: Lesson[] = [
  {
    id: 'ra_0',
    title: 'Render Props & HOCs',
    badge: 'Patterns',
    badgeClass: 'badge-concept',
    content: [
      'While Hooks are the modern way to share logic, **Render Props** and **Higher-Order Components (HOCs)** are essential patterns used by many libraries (like Formik and React Router) and legacy codebases.',
      'A Higher-Order Component is a function that takes a component and returns a NEW component with extra "superpowers". It is a "Decorator" for components. It\'s great for injecting things like a user\'s theme or auth status into any component automatically.',
      'Render Props involve passing a function as a child or a prop. This function receives data and returns a component to render. It\'s incredibly powerful for "Logic-Only" components (like a `MouseTracker` or a `DataLoader`) that don\'t want to decide how the UI looks.'
    ],
    code: `// ── HOC Example (WithAuth) ──
function withAuth(WrappedComponent) {
  return function Authenticated(props) {
    const { user } = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <WrappedComponent {...props} user={user} />;
  };
}

// ── Render Prop Example ──
<MouseTracker render={({ x, y }) => (
  <h1>The mouse is at ({x}, {y})</h1>
)} />`
  },
  {
    id: 'ra_1',
    title: 'Compound Components Pattern',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'The **Compound Components Pattern** is used to build complex, flexible UIs where child components need to share internal state with the parent. Think of an `<Accordion>` or a `<Tabs>` component.',
      'Instead of passing 10 different props to one massive component, you break it down into small sub-components that communicate via **Context**. This gives the user of your component total control over the layout while you handle the complex logic.',
      'This is the gold standard for "UI Libraries". It prevents "Prop Drilling" and makes your code look as clean as standard HTML. If you change the order of the tabs, the logic still works perfectly because they all share one internal state.'
    ],
    code: `// ── The Goal: A clean, declarative API ──
<Tabs defaultIndex={0}>
  <Tabs.List>
    <Tabs.Trigger index={0}>Info</Tabs.Trigger>
    <Tabs.Trigger index={1}>Stats</Tabs.Trigger>
  </Tabs.List>
  
  <Tabs.Content index={0}>User details...</Tabs.Content>
  <Tabs.Content index={1}>Analytics...</Tabs.Content>
</Tabs>

// Under the hood, Trigger and Content talk to Tabs 
// via a hidden "TabsContext".`
  },
  {
    id: 'ra_2',
    title: 'Performance: useMemo & useCallback',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'React is fast, but it can be wasteful. Every time a component re-renders, it re-runs every line of code inside it. `useMemo` allows you to **Cache a calculated value** so it only recalculates if its inputs change.',
      '`useCallback` is similar, but for **Functions**. In JS, two functions with the same code are not equal (`() => {} !== () => {}`). This causes child components to re-render unnecessarily because they think they received a brand new prop.',
      'Premature optimization is the root of all evil. Don\'t wrap every function in `useCallback`! Use it only when passing functions to children that are "Memoized" (using `React.memo`), or when the function is a dependency in a `useEffect` hook.'
    ],
    code: `// ── useMemo: save heavy math ──
const filterResults = useMemo(() => {
  return expensiveCalculation(items, query);
}, [items, query]);

// ── useCallback: save stable functions ──
const handleToggle = useCallback(() => {
  setOpen(prev => !prev);
}, []); // Empty deps: function never changes

// Use React.memo on the child so it only renders
// when its specific props ACTUALLY change.
const Child = memo(({ onToggle }) => { ... });`
  },
  {
    id: 'ra_3',
    title: 'Custom Hooks: Logic Abstraction',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'A **Custom Hook** is simply a JavaScript function that starts with "use". It allows you to extract component logic into a reusable, testable piece of code. If you find yourself writing the same `useEffect` twice, it belongs in a hook.',
      'Custom hooks can call other hooks (`useState`, `useEffect`). This allows you to build complex "Stateful Utilities" like `useLocalStorage`, `useDebounce`, or `useWindowSize`. The component using the hook doesn\'t care how it works; it just gets the data it needs.',
      'They represent the ultimate "Logic Refactor". Instead of a component with 100 lines of API fetching, error handling, and loading states, you have a one-line `const { data, loading } = useApi("/users")`. This makes your UI code incredibly lean and easy to read.'
    ],
    code: `// ── useOnlineStatus custom hook ──
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online',  handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online',  handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  return isOnline;
}`
  },
  {
    id: 'ra_4',
    title: 'Portals: Escape the DOM Tree',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'Sometimes a component needs to render "Outside" its parent in the HTML tree, but remain "Inside" in the React tree. This is used for Modals, Tooltips, and Popovers that should avoid being cut off by a `overflow: hidden` parent.',
      '**Portals** (`createPortal`) allow you to render to any DOM node you choose, usually a secondary root like `<div id="modal-root">`. Even though the modal is physically at the end of the `<body>`, it still behaves as a child of your component for events and context.',
      'Event Bubbling still works! An event fired inside a portal will "Bubble up" to its React parent even if they are far apart in the real DOM. This is magic — it keeps your component logic and event handling consistent while solving complex CSS layout problems.'
    ],
    code: `import { createPortal } from 'react-dom';

function Modal({ children }) {
  // Renders children into 'modal-root' instead of 
  // wherever this <Modal /> is placed.
  return createPortal(
    <div className="modal-overlay">
      {children}
    </div>,
    document.getElementById('modal-root')
  );
}`
  },
  {
    id: 'ra_5',
    title: 'Transition API: Non-Blocking UI',
    badge: 'Modern',
    badgeClass: 'badge-concept',
    content: [
      'In React 18+, not all updates are equally urgent. Typing in a search bar is "Urgent" (it must feel instant). Rendering a massive list of results is "Transitionary" (the user can wait a few milliseconds).',
      '`startTransition` allows you to mark specific updates as low-priority. This prevent slow renders from "Locking up" the browser, so the user can keep typing while the expensive list is being prepared in the background.',
      'The `useTransition` hook gives you an `isPending` state. You can use this to show a subtle progress bar or dim the background while the "Transition" is happening, providing a much higher-quality user experience without complex manual coding.'
    ],
    code: `import { useTransition, useState } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    // 1. URGENT: Update input immediately
    setQuery(e.target.value);

    // 2. LOW-PRIORITY: Filter 10,000 items
    startTransition(() => {
      performHeavyFilter(e.target.value);
    });
  };

  return (
    <div>
      <input onChange={handleChange} />
      {isPending && <p>Updating results...</p>}
    </div>
  );
}`
  },
  {
    id: 'ra_6',
    title: 'Server components (RSC) Concept',
    badge: 'Next Gen',
    badgeClass: 'badge-concept',
    content: [
      '**React Server Components (RSC)** are a revolutionary shift in how we build React apps. Instead of sending ALL your JS to the browser, some components run ONLY on the server and send pre-rendered HTML to the client.',
      'Benefit: **Zero Bundle Size**. If you use a massive library like "D3" or "Markdown-Parser" on the server, that library never reaches the user\'s phone. This leads to near-instant page loads regardless of how complex your server logic is.',
      'Server components can fetch data directly from your database using `async/await`. They don\'t use hooks (`useState`, `useEffect`) because they don\'t "Live" in the browser. You combine them with "Client Components" for interactivity (buttons, forms, animations).'
    ],
    code: `// ── Server Component (Next.js Example) ──
// This runs only on the server.
async function ProductList() {
  const products = await db.products.findMany(); // Direct DB access!

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>
          {p.name}
          <AddToCart id={p.id} /> {/* 👈 Client Component */}
        </li>
      ))}
    </ul>
  );
}`
  },
  {
    id: 'ra_7',
    title: 'Project Execution: Infinite Feed',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will build a professional social-style "Infinite Scrolling Feed" for JobTrackr updates. You must use a `useIntersectionObserver` custom hook to detect when the user reaches the bottom of the list.',
      'You will implement `useTransition` to keep the UI responsive while loading new pages and `memo` to ensure that old cards don\'t re-render as new ones are added. The goal is a performance-optimized feed that stays smooth even with 1,000 items.',
      '**Studio Task**: Build the "PulseFlow" feed. It should fetch data in chunks of 10, show a skeleton loader at the bottom, and use a Portal for the "Quick View" modal when a job status is clicked.'
    ],
    code: `# ── Advanced Checklist ──
# 1. Logic moved to Custom hooks? [Yes]
# 2. Portals used for Modals?    [Yes]
# 3. useTransition for Loading?  [Yes]
# 4. Memoization implemented?    [Yes]`
  },
  {
  id: 'ra_8',
  title: 'Error Boundaries',
  badge: 'Stability',
  badgeClass: 'badge-concept',
  content: [
    'A normally rendered React component that throws during render is a catastrophic UX failure — the entire React tree below the Error Boundary unmounts. **Error Boundaries** are class components that catch errors in their subtree during render, lifecycle methods, and constructors. They render a fallback UI instead of crashing the whole app. Essential for any production React app.',
    'The correct scoping strategy: wrap each major page section with its own Error Boundary. If the right sidebar crashes, the main content still works. The error is isolated to the boundary\'s subtree. Log the error details (component name, error message, component stack) to your monitoring service (Sentry, Datadog) inside `componentDidCatch`.',
    'The **react-error-boundary** library provides the de-facto standard functional wrapper — avoiding writing class components in a modern codebase. It adds `onError` callback for logging, `onReset` for recovery, and the `resetKeys` prop to auto-reset the boundary when specified values change (e.g., when the user navigates to a different route).'
  ],
  code: `// ── Modern Error Boundary with react-error-boundary ──
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-state">
      <h2>Something went wrong</h2>
      <pre className="error-details">{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// ── Wrap individual sections, not the whole app ──
export function Dashboard() {
  return (
    <div className="dashboard">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, info) => Sentry.captureException(error, info)}
        onReset={() => queryClient.clear()}
      >
        <JobsFeed />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <StatsSidebar />   {/* Isolated: if stats crash, feed still works */}
      </ErrorBoundary>
    </div>
  );
}

// ── Throwing from async code (not caught by boundaries) ──
// Error boundaries only catch render errors, NOT async errors
// Use react-error-boundary's throwError hook:
function JobCard({ jobId }) {
  const { throwError } = useErrorBoundary();
  useEffect(() => {
    fetchJob(jobId).catch((err) => throwError(err)); // Propagates to boundary
  }, [jobId]);
}`
},
{
  id: 'ra_9',
  title: 'Suspense for Data Fetching',
  badge: 'Modern',
  badgeClass: 'badge-concept',
  content: [
    '**React Suspense** is a mechanism for components to "suspend" rendering while they wait for something asynchronous — originally just code splitting (`React.lazy`), now extended to data fetching in React 18. When a component suspends, React walks up the tree to the nearest `<Suspense>` boundary and renders its `fallback` prop. When the async operation resolves, React retries the render from that component.',
    'The key insight: Suspense unifies loading state with render. Instead of `{ isLoading ? <Spinner /> : <Content /> }` scattered throughout every component, `<Suspense fallback={<Spinner />}>` handles it declaratively at the boundary level. One loading state for an entire subtree. **TanStack Query** and **Next.js App Router** are the two most common Suspense-compatible data fetching solutions.',
    '`<Suspense>` composes with Error Boundaries: wrap Suspense inside an Error Boundary so both loading and error states are handled gracefully at the same level. The `startTransition` API marks updates as "non-urgent" — Suspense won\'t show a loading fallback for transitions, keeping the old UI visible while new data loads. This eliminates the jarring "flash to spinner" on every navigation.'
  ],
  code: `// ── TanStack Query: enable Suspense mode ──
import { useSuspenseQuery } from '@tanstack/react-query';

// Component never handles loading state — it just suspends
function JobsList({ companyId }: { companyId: string }) {
  // Throws a Promise while loading (Suspense catches it)
  // Throws an Error on failure (Error Boundary catches it)
  const { data: jobs } = useSuspenseQuery({
    queryKey: ['jobs', companyId],
    queryFn: () => api.getJobs(companyId),
  });

  return (
    <ul>
      {jobs.map(job => <JobItem key={job.id} job={job} />)}
    </ul>
  );
}

// ── Compose Suspense with Error Boundary ──
import { ErrorBoundary } from 'react-error-boundary';

function CompanyPage({ companyId }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsList companyId={companyId} />
      </Suspense>
    </ErrorBoundary>
  );
}

// ── No flash: use startTransition for navigation ──
import { startTransition } from 'react';

function CompanyFilter({ onCompanyChange }) {
  return (
    <select onChange={(e) => startTransition(() => onCompanyChange(e.target.value))}>
      {companies.map(c => <option key={c.id}>{c.name}</option>)}
    </select>
  );
}`
},
{
  id: 'ra_10',
  title: 'Context Performance Optimization',
  badge: 'Performance',
  badgeClass: 'badge-concept',
  content: [
    'React Context has a fundamental performance characteristic: **every component that calls `useContext(MyContext)` re-renders whenever the context value changes**, even if only a tiny slice of the value changed. If you put `{ user, jobs, theme, notifications }` in one context and the notification count changes, every component reading user or theme also re-renders unnecessarily.',
    'The first fix: **split contexts by change frequency**. `UserContext` (changes rarely), `ThemeContext` (changes per preference), `NotificationsContext` (changes frequently). Consumer components only subscribe to the context they need. The second fix: **memoize the context value** with `useMemo` — without it, the value is a new object reference on every parent re-render, causing all consumers to re-render even when the data didn\'t change.',
    'For complex global state, migrating from Context to **Zustand** is often the better long-term solution. Zustand uses a subscription model — components subscribe to only the slices they read. `const count = useStore(state => state.notifications.count)` — only re-renders when `count` changes, not when `state.user` changes. For form state, **React Hook Form** with its subscription model beats Context + useState dramatically.'
  ],
  code: `// ── BAD: one large context = excessive re-renders ──
const AppContext = createContext({
  user: null, theme: 'dark', notifications: [], jobs: []
});

// ── GOOD: split by change domain ──
const UserContext      = createContext<User | null>(null);
const ThemeContext     = createContext<Theme>('dark');
const NotifContext     = createContext<Notification[]>([]);

// ── Memoize the context value to prevent reference churn ──
function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  // Without useMemo: { user, setUser } is a new object on every render
  // → all consumers re-render even when user data didn't change
  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ── Zustand: fine-grained subscriptions (no Provider needed) ──
import { create } from 'zustand';

const useJobStore = create(set => ({
  jobs: [] as Job[],
  filter: 'all' as JobFilter,
  setFilter: (f: JobFilter) => set({ filter: f }),
  setJobs:   (j: Job[]) => set({ jobs: j }),
}));

// Only re-renders when filter changes (not when jobs change)
function FilterBar() {
  const filter    = useJobStore(state => state.filter);
  const setFilter = useJobStore(state => state.setFilter);
  return <FilterPicker value={filter} onChange={setFilter} />;
}`
}
];

