import type { Lesson } from '../../types/curriculum';

export const postgresqlLessons: Lesson[] = [
  {
    id: 'pg_0',
    title: 'Relational Model vs The World',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**PostgreSQL** is the world\'s most advanced open-source relational database. While "NoSQL" (like MongoDB) was popular for its flexibility, relational databases (SQL) have returned as the industry standard because of their **Reliability** and **Data Integrity**.',
      'The Relational Model is based on "Tables" with strict "Schemas". Every row in a table must follow the same rules. This prevents "Corrupt Data" from ever entering your system. If you say a user must have an email, Postgres will refuse to save a user without one.',
      '**ACID Compliance**: This is the scientific guarantee that your transactions are safe. If your server crashes halfway through a bank transfer, Postgres ensures that either the whole transfer happens OR nothing happens. There is no middle ground where money disappears.'
    ],
    code: `-- ── A Simple Relational Table ──
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── The power of "Constraints" ──
ALTER TABLE users ADD CONSTRAINT email_check 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\$');`
  },
  {
    id: 'pg_1',
    title: 'Normalization & Schema Design',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'Data architecture is about avoiding **Redundancy**. Instead of saving a company\'s name on every single Job posting, you create a `companies` table and a `jobs` table, and link them with an ID. This is called **Normalization**.',
      'Foreign Keys are "The Glue". They ensure that you cannot have a job posting for a company that doesn\'t exist. If you delete a company, Postgres can automatically delete all its jobs (CASCADE) or prevent the deletion until the jobs are moved.',
      'Getting the schema right on Day 1 is the most important decision a developer makes. A bad UI can be fixed in an hour; a bad database schema can haunt a company for decades. Think about your data "Entities" before you write a single line of code.'
    ],
    code: `-- ── Linked Tables (1-to-Many) ──
CREATE TABLE companies (
  id   INT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE jobs (
  id         INT PRIMARY KEY,
  title      TEXT NOT NULL,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE
);`
  },
  {
    id: 'pg_2',
    title: 'Joins: Bringing Data Together',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'Because we normalize our data into separate tables, we need a way to pull it back together. **JOINS** are the solution. An `INNER JOIN` finds rows that exist in both tables, while a `LEFT JOIN` keeps all rows from the primary table even if they have no match.',
      'Mastering JOINS is what separates a SQL beginner from a pro. You can combine 5 tables in a single query to get a user\'s name, their company, their recent applications, and their status — all in one efficient trip to the database.',
      'Performance warning: Large joins can be slow if you don\'t have **Indexes** on your foreign keys. Always index the columns you use in a `JOIN` or `WHERE` clause to keep your queries running in milliseconds instead of seconds.'
    ],
    code: `-- ── Combining Data ──
SELECT 
  jobs.title, 
  companies.name AS company_name
FROM jobs
JOIN companies ON jobs.company_id = companies.id
WHERE companies.name = 'Google';

-- ── Aggregation: Logic inside the DB ──
SELECT company_id, COUNT(*) as open_roles
FROM jobs
GROUP BY company_id;`
  },
  {
    id: 'pg_3',
    title: 'Indexes: The Performance Engine',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Searching for a user by email in a table of 1 million rows without an **Index** is like reading every page of a book to find one word. It takes forever. An Index is a "Table of Contents" that tells Postgres exactly where that word is.',
      'Postgres uses **B-Tree** indexes by default. They are incredibly efficient for equality (`=`) and range (`<`, `>`) searches. There are also specialized indexes like **GIN** (for searching inside JSON or Text) and **GiST** (for geographic/map data).',
      'Indexes aren\'t free! Every index you add makes "Reads" faster but makes "Writes" slightly slower because Postgres has to update the index every time a row is added. The goal is to index only the columns you search by most often.'
    ],
    code: `-- ── Make searching by email instant ──
CREATE INDEX idx_users_email ON users(email);

-- ── Multi-column index (e.g., filter by city AND category) ──
CREATE INDEX idx_jobs_location_type ON jobs(location, type);

-- ── Unique index (No two users can have the same handle) ──
CREATE UNIQUE INDEX idx_unique_handle ON users(handle);`
  },
  {
    id: 'pg_4',
    title: 'Transactions: All or Nothing',
    badge: 'Security',
    badgeClass: 'badge-concept',
    content: [
      'A **Transaction** is a group of SQL commands that are treated as a single unit. You use `BEGIN` to start one and `COMMIT` to finish it. This is the ultimate tool for "Atomic" operations.',
      'If any command in a transaction fails, you can run `ROLLBACK` to undo everything that happened since the `BEGIN`. This is essential for things like financial transfers, where you must subtract money from Account A *only if* you can successfully add it to Account B.',
      'Transaction Isolation: Postgres handles multiple people using the database at once. It ensures that my transaction doesn\'t accidentally see your "Half-finished" work, preventing data corruption in high-traffic applications.'
    ],
    code: `-- ── The "Bank Transfer" Pattern ──
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If we lose power now, NO MONEY IS MOVED.
COMMIT;`
  },
  {
    id: 'pg_5',
    title: 'JSONB: The Best of Both Worlds',
    badge: 'Advanced',
    badgeClass: 'badge-code',
    content: [
      'PostgreSQL has a secret weapon: **JSONB**. This allows you to store and query unstructured JSON data inside a traditional relational table. You get the flexibility of NoSQL (MongoDB) with the power of SQL.',
      'JSONB is stored in a binary format that is indexed and fast to search. You can ask Postgres: "Find all users whose profile JSON contains the skill \'React\'". It will find them in milliseconds, even in a table with millions of rows.',
      'When to use it: JSONB is perfect for "Metadata" or things that change constantly (like user preferences or dynamic forms). For your core data (users, jobs, orders), stick to standard columns to keep your data clean and consistent.'
    ],
    code: `-- ── Storing JSON in Postgres ──
CREATE TABLE candidates (
  id       INT PRIMARY KEY,
  name     TEXT,
  metadata JSONB  -- 👈 Any structure allowed
);

-- ── Advanced Querying inside JSON ──
SELECT name FROM candidates
WHERE metadata->'skills' ? 'TypeScript';`
  },
  {
    id: 'pg_6',
    title: 'Stored Procedures & Triggers',
    badge: 'Operations',
    badgeClass: 'badge-code',
    content: [
      'Sometimes logic belongs inside the database itself. **Stored Procedures** (PL/pgSQL) are functions that run on the Postgres server. This is faster than pulling data into Node.js, processing it, and sending it back.',
      '**Triggers** are automated actions. You can tell Postgres: "Every time a job is deleted, automatically move it to the `archived_jobs` table". This ensures that your data business rules are enforced even if someone forgets to write the code in the API.',
      'Professional Tip: Use triggers for "Audit Logs" (tracking who changed what). Since the database itself records the change, it is impossible for a developer to accidentally "Skip" the logging step.'
    ],
    code: `-- ── Automating "Updated At" timestamps ──
CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();`
  },
  {
    id: 'pg_7',
    title: 'Project Execution: Data Architect',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will design the full database architecture for "JobTrackr". You will define the schema for Users, Jobs, and Applications, implement the necessary Foreign Keys and Indexes, and write a complex SQL Join to generate a monthly report.',
      'The goal is a "Production Grade" schema that is normalized and performant. You must also write a database "Migration" script that safely updates the table structure without losing any existing student data.',
      '**Studio Task**: Build the "Core-DB" migration. It must handle the relationship between Users and their Applications, ensuring that if a user deletes their account, their application history is anonymized but not deleted.'
    ],
    code: `# ── Schema Checklist ──
# 1. Primary Keys on all tables? [Yes]
# 2. Foreign Keys verified?     [Yes]
# 3. Created_at/Updated_at?     [Yes]
# 4. Indexes for main queries?  [Yes]`
  },
  {
  id: 'pg_8',
  title: 'Query Optimization & EXPLAIN',
  badge: 'Performance',
  badgeClass: 'badge-concept',
  content: [
    '`EXPLAIN ANALYZE` is your most powerful debugging tool for slow queries. It shows the **query execution plan** — how PostgreSQL actually runs the query, which indexes it uses, how many rows it scans, and the real execution time. The two most critical things to look for: **Seq Scan** on a large table (scanning every row — add an index) and **actual rows >> estimated rows** (statistics are stale — run `ANALYZE table_name` to update them).',
    'Reading an EXPLAIN output: each node shows `(cost=startup..total rows=N width=W)`. `cost` is abstract units (not milliseconds). The actual runtime appears on the `Actual time=X..Y` line after ANALYZE runs. **Nested Loop** joins are expensive for large datasets — they multiply row counts. A **Hash Join** or **Merge Join** is usually faster for large sets.',
    'Common fixes: add indexes on columns in `WHERE`, `JOIN ON`, and `ORDER BY` clauses. Use **partial indexes** (`CREATE INDEX ON jobs(created_at) WHERE status = \'active\'`) — they\'re smaller and faster than full-table indexes. Use **covering indexes** (`CREATE INDEX ON jobs(company_id) INCLUDE (title, salary)`) so the query engine never touches the main table for those columns.'
  ],
  code: `-- ── Read a real EXPLAIN ANALYZE output ──
EXPLAIN ANALYZE
SELECT j.*, c.name as company_name
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.status = 'active'
  AND j.created_at > NOW() - INTERVAL '30 days'
ORDER BY j.created_at DESC
LIMIT 20;

-- ── Find slow queries in PostgreSQL logs ──
-- In postgresql.conf:
log_min_duration_statement = 500   -- Log queries > 500ms

-- ── Check missing indexes ──
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'jobs';

-- ── Add a partial + covering index ──
CREATE INDEX CONCURRENTLY idx_jobs_active_recent
  ON jobs (created_at DESC)
  INCLUDE (title, company_id, salary)
  WHERE status = 'active';
-- CONCURRENTLY = no table lock during creation`
},
{
  id: 'pg_9',
  title: 'Pagination Strategies',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    '**Offset pagination** (`LIMIT 10 OFFSET 1000`) is simple but has a critical flaw at scale: PostgreSQL must read and discard the first 1000 rows before returning 10. At page 500 (OFFSET 5000), it\'s reading 5010 rows to return 10. On a 1M-row jobs table, page 10000 causes a full table scan. It also produces inconsistent results if rows are inserted/deleted between page fetches.',
    '**Cursor-based pagination** solves both problems. Instead of "skip N rows", you say "give me 10 rows where `id > last_seen_id`". PostgreSQL uses the index on `id` directly — no wasted scans. The API returns `nextCursor: "1456"` with each page; the client sends `?cursor=1456` with the next request. Stable, fast at any depth, and the gold standard for production APIs.',
    'For **search-sorted results** (by relevance or score, not just ID), cursor pagination gets complex — use `(score, id)` composite cursors to maintain stable ordering. For infinite-scroll UI patterns, cursor pagination is essential. For traditional numbered pages, consider **keyset pagination** which tracks a composite of the sort column + id as the key.'
  ],
  code: `-- ── Offset pagination (avoid on large tables) ──
SELECT id, title, salary, created_at
FROM jobs
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10 OFFSET 200;   -- Gets slower as OFFSET grows

-- ── Cursor pagination (production-ready) ──
-- First page (no cursor):
SELECT id, title, salary, created_at
FROM jobs
WHERE status = 'active'
ORDER BY created_at DESC, id DESC
LIMIT 11;   -- Fetch 11, if 11 returned → there's a next page

-- Next page (with cursor from last row):
SELECT id, title, salary, created_at
FROM jobs
WHERE status = 'active'
  AND (created_at, id) < ('2024-01-15T10:30:00Z', 456)
ORDER BY created_at DESC, id DESC
LIMIT 11;

// ── Node.js cursor pagination helper ──
async function getJobs(cursor?: { createdAt: string; id: number }) {
  const result = await pool.query(
    cursor
      ? 'SELECT * FROM jobs WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 11'
      : 'SELECT * FROM jobs ORDER BY created_at DESC, id DESC LIMIT 11',
    cursor ? [cursor.createdAt, cursor.id] : []
  );
  const jobs = result.rows.slice(0, 10);
  const nextCursor = result.rows.length === 11
    ? { createdAt: result.rows[9].created_at, id: result.rows[9].id }
    : null;
  return { jobs, nextCursor };
}`
},
{
  id: 'pg_10',
  title: 'Database Migrations',
  badge: 'Operations',
  badgeClass: 'badge-practice',
  content: [
    'A **migration** is a versioned, ordered script that transforms your database schema from one state to another. Instead of running `ALTER TABLE` directly in production (risky, manual, unrepeatable), you write migration files that your tool applies automatically, tracking which ones have already run. Migrations are committed to Git — the schema\'s history lives alongside the code.',
    '**Knex.js** is the most common migration tool in Node.js — it generates timestamped migration files, provides a fluent schema builder API, and runs `knex migrate:latest` in CI before deploying. Each migration has an `up` function (apply change) and a `down` function (rollback). Always write the `down` function — it saves you at 3 AM when a deploy goes wrong.',
    '**Safe production migration patterns**: Adding a column (`ADD COLUMN`) is safe (no lock). Adding a non-null column without a default requires a table rewrite — add it nullable first, backfill, then add the constraint. Dropping a column requires deploying code that doesn\'t reference it first, then removing the column. Renaming a column requires a two-deploy approach: add the new name, update code, drop old name. These patterns prevent downtime.'
  ],
  code: `# ── Knex migration setup ──
npm install knex
npx knex init     # Creates knexfile.js

# Generate a new migration file
npx knex migrate:make add_salary_to_jobs

# Apply all pending migrations
npx knex migrate:latest

# Rollback last batch
npx knex migrate:rollback

-- ── migrations/20240315_add_salary_to_jobs.js ──
exports.up = async (knex) => {
  await knex.schema.table('jobs', (table) => {
    table.decimal('salary_min', 10, 2).nullable();
    table.decimal('salary_max', 10, 2).nullable();
    table.string('salary_currency', 3).defaultTo('USD');
    table.index(['salary_min', 'salary_max'], 'idx_jobs_salary_range');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('jobs', (table) => {
    table.dropIndex(['salary_min', 'salary_max'], 'idx_jobs_salary_range');
    table.dropColumns(['salary_min', 'salary_max', 'salary_currency']);
  });
};`
},
{
  id: 'pg_11',
  title: 'Transactions & Data Integrity',
  badge: 'Core',
  badgeClass: 'badge-practice',
  content: [
    'A **transaction** is a sequence of SQL operations that succeed or fail atomically. Either all statements commit, or all are rolled back. Without transactions, a crash between "deduct credits" and "create job posting" leaves your data inconsistent — credits gone, no job created. With a transaction, the partial state never persists.',
    'Transactions enforce **ACID** properties: Atomicity (all or nothing), Consistency (data remains valid), Isolation (concurrent transactions don\'t interfere), Durability (committed data survives crashes). The isolation level you choose determines how visible in-progress transactions are to each other. `READ COMMITTED` (default) is fine for most cases; `SERIALIZABLE` prevents all anomalies but reduces throughput.',
    'In Node.js with `pg`, always use `client.query()` inside a transaction (not `pool.query()`) and always `release()` the client in a `finally` block — even on error. If you forget `release()`, the connection is never returned to the pool and you\'ll eventually exhaust all available connections, causing the entire API to hang.'
  ],
  code: `// ── PostgreSQL transaction in Node.js ──
export async function createJobWithDebitCredits(
  userId: string,
  jobData: CreateJobDto
): Promise<Job> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check credits
    const creditsResult = await client.query(
      'SELECT credits FROM users WHERE id = $1 FOR UPDATE',  // Lock the row
      [userId]
    );
    const credits = creditsResult.rows[0]?.credits ?? 0;

    if (credits < 1) {
      throw new AppError('Insufficient job posting credits', 402);
    }

    // Deduct 1 credit
    await client.query(
      'UPDATE users SET credits = credits - 1 WHERE id = $1',
      [userId]
    );

    // Create the job posting
    const jobResult = await client.query(
      'INSERT INTO jobs (title, description, author_id) VALUES ($1, $2, $3) RETURNING *',
      [jobData.title, jobData.description, userId]
    );

    await client.query('COMMIT');
    return jobResult.rows[0];

  } catch (err) {
    await client.query('ROLLBACK');  // Undo everything if anything fails
    throw err;
  } finally {
    client.release();  // ALWAYS release — even on uncaught error
  }
}`
}
];

