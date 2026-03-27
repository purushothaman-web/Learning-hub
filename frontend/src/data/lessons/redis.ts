import type { Lesson } from '../../types/curriculum';

export const redisLessons: Lesson[] = [
  {
    id: 'rd_0',
    title: 'Redis: The Speed of Light',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**Redis** is an open-source, **In-Memory** data structure store. Unlike Postgres which saves data to a slow hard drive, Redis keeps everything in RAM. This makes it incredibly fast, capable of millions of operations per second.',
      'Because RAM is expensive, you don\'t store your whole database in Redis. Instead, you use it as a "Cache" for frequently accessed data, a "Session Store" for user logins, or a "Message Broker" for real-time apps.',
      'Think of Redis as your application\'s "Short-term Memory". It\'s where you put things that you need to access *instantly*, but that wouldn\'t be a disaster if they were disappeared after a server reboot (provided you have a backup).'
    ],
    code: `// ── Redis Performance ──
// PostgreSQL: ~1,000 queries/sec (Disk)
// Redis:      ~100,000 ops/sec (RAM)

// ── Basic Key-Value Pair ──
SET user:123:name "Puru"
GET user:123:name # Returns "Puru" in < 1ms`
  },
  {
    id: 'rd_1',
    title: 'Caching Strategies',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'The most common use for Redis is **Caching**. When a user requests a slow piece of data (like a complex report), you first check Redis. If it\'s there ("Cache Hit"), you return it instantly. If not ("Cache Miss"), you fetch it from your DB and save it to Redis for next time.',
      '**TTLs (Time-To-Live)** are vital. You can tell Redis: "Keep this data for exactly 10 minutes". This ensures that your users don\'t see "Stale" (old) data forever while still getting the performance boost of the cache.',
      'Eviction Policies: When Redis runs out of memory, it has to decide what to delete. The most common policy is **LRU (Least Recently Used)** — it deletes the things that people haven\'t asked for in a long time, keeping the "Hot" data ready at all times.'
    ],
    code: `// ── The Cache Pattern (Pseudocode) ──
async function getDashboard(userId) {
  const cacheKey = \`dash:\${userId}\`;
  
  // 1. Try Cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache Miss: Fetch from DB
  const data = await db.fetchDashboard(userId);
  
  // 3. Save to Cache with 10min TTL
  await redis.setex(cacheKey, 600, JSON.stringify(data));
  return data;
}`
  },
  {
    id: 'rd_2',
    title: 'Data Structures: Beyond Key-Value',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'Redis isn\'t just simple strings. It supports rich data structures like **Lists** (for queues), **Sets** (for unique tags), and **Hashes** (for object-like data). These are optimized to run in constant time (`O(1)`).',
      '**Sorted Sets (ZSETs)** are a Redis superpower. Every item has a "Score", and Redis keeps them perfectly sorted automatically. This is the gold standard for building "Leaderboards" or "Most Popular" lists in real-time.',
      'Using the right structure is key. If you want to track which 500 topics a user has visited, don\'t use a string; use a **Set**. You can then instantly ask Redis: "Show me the topics User A and User B both have in common" using SINTER (Intersection).'
    ],
    code: `// ── Redis Hash (Storing a User) ──
HSET user:101 name "Puru" role "admin"
HGETALL user:101 # Returns object

// ── Sorted Set (Leaderboard) ──
ZADD scoreboard 1500 "user_a"
ZADD scoreboard 2200 "user_b"

// Get top 3 players
ZREVRANGE scoreboard 0 2 WITHSCORES`
  },
  {
    id: 'rd_3',
    title: 'Pub/Sub: Real-time Communication',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Redis includes a powerful **Publish/Subscribe (Pub/Sub)** system. One part of your app can "Publish" a message to a channel (like `news_feed`), and any other part can "Subscribe" and receive that message instantly.',
      'This is how you scale real-time apps across multiple servers. If a user on Server A posts a comment, Server A publishes it to Redis. Server B, C, and D receive it from Redis and send it to their own connected users.',
      'Warning: Pub/Sub is "Fire and Forget". If a subscriber is offline when a message is sent, they miss it. For "Reliable" messaging where every message must be processed, you should use **Redis Streams** or a queue library like BullMQ.'
    ],
    code: `// ── Listener (Server 1) ──
redis.subscribe("chat_room_1", (msg) => {
  console.log("Broadcasting to users:", msg);
});

// ── Publisher (Server 2) ──
redis.publish("chat_room_1", "Hello from another server!");`
  },
  {
    id: 'rd_4',
    title: 'Atomic Operations & Locks',
    badge: 'Expert',
    badgeClass: 'badge-code',
    content: [
      'Because Redis is single-threaded, every command is **Atomic**. If ten servers all try to increment the same counter at the exact same millisecond, Redis will handle them one-by-one, and the count will always be correct.',
      '**Distributed Locks (Redlock)**: Sometimes you need to ensure that only "one" server is doing a specific task across your whole cluster (e.g., sending the daily email). You can "Acquire a lock" in Redis.',
      'If Server A has the lock, Server B will see that the key already exists and will wait or skip the task. This prevents "Race Conditions" where multiple servers fight over the same resource or perform a task twice.'
    ],
    code: `// ── Atomic Counter (Safe for 1M concurrent reqs) ──
const newTotal = await redis.incr("site_visits");

// ── Simple Lock (Primitive) ──
const acquired = await redis.set("sync_lock", "1", "NX", "EX", 30);
if (acquired) {
  // We have the lock! Do work for 30 seconds...
  await doWork();
  await redis.del("sync_lock");
}`
  },
  {
    id: 'rd_5',
    title: 'At-Least-Once: Redis Streams',
    badge: 'Expert',
    badgeClass: 'badge-concept',
    content: [
      '**Redis Streams** are log-like data structures that allow for high-throughput, reliable messaging. Unlike Pub/Sub, messages are persisted in Redis. If a worker goes offline, it can come back and "Catch up" on the messages it missed.',
      '**Consumer Groups** allow you to divide the workload of a stream among multiple worker processes. If you have 1,000,000 image processing jobs, you can have 10 workers "Sharing" the stream, ensuring each job is processed exactly once.',
      'This is the heart of professional "Task Queues". It allows you to build asynchronous, decoupled systems that are incredibly resilient to failure and can handle massive bursts of traffic without crashing your main API.'
    ],
    code: `// ── Adding to a stream ──
XADD orders * user "puru" total "49.99"

// ── Reading from a stream (Consumer Group) ──
XREADGROUP GROUP workers worker_1 BLOCK 2000 STREAMS orders >`
  },
  {
    id: 'rd_6',
    title: 'Redis Persistence: RDB & AOF',
    badge: 'Operations',
    badgeClass: 'badge-practice',
    content: [
      'Is Redis volatile? Yes, by default. But you can enable **Persistence**. **RDB (Redis Database)** takes a "snapshot" of your memory every few minutes. It is very fast but you might lose a few minutes of data if you crash.',
      '**AOF (Append Only File)** records every single write command to a log on the hard drive. If you crash, Redis "Replays" the log to perfectly restore your state. It is much more secure but slightly slower and creates larger files.',
      'The "Hybrid Strategy": Most professional setups use BOTH. RDB for fast backups and restarts, and AOF to ensure zero data loss. This gives you the speed of an in-memory database with the safety of a traditional disk-based one.'
    ],
    code: `# ── redis.conf Essentials ──
save 900 1      # Snapshot if 1 key changes in 15min
appendonly yes  # Enable the log-based persistence
appendfsync everysec # Balance performance and security`
  },
  {
    id: 'rd_7',
    title: 'Project Execution: The Lightning Cache',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will implement a high-performance caching layer for JobTrackr. You will write a "Cache-Aside" utility that automatically stores and retrieves job postings from Redis, with a 5-minute TTL to keep data fresh.',
      'You must also use a Redis Set to track "Live Users" in real-time. When a user opens their dashboard, they are added to the set; when they close it, they are removed. This allows you to show a "5 people looking at this job" feature.',
      '**Studio Task**: Build the "PulseCache" layer. It needs to automatically invalidate (delete) the cache for a specific job whenever that job is updated in the Postgres database, ensuring users never see stale info.'
    ],
    code: `# ── Redis Checklist ──
# 1. Cache-Aside pattern used?  [Yes]
# 2. TTLs set on all keys?     [Yes]
# 3. Sets for real-time tracking? [Yes]
# 4. Error handling (Redis down)? [Yes]`
  },
  {
  id: 'rd_8',
  title: 'Cache Invalidation Strategies',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'Phil Karlton famously said "There are only two hard things in Computer Science: cache invalidation and naming things." Cache invalidation is hard because data changes at unpredictable times and multiple cached keys might depend on the same source data. The wrong strategy leads to users seeing stale data for hours.',
    '**Cache-Aside** is the most common pattern: your code checks the cache first, fetches from DB on miss, and writes to cache. On updates, your code explicitly deletes the relevant cache key (`redis.del("job:456")`). Simple, but you must remember to invalidate everywhere the data is written. Miss → always fetches correctly. Stale data only happens if you forget a deletion.',
    '**Tag-based invalidation** solves the "which keys to delete?" problem at scale. When caching a job listing, you tag it with `["company:42", "jobs"]`. When Company 42 updates their name, you delete all cache entries tagged with `"company:42"` in one operation — without knowing the exact keys. Libraries like `cache-manager` and `ioredis-tag` implement this pattern on top of Redis sets.'
  ],
  code: `// ── Cache-Aside with automatic invalidation ──
const CACHE_TTL = 300; // 5 minutes

async function getJob(jobId: string) {
  const cacheKey = \`job:\${jobId}\`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Cache miss — fetch from DB
  const job = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
  if (!job) return null;

  // Store in cache with TTL
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(job));
  return job;
}

async function updateJob(jobId: string, data: UpdateJobDto) {
  await db.query('UPDATE jobs SET title = $1 WHERE id = $2', [data.title, jobId]);

  // Invalidate all derived cache keys
  const pipeline = redis.pipeline();
  pipeline.del(\`job:\${jobId}\`);
  pipeline.del(\`company:\${data.companyId}:jobs\`);  // Listing cache also stale
  pipeline.del(\`search:*\`);  // Any search result mentioning this job
  await pipeline.exec();
}`
},
{
  id: 'rd_9',
  title: 'Distributed Rate Limiting with Lua',
  badge: 'Practice',
  badgeClass: 'badge-practice',
  content: [
    'The naive rate limiter using `INCR` + `EXPIRE` has a race condition: two concurrent requests can both read count=0, both increment to 1, and both get the first slot — while count should be at 2. The fix is a Redis **Lua script**: Lua scripts run atomically on the Redis server — no other command executes between `INCR` and `EXPIRE`. This makes the counter truly thread-safe across thousands of concurrent API instances.',
    'The **sliding window** algorithm (vs fixed window) is fairer. A fixed window resets every 60 seconds at the clock boundary — a user can make 100 requests in the last second of window 1 and 100 more in the first second of window 2 (200 requests in 2 seconds). A sliding window tracks requests in the last 60 real seconds regardless of clock boundaries.',
    'For production rate limiting, the `rate-limiter-flexible` library implements sliding window + token bucket algorithms on Redis with Lua scripts, handling all edge cases. The sliding window via sorted sets: `ZADD key timestamp requestId` + `ZREMRANGEBYSCORE key 0 (now - window)` + `ZCARD key` — atomic with Lua or a pipeline.'
  ],
  code: `-- ── Lua script: atomic sliding window rate limiter ──
-- Run with: redis.eval(script, 1, key, now, window, limit)
local key      = KEYS[1]
local now      = tonumber(ARGV[1])
local window   = tonumber(ARGV[2])  -- Window in ms
local limit    = tonumber(ARGV[3])

-- Remove entries older than the window
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

-- Count current entries
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add this request with current timestamp as score
  redis.call('ZADD', key, now, now .. math.random())
  redis.call('PEXPIRE', key, window)
  return 1  -- Allowed
else
  return 0  -- Rate limited
end

// ── Use from Node.js ──
const script = fs.readFileSync('./rate-limit.lua', 'utf-8');
const scriptSha = await redis.script('LOAD', script);

async function isAllowed(userId: string): Promise<boolean> {
  const key   = \`ratelimit:\${userId}\`;
  const now   = Date.now();
  const window = 60_000;  // 60 seconds
  const limit  = 100;

  const result = await redis.evalsha(scriptSha, 1, key, now, window, limit);
  return result === 1;
}`
},
{
  id: 'rd_10',
  title: 'ioredis: Production Setup',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    '**ioredis** is the production-grade Redis client for Node.js. Unlike the official `redis` npm package, ioredis has built-in support for Redis Cluster, Sentinel (high availability), pipelines, Lua scripting, and automatic reconnection. Creating the client correctly at startup means all subsequent usage is a simple import.',
    '**Graceful degradation** is critical for Redis. If your cache is down, your app should still work — just slower. Wrap every Redis call in a try-catch. A cache miss (due to Redis being unreachable) should fall through to the database, not crash the request. Set `lazyConnect: true` and `maxRetriesPerRequest: 1` to fail fast instead of hanging waiting for Redis.',
    'For high-traffic production, use **Redis Cluster** (horizontal scaling via sharding) or **Redis Sentinel** (high availability via primary/replica failover). ioredis handles both natively — just change the constructor from `new Redis(url)` to `new Redis.Cluster(nodes)` or `new Redis({ sentinels: [...] })`. The rest of your code stays identical.'
  ],
  code: `// ── lib/redis.ts ──
import Redis from 'ioredis';

function createRedisClient() {
  const client = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
    maxRetriesPerRequest: 2,   // Fail fast, don't block the request
    enableOfflineQueue: false, // Don't queue commands while disconnected
  });

  client.on('connect',  () => console.log('Redis connected'));
  client.on('error',    (err) => console.error('Redis error:', err.message));
  client.on('reconnecting', () => console.warn('Redis reconnecting...'));

  return client;
}

export const redis = createRedisClient();

// ── Graceful degradation wrapper ──
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn('Redis read failed, bypassing cache:', err.message);
    return null;  // Fall through to DB — app still works
  }
}`
},
{
  id: 'rd_11',
  title: 'Memory Management & Eviction',
  badge: 'Operations',
  badgeClass: 'badge-concept',
  content: [
    'Redis is an **in-memory database** — all data lives in RAM. When total memory usage approaches the `maxmemory` limit, Redis must either reject new writes (`noeviction` policy, the default) or start removing existing keys to make room. In production, `noeviction` causes your app to receive errors when the cache is full. Always configure an eviction policy explicitly.',
    '**LRU (Least Recently Used)** eviction (`allkeys-lru`) removes the key that hasn\'t been accessed for the longest time. This is the right choice for a cache — the data most likely to be requested again is the data most recently accessed. `volatile-lru` only evicts keys that have TTL set, preserving keys without TTL (like session data).',
    '**Monitor memory continuously**: run `INFO memory` to see `used_memory_human` (current), `maxmemory_human` (limit), `mem_fragmentation_ratio` (should be close to 1.0 — above 1.5 means RAM is wasted on fragmentation). Set `MAXMEMORY` to 75% of your Redis instance\'s available RAM to leave headroom for Redis\'s own internal data structures and copy-on-write operations.'
  ],
  code: `# ── Check memory usage ──
redis-cli INFO memory

# Key fields to watch:
# used_memory_human:     1.50G   ← current usage
# maxmemory_human:       2.00G   ← configured limit
# mem_fragmentation_ratio: 1.24  ← healthy (< 1.5)
# evicted_keys:          0       ← 0 = good, > 0 = eviction happening

# ── Configure eviction policy ──
# In redis.conf:
maxmemory 1536mb             # 75% of 2GB
maxmemory-policy allkeys-lru # Evict least recently used keys

# Or set at runtime (not persistent after restart):
redis-cli CONFIG SET maxmemory 1536mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# ── Find the largest keys consuming memory ──
redis-cli --bigkeys

# ── Analyze key patterns (which types consume most memory) ──
redis-cli --memkeys

# ── Set TTL on all keys at creation (prevents unbounded growth) ──
# Never use redis.set(key, value) without an expiry in a cache layer
await redis.setex('job:456', 300, JSON.stringify(job));  // 5 min TTL`
}
];

