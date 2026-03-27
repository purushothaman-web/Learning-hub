import type { Lesson } from '../../types/curriculum';

export const networkingLessons: Lesson[] = [
{
  id: 'net_0',
  title: 'How the Internet Works',
  badge: 'Foundations',
  badgeClass: 'badge-concept',
  content: [
    'The internet is not a single network — it is a **network of networks**. Thousands of independent systems called Autonomous Systems (AS) — run by ISPs, universities, and corporations — are stitched together using the **Border Gateway Protocol (BGP)**. BGP is the "postal system" that determines the best route for your data to travel from New York to Tokyo.',
    'When you type a URL, your request is broken into **IP packets**. Each packet travels independently through routers — specialized devices that read the destination IP address and forward the packet one "hop" closer to its destination. Packets from the same file can take completely different routes and are reassembled at the destination.',
    '**Latency vs Bandwidth**: Latency is the time for a signal to make one round trip (affected by physical distance and the speed of light). Bandwidth is how much data can flow per second. A fiber connection to Tokyo has high bandwidth but unavoidable latency (~150ms). Understanding this distinction is critical for building performant distributed systems.'
  ],
  code: `# ── Trace the physical route of a packet ──
tracert google.com         # Windows
traceroute google.com      # Mac/Linux

# Each hop is a router. Notice the millisecond times —
# that's latency accumulating with each jump.

# ── See your public IP (assigned by your ISP) ──
curl ifconfig.me

# ── View your machine's routing table ──
route print                # Windows
ip route show              # Linux`
},
{
  id: 'net_1',
  title: 'TCP vs UDP: Reliability vs Speed',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    '**TCP (Transmission Control Protocol)** is a conversation. Before sending any data, client and server perform a "**3-Way Handshake**" (SYN → SYN-ACK → ACK) to establish a connection. TCP then guarantees: packets arrive, packets arrive in order, and lost packets are retransmitted. This reliability has a cost — overhead and latency.',
    '**UDP (User Datagram Protocol)** is a broadcast. You fire packets and don\'t wait for confirmation. If a packet is lost, it\'s gone. This makes UDP faster and ideal for real-time use cases where outdated data is worse than missing data — like video calls, online gaming, or DNS lookups. Losing one video frame is fine; resending it arrives too late to matter.',
    'Modern protocols blur this line. **QUIC** (used by HTTP/3) is built on UDP but implements its own reliability layer. This gives it TCP\'s reliability with faster connection setup (0-RTT on repeat visits) because it skips the TCP handshake overhead.'
  ],
  code: `# ── TCP: verify a connection is established ──
# Performs the 3-way handshake to test TCP connectivity
curl -v https://api.example.com 2>&1 | grep -E 'Connected|TLSv'

# ── UDP: DNS uses UDP by default (fast, stateless) ──
# @8.8.8.8 = use Google's DNS server explicitly
dig @8.8.8.8 example.com

# ── Check active TCP connections on your machine ──
netstat -an | findstr ESTABLISHED    # Windows
ss -tn state established             # Linux

# ── See TCP handshake in action with tcpdump (Linux) ──
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'`
},
{
  id: 'net_2',
  title: 'DNS: The Internet\'s Phone Book',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    'DNS (Domain Name System) translates `google.com` into `142.250.80.46`. The resolution chain is: **Browser cache → OS cache → Recursive Resolver (ISP) → Root Nameserver → TLD Nameserver (.com) → Authoritative Nameserver (Google\'s) → IP returned**. Each level can cache results, making subsequent lookups instant.',
    '**DNS Record Types** define what a domain points to: `A` = IPv4 address, `AAAA` = IPv6, `CNAME` = alias to another domain, `MX` = mail server, `TXT` = arbitrary text (used for verification and SPF records), `NS` = nameserver. Understanding these is essential for deploying real applications with custom domains.',
    '**TTL (Time To Live)** is the cache expiry for a DNS record in seconds. A TTL of 300 means resolvers cache the result for 5 minutes. Before a major migration, lower the TTL to 60 seconds a day in advance so traffic switches over quickly. After the migration, raise it back to 86400 (24h) for performance.'
  ],
  code: `# ── Full DNS resolution trace ──
nslookup -type=any google.com
dig +trace google.com           # Shows every hop in the chain

# ── Check specific record types ──
dig google.com A                # IPv4 address
dig google.com MX               # Mail server
dig google.com TXT              # SPF, DKIM, verification records
dig google.com NS               # Which nameservers are authoritative?

# ── Check TTL of a record ──
dig google.com | grep -A2 "ANSWER SECTION"
# 299 (seconds left on the cache)

# ── Flush DNS cache (Windows) ──
ipconfig /flushdns`
},
{
  id: 'net_3',
  title: 'HTTP/HTTPS: The Web\'s Language',
  badge: 'Core',
  badgeClass: 'badge-code',
  content: [
    '**HTTP is stateless** — each request is completely independent. The server has no memory of previous requests. This simplicity is what made the web scale, but it means *you* must build state management (cookies, tokens) on top of it. HTTP/2 added multiplexing (multiple requests over one connection) and HTTP/3 uses QUIC for even faster handshakes.',
    '**HTTPS = HTTP + TLS**. After the TCP connection, a TLS handshake occurs: the server presents its certificate, the client verifies it against a Certificate Authority (CA), and they negotiate a symmetric encryption key. All subsequent data is encrypted. The certificate proves *who* the server is; the encryption ensures *only* client and server can read the data.',
    '**Status codes tell the story**: `2xx` = success (`200 OK`, `201 Created`). `3xx` = redirects (`301 Moved`, `304 Not Modified`). `4xx` = client error (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`). `5xx` = server error (`500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`). Returning the correct status code is professional API design.'
  ],
  code: `# ── Inspect every header in a request/response ──
curl -v https://api.github.com/users/octocat 2>&1

# ── Send a POST with JSON body ──
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Puru", "email": "puru@test.com"}'

# ── Check certificate info ──
curl -v https://google.com 2>&1 | grep -E 'SSL|TLS|subject|expire'

# ── Simulate different status codes ──
# 301: permanent redirect (browser caches this!)
# 302: temporary redirect (browser re-checks each time)
# 304: "Use your cached copy" (saves bandwidth)
curl -I https://google.com   # Note: 301 redirect to https://www.google.com`
},
{
  id: 'net_4',
  title: 'REST vs WebSockets vs SSE',
  badge: 'Architecture',
  badgeClass: 'badge-concept',
  content: [
    '**REST (HTTP)** is request-response: client asks, server answers, connection closes. Perfect for CRUD operations (fetching a user profile, submitting a form). It\'s stateless, cacheable, and scales horizontally without effort. The tradeoff: the server can never push data to the client proactively.',
    '**WebSockets** provide a persistent, bidirectional channel. After the initial HTTP upgrade, both sides can send messages at any time. This is best for collaborative apps (like Figma), multiplayer games, or trading platforms where the server must push data immediately. The cost: connections consume server resources and require sticky sessions behind load balancers.',
    '**Server-Sent Events (SSE)** is the middle ground. The server streams data to the client over a single, persistent HTTP connection — but only server → client. This is perfect for AI chatbots (streaming token-by-token), live dashboards, or notification feeds. It uses regular HTTP (no protocol upgrade), works through proxies, and auto-reconnects.'
  ],
  code: `// ── REST: classic request-response ──
const user = await fetch('/api/users/1').then(r => r.json());

// ── WebSocket: bidirectional real-time ──
const ws = new WebSocket('wss://game.example.com');
ws.onopen  = ()  => ws.send(JSON.stringify({ type: 'join', room: 'lobby' }));
ws.onmessage = (e) => console.log('Server pushed:', JSON.parse(e.data));

// ── SSE: server streams, client listens ──
const sse = new EventSource('/api/ai-chat-stream');
sse.onmessage = (e) => {
  const chunk = JSON.parse(e.data);
  document.getElementById('output').textContent += chunk.token;
};

// ── Express SSE endpoint ──
app.get('/api/ai-chat-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const interval = setInterval(() => {
    res.write(\`data: {"token": "hello"}\n\n\`);
  }, 100);

  req.on('close', () => clearInterval(interval));
});`
},
{
  id: 'net_5',
  title: 'Latency, Bandwidth & Throughput',
  badge: 'Performance',
  badgeClass: 'badge-concept',
  content: [
    '**Latency** is the round-trip time for a single request. A database query that takes 1ms locally adds 150ms when your server is in Dublin and the user is in Mumbai. This compounds: an app making 10 serial API calls adds 1,500ms of latency. The fix is parallelism (`Promise.all`) and co-locating services.',
    '**Bandwidth** is maximum data transfer rate (1 Gbps, 100 Mbps). **Throughput** is actual data transferred under real-world conditions. Bandwidth is theoretical headroom; throughput is what you actually get. A 1 Gbps link might only deliver 600 Mbps throughput at peak due to TCP overhead, packet loss, and congestion.',
    'The **Waterfall problem**: When requests are chained (response A triggers request B triggers request C), latency multiplies. HTTP/2 multiplexing helps for multiple requests to the same host. For cross-service calls, use a **service mesh** or aggregate APIs (one call to a BFF — Backend for Frontend — that internally fans out to many services).'
  ],
  code: `# ── Measure raw latency to a host ──
ping -n 10 google.com           # Windows (10 packets)
ping -c 10 google.com           # Linux/Mac

# ── Measure download bandwidth ──
curl -o /dev/null -s -w "%{speed_download}\n" https://speedtest.example.com/file

# ── Measure HTTP request timing breakdown ──
curl -w "\
   DNS lookup: %{time_namelookup}s\n\
    TCP connect: %{time_connect}s\n\
    TLS handshake: %{time_appconnect}s\n\
    Time to first byte: %{time_starttransfer}s\n\
    Total: %{time_total}s\n" \
    -o /dev/null -s https://api.example.com

# ── Parallel vs serial requests (Node.js) ──
// ❌ Serial: 3 x 200ms = 600ms
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// ✅ Parallel: max(200ms, 200ms, 200ms) = 200ms
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);`
},
{
  id: 'net_6',
  title: 'CDN & Edge Networking',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    'A **CDN (Content Delivery Network)** is a globally distributed network of "Edge Servers". When a user requests your site, the CDN serves the response from the closest edge server (e.g., Paris → Frankfurt instead of Paris → San Francisco). This cuts latency by 80-90% for static assets and can reduce origin server load dramatically.',
    '**What can be cached at the edge**: Static files (images, CSS, JS bundles), API responses with `Cache-Control` headers, and even rendered HTML pages (with products like Cloudflare Workers or Vercel Edge Functions). **What cannot** (or shouldn\'t): authenticated user data, real-time prices, personalized content.',
    '**Cache Invalidation** is the hardest part. Strategy 1: Fingerprint file names (`main.abc123.js`) — the CDN caches forever; a new deploy gets a new hash. Strategy 2: Set a short TTL (`Cache-Control: public, max-age=60`) for API responses and purge the CDN cache on data updates via the CDN\'s API. Vercel and Cloudflare both have purge APIs.'
  ],
  code: `// ── Express: set correct cache headers ──
// Static asset (hashed filename): cache for 1 year
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true
}));

// API endpoint: cache for 60s, revalidate in background
app.get('/api/popular-jobs', (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
  res.json(jobs);
});

// ── Cloudflare: purge cache via API ──
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://myapp.com/api/popular-jobs"]}'

// ── Check if response came from CDN cache ──
// Look for: CF-Cache-Status: HIT  (Cloudflare cached it)`
},
{
  id: 'net_7',
  title: 'TLS, Certificates & HTTPS',
  badge: 'Security',
  badgeClass: 'badge-concept',
  content: [
    '**TLS (Transport Layer Security)** works by establishing a shared secret between client and server using asymmetric cryptography (public/private key pairs). The server\'s **Certificate** contains its public key and is signed by a trusted **Certificate Authority (CA)** like Let\'s Encrypt or DigiCert. Your browser ships with a list of trusted CAs; if the server\'s cert is signed by one, the connection is trusted.',
    '**The TLS Handshake (simplified)**: Client sends supported cipher suites → Server picks one and sends its certificate → Client verifies cert against CA list → Both derive a shared symmetric key using the public key → All further communication is encrypted with that symmetric key. TLS 1.3 completes this in 1 round trip (vs 2 for TLS 1.2).',
    '**HSTS (HTTP Strict Transport Security)** tells the browser to *always* use HTTPS for your domain for up to 2 years — even if the user types `http://`. Combined with `HSTS Preloading` (submitting your domain to Chrome\'s hardcoded list), it makes downgrade attacks impossible. This is a one-liner in Express via `helmet.js`.'
  ],
  code: `// ── Check certificate details ──
openssl s_client -connect example.com:443 -servername example.com < /dev/null 2>&1 \
  | openssl x509 -noout -text | grep -E "Subject:|Issuer:|Not After"

// ── Check TLS version being used ──
nmap --script ssl-enum-ciphers -p 443 example.com

// ── Express: enforce HTTPS with helmet ──
import helmet from 'helmet';

app.use(helmet({
  hsts: {
    maxAge: 31536000,        // 1 year in seconds
    includeSubDomains: true,
    preload: true            // Submit to browser preload lists
  }
}));

// ── Redirect HTTP → HTTPS ──
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, 'https://' + req.hostname + req.url);
  }
  next();
});`
},
{
  id: 'net_8',
  title: 'Project Execution: API Network Audit',
  badge: 'Project',
  badgeClass: 'badge-practice',
  content: [
    'In this task, you will perform a full network audit of the JobTrackr API. Using `curl` with timing flags, you will measure DNS lookup time, TCP connect time, TLS handshake time, and Time to First Byte (TTFB) for three key endpoints. You will document the network waterfall and identify the biggest latency contributor.',
    'You will then set correct `Cache-Control` headers on the public job listings endpoint, verify the CDN picks them up (look for `CF-Cache-Status: HIT`), and confirm the latency improvement with a second measurement. Finally, confirm the app\'s TLS certificate is valid and HSTS is set correctly.',
    '**Studio Task**: Build a Node.js `network-audit.mjs` script that pings 5 endpoints in parallel using `Promise.all`, records `performance.now()` times, and outputs a ranked latency report to the terminal. The slowest endpoint must be flagged in red using ANSI escape codes.'
  ],
  code: `# ── Full network timing breakdown ──
curl -w @- -o /dev/null -s "https://api.jobtrackr.com/jobs" <<'EOF'
     DNS: %{time_namelookup}s
     TCP: %{time_connect}s
     TLS: %{time_appconnect}s
    TTFB: %{time_starttransfer}s
   Total: %{time_total}s
    Size: %{size_download} bytes
EOF

# ── Project checklist ──
# 1. TTFB under 200ms?              [ ]
# 2. Cache-Control headers set?     [ ]
# 3. CDN HIT confirmed?             [ ]
# 4. TLS 1.3 verified?              [ ]
# 5. HSTS header present?           [ ]`
}
];
