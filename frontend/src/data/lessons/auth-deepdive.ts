import type { Lesson } from '../../types/curriculum';

export const authDeepDiveLessons: Lesson[] = [
{
  id: 'auth_0',
  title: 'Authentication vs Authorization: The Foundation',
  badge: 'Foundations',
  badgeClass: 'badge-concept',
  content: [
    '**Authentication** (AuthN) answers "Who are you?" It establishes identity. You authenticate with a password, a fingerprint, or a Google OAuth token. Once authenticated, the system knows who you are for the duration of the session. Authentication is the door; it determines if you are allowed in at all.',
    '**Authorization** (AuthZ) answers "What can you do?" It controls access to specific resources. A logged-in user (authenticated) might not be authorized to delete another user\'s data or access the admin dashboard. Authorization is the set of rules applied after identity is established. Most security bugs are authorization bugs — the app knows who the user is, but fails to check what they\'re allowed to do.',
    'The layered IAAA model (Identity, Authentication, Authorization, Accounting) adds **Accounting** — logging every action. You need to know not just who was authenticated and what they\'re authorized to do, but also what they *actually did* (audit trail). This is required for compliance (GDPR, SOC2) and is essential for post-breach forensics.'
  ],
  code: `// ── Authentication: who are you? ──
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.findUserByEmail(email);

  // bcrypt.compare times out by design to resist timing attacks
  const isValid = user && await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: '15m'
  });
  res.json({ token });
});

// ── Authorization: what can you do? ──
function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Authentication middleware + Authorization decorator
app.delete('/api/users/:id', authenticate, requireRole('admin'), deleteUser);`
},
{
  id: 'auth_1',
  title: 'Sessions vs JWT: Choosing the Right Strategy',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    '**Session-based auth**: At login, the server creates a session record in the database and returns a `sessionId` in an `HttpOnly` cookie. On every subsequent request, the server looks up that ID in the database to get the user object. The session lives server-side — if you want to invalidate it (user logs out, account banned), you delete the row. Simple and completely controllable. Weak point: every request requires a database lookup.',
    '**JWT (JSON Web Tokens)**: The server signs a payload (`{userId, role, exp}`) with a private key and sends it to the client. The client stores it and sends it back as a `Bearer` token. The server verifies the signature without touching the database — stateless, horizontally scalable. Weak point: JWTs cannot be invalidated before they expire. If a JWT is stolen or a user\'s role changes, the old token remains valid until expiry.',
    'The hybrid solution: **Short-lived JWTs + Refresh Tokens**. Access JWTs expire in 15 minutes (minimal window if stolen). A longer-lived refresh token (stored in an `HttpOnly` cookie, 7 days) can request a new access JWT. The refresh token *is* tracked in the database — so you *can* revoke it. You get JWT\'s stateless performance for the 99.9% of requests while retaining the ability to instantly invalidate sessions when needed.'
  ],
  code: `// ── Session-based: simple, revocable ──
import session from 'express-session';
import connectRedis from 'connect-redis';

app.use(session({
  store: new connectRedis({ client: redis }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // JS cannot read cookie (XSS protection)
    secure: true,      // HTTPS only
    sameSite: 'lax',   // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  }
}));

// ── JWT: stateless, fast ──
// 1. Login → issue both tokens
const accessToken  = jwt.sign({ userId, role }, env.JWT_SECRET,   { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId },       env.REFRESH_SECRET, { expiresIn: '7d' });

// Store refresh token hash in DB for revocation
await db.saveRefreshToken(userId, crypto.createHash('sha256').update(refreshToken).digest('hex'));

// 2. Refresh flow (client calls this when access token expires)
app.post('/api/refresh', async (req, res) => {
  const { refreshToken } = req.cookies;
  const payload = jwt.verify(refreshToken, env.REFRESH_SECRET);
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const stored = await db.findRefreshToken(payload.userId, tokenHash);
  if (!stored) return res.status(401).json({ error: 'Token revoked' });
  const newAccessToken = jwt.sign({ userId: payload.userId }, env.JWT_SECRET, { expiresIn: '15m' });
  res.json({ accessToken: newAccessToken });
});`
},
{
  id: 'auth_2',
  title: 'JWT Best Practices',
  badge: 'Security',
  badgeClass: 'badge-concept',
  content: [
    '**Choosing the signing algorithm matters**: `HS256` uses a single shared secret (symmetric — both signing and verification use the same key). `RS256` uses a public/private key pair (asymmetric — sign with private key, verify with public key). Use `RS256` when multiple services need to verify tokens without being able to issue them — hand out the public key freely.',
    '**Never store JWTs in localStorage**. It\'s accessible to JavaScript and is the direct target of XSS attacks. Use `HttpOnly` cookies instead — they cannot be read by JavaScript regardless of XSS vulnerabilities. If you must use `Authorization: Bearer` headers (e.g., for a mobile app or cross-domain SPA), keep JWTs in memory only and accept re-authentication after a page refresh.',
    '**JWT Claims best practices**: Always set `exp` (expiration). Always validate `iss` (issuer) and `aud` (audience) to prevent token substitution attacks — a JWT issued for your mobile app shouldn\'t be accepted by your web API. Never put sensitive data (passwords, PII) in the JWT payload — it\'s base64 encoded (not encrypted) and readable by anyone who intercepts it.'
  ],
  code: `import jwt from 'jsonwebtoken';

// ── Signing with RS256 (recommended for multi-service) ──
import fs from 'fs';
const privateKey = fs.readFileSync('private.pem');
const publicKey  = fs.readFileSync('public.pem');

const token = jwt.sign(
  {
    sub: user.id,          // Subject (user ID)
    iss: 'jobtrackr-api',  // Issuer
    aud: 'jobtrackr-web',  // Audience
    role: user.role,
  },
  privateKey,
  { algorithm: 'RS256', expiresIn: '15m' }
);

// ── Verification with strict validation ──
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer:    'jobtrackr-api',
      audience:  'jobtrackr-web',
    });
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}`
},
{
  id: 'auth_3',
  title: 'Refresh Tokens & Token Rotation',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '**Refresh Token Rotation** is a security technique where a refresh token is single-use. When you exchange a refresh token for a new access token, the old refresh token is immediately invalidated and a brand new one is issued. If an attacker steals a refresh token and tries to use it *after* a legitimate user already used it, the server detects the already-used token and can revoke the entire session family.',
    '**Token families** track the chain of refresh tokens issued for a session. If rotation detects a reuse (token already invalidated), the entire family is deleted — all sessions for that user on all devices are logged out. This limits the damage of a stolen refresh token to the window between theft and the next rotation, which is bounded by usage frequency.',
    'Implement a **token reuse detection** table in your database: store `(familyId, tokenHash, usedAt)`. A newly issued replacement gets the same `familyId`. If a token comes in that has `usedAt != null`, it\'s been reused — delete everything with that `familyId`. Notify the user of a potential token theft via email.'
  ],
  code: `// ── Refresh with rotation + reuse detection ──
async function refreshTokens(token: string) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const stored = await db.findRefreshToken({ hash });

  if (!stored) {
    throw new Error('Invalid refresh token');
  }

  if (stored.usedAt !== null) {
    // REUSE DETECTED: token already consumed → likely stolen
    await db.revokeTokenFamily(stored.familyId); // Nuke all sessions in this family
    await notifyUser(stored.userId, 'security-alert');
    throw new Error('Token reuse detected. All sessions terminated.');
  }

  // Mark this token as used
  await db.markTokenUsed(hash);

  // Issue new pair (same familyId continues the chain)
  const newRefreshToken = crypto.randomBytes(64).toString('hex');
  const newRefreshHash  = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  await db.saveRefreshToken({
    userId:   stored.userId,
    hash:     newRefreshHash,
    familyId: stored.familyId,  // Same family
    usedAt:   null,
  });

  const accessToken = jwt.sign({ userId: stored.userId }, env.JWT_SECRET, { expiresIn: '15m' });
  return { accessToken, refreshToken: newRefreshToken };
}`
},
{
  id: 'auth_4',
  title: 'OAuth 2.0 & Social Login',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    '**OAuth 2.0** allows users to grant your app limited access to their account on another service (Google, GitHub, LinkedIn) without sharing their password with you. The **Authorization Code Flow** (with PKCE for SPAs) is the secure standard: user is redirected to Google → approves access → Google redirects back with a `code` → your server exchanges the `code` for an `access_token` (single-time, server-to-server).',
    'The `code` exchange happens server-to-server, so the `access_token` never touches the browser. PKCE (Proof Key for Code Exchange) adds an additional layer for public clients (mobile apps, SPAs) that can\'t safely store a client secret — the app generates a random `code_verifier`, hashes it to `code_challenge`, and includes the challenge in the initial redirect. The exchange only succeeds if the original verifier is presented.',
    '**Implementing OAuth with Passport.js**: Passport provides a unified interface across 500+ OAuth providers. The same middleware pattern works for Google, GitHub, or Apple. Store the user\'s `providerId` and `accessToken` in your database — never store their OAuth password (they don\'t have one). Handle the case where the same email exists from two different providers.'
  ],
  code: `import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID:     env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'https://api.jobtrackr.com/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user by Google ID
    let user = await db.findByProvider('google', profile.id);

    if (!user) {
      user = await db.createUser({
        email:      profile.emails?.[0].value,
        name:       profile.displayName,
        provider:   'google',
        providerId: profile.id,
        avatar:     profile.photos?.[0].value,
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// ── Routes ──
// 1. Redirect user to Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

// 2. Google redirects back with code
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, env.JWT_SECRET, { expiresIn: '15m' });
    res.redirect(\`https://jobtrackr.com/auth?token=\${token}\`);
  }
);`
},
{
  id: 'auth_5',
  title: 'OpenID Connect (OIDC)',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '**OpenID Connect (OIDC)** is an identity layer built on top of OAuth 2.0. While OAuth 2.0 only handles *authorization* ("this app can read your Google contacts"), OIDC adds *authentication* — it provides a standardized way to verify the user\'s identity and get their profile information. If OAuth 2.0 is "can I access your stuff?", OIDC answers "who are you?"',
    'OIDC adds the **ID Token** — a JWT issued by the identity provider (Google, Auth0, Okta) that contains the user\'s identity claims: `sub` (subject/user ID), `email`, `name`, `picture`, `email_verified`. Your app validates the ID token\'s signature against the provider\'s public key (fetched from their JWKS endpoint) to confirm it came from the real Google and hasn\'t been tampered with.',
    '**Auth0** and **Clerk** are hosted OIDC providers — they handle the entire authentication flow, user management, MFA, and social logins, so you focus only on what your app does uniquely. Auth0 provides a React SDK where you wrap your app in `<Auth0Provider>` and get `useAuth0()` hooks for login, logout, and user data. The tradeoff: vendor dependency and monthly costs beyond the free tier.'
  ],
  code: `// ── Validate an OIDC ID Token (from Google) ──
import { jwtVerify, createRemoteJWKSet } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

async function verifyGoogleIdToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer:   ['https://accounts.google.com', 'accounts.google.com'],
    audience: env.GOOGLE_CLIENT_ID,  // Must match your app's client ID
  });

  // payload.sub = Google's unique user ID (stable, never changes)
  // payload.email = user's email
  // payload.email_verified = boolean (always check this!)
  if (!payload.email_verified) {
    throw new Error('Email not verified by Google');
  }

  return payload;
}

// ── Using Auth0 in React ──
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider domain="jobtrackr.auth0.com" clientId={CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}>
      <Router />
    </Auth0Provider>
  );
}

function Profile() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  if (!isAuthenticated) return <button onClick={loginWithRedirect}>Log in</button>;
  return <p>Hello, {user?.name}</p>;
}`
},
{
  id: 'auth_6',
  title: 'Role-Based Access Control (RBAC)',
  badge: 'Security',
  badgeClass: 'badge-practice',
  content: [
    '**RBAC (Role-Based Access Control)** assigns permissions to roles, not directly to users. A user has a role (`admin`, `recruiter`, `candidate`). The role has permissions (`job:create`, `job:delete`, `application:view`). This makes permission management scalable — changing what all recruiters can do means editing one role definition, not updating 10,000 user records.',
    '**Attribute-Based Access Control (ABAC)** is the next level — permissions depend on attributes of both the user and the resource. "A recruiter can edit a job posting, but only if they work at the same company as the job." This is richer than RBAC but more complex. Most apps start with RBAC and add ABAC only for the specific resources that need it.',
    'The **critical rule**: always enforce authorization on the server. Frontend role checks (hiding a button from non-admins) are UX — they do not provide security. A user can open DevTools and call your API directly. Every sensitive endpoint must verify the caller\'s role server-side, regardless of what the frontend shows.'
  ],
  code: `// ── Define permissions as typed constants ──
export const Permissions = {
  JOB_CREATE:          'job:create',
  JOB_DELETE:          'job:delete',
  APPLICATION_VIEW:    'application:view',
  USER_MANAGE:         'user:manage',
} as const;

// ── Map roles to permissions ──
const RolePermissions: Record<string, string[]> = {
  admin:     Object.values(Permissions),   // All permissions
  recruiter: [Permissions.JOB_CREATE, Permissions.APPLICATION_VIEW],
  candidate: [Permissions.APPLICATION_VIEW],
};

// ── Authorization middleware ──
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const allowed  = RolePermissions[userRole] ?? [];

    if (!allowed.includes(permission)) {
      return res.status(403).json({
        error: \`Forbidden: requires \${permission}\`,
      });
    }
    next();
  };
}

// ── Usage ──
app.post('/api/jobs', authenticate, requirePermission('job:create'), createJob);
app.delete('/api/jobs/:id', authenticate, requirePermission('job:delete'), deleteJob);

// ── ABAC: also check resource ownership ──
app.patch('/api/jobs/:id', authenticate, async (req, res) => {
  const job = await db.getJob(req.params.id);
  if (req.user.role !== 'admin' && job.companyId !== req.user.companyId) {
    return res.status(403).json({ error: 'You can only edit your own company\'s jobs' });
  }
  // proceed...
});`
},
{
  id: 'auth_7',
  title: 'Common Auth Vulnerabilities & Fixes',
  badge: 'Security',
  badgeClass: 'badge-concept',
  content: [
    '**Broken Authentication** is OWASP #7. The top mistakes: storing passwords in plaintext or with MD5/SHA1 (use bcrypt with cost factor 12+), allowing weak passwords (enforce minimum complexity), not hashing comparison times (use `crypto.timingSafeEqual` or bcrypt\'s built-in timing-safe compare to prevent timing attacks that reveal if a user exists). Not implementing MFA for high-value accounts is increasingly considered negligence.',
    '**Token leakage paths**: JWT in localStorage (readable by XSS), JWT in URL parameters (stored in server logs and browser history), JWT in non-HttpOnly cookies (readable by XSS). Secure path: access token in memory + refresh token in HttpOnly, Secure, SameSite=Strict cookie. Many developers also accidentally log tokens in server logs when printing the full `req.headers` object.',
    '**Session fixation**: an attacker sets a user\'s session ID before they log in (via a URL parameter or cookie). After the user logs in with that session, the attacker can use the same ID to hijack the session. Fix: always regenerate the session ID upon successful login. `req.session.regenerate(callback)` in express-session does this correctly.'
  ],
  code: `// ── bcrypt: correct configuration ──
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;  // ~300ms per hash on modern hardware
// Higher = slower (good for attackers) but also slower for users

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // bcrypt.compare is timing-safe by design
  return bcrypt.compare(password, hash);
}

// ── Prevent user enumeration (timing attack) ──
// BAD: returns immediately if user not found → timing difference reveals user existence
const user = await db.findUser(email);
if (!user) return res.status(401).json({ error: 'User not found' }); // ❌

// GOOD: always run bcrypt even if user doesn't exist → constant time
const user = await db.findUser(email);
const validPassword = user
  ? await bcrypt.compare(password, user.hash)
  : await bcrypt.compare(password, '$2b$12$invalidhashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
if (!user || !validPassword) return res.status(401).json({ error: 'Invalid credentials' }); // ✅

// ── Fix session fixation: regenerate after login ──
req.session.regenerate((err) => {
  if (err) return next(err);
  req.session.userId = user.id;
  res.json({ success: true });
});`
},
{
  id: 'auth_8',
  title: 'Project Execution: Full Auth System',
  badge: 'Project',
  badgeClass: 'badge-practice',
  content: [
    'In this task, you will implement the complete authentication system for JobTrackr. The system must support: email/password login with bcrypt hashing (bcrypt rounds = 12), short-lived JWT access tokens (15 minutes), refresh token rotation with reuse detection stored in Postgres, Google OAuth using Passport.js, and RBAC middleware for three roles (admin, recruiter, candidate).',
    'Security requirements: all passwords validated for minimum strength (8 chars, 1 uppercase, 1 number), login endpoint rate-limited (5 attempts / 15 minutes), refresh tokens stored as SHA-256 hashes (never plaintext), access tokens delivered via JSON body, refresh tokens delivered via HttpOnly cookie, and all auth-related events logged (login, logout, token refresh, failed attempts, account lockout).',
    '**Studio Task**: Build `auth/` directory with `auth.service.ts`, `auth.controller.ts`, `auth.middleware.ts`, and `auth.router.ts`. Write tests in `auth.test.ts` verifying: bcrypt is actually used, invalid passwords fail, expired JWTs are rejected, and reused refresh tokens trigger session revocation.'
  ],
  code: `# ── Auth System Checklist ──
# Password storage
# [ ] bcrypt with rounds >= 12
# [ ] Password strength validation (zxcvbn or regex)
# [ ] Timing-safe comparison

# Token architecture        
# [ ] Access JWT: 15 min, RS256, with iss+aud claims
# [ ] Refresh token: 7 days, HttpOnly cookie, stored as hash
# [ ] Refresh rotation with reuse detection implemented

# OAuth
# [ ] Google OAuth via Passport.js
# [ ] User created on first OAuth login
# [ ] Same email from multiple providers handled

# RBAC
# [ ] Roles: admin, recruiter, candidate
# [ ] requirePermission() middleware
# [ ] Server-side checks on all sensitive routes

# Logging & monitoring
# [ ] Login success/failure logged with IP + user agent
# [ ] Suspicious activity (reuse detection) triggers email

# Run auth tests
npm test -- --testPathPattern=auth`
}
];
