import type { Lesson } from '../../types/curriculum';

export const nodeLessons: Lesson[] = [
  {
    id: 'node_0',
    title: 'Node.js: The Runtime Architecture',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**Node.js** is not a programming language; it is a JavaScript runtime built on Chrome\'s V8 engine. It allows you to run JavaScript on servers, desktops, and even physical hardware, using an asynchronous, event-driven architecture.',
      'The magic behind Node.js is the **Libuv Event Loop**. While Node.js itself is single-threaded, it delegates slow operations (like reading from a hard drive or making a network request) to the operating system or its own internal thread pool, allowing it to handle thousands of concurrent connections with ease.',
      'Unlike a traditional browser environment, Node.js has no `window` or `document` object. Instead, it provides access to the computer\'s filesystem (`fs`), network (`net`), and processes, making it a powerful tool for building APIs and system utilities.'
    ],
    code: `// ── The Node.js Core Architecture ──
// [ User Code (JS/TS) ]
//      |
//      v
// [ Node.js API (fs, http, etc) ]
//      |
//      v
// [ V8 Engine ] <---> [ Libuv (Event Loop) ]
//      |                    |
//      +--------------------+
//              |
//              v
//      [ Operating System ]`
  },
  {
    id: 'node_1',
    title: 'NPM & The Module System',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**NPM (Node Package Manager)** is the world\'s largest software registry. It allows you to share your own code and use thousands of open-source libraries (like Express, Lodash, or Zod) in your projects.',
      'The **Module System** is how you organize your code. Modern Node.js uses **ES Modules** (`import`/`export`), while older projects use **CommonJS** (`require`/`module.exports`). ES Modules are preferred as they allow for better tree-shaking and are consistent with frontend development.',
      'The `package.json` file is your project\'s manifesto. It lists your dependencies, scripts (like `start` or `test`), and metadata. The `package-lock.json` ensures that everyone on your team is using the exact same version of every library, preventing "Dependency Hell".'
    ],
    code: `// ── package.json Essentials ──
{
  "name": "my-api",
  "version": "1.0.0",
  "type": "module",    /* 👈 Required for native ES Modules */
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}

// ── Importing a Module ──
import express from 'express';
import { db } from './config/db.js';`
  },
  {
    id: 'node_2',
    title: 'Buffers & Steams: Handling Data',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'When handling large files or high-volume data, you shouldn\'t load everything into memory at once. **Streams** allow you to process data piece-by-piece, which is far more efficient for memory and performance.',
      'A **Buffer** is a temporary storage area in memory that handles data that is being moved. It\'s an array of integers representing raw binary data (bytes), which is how Node.js communicates with things like the network or the disk.',
      'There are four types of streams: Readable (fetching a file), Writable (writing a log), Duplex (a network socket), and Transform (zipping a file while it\'s being written). Mastering streams is the difference between a "good" Node app and a "professional" one.'
    ],
    code: `import fs from 'fs';

// ── ❌ Bad (Reads full 2GB into memory) ──
const data = fs.readFileSync('large_movie.mp4');

// ── ✅ Good (Efficient Steaming) ──
const readStream = fs.createReadStream('large_movie.mp4');
const writeStream = fs.createWriteStream('copy.mp4');

// Pipe the data directly from source to destination
readStream.pipe(writeStream);

readStream.on('data', (chunk) => {
  console.log(\`Received \${chunk.length} bytes of data\`);
});`
  },
  {
    id: 'node_3',
    title: 'The Event Emitter Pattern',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'Many core Node.js modules are built on top of the **EventEmitter** class. It allows you to create a "listener" system where you can emit events (e.g., "new-user-registered") and handle them anywhere else in your app.',
      'This pattern is perfect for decoupled architectures. Your "AuthService" doesn\'t need to know how to send emails; it just emits a "success" event, and a separate "EmailService" listens for that event and takes action.',
      'Be careful with memory leaks! If you add an event listener but don\'t remove it when it\'s no longer needed (specifically in long-running processes or React-like environments), your application will slowly consume more and more memory.'
    ],
    code: `import { EventEmitter } from 'events';

const appEmitter = new EventEmitter();

// 1. Subscribe to an event
appEmitter.on('order-placed', (order) => {
  console.log(\`📦 Inventory updated for Order #\${order.id}\`);
});

// 2. Emit the event
setTimeout(() => {
  appEmitter.emit('order-placed', { id: 101, user: 'Puru' });
}, 1000);`
  },
  {
    id: 'node_4',
    title: 'Process, Env & Command Line',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'The **Process** object provides information about the current Node.js instance. You use it to access environment variables (`process.env`), stop the application (`process.exit()`), and listen for system signals (like "kill" or "SIGINT").',
      '**Environment Variables** are essential for security. You never hardcode API keys or database passwords in your code. Instead, you load them from an external `.env` file or from your hosting platform.',
      'Node.js is great for building **CLI tools**. You can read command-line arguments using `process.argv` or libraries like `Commander`. This allows you to build custom tools for your team, like a "deploy-bot" or a "database-seeder".'
    ],
    code: `// ── Secure Config Loading ──
import 'dotenv/config';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("❌ CRITICAL: DATABASE_URL is missing!");
  process.exit(1); // Stop the server immediately
}

// ── Handling System Signals (Graceful Shutdown) ──
process.on('SIGINT', () => {
  console.log("Stopping server safely...");
  db.close(() => {
    process.exit(0);
  });
});`
  },
  {
    id: 'node_5',
    title: 'Filesystem (FS) Mastery',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'The `fs` module is how Node.js interacts with your computer\'s files and folders. In modern projects, you should always use the **fs/promises** API to avoid blocking the event loop with synchronous calls.',
      'You can check if a file exists, read its contents, and even "Watch" it for changes. Watching is how tools like "Nodemon" or "Vite" automatically restart your app when you save a file.',
      'Working with paths: Never use manual strings like `"src/" + fileName`. The `path` module automatically handles the differences between Windows (`\`) and Mac/Linux (`/`), ensuring your code works on every operating system.'
    ],
    code: `import fs from 'fs/promises';
import path from 'path';

async function logSystemReport() {
  const filePath = path.join(process.cwd(), 'logs', 'report.json');
  
  try {
    const data = { time: new Date(), uptime: process.uptime() };
    await fs.writeFile(filePath, JSON.stringify(data));
    console.log("Report saved!");
  } catch (err) {
    console.error("Save failed:", err);
  }
}`
  },
  {
    id: 'node_6',
    title: 'Express: The Industry Standard',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      '**Express** is the most popular framework for building Node.js APIs. It provides a simple "Routing" system and a powerful "Middleware" architecture for handling requests and responses.',
      'Middleware functions are the building blocks of an Express app. They sit between the incoming request and your final route handler, performing tasks like: logging, parsing JSON, or checking for authentication.',
      'The "Chain of Responsibility" pattern: When a request hits your server, Express passes it through a series of functions (`next()`). This allows you to build clean, modular APIs where each middleware only cares about one specific task.'
    ],
    code: `const app = express();

// 1. Generic Middleware (Runs for every request)
app.use(express.json()); // Parses body to JS object

// 2. Custom Middleware
const logger = (req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next(); // 👈 Essential: continue the chain
};

// 3. Final Route Handler
app.get('/api/status', logger, (req, res) => {
  res.json({ status: 'online' });
});`
  },
  {
    id: 'node_7',
    title: 'Project Execution: The Logging Microservice',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will build a standalone Node.js utility that watches a directory for new `.txt` files and "processes" them into a structured log database. You must use Streams to handle potentially large files and Event Emitters to notify the console when processing is done.',
      'The goal is to demonstrate mastery of the Node architecture: Event Loop, Streams, and the Filesystem. Your utility must be robust enough to handle "Permissions Denied" errors without crashing.',
      '**Studio Task**: Build the "NodeWatch" script. It should use `fs.watch`, pipe incoming data through a transform stream to filter sensitive words, and write the result to a `summary.log` file.'
    ],
    code: `// ── Project Checklist ──
// 1. Uses non-blocking FS promises? [Yes]
// 2. Implements a custom Event?    [Yes]
// 3. Handles process.env safe?     [Yes]
// 4. Transform Stream implemented?  [Yes]`
  },
  {
  id: 'node_8',
  title: 'Routing & Modular Structure',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    'As your API grows beyond 5 routes, all routes in one file creates merge conflicts, readability problems, and violates the Single Responsibility Principle. **Express Router** lets you create isolated route modules — each mounted on a prefix in the main app. `app.use("/api/users", userRouter)` means `userRouter.get("/")` handles `GET /api/users` automatically.',
    'The standard Express app structure: `routes/` (defines URL patterns and delegates to controllers), `controllers/` (extract req params, call services, format responses), `services/` (business logic, orchestrates DB calls), `repositories/` (raw DB queries only). Each layer has a single responsibility and can be tested in isolation.',
    '**Middleware ordering matters critically** in Express. `app.use(express.json())` must come before any route that reads `req.body`. Authentication middleware must come before the protected routes. The error handling middleware (4-argument function) must be **last** — after all routes. Express identifies it as error middleware by the 4th `err` parameter.'
  ],
  code: `// ── src/routes/jobs.router.ts ──
import { Router } from 'express';
import * as jobsController from '../controllers/jobs.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CreateJobSchema } from '../schemas/job.schema';

export const jobsRouter = Router();

// Public routes
jobsRouter.get('/',    jobsController.listJobs);
jobsRouter.get('/:id', jobsController.getJob);

// Protected routes: authenticate first, then validate body
jobsRouter.post('/',    authenticate, validate(CreateJobSchema), jobsController.createJob);
jobsRouter.patch('/:id', authenticate, validate(UpdateJobSchema), jobsController.updateJob);
jobsRouter.delete('/:id', authenticate, jobsController.deleteJob);

// ── src/app.ts ──
import { jobsRouter } from './routes/jobs.router';
import { authRouter } from './routes/auth.router';

app.use('/api/jobs', jobsRouter);
app.use('/api/auth', authRouter);
app.use(errorMiddleware);  // Always last!`
},
{
  id: 'node_9',
  title: 'Controllers & Services Pattern',
  badge: 'Architecture',
  badgeClass: 'badge-concept',
  content: [
    'The **Controller → Service → Repository** layering is the single most important architectural pattern for maintainable Node.js apps. The Controller is thin — it extracts HTTP-specific things (URL params, query strings, req body, res.json), calls the service with plain data, and formats the response. It knows nothing about the database.',
    'The **Service** contains all business logic: "Can this user create a job posting?", "Should we send an email?", "What happens if the company doesn\'t exist?". The service never touches `req` or `res` — it\'s pure business logic that can be called from a REST route, a WebSocket handler, or a background job with the same behavior.',
    'The **Repository** (or Data Access Layer) is the only place SQL queries live. If you can swap PostgreSQL for MongoDB by only changing the repository files and nothing else, your architecture is clean. Repositories return domain objects, not raw database rows. This makes testing trivial — mock the repository, test the service logic without a real database.'
  ],
  code: `// ── controllers/jobs.controller.ts (HTTP layer) ──
export async function createJob(req: Request, res: Response) {
  const job = await jobsService.createJob(req.user.id, req.body);
  res.status(201).json(job);
}

// ── services/jobs.service.ts (business logic) ──
export async function createJob(userId: string, dto: CreateJobDto): Promise<Job> {
  const company = await companiesRepo.findByUserId(userId);
  if (!company) throw new AppError('Company not found', 404);

  if (await jobsRepo.countByCompany(company.id) >= 10) {
    throw new AppError('Job posting limit reached for free plan', 403);
  }

  const job = await jobsRepo.create({ ...dto, companyId: company.id, authorId: userId });
  await emailService.sendJobPostedConfirmation(userId, job);
  return job;
}

// ── repositories/jobs.repo.ts (data access) ──
export async function create(data: CreateJobPayload): Promise<Job> {
  const result = await pool.query(
    'INSERT INTO jobs (title, description, company_id, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.title, data.description, data.companyId, data.authorId]
  );
  return result.rows[0];
}`
},
{
  id: 'node_10',
  title: 'Centralized Error Handling',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'Copy-pasting `res.status(500).json({ error: err.message })` in every route is how you get inconsistent error formats, leaked stack traces in production, and debugging nightmares. Express\'s 4-parameter middleware `(err, req, res, next)` is the correct place to handle all errors centrally. Any route calling `next(error)` or any unhandled promise rejection flows here.',
    'Define a custom **AppError** class that carries a status code. `throw new AppError("Not found", 404)` from a service — the error middleware catches it, checks if it\'s an `AppError`, and sends the correct status code and message. Non-AppError exceptions are unexpected server errors requiring a 500 and no leaked details.',
    '**Async route wrappers** are essential. Express doesn\'t catch async errors by default — an `async` route that throws will silently hang or crash the process. Wrap every async route with a helper (`asyncHandler`) or use `express-async-errors` (which monkey-patches Express to handle async routes automatically).'
  ],
  code: `// ── lib/errors.ts ──
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ── middleware/error.middleware.ts ──
export function errorMiddleware(
  err: Error, req: Request, res: Response, next: NextFunction
) {
  // Operational error (expected, safe to expose message)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
  }

  // Unknown/programmer error (never leak details in production)
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

// ── Async route wrapper ──
const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/jobs/:id', asyncHandler(async (req, res) => {
  const job = await jobsService.getById(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  res.json(job);
}));`
},
{
  id: 'node_11',
  title: 'Request Validation with Zod',
  badge: 'Practice',
  badgeClass: 'badge-practice',
  content: [
    'Zod validation should be a reusable **middleware**, not copy-pasted logic inside each controller. Write `validate(schema)` once — it returns an Express middleware that parses `req.body` against the schema, calls `next()` on success, and calls `next(zodError)` on failure. The centralized error middleware formats the ZodError into a user-friendly response automatically.',
    'Validate more than just the body: route **params** (`:id` should be a valid UUID or positive integer), **query strings** (`?page=1&limit=10` need coercion and range validation), and **headers** for custom values. Zod\'s `.transform()` and `.coerce` allow converting strings to numbers (`z.coerce.number()`) or URL-decoding values automatically.',
    'Schema colocate with the route file (or in a `schemas/` directory). The schema becomes your API documentation — anyone reading `CreateJobSchema` knows exactly what the POST endpoint accepts, what types are allowed, and what validation rules apply. Tools like `zod-to-openapi` can generate OpenAPI specs automatically from your Zod schemas.'
  ],
  code: `// ── schemas/job.schema.ts ──
import { z } from 'zod';

export const CreateJobSchema = z.object({
  title:       z.string().min(5).max(100).trim(),
  description: z.string().min(50).max(5000).trim(),
  salary:      z.coerce.number().positive().max(10_000_000).optional(),
  location:    z.string().max(100).trim(),
  type:        z.enum(['full-time', 'part-time', 'contract', 'internship']),
  tags:        z.array(z.string().max(30)).max(10).default([]),
});

export type CreateJobDto = z.infer<typeof CreateJobSchema>;

// ── middleware/validate.ts ──
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(result.error);  // Let error middleware handle
    req.body = result.data;  // Replace body with validated + coerced data
    next();
  };
}

// ── Validate route params ──
const IdParamSchema = z.object({ id: z.coerce.number().int().positive() });

app.get('/api/jobs/:id', validate(IdParamSchema, 'params'), asyncHandler(async (req, res) => {
  const job = await jobsService.getById(req.params.id); // Already typed as number
  res.json(job);
}));`
},
{
  id: 'node_12',
  title: 'Database Connection & Pool Management',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    'A **connection pool** is a cache of database connections. Creating a TCP connection to PostgreSQL takes ~5ms. If your API creates a new connection on every request (100 req/s), you\'re spending 500ms/s just on connection overhead. A pool pre-creates 5-20 connections and reuses them. Queries wait briefly for an available connection rather than paying the full creation cost each time.',
    '**Pool configuration matters**: `max` is the maximum number of connections in the pool. Setting it too high starves the database — PostgreSQL defaults to `max_connections = 100`, and if 10 API instances each use `max = 20`, you\'ve already exhausted the database at full load. Set `max` to `(db_max_connections / num_api_instances) - 5` as a rule of thumb.',
    'Always implement a **health check** that tests the database connection. If the pool is exhausted or the database is unreachable, your app should return `503 Service Unavailable` immediately instead of hanging. The readiness probe in Kubernetes calls this endpoint — if it fails, K8s stops routing traffic to that Pod.'
  ],
  code: `// ── lib/db.ts ──
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                  // Max connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if pool exhausted
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : false,
});

// Log pool issues prominently
pool.on('error', (err) => console.error('Unexpected pool error', err));

// ── Typed query helper ──
export async function query<T>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (duration > 500) {
    console.warn({ text, duration }, 'Slow query detected');
  }

  return result.rows as T[];
}

// ── Health check ──
export async function healthCheck() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return { db: 'connected', pool: { idleCount: pool.idleCount, totalCount: pool.totalCount } };
  } finally {
    client.release();  // Always release back to pool!
  }
}`
}
];

