import type { Lesson } from '../../types/curriculum';

export const secureCodingLessons: Lesson[] = [
{
  id: 'sc_0',
  title: 'Secure Coding Fundamentals',
  badge: 'Foundations',
  badgeClass: 'badge-concept',
  content: [
    'Secure coding is not a feature you add at the end — it is a discipline woven into every line you write. The attacker\'s mindset: every input field is an injection point, every URL parameter is an attack vector, every error message is intelligence. Your default posture should be **zero trust of user input**: assume everything coming from outside your system is hostile until your code proves otherwise.',
    'The **Principle of Defense in Depth** means not relying on a single security control. Your API route might validate the request body, but what if someone bypasses the validation by crafting a raw HTTP request? There should be validation at the route level, sanitization in the service layer, and parameterized queries at the database layer. Multiple layers mean a single failure doesn\'t lead to a breach.',
    '**Secure defaults**: ship with the most restrictive setting and require explicit opt-in to less secure behavior. `httpOnly: true` on cookies by default. CORS restricted to known origins by default. Database users created with `SELECT` permission only, with `INSERT`/`UPDATE` granted explicitly. The principle is: if you forget to configure something, the secure behavior should happen automatically.'
  ],
  code: `// ── The Layered Defense Model ──
// Layer 1: Input validation (schema shape)
const schema = z.object({ email: z.string().email(), age: z.number().min(0).max(150) });
const data = schema.parse(req.body);

// Layer 2: Sanitization (remove dangerous content)
import DOMPurify from 'isomorphic-dompurify';
const safeHtml = DOMPurify.sanitize(data.bio);

// Layer 3: Parameterized query (never inject into SQL)
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [data.email]
);

// Layer 4: Output encoding (prevent XSS on render)
// React does this automatically - never use dangerouslySetInnerHTML with user data`
},
{
  id: 'sc_1',
  title: 'Input Validation & Sanitization',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    '**Validation** checks that data is structurally correct — the right type, right length, right format. An email must match `^[^@]+@[^@]+\\.[^@]+$`. An age must be a number between 0 and 150. A username must be alphanumeric with no SQL special characters. Reject at the door — don\'t let malformed data enter your system.',
    '**Sanitization** is a second pass after validation — removing or escaping potentially harmful content that still passes structural validation. A biography field might contain a valid string but include `<script>` tags. A comment might be correctly formatted but contain SQL fragments. Sanitize before storing and again before rendering.',
    '**Zod** is the gold standard for TypeScript validation. Unlike `express-validator`, Zod schemas are type-safe — your validated data type is automatically inferred from the schema. If the schema says `z.number()`, TypeScript knows the output is a `number`, not `any`. Validation and type narrowing happen in one step.'
  ],
  code: `import { z } from 'zod';

// ── Define schema with business rules ──
const CreateJobSchema = z.object({
  title:       z.string().min(5).max(100).trim(),
  description: z.string().min(20).max(5000).trim(),
  salary:      z.number().positive().max(10_000_000),
  email:       z.string().email().toLowerCase(),
  tags:        z.array(z.string().max(30)).max(10).optional(),
});

// ── Use in Express route ──
app.post('/api/jobs', (req, res) => {
  const result = CreateJobSchema.safeParse(req.body);

  if (!result.success) {
    // Return structured errors to the client
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }

  // result.data is now fully typed — no 'any'
  const job = await jobService.create(result.data);
  res.status(201).json(job);
});`
},
{
  id: 'sc_2',
  title: 'Secure HTTP Headers with Helmet',
  badge: 'Security',
  badgeClass: 'badge-concept',
  content: [
    '**HTTP Security Headers** are low-effort, high-impact defenses configured in your web server. **Content-Security-Policy (CSP)** tells the browser which scripts, styles, and media sources are trusted — a strict CSP makes XSS attacks nearly impossible to execute even if an injection point exists. **X-Frame-Options: DENY** prevents your app from being embedded in an `<iframe>` on another site (prevents clickjacking).',
    '**HSTS (HTTP Strict Transport Security)** with a long `max-age` (31536000 = 1 year) tells browsers to always use HTTPS for your domain, making SSL-stripping attacks impossible. **X-Content-Type-Options: nosniff** prevents browsers from guessing the MIME type of a response (prevents a `.png` file containing JavaScript from executing). These headers are a 5-minute fix with `helmet.js` in Express.',
    '**CORS (Cross-Origin Resource Sharing)** headers control which external domains can call your API. The insecure `Access-Control-Allow-Origin: *` allows any website to make authenticated requests to your API using your users\' session cookies. Always whitelist specific origins. Never use the wildcard with `credentials: true` — browsers refuse this combination by spec.'
  ],
  code: `import helmet from 'helmet';
import cors from 'cors';

// ── Apply all security headers at once ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "https://trusted-cdn.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// ── Lock down CORS ──
const allowedOrigins = [
  'https://jobtrackr.com',
  'https://www.jobtrackr.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,   // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));`
},
{
  id: 'sc_3',
  title: 'Secrets Management Best Practices',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'A **secret** is any credential that grants access to a resource: API keys, database passwords, JWT signing keys, encryption keys, OAuth client secrets. Secrets have three failure modes: committed to version control (the most common breach vector), hardcoded in application code, or stored in plaintext files on servers. Each of these has caused major, publicized security incidents.',
    'The local development standard is **dotenv** (`.env` files) with `.env` in `.gitignore`. But `.env` files on production servers are risky — they can be read by anyone with shell access. Production secrets should come from a **secrets manager**: AWS Secrets Manager, HashiCorp Vault, or Doppler. These provide: encrypted storage, audit logs of every access, automatic rotation, and fine-grained access control.',
    '**Secret rotation** is the practice of automatically changing credentials on a schedule. AWS Secrets Manager can rotate RDS passwords automatically — it generates a new password, updates the database, and updates the secret, all without downtime. Your application always fetches the secret at startup (or refreshes it periodically) — it never holds a stale credential.'
  ],
  code: `// ── Local dev: .env + Zod validation ──
// .gitignore: .env, .env.local, .env.production

import { z } from 'zod';
import 'dotenv/config';

const EnvSchema = z.object({
  DATABASE_URL:       z.string().url(),
  JWT_SECRET:        z.string().min(32),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  NODE_ENV:          z.enum(['development', 'staging', 'production']),
  PORT:              z.coerce.number().default(3000),
});

// Crash at startup if any secret is missing or malformed
export const env = EnvSchema.parse(process.env);

// ── Production: fetch from AWS Secrets Manager ──
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'ap-south-1' });

async function getSecret(secretName: string): Promise<Record<string, string>> {
  const { SecretString } = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(SecretString!);
}

// Usage at app startup:
const secrets = await getSecret('prod/jobtrackr/db');
// secrets.password, secrets.username are now available`
},
{
  id: 'sc_4',
  title: 'Rate Limiting & Abuse Protection',
  badge: 'Practice',
  badgeClass: 'badge-practice',
  content: [
    '**Rate limiting** is a multi-layer defense against brute-force attacks, credential stuffing, and API abuse. At the most basic level, limit how many requests any single IP can make per minute. But IP-based rate limiting is easy to bypass with a botnet. Layer with **user-level limits** (even authenticated users can\'t hammer your API) and **progressive backoff** (exponentially increasing delays after repeated failures).',
    'The `/api/login` endpoint is the most critical to rate limit — it\'s the target of credential stuffing (automated attempts using leaked email/password combinations from other breaches). Best practice: after 5 failed attempts, require CAPTCHA. After 10, lock out for 15 minutes. Log every failure with the IP and user agent for threat intelligence. Notify the user via email if their account is locked.',
    '**Redis-based rate limiting** is production-ready — it\'s atomic (`INCR` is atomic in Redis), shared across all server instances (unlike in-memory rate limiting which only works for single-server setups), and automatically expires via TTL. The `rate-limiter-flexible` library provides Redis-backed rate limiting with battle-tested logic for all the edge cases.'
  ],
  code: `import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// ── Protect login endpoint: 5 attempts per 15 min per IP ──
const loginLimiter = new RateLimiterRedis({
  storeClient:       redis,
  keyPrefix:         'login_fail',
  points:            5,         // 5 attempts
  duration:          900,       // per 15 minutes
  blockDuration:     900,       // block for 15 minutes after limit
});

app.post('/api/login', async (req, res) => {
  const ip = req.ip;
  try {
    await loginLimiter.consume(ip);
  } catch {
    return res.status(429).json({
      error: 'Too many login attempts. Try again in 15 minutes.',
    });
  }

  // Proceed with login...
  const user = await authService.validateCredentials(req.body);
  if (!user) {
    // Increment on failure — not on success
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await loginLimiter.delete(ip); // Reset on successful login
  res.json({ token: generateJWT(user) });
});`
},
{
  id: 'sc_5',
  title: 'Project Execution: Secure API Audit',
  badge: 'Project',
  badgeClass: 'badge-practice',
  content: [
    'In this task, you will perform a security audit of the JobTrackr API and document 5 specific security improvements required. For each endpoint, verify: input is validated with a Zod schema (no raw `req.body` usage), database queries are parameterized (no string concatenation), rate limiting is configured, error responses don\'t leak stack traces or internal details, and security headers are set globally.',
    'Implement the full secure coding stack: Zod validation on all POST/PATCH endpoints, `helmet.js` middleware globally, `cors` configured to the specific frontend domain only, `rate-limiter-flexible` on the auth endpoints, and environment variable validation at startup. Run `npm audit` and resolve any high/critical dependencies.',
    '**Studio Task**: Add a `security.test.ts` file that tests the security properties — verify the API returns 400 for invalid schemas, 429 after 6 rapid login attempts, and that the response headers include `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and a `Content-Security-Policy` header on all responses.'
  ],
  code: `# ── Security Checklist ──
# Input Validation
# [ ] Every POST/PATCH route uses Zod schema
# [ ] File uploads validate MIME type + size
# [ ] All IDs validated as positive integers or UUIDs

# Authentication
# [ ] JWT signed with strong secret (min 32 chars)
# [ ] JWT expires in 15 minutes
# [ ] Refresh token rotation implemented

# Headers & CORS
# [ ] helmet() middleware applied globally
# [ ] CORS whitelist — no wildcard '*'
# [ ] No stack traces in production error responses

# Rate Limiting
# [ ] /api/login: 5 attempts / 15 minute per IP
# [ ] /api/register: 3 attempts / hour per IP
# [ ] General API: 100 requests / minute per user

# Dependencies
npm audit --audit-level=high
npx snyk test                # More comprehensive supply chain audit`
}
];
