import type { Lesson } from '../../types/curriculum';

export const testingLessons: Lesson[] = [
  {
    id: 'test_0',
    title: 'Testing Tiers: The Pyramid',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Software testing is not about "finding bugs"; it is about providing the **Confidence** to move fast and change code without fear. The **Testing Pyramid** is the industry standard for distributing your tests effectively.',
      '**Unit Tests** (The Base): test small, isolated functions in milliseconds. **Integration Tests** (The Middle): test how multiple units work together (like a form submitting to an API). **E2E Tests** (The Top): test the entire user journey in a real browser.',
      'The Golden Rule: Focus on the "Trophy" (Integration Tests). They provide the best return on investment by testing that your *features* actually work as a user expects, without being as slow and brittle as E2E tests.'
    ],
    code: `// ── The Testing Pyramid ──
//     /  E2E  \\      <- (Slowest, Most Expensive)
//    /   INT   \\     <- (Greatest ROI)
//   /   UNIT    \\    <- (Fastest, Cheapest)
//   -------------

// ── The "Trophy" Pattern ──
// Testing implementation details (Unit) is risky.
// Testing user outcomes (Integration) is steady.`
  },
  {
    id: 'test_1',
    title: 'Unit Testing with Vitest / Jest',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**Vitest** (or Jest) is a "Test Runner". It finds your `.test.ts` files, executes them, and tells you which ones passed or failed. Its goal is to make the "Test Cycle" so fast that you can run it every time you save a file.',
      'Anatomy of a test: `describe` groups related tests, `it` (or `test`) defines a single expectation, and `expect` is the assertion that checks if something is true (`expect(result).toBe(4)`).',
      '**Mocking**: When a function depends on something complex (like an API or the Current Time), you replace that dependency with a "Mock" — a fake version that returns a predictable value. This keeps your unit tests fast and truly isolated.'
    ],
    code: `// ── utils.test.ts ──
import { describe, it, expect, vi } from 'vitest';
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
  it('should correctly sum an array of numbers', () => {
    const result = calculateTotal([10, 20, 30]);
    expect(result).toBe(60);
  });

  it('should handle an empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});`
  },
  {
    id: 'test_2',
    title: 'Testing Library: User-Centric UI',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      '**React Testing Library (RTL)** is the standard for UI testing. Its core philosophy: "The more your tests resemble the way your software is used, the more confidence they can give you."',
      'Instead of testing "State" or "Component Props", RTL encourages you to query the UI by what a user sees (e.g., `getByRole("button", { name: /submit/i })`). If the user can\'t find the button, your test should fail too.',
      'Avoid testing implementation details. If you rename a variable but the UI still looks and works the same, your tests should still pass. This allows you to refactor your code with total freedom and zero "False Alarms".'
    ],
    code: `// ── LoginForm.test.tsx ──
import { render, screen, fireEvent } from '@testing-library/react';

it('allows the user to submit the form', () => {
  render(<LoginForm />);
  
  // 1. Act like a user
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'puru@dev.com' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // 2. Assert outcome
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});`
  },
  {
    id: 'test_3',
    title: 'Async Testing & MSW',
    badge: 'Deep Dive',
    badgeClass: 'badge-code',
    content: [
      'Testing components that fetch data is tricky. **Mock Service Worker (MSW)** is the best solution. Instead of mocking the code, it mocks the "Network". It intercepts your API requests and returns fake JSON, exactly like a real server.',
      'Using RTL\'s `find*` queries (`findByText`): These are asynchronous. They will "Wait" (default 1 second) for an element to appear in the DOM before failing. This is how you handle loading states and animations in your tests.',
      'Avoid "Wait for nothing" (e.g., `waitFor(() => true)`). Always wait for a specific visual change in the UI. This ensures your tests aren\'t just "Waiting for time", but are actually synchronized with your application\'s logic.'
    ],
    code: `// ── Handling Async with MSW ──
it('displays the user list after loading', async () => {
  render(<UserFeed />);

  // Initial state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for the mock API response (MSW)
  const user = await screen.findByText("Puru");
  expect(user).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});`
  },
  {
    id: 'test_4',
    title: 'E2E Testing with Playwright',
    badge: 'Advanced',
    badgeClass: 'badge-practice',
    content: [
      '**Playwright** is the next generation of End-to-End (E2E) testing. It can drive Chrome, Firefox, and Safari simultaneously. It is much faster and less "flaky" than older tools like Selenium or Cypress.',
      'E2E tests catch "The big stuff". Does the login page redirect correctly? Does the checkout button actually call the payment processor? Does the database actually save the new user? These tests sleep better at night.',
      'The "Visual Regression" feature is a secret weapon. Playwright can take screenshots of your pages and compare them pixel-by-pixel to a known "Base image". If you accidentally moved a pixel in your footer, Playwright will catch it.'
    ],
    code: `# ── Playwright Flow ──
# (No need to write JS if you use the codegen!)
npx playwright codegen localhost:3000

# ── example.spec.ts ──
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('/cart');
  await page.click('text=Checkout');
  await page.fill('#card-number', '4242...');
  
  await expect(page).toHaveURL(/success/);
});`
  },
  {
    id: 'test_5',
    title: 'TDD: Test-Driven Development',
    badge: 'Philosophy',
    badgeClass: 'badge-concept',
    content: [
      '**TDD (Test-Driven Development)** is a workflow: Red, Green, Refactor. 1. You write a failing test (Red). 2. You write the *bare minimum* code to make it pass (Green). 3. You clean up the code (Refactor).',
      'Why TDD? It forces you to think about the **Interface** before the implementation. It prevents "Feature Creep" because you only write the code needed to pass the test, and it results in 100% test coverage by default.',
      'TDD is not for everything. Use it for complex logic, data transformations, and bug fixes (writing a test that "reproduces" the bug before fixing it). For UI/Layout work, traditional development is often more efficient.'
    ],
    code: `// ── TDD: Red step ──
// I want a function that converts 'snake_case' to 'camelCase'
test('toCamel', () => {
  expect(toCamel('user_name')).toBe('userName');
});

// Run test -> FAIL (it doesn't exist yet)

// ── TDD: Green step ──
function toCamel(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Run test -> PASS`
  },
  {
    id: 'test_6',
    title: 'Testing hooks: renderHook',
    badge: 'Expert',
    badgeClass: 'badge-code',
    content: [
      'You cannot call a hook outside of a component, so how do you test a custom hook like `useCounter`? Testing Library provides `renderHook` — a wrapper that simulates a component environment for your hook.',
      '`renderHook` gives you a `result` object (holding the hook\'s return value) and an `act` function. Because hooks often trigger state updates, you must wrap those updates in `act` to ensure React finishes rendering before you assert.',
      'This allows you to test the "Logic" of your application in total isolation from the UI. If your hook correctly handles a complex data sync from LocalStorage, you can verify it once in a hook test and then use it safely in 50 different components.'
    ],
    code: `import { renderHook, act } from '@testing-library/react';

it('should increment the counter', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});`
  },
  {
    id: 'test_7',
    title: 'Project Execution: The Test Suite',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will secure the "JobTrackr" codebase by implementing a full test suite. You will write unit tests for the date-formatting utilities, an integration test for the JobForm using MSW to mock the API, and a Playwright E2E test for the login flow.',
      'The goal is over 80% code coverage. You must demonstrate that your tests catch common regressions, such as form validation errors and broken API responses.',
      '**Studio Task**: Build the test suite for the `useJobTracker` hook. It should cover adding a job, updating its status, and handling the "Network Offline" error state.'
    ],
    code: `# ── Testing Checklist ──
# 1. Vitest running fast?      [Yes]
# 2. MSW mocking API?          [Yes]
# 3. RTL queries are semantic?  [Yes]
# 4. Playwright for E2E?       [Yes]`
  },
  {
  id: 'test_8',
  title: 'Contract Testing (API Reliability)',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '**Contract Testing** solves a specific microservices problem: when the team owning Service A changes a response format, how does the team owning Service B know before it breaks in production? Consumer-Driven Contract Testing flips the traditional approach — the consumer defines what it expects from the API, and those expectations are verified against the provider.',
    '**Pact** is the gold standard library for contract testing. The consumer writes a Pact test describing expected interactions. Pact records this as a JSON contract file. The provider CI pipeline downloads the contract and verifies its actual responses match. If they diverge, the provider build fails — before the consumer is ever broken in production.',
    'The Pact Broker service stores contracts centrally and tracks which consumer-provider version combinations are safe to deploy. The `can-i-deploy` CLI command queries the broker before any release: "Is version 2.1.0 of the API safe to deploy given all contracts?". This makes independent team deployments safe and auditable.'
  ],
  code: `// ── Consumer test: define expected contract ──
import { Pact, like } from '@pact-foundation/pact';

const provider = new Pact({
  consumer: 'JobTrackr-Frontend',
  provider: 'JobTrackr-API',
  port: 8080,
});

describe('Jobs API contract', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  it('returns a job by ID', async () => {
    await provider.addInteraction({
      state: 'job with ID 1 exists',
      uponReceiving: 'a request for job 1',
      withRequest: { method: 'GET', path: '/api/jobs/1' },
      willRespondWith: {
        status: 200,
        body: {
          id:      like(1),           // any number is fine
          title:   like('Engineer'),  // any string
          company: like('Acme'),
        }
      }
    });

    const res = await fetch('http://localhost:8080/api/jobs/1');
    const job = await res.json();
    expect(job.id).toBeDefined();
    expect(job.title).toBeDefined();
  });
});`

},
{
  id: 'test_9',
  title: 'Performance & Load Testing',
  badge: 'Performance',
  badgeClass: 'badge-practice',
  content: [
    '**Load testing** answers the question every engineer should ask before launch: "What happens when 1000 users hit my app at the same time?" You need to find the breaking point before your users do. **k6** is the modern developer-friendly load testing tool — tests are written in JavaScript, run from the CLI, and produce detailed P95/P99 latency percentiles.',
    'The three load test types: **Load test** (normal expected traffic for 30+ minutes — checks for degradation over time and memory leaks), **Stress test** (increase load until the system fails — find the ceiling), **Soak test** (moderate load for hours — catches bugs that only appear with sustained usage like connection pool exhaustion or file descriptor leaks).',
    '**Performance thresholds** in k6 make tests pass or fail automatically. Set `http_req_duration["p95"] < 200ms` — if the 95th percentile response time exceeds 200ms, the k6 run exits with code 99 (failure). This integrates directly with CI/CD: a PR that degrades API performance fails the pipeline before merging.'
  ],
  code: `// ── k6 load test script (load-test.js) ──
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50  }, // Ramp up to 50 virtual users
    { duration: '1m',  target: 100 }, // Stay at 100 users for 1 minute
    { duration: '30s', target: 0   }, // Ramp down gracefully
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200'],  // 95th percentile under 200ms
    'http_req_failed':   ['rate<0.01'],  // Less than 1% error rate
    'http_req_duration{name:getJobs}': ['p(99)<500'],  // Named request threshold
  },
};

export default function () {
  const res = http.get('https://api.example.com/api/jobs', {
    tags: { name: 'getJobs' },   // Tag for named thresholds
  });

  check(res, {
    'status 200':   (r) => r.status === 200,
    'has results':  (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);  // Simulate think time between user actions
}

# ── Run locally ──
k6 run load-test.js

# ── Run in CI (fail build if thresholds breached) ──
k6 run --out json=results.json load-test.js`
}
];
