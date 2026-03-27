import type { Lesson } from '../../types/curriculum';

export const performanceLessons: Lesson[] = [
  {
    id: 'perf_0',
    title: 'Web Vitals & Performance Monitoring',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Performance isn\'t just about "Fast Loading"; it\'s about the user\'s **Perceived Experience**. Google\'s **Core Web Vitals** provide three scientific metrics to measure this: **LCP** (how fast the main content appears), **INP** (how quickly the page reacts to clicks), and **CLS** (how much the layout jumps around while loading).',
      'A "Good" LCP is under 2.5 seconds. If your page takes longer, users will feel it\'s "Slow" and likely leave. CLS is especially annoying — if a user tries to click "Cancel" but the page jumps and they click "Buy Now" instead, you have failed the performance and UX audit.',
      'Real User Monitoring (RUM) is the only way to see the truth. While lighthouse scores on your laptop are helpful, they don\'t represent a user on a 3-year-old Android phone on a weak 4G connection. You must collect metrics from real users to find where your app is actually failing.'
    ],
    code: `import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, rating, id }) {
  // Send to your observability stack
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, value, rating, id, url: location.href }),
    keepalive: true, // survives page unload
  });
}

onLCP(sendToAnalytics);  // Largest Contentful Paint
onINP(sendToAnalytics);  // Interaction to Next Paint
onCLS(sendToAnalytics);  // Cumulative Layout Shift
onFCP(sendToAnalytics);  // First Contentful Paint
onTTFB(sendToAnalytics); // Time to First Byte

// ── Quick Lighthouse CI in package.json ──
// "scripts": {
//   "lighthouse": "lhci autorun --upload.target=temporary-public-storage"
// }

// ── Performance budget — fail CI if vitals regress ──
// lighthouserc.js
module.exports = {
  assert: {
    assertions: {
      'categories:performance':       ['error', { minScore: 0.9 }],
      'first-contentful-paint':       ['error', { maxNumericValue: 2000 }],
      'largest-contentful-paint':     ['error', { maxNumericValue: 2500 }],
      'cumulative-layout-shift':      ['error', { maxNumericValue: 0.1 }],
      'total-blocking-time':          ['warn',  { maxNumericValue: 200 }],
    },
  },
};`
  },
  {
    id: 'perf_1',
    title: 'Frontend Performance Patterns',
    badge: 'Optimisation',
    badgeClass: 'badge-code',
    content: [
      '**Code splitting** is the single highest-impact frontend optimisation. By default, bundlers ship one giant JS file — the user downloads code for every page before they can interact with any page. Route-based splitting with `React.lazy` + `Suspense` means each page only loads its own code, reducing initial bundle size by 60–80% in typical apps.',
      '**Image optimisation** is almost always the LCP bottleneck. The key techniques: use modern formats (WebP/AVIF over JPEG/PNG), serve responsive sizes with `srcset`, add `loading="lazy"` to below-fold images, and always set explicit `width`/`height` to prevent layout shift. One unoptimised hero image can tank your entire Lighthouse score.',
      '**Caching strategy** is what separates fast apps from fast-on-first-load apps. Immutable assets (JS/CSS with content hashes in filenames) get `Cache-Control: max-age=31536000, immutable`. HTML gets `no-cache` so users always get fresh routes. Service workers enable offline-first with stale-while-revalidate patterns.'
    ],
    code: `// ── Code splitting: lazy-load routes ──
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard   = lazy(() => import('./pages/Dashboard'));
const LessonView  = lazy(() => import('./pages/LessonView'));
const Profile     = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/lessons/:id" element={<LessonView />} />
        <Route path="/profile"  element={<Profile />} />
      </Routes>
    </Suspense>
  );
}

// ── Image optimisation: responsive + lazy + no CLS ──
function HeroImage({ src, alt }) {
  return (
    <picture>
      {/* Modern format first — browser picks the first it supports */}
      <source srcSet={\`\${src}.avif\`} type="image/avif" />
      <source srcSet={\`\${src}.webp\`} type="image/webp" />
      <img
        src={\`\${src}.jpg\`}
        alt={alt}
        width={1200}
        height={630}       // explicit dimensions prevent CLS
        loading="eager"    // hero is above fold — don't lazy load
        fetchPriority="high" // tell browser this is LCP element
      />
    </picture>
  );
}

// ── Cache-Control headers (Express / Node) ──
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',                          // immutable hashed filenames
  immutable: true,
}));

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache'); // HTML: always revalidate
  res.sendFile('dist/index.html');
});

// ── Bundle analysis: find what's bloating your JS ──
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';
export default { plugins: [visualizer({ open: true })] };`
  },
  {
    id: 'perf_2',
    title: 'Backend Performance & Profiling',
    badge: 'Server Ops',
    badgeClass: 'badge-code',
    content: [
      '**Database queries** are the most common backend performance bottleneck by far. The three biggest offenders: missing indexes on columns used in `WHERE`/`JOIN`/`ORDER BY`, N+1 queries (fetching a list then querying each item individually in a loop), and `SELECT *` pulling far more data than the application needs. Run `EXPLAIN ANALYZE` on every slow query before adding indexes — it tells you exactly what PostgreSQL is doing.',
      '**Node.js is single-threaded**, so CPU-bound work (image processing, PDF generation, heavy computation) blocks the entire event loop and stalls every other request. Offload it: use worker threads for in-process parallelism, or push jobs to a queue (BullMQ + Redis) so a separate worker process handles them asynchronously without blocking your API.',
      '**Distributed tracing** connects the dots across your entire stack — from the browser request through your API, into the database, and back. Tools like OpenTelemetry + Jaeger give you a flame graph of every function call with timing, so you can see at a glance whether a slow endpoint is caused by a slow DB query, a slow external API call, or slow application code.'
    ],
    code: `// ── EXPLAIN ANALYZE: understand your query plan ──
-- Before adding an index, see what Postgres is doing:
EXPLAIN ANALYZE
  SELECT u.name, COUNT(l.id) AS completed
  FROM   users u
  JOIN   lesson_progress l ON l.user_id = u.id
  WHERE  l.completed = true
  GROUP  BY u.id
  ORDER  BY completed DESC;
-- Look for: "Seq Scan" on large tables = missing index
-- Look for: high "actual rows" vs "estimated rows" = stale statistics

-- Add the missing index:
CREATE INDEX CONCURRENTLY idx_lesson_progress_user_completed
  ON lesson_progress (user_id, completed)
  WHERE completed = true; -- partial index: only indexes true rows

// ── N+1 killer: batch with a JOIN instead of a loop ──

// ❌ N+1: 1 query for users + N queries for each user's lessons
const users = await db.query('SELECT * FROM users LIMIT 20');
for (const user of users.rows) {
  user.lessons = await db.query(           // fires 20 extra queries!
    'SELECT * FROM lesson_progress WHERE user_id = $1', [user.id]
  );
}

// ✅ 1 query with JOIN
const { rows } = await db.query(\`
  SELECT u.id, u.name,
         json_agg(lp.*) FILTER (WHERE lp.id IS NOT NULL) AS lessons
  FROM   users u
  LEFT   JOIN lesson_progress lp ON lp.user_id = u.id
  GROUP  BY u.id
  LIMIT  20
\`);

// ── Offload CPU work to BullMQ (Redis-backed queue) ──
import { Queue, Worker } from 'bullmq';

const pdfQueue = new Queue('pdf-export', { connection: redis });

// API route: enqueue the job and return immediately
app.post('/api/export', async (req, res) => {
  const job = await pdfQueue.add('generate', { userId: req.user.id });
  res.json({ jobId: job.id, status: 'queued' });
});

// Worker process (separate Node process — doesn't block the API)
new Worker('pdf-export', async (job) => {
  const pdf = await generatePDF(job.data.userId); // heavy CPU work
  await uploadToS3(pdf);
  await notifyUser(job.data.userId);
}, { connection: redis, concurrency: 4 });`
  },
  {
    id: 'perf_3',
    title: 'Observability: Logs, Metrics & Traces',
    badge: 'Production Ops',
    badgeClass: 'badge-practice',
    content: [
      'The **three pillars of observability** are logs (what happened), metrics (how the system is behaving over time), and traces (how a request travelled through the system). You need all three — logs alone are like trying to debug with `console.log`, metrics alone hide the cause, and traces alone miss system-wide trends.',
      '**Structured logging** means emitting JSON objects instead of plain strings. \`{"level":"error","msg":"DB timeout","userId":"abc","duration":5043}\` is machine-parseable — you can filter, aggregate, and alert on any field. Plain string logs like \`"Error: DB timeout for user abc after 5043ms"\` require brittle regex to extract the same data.',
      "**Alerting on symptoms, not causes** is the most important on-call philosophy. Alert on high error rate (users are affected) and high p99 latency (users are suffering) — not on CPU usage or memory (causes that may or may not matter). Every alert should be actionable: if you don't know what to do when it fires, it shouldn't fire."
    ],
    code: `// ── Structured logging with Pino ──
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // In production: emit JSON. In dev: pretty-print.
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});

// ✅ Structured — every field is queryable in your log platform
logger.info({ userId: 'abc123', lessonId: 42, duration: 320 }, 'Lesson completed');
logger.error({ err, userId: req.user.id, path: req.path }, 'Request failed');

// ── Request logging middleware ──
app.use((req, res, next) => {
  const start = Date.now();
  const reqLogger = logger.child({ reqId: crypto.randomUUID(), path: req.path });
  req.log = reqLogger;

  res.on('finish', () => {
    reqLogger.info({
      method:   req.method,
      status:   res.statusCode,
      duration: Date.now() - start,
    }, 'request completed');
  });
  next();
});

// ── Metrics with OpenTelemetry ──
import { MeterProvider } from '@opentelemetry/sdk-metrics';

const meter  = new MeterProvider().getMeter('learning-hub');
const reqCounter  = meter.createCounter('http_requests_total');
const latencyHist = meter.createHistogram('http_request_duration_ms');

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const labels = { method: req.method, status: String(res.statusCode) };
    reqCounter.add(1, labels);
    latencyHist.record(Date.now() - start, labels);
  });
  next();
});`
  },
  {
    id: 'perf_4',
    title: 'Database Performance & Indexing',
    badge: 'Backend Expert',
    badgeClass: 'badge-code',
    content: [
      'A database without indexes is a text file that has to be scanned from start to finish for every query. **B-Tree Indexes** create a balanced search tree that allows the database to find any row in O(log n) time. However, every index slows down WRITE operations (INSERT/UPDATE/DELETE) because the index itself must be updated. Production indexing is a balancing act.',
      '**Composite Indexes** (indexes on multiple columns) are powerful but order-dependent. An index on \`(user_id, created_at)\` can speed up a search for a specific user, or a search for a user within a time range. It CANNOT speed up a search for just `created_at` unless `user_id` is also provided. Always follow the "Left-to-Right" rule.',
      '**Query Profiling** with `EXPLAIN ANALYZE` is the only way to verify performance. It shows the execution plan: whether the DB used a "Sequential Scan" (bad) or an "Index Scan" (good). It also identifies if the DB is doing a "Nested Loop" (O(n*m)) instead of a more efficient "Hash Join".'
    ],
    code: `// ── SQL: Adding efficient indexes ──
-- Basic index on email for login
CREATE INDEX idx_users_email ON users(email);

-- Composite index for social feed
-- Matches: WHERE user_id = ? AND status = 'active'
-- Matches: WHERE user_id = ?
-- DOES NOT MATCH: WHERE status = 'active' (violates left-to-right)
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Partial index: only index active sessions (keeps index small/fast)
CREATE INDEX idx_active_sessions ON sessions(token) 
WHERE expires_at > NOW();

// ── Node.js: Preventing N+1 with Dataloader ──
import DataLoader from 'dataloader';

// ❌ N+1: Querying author for each post in a loop
// ✅ Batching: Collect all IDs and fire ONE query
const authorLoader = new DataLoader(async (ids) => {
  const authors = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
  // Important: return results in the exact same order as IDs
  return ids.map(id => authors.find(a => a.id === id));
});

// Usage in an API or GraphQL resolver
const author = await authorLoader.load(post.authorId);`
  },
  {
    id: 'perf_5',
    title: 'Distributed Caching (Redis)',
    badge: 'System Design',
    badgeClass: 'badge-code',
    content: [
      'Caching is the process of storing expensive data in memory (RAM) so subsequent requests are served in microseconds instead of milliseconds. **Client-side caching** (headers) and **CDN caching** are "shared" caches. **Redis** is a dedicated server-side key-value store that provides sub-millisecond latency for complex data structures.',
      'The **Cache-Aside Pattern** is the industry standard: 1. check if data is in Redis (hit/miss). 2. If miss, fetch from DB. 3. Save to Redis. 4. Return to user. 5. Set an expiration (TTL). This ensures consistent performance while keeping memory usage under control. Without TTL (Time To Live), your Redis server will eventually crash from memory exhaustion.',
      '**Cache Invalidation** is the hardest part. If a user updates their profile, the old data in the cache is now "stale" (wrong). You must either wait for the TTL to expire or actively "delete" the key on every update. A more advanced pattern is **Write-Through**, where the application writes to the cache and the cache updates the database.'
    ],
    code: `// ── Redis Cache-Aside Implementation ──
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedUser(userId) {
  const cacheKey = \`user:\${userId}\`;

  // 1. Try Cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache Miss: Fetch from DB
  const user = await db.users.findUnique({ where: { id: userId } });
  
  // 3. Populate Cache with TTL (e.g. 1 hour)
  if (user) {
    await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600);
  }

  return user;
}

// ── Rate Limiting (Performance Protection) ──
async function isRateLimited(ip) {
  const limit = 100; // max requests
  const window = 60; // per 60 seconds
  const current = await redis.incr(ip);
  
  if (current === 1) await redis.expire(ip, window);
  return current > limit;
}`
  },
  {
    id: 'perf_6',
    title: 'CDN & Edge Optimization',
    badge: 'Cloud Expert',
    badgeClass: 'badge-concept',
    content: [
      'A **Content Delivery Network (CDN)** copies your assets (images, JS, CSS) to edge servers globally. When a user in Tokyo visits your London-hosted app, they download files from Tokyo, reducing latency from 300ms to 20ms. CDN is not just for speed — it protects your origin server from traffic spikes.',
      '**Cache-Control Headers** tell the CDN and browser how to behave. \`public, max-age=31536000, immutable\` is used for unique assets (hashed filenames). This means the user NEVER asks for that file again once they have it. \`no-cache, must-revalidate\` is used for your HTML, so users always get the latest version of your app.',
      '**Edge Functions** allow you to run code at the CDN level. You can handle authentication, A/B testing, or geographic redirects before the request even hits your main server. This "Edge Computing" is the next level of performance, moving logic as close to the user as physics allows.'
    ],
    code: `// ── Cache-Control Strategy (Express) ──

// 1. Hashed Assets (Forever)
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}));

// 2. Dynamic HTML (Always fresh)
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Edge Function: Geo-Aware Redirect (Middleware) ──
export default function middleware(request) {
  const country = request.geo?.country || 'US';
  
  // Redirect users to their local language sub-path
  if (request.nextUrl.pathname === '/') {
    return Response.redirect(new URL(\`/\${country.toLowerCase()}\`, request.url));
  }
}`
  },
  {
    id: 'perf_7',
    title: 'Load Balancing & Scaling',
    badge: 'System Design',
    badgeClass: 'badge-concept',
    content: [
      '**Vertical Scaling** means buying a bigger server. It has a ceiling and a single point of failure. **Horizontal Scaling** means running 10 small servers behind a **Load Balancer**. The load balancer distributes traffic using algorithms like Round Robin or Least Connections, ensuring no single server is overwhelmed.',
      '**Health Checks** are critical. The load balancer periodically pings /health. If a server is slow or crashing, it is pulled out of rotation automatically. This enables "Self-healing" infrastructure. **Sticky Sessions** (Session Affinity) ensure a user stays on the same server — necessary if you use local memory sessions instead of Redis.',
      '**Auto-Scaling Groups (ASG)** monitor metrics like CPU or Request Count and pull up new servers in real-time when traffic spikes. This is how platforms like Netflix handle millions of concurrent users without manual intervention. Infrastructure as Code (Terraform) makes this repeatable and reliable.'
    ],
    code: `// ── Health Check: Infrastructure Pulse ──
app.get('/health', async (req, res) => {
  try {
    // Check DB and Redis connectivity
    await Promise.all([db.ping(), redis.ping()]);
    res.status(200).json({ status: 'UP', timestamp: new Date() });
  } catch (err) {
    // Return 503 so Load Balancer removes this instance
    res.status(503).json({ status: 'DOWN', error: err.message });
  }
});

// ── NGINX: Basic Load Balancer Config ──
/*
upstream backend_cluster {
    server 10.0.0.1:5000;
    server 10.0.0.2:5000;
    server 10.0.0.3:5000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend_cluster;
        proxy_set_header Host $host;
    }
}
*/`
  }
];
