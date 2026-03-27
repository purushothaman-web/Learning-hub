import type { Lesson } from '../../types/curriculum';

export const websocketsLessons: Lesson[] = [
  {
    id: 'ws_0',
    title: 'HTTP vs WebSockets: The Big Shift',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Standard web communication is **Stateless HTTP**. The client asks, the server answers, and the connection closes. This is perfect for reading articles, but terrible for things like chat, live sports scores, or multiplayer games where you need instant updates.',
      '**WebSockets** provide a "Full-Duplex" persistent connection. Once the connection is "Handshaked", the door stays open. Both the client and the server can send data to each other *at any time* without waiting for a request.',
      'Think of HTTP as a "Letter" (you send it, you wait for a reply) and WebSockets as a "Phone Call" (once you\'re connected, either of you can speak instantly). This shift enables a whole new class of "Real-time" web experiences.'
    ],
    code: `// ── Comparison ──

// ❌ HTTP: Client must ask...
// GET /api/messages -> [No new messages]
// GET /api/messages -> [No new messages] (polling is wasteful)

// ✅ WebSockets: Server pushes!
// Connection Open...
// (5 minutes later)
// SERVER: "Hey! You got a new message!"
// (No request needed from client)`
  },
  {
    id: 'ws_1',
    title: 'The WS Handshake & Protocol',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Every WebSocket connection starts as a standard HTTP request. The client sends a special **Upgrade Header** asking: "Can we switch to the WebSocket protocol?". If the server agrees, it responds with a `101 Switching Protocols` status code.',
      'After this handshake, the protocol switches from `http://` to `ws://` (or `wss://` for secure). The connection stops being about headers and URLs, and starts being about **Binary Frames** — lightweight packets of data that have very little overhead.',
      'Because the connection stays open, you don\'t have to re-send auth headers or cookies with every message. This makes WebSockets significantly faster and more efficient for high-frequency data (like stock market tickers or mouse movements).'
    ],
    code: `// ── The Handshake (Simplified) ──
// CLIENT:
// GET /chat HTTP/1.1
// Connection: Upgrade
// Upgrade: websocket
// Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==

// SERVER:
// HTTP/1.1 101 Switching Protocols
// Upgrade: websocket
// Connection: Upgrade`
  },
  {
    id: 'ws_2',
    title: 'Server-side: Socket.io & WS',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'While the browser has a built-in `WebSocket` API, most professional projects use **Socket.io**. It is a library built on top of WebSockets that adds critical features: automated reconnection, packet buffering, and "Fallbacks" for older browsers.',
      'Socket.io introduces the concept of **"Rooms" and "Namespaces"**. You can group users into specific rooms (e.g., "chat-room-101") and emit a message only to the people in that room. This is much easier than manually tracking and filtering user IDs.',
      'Events: Unlike raw WebSockets (where you just send raw strings), Socket.io lets you define custom named events. You can `emit("new-like", data)` and the client can listen specifically for that event, making your code much more organized.'
    ],
    code: `import { Server } from 'socket.io';

const io = new Server(3001);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a specific room
  socket.join("lobby");

  // Listen for custom event
  socket.on("chat-msg", (data) => {
    // Broadcast to everyone in the room
    io.to("lobby").emit("msg-received", data);
  });
});`
  },
  {
    id: 'ws_3',
    title: 'Client-side: Real-time UI Patterns',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'Handling real-time data in React requires careful state management. You should establish the socket connection *outside* of your component or in a top-level provider to ensure it doesn\'t disconnect and reconnect on every layout change.',
      '**The "Optimistic Update" Pattern**: When a user sends a message, you should add it to the UI immediately before the server even receives it. If the server eventually gives an error, you then "Roll back" and show an error message. This makes the app feel "Instant".',
      'Always remember to "Clean up" your listeners. In a `useEffect` hook, you must remove the `.on("event")` listener when the component unmounts. If you don\'t, your app will trigger the same function 10 times if the user visits the page 10 times.'
    ],
    code: `import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function ChatBox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("msg-received", (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      socket.off("msg-received"); // 👈 Essential Cleanup!
    };
  }, []);

  return (
    <div>
      {messages.map(m => <div key={m.id}>{m.text}</div>)}
    </div>
  );
}`
  },
  {
    id: 'ws_4',
    title: 'Scaling: Redis Pub/Sub',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'WebSockets live in the **server memory**. If you have two servers, and User A is on Server 1 while User B is on Server 2, they won\'t be able to chat with each other because Server 1 doesn\'t know about User B.',
      'The solution is a **Redis Pub/Sub adapter**. When Server 1 wants to send a message, it publishes it to Redis. Redis then "Broadcasts" that message to ALL servers, and they each send it to their connected users. This allows you to scale to millions of users across many servers.',
      'Sticky Sessions: Because the WebSocket handshake starts as HTTP, you must ensure that your Load Balancer always sends the user to the *same* server for the duration of the upgrade process. This is known as "Sticky Sessions" or "Session Affinity".'
    ],
    code: `// ── Scaling with Redis Adapter ──
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

const io = new Server(3000);
io.adapter(createAdapter(pubClient, subClient));

// Now messages travel across your entire server cluster!`
  },
  {
    id: 'ws_5',
    title: 'Security: Authentication & Hearts',
    badge: 'Security',
    badgeClass: 'badge-practice',
    content: [
      'You must authenticate WebSocket connections just like REST APIs. The most secure way is to send a token during the initial HTTP handshake using a middleware. If the token is invalid, you reject the `Upgrade` request immediately.',
      '**Heartbeats (Pings/Pongs)** are how you detect "Ghost Connections". Sometimes a user loses internet or closes their laptop without the server knowing. The server sends a "Ping" every 20 seconds. If the client doesn\'t answer with a "Pong", the server closes the connection and frees up memory.',
      'Rate Limiting on Sockets: Attacks can happen over WebSockets too. You should limit how many messages a user can send per second. If a user emits 100 "chat-msg" events in 1 second, it\'s likely a bot or a malicious user trying to crash your server.'
    ],
    code: `// ── Socket.io Middleware: Auth ──
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (verifyJWT(token)) {
    // Authenticated! Store user data on socket
    socket.user = getUser(token); 
    next();
  } else {
    next(new Error("invalid-token"));
  }
});

// ── Rate Limiting ──
socket.on("message", () => {
  if (rateLimitExceeded(socket.user.id)) {
    return socket.emit("error", "Slow down!");
  }
  // Process...
});`
  },
  {
    id: 'ws_6',
    title: 'Binary Data: Files & Blobs',
    badge: 'Expert',
    badgeClass: 'badge-code',
    content: [
      'WebSockets aren\'t just for JSON text; they are incredibly efficient for sending **Binary Data** like images, audio streams, or file fragments. Instead of converting a file to a Base64 string (which makes it 33% larger), you send it as a raw `ArrayBuffer`.',
      'This is the secret behind real-time collaboration tools (like Figma) and video streaming. By sending raw bytes, you maximize your bandwidth and reduce the CPU work needed to encode/decode the data on both ends.',
      'When sending binary data, you often send a "Metadata Packet" first (JSON) to tell the receiver what to expect (e.g., "An image is coming, it is 5MB and named logo.png"), followed by the raw binary stream.'
    ],
    code: `// ── Client: Sending raw binary ──
const file = document.querySelector('input').files[0];
const reader = new FileReader();

reader.onload = () => {
  // Send raw ArrayBuffer - no encoding overhead!
  socket.emit("file-upload", { 
    name: file.name, 
    data: reader.result 
  });
};

reader.readAsArrayBuffer(file);`
  },
  {
    id: 'ws_7',
    title: 'Project Execution: Real-time Collab Board',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will implement the real-time "Activity Feed" for JobTrackr. When any user updates a job status, all other connected users must see an instant notification without refreshing their page.',
      'You will use Socket.io for the connection, implement a Redis adapter for "Scaling readiness", and use an optimistic UI pattern in React to ensure the feed feels lightning fast.',
      '**Studio Task**: Build the "LivePulse" component. It must connect to the WebSocket server, listen for `status-update` events, and display a floating notification with a slide-in animation.'
    ],
    code: `# ── Real-time Checklist ──
# 1. Socket connection shared?  [Yes]
# 2. Cleanup function used?     [Yes]
# 3. Connection Auth setup?     [Yes]
# 4. Redis Adapter ready?       [Yes]`
  }
];
