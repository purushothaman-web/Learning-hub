import type { Lesson } from '../../types/curriculum';

export const systemDesignLessons: Lesson[] = [
  {
    id: 'sd_0',
    title: 'Thinking in Systems: Scale & Trade-offs',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**System Design** is the art of building software that can handle millions of users without crashing. It is not about writing code; it is about choosing the right **Architecture** and understanding the fundamental trade-offs between speed, reliability, and cost.',
      'The biggest myth in engineering is that there is a "Best" database or a "Best" framework. In system design, everything is a trade-off. If you want high speed, you might sacrifice data consistency. If you want high availability, you might increase your cloud bill.',
      'Core Goal: **Scalability**. A scalable system is one where you can handle twice as much traffic by simply adding twice as much hardware (Horizontal Scaling). If you stay on one giant server (Vertical Scaling), you will eventually hit a wall that no amount of money can break.'
    ],
    code: `// ── The Scaling Equation ──
// [ Vertical Scaling ] (Scale UP)
//   Buy a bigger CPU/RAM. 
//   Limits: Financial and Physical.

// [ Horizontal Scaling ] (Scale OUT)
//   Add more identical servers.
//   Limits: None (in theory). 
//   Requirement: Stateless Architecture.`
  },
  {
    id: 'sd_1',
    title: 'Load Balancing & High Availability',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'A **Load Balancer** is the "Traffic Cop" of your system. It sits in front of your servers and distributes incoming requests evenly so that no single server is overwhelmed. It is the single most important tool for achieving High Availability.',
      '**Health Checks**: If one of your servers crashes, the load balancer detects it and stops sending traffic there. This allows you to perform "Zero Downtime Deploys" and survive hardware failures without your users ever noticing a problem.',
      'Algorithms: How does the cop decide where to send traffic? "Round Robin" is simple (1, 2, 3...). "Least Connections" is smarter (sends to the quietest server). "IP Hash" ensures that a specific user always goes to the same server (essential for some auth systems).'
    ],
    code: `# ── Nginx as a Load Balancer ──
upstream api_servers {
    server api-1.internal:3000;
    server api-2.internal:3000;
    server api-3.internal:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://api_servers;
    }
}`
  },
  {
    id: 'sd_2',
    title: 'Database Scaling: Sharding & Replicas',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Your database is almost always the first thing to break under scale. To fix this, we use **Read Replicas**. You have one "Primary" database for writing data, and multiple "Copies" for reading it. Since most apps are 90% reads, this is a huge win.',
      '**Database Sharding** is the ultimate solution. You split one giant table into many smaller ones. Users A-M go to Server 1, and Users N-Z go to Server 2. This is how giants like Facebook and Twitter handle billions of rows of data.',
      'Consistency Trade-off (Eventual Consistency): If you write an update to the Primary, it takes a few milliseconds to reach the Replicas. If a user refreshes *instantly*, they might see their old data. This is a trade-off you must plan for in your UI design.'
    ],
    code: `// ── The Database Split ──
// WRITE -> [ Primary DB ]
//             | (Replication)
//             v
// READ  <- [ Replica 1 ]
// READ  <- [ Replica 2 ]
// READ  <- [ Replica 3 ]

// In the code:
const db = {
  get: () => connectToReplica(),
  set: () => connectToPrimary()
};`
  },
  {
    id: 'sd_3',
    title: 'CAP Theorem: The Laws of Physics',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'The **CAP Theorem** states that a distributed system can only provide two out of these three guarantees: **Consistency** (all users see the same data), **Availability** (the system stays up), and **Partition Tolerance** (the system works even if servers can\'t talk).',
      'In reality, you MUST have Partition Tolerance in the cloud. So the choice is really between **Consistency vs Availability**. A bank chooses Consistency (it\'s better for the site to be down than to show the wrong balance). A social media site chooses Availability.',
      'Understanding CAP helps you choose the right database. Relational DBs (Postgres) favor Consistency. NoSQL DBs (Cassandra, DynamoDB) favor Availability. There is no "Perfect" choice, only the right one for your specific problem.'
    ],
    code: `// ── The CAP Triangle ──
// [C] Consistency
// [A] Availability
// [P] Partition Tolerance (Required)

// ⚡ CP: Strong Consistency (PostgreSQL)
// ⚡ AP: High Availability (DynamoDB)

// Ask yourself: "Does it matter if the Like count 
// is 100 on my laptop and 102 on your phone?"`
  },
  {
    id: 'sd_4',
    title: 'Horizontal vs Vertical Scaling',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**Vertical Scaling** (Scale UP) is like buying a faster car. It\'s easy to do (just click a button in AWS), but it has a hard limit. Eventually, you can\'t buy a faster CPU, and the cost starts increasing exponentially.',
      '**Horizontal Scaling** (Scale OUT) is like adding more cars to a highway. It\'s more complex to manage because you need a load balancer and a stateless API, but it is theoretically infinite. You can have 10,000 small servers working as one.',
      'Modern cloud architecture is almost entirely Horizontal. We build our apps so that they don\'t care which server they are running on. If a server dies, AWS automatically spawns a new one to replace it, and the load balancer keeps traffic flowing.'
    ],
    code: `/* ── Scaling Strategy ── */
// 1. Vertical: Max out your dev database.
// 2. Horizontal: Scale your API servers.
// 3. Sharding: Last resort for huge data.

// Rule: Scale the easiest parts (Stateless API) 
// before the hard parts (Stateless Database).`
  },
  {
    id: 'sd_5',
    title: 'Microservices vs The Monolith',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'A **Monolith** is one giant application where everything lives together. It is fast to develop and easy to test. For most startups, a monolith is the correct choice to start with.',
      '**Microservices** break the app into many small, independent services (e.g., Auth Service, Payment Service, Feed Service). Each has its own database. This allows large teams to work independently without stepping on each other\'s toes.',
      'The "Microservice Tax": Microservices are much harder to maintain. You have to handle network failures between services, complex deployments, and "Distributed Tracing" to find bugs. Don\'t switch to them until your team size or scaling needs absolutely demand it.'
    ],
    code: `// ── Architecture Layout ──
// Monolith: [ API + DB ]

// Microservices:
// [ Auth Service ]    -> [ Auth DB ]
// [ Payment Service ] -> [ Payment DB ]
// [ API Gateway ]     -> (Route to services)`
  },
  {
    id: 'sd_6',
    title: 'Caching: The Speed Engine',
    badge: 'Performance',
    badgeClass: 'badge-practice',
    content: [
      'Caching is the single most effective way to improve system performance. We cache at every layer: the browser (static assets), the CDN (edge images), and the server (API results in Redis).',
      '**CDN (Content Delivery Network)**: Instead of a user in India fetching an image from your server in New York, the CDN serves it from a server in Mumbai. This reduces latency from 300ms to 10ms.',
      'Cache Invalidation is the hardest problem in computer science. If you cache a job posting for 24 hours, but the job is filled 1 minute later, your users see false data. You need a strategy (like TTLs or selective purging) to keep the cache fresh.'
    ],
    code: `// ── Cache Layer Checklist ──
// 1. Browser: Cache-Control headers
// 2. CDN: CloudFront / Cloudflare
// 3. Application: Redis (Strings/Hashes)
// 4. DB: Buffer Pool / Query Cache`
  },
  {
    id: 'sd_7',
    title: 'Project Execution: Scalable Architecture',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will design the "Global-Scale" architecture for JobTrackr. You must draw a diagram (using code/text) showing how a user request travels through a Load Balancer, to a cluster of API servers, fetching data from a Redis cache and a Postgres Primary/Replica cluster.',
      'The goal is to eliminate any "Single Point of Failure". You must explain what happens if any one component crashes and how the system remains available to the user.',
      '**Studio Task**: Build the "Redundancy Plan" for JobTrackr. Design the migration from a single-server monolith to a horizontally scaled cluster with an Nginx load balancer and a Redis caching layer.'
    ],
    code: `# ── Architecture Checklist ──
# 1. Load Balancer setup?     [Yes]
# 2. Redis Cache Tier?        [Yes]
# 3. Read Replicas mapped?    [Yes]
# 4. No state on API server?   [Yes]`
  },
  {
  id: 'sd_8',
  title: 'API Gateway & Edge Layer',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'An **API Gateway** is the single entry point for all client traffic. Instead of the frontend knowing about 12 internal microservices, it talks to one stable gateway that routes, authenticates, and rate-limits requests before forwarding them. This simplifies the client dramatically and centralizes cross-cutting concerns.',
    'Gateways handle: **Authentication** (validate JWT once at the gateway, pass identity downstream), **Rate Limiting** (protect all services with one config), **SSL Termination** (decrypt HTTPS at the edge, internal traffic uses plain HTTP), **Request/Response Transformation** (rename fields, merge responses from multiple services), and **Caching** (cache hot responses at the edge).',
    'In AWS, **API Gateway + Lambda** is the serverless pattern — each route triggers a Lambda function, no servers to manage. For self-hosted, **Kong** (built on Nginx) or **Traefik** provide plugin ecosystems. For Kubernetes, the Nginx Ingress Controller or AWS ALB Ingress Controller fills this role. Choose based on your infrastructure: managed cloud vs self-hosted Kubernetes.'
  ],
  code: `# ── Kong API Gateway: declarative config ──
# kong.yaml
services:
  - name: jobs-api
    url: http://jobs-service:3000
    routes:
      - name: jobs-routes
        paths: [/api/jobs]
    plugins:
      - name: jwt           # Validate JWT at gateway
      - name: rate-limiting
        config:
          minute: 100       # 100 req/min per consumer
          policy: redis     # Shared across gateway instances

  - name: auth-api
    url: http://auth-service:3001
    routes:
      - name: auth-routes
        paths: [/api/auth]
    plugins:
      - name: rate-limiting
        config:
          minute: 10        # Stricter limit on auth endpoints`
},
{
  id: 'sd_9',
  title: 'Message Queues & Async Processing',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'Not all work should be done synchronously inside an HTTP request. When a user uploads a 10MB resume, your API should respond with `202 Accepted` in milliseconds, push a job to a **message queue**, and let a background **worker** handle the slow processing (PDF parsing, AI embedding generation, S3 upload). The user doesn\'t wait 10 seconds — they\'re told "Processing...".',
    '**BullMQ** (backed by Redis) is the production choice for Node.js job queues. It provides: job retries with exponential backoff, job priorities, rate-limited workers, delayed jobs, recurring cron jobs, and a Web UI dashboard. Each job in the queue is processed by exactly one worker — no double-processing, even if you run 10 worker instances.',
    'For microservices that need pub/sub (many services react to one event), use **Apache Kafka** or **AWS SQS + SNS**. Kafka provides durable, ordered, replayable event streams — perfect for event sourcing. SQS is simpler and managed. The key question: does each message need to be processed by *one* service (queue semantics) or *many* services (pub/sub semantics)?'
  ],
  code: `// ── BullMQ: producer (API route) ──
import { Queue } from 'bullmq';
const resumeQueue = new Queue('resume-processing', {
  connection: { host: 'localhost', port: 6379 }
});

app.post('/api/resumes/upload', authenticate, async (req, res) => {
  const s3Key = await uploadRawToS3(req.file);  // Fast: just upload raw file

  // Add job to queue — returns instantly
  const job = await resumeQueue.add('parse-resume', {
    userId: req.user.id,
    s3Key,
    uploadedAt: new Date().toISOString(),
  }, {
    attempts: 3,                    // Retry 3 times on failure
    backoff: { type: 'exponential', delay: 2000 },
  });

  res.status(202).json({ jobId: job.id, status: 'processing' });
});

// ── BullMQ: consumer (worker process) ──
import { Worker } from 'bullmq';
const worker = new Worker('resume-processing', async (job) => {
  const { userId, s3Key } = job.data;
  const text = await parseResumeFromS3(s3Key);   // Slow AI processing
  const embedding = await generateEmbedding(text);
  await db.saveResume(userId, { text, embedding });
}, { connection: { host: 'localhost', port: 6379 } });`
},
{
  id: 'sd_10',
  title: 'Rate Limiting at Scale',
  badge: 'Security',
  badgeClass: 'badge-concept',
  content: [
    'Rate limiting at scale has a key constraint: your API runs on 10 servers, and each server must enforce the same global limit. An in-memory counter only works for single-server setups — distribute across 10 servers and each enforces one-tenth of the limit. The solution is a **shared counter in Redis** using atomic operations.',
    'Redis\'s `INCR` command increments a key atomically — it\'s thread-safe and process-safe. Combined with `EXPIRE`, you get a sliding window counter: `INCR user:42:req_count` + `EXPIRE user:42:req_count 60` gives you requests-per-minute across all your server instances simultaneously. The `rate-limiter-flexible` library implements advanced algorithms (fixed window, sliding window, token bucket) on top of Redis.',
    'Multi-tier rate limiting is best practice: **IP-level** (protect against non-authenticated flooding), **User-level** (prevent a single account from hammering the API after login), **Endpoint-level** (stricter limits on expensive operations like AI calls or report generation), and **Global** (protect your infrastructure from unexpected traffic spikes from any source).'
  ],
  code: `// ── Multi-tier Redis rate limiting ──
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Tier 1: IP-level (unauthenticated)
const ipLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ip',
  points: 100,      // 100 requests
  duration: 60,     // per minute
});

// Tier 2: User-level (post-authentication)
const userLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'user',
  points: 500,      // 500 requests per user
  duration: 60,
});

// Tier 3: AI endpoint limit (expensive operation)
const aiLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ai',
  points: 10,       // 10 AI calls per user
  duration: 3600,   // per hour
});

async function rateLimitMiddleware(req, res, next) {
  try {
    await ipLimiter.consume(req.ip);
    if (req.user) await userLimiter.consume(req.user.id);
    next();
  } catch {
    res.status(429).set('Retry-After', '60').json({ error: 'Rate limit exceeded' });
  }
}`
},
{
  id: 'sd_11',
  title: 'Fault Tolerance & Resilience Patterns',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'In distributed systems, **failures are not exceptions — they are expected**. Services go down, networks partition, databases slow. Your architecture must be designed to degrade gracefully rather than fail completely. The first rule: never let one service\'s failure cascade to bring down the entire system.',
    'The **Circuit Breaker** pattern prevents cascading failures. Track the error rate on calls to a downstream service. When the error rate exceeds a threshold (e.g., 50% failure in 10 seconds), the breaker "opens" — subsequent calls immediately return a fallback response without trying the failing service. After a cooldown period, the breaker half-opens and allows one test request through. If it succeeds, the breaker closes; if it fails, the cooldown resets.',
    '**Retry with exponential backoff and jitter**: Don\'t retry immediately on failure — the service might be overwhelmed. Wait, then retry. Double the wait time with each retry (exponential backoff). Add a small random delay (jitter) to prevent the "thundering herd" problem where all your instances retry simultaneously. The `cockatiel` library provides production-ready retry + circuit breaker for Node.js.'
  ],
  code: `// ── Circuit Breaker + Retry with cockatiel ──
import { circuitBreaker, retry, ExponentialBackoff, handleAll } from 'cockatiel';

const breaker = circuitBreaker(handleAll, {
  halfOpenAfter: 5000,         // Try again after 5 seconds
  breaker: {
    threshold: 0.5,            // Open if 50% of calls fail
    duration: 10_000,          // Over a 10-second window
    minimumRps: 5,             // Only engage if at least 5 req/s
  }
});

const retryPolicy = retry(handleAll, {
  maxAttempts: 3,
  backoff: new ExponentialBackoff({
    initialDelay: 100,         // Start at 100ms
    maxDelay: 10_000,          // Cap at 10s
  }),
});

// Combine: retry first, then circuit breaker
const resilientFetch = retryPolicy.wrap(breaker);

async function fetchExternalJobs(query: string) {
  return resilientFetch.execute(() =>
    externalJobsApi.search(query)
  );
  // If API is down: retries 3x with backoff
  // If still failing: circuit opens, returns fallback immediately
}`
}
];

