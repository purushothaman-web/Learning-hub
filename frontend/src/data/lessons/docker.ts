import type { Lesson } from '../../types/curriculum';

export const dockerLessons: Lesson[] = [
  {
    id: 'doc_0',
    title: 'The Container Revolution',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**Docker** solves the "It works on my machine" problem by bundling your application and all its dependencies (Node.js, libraries, config) into a single, immutable container image. This image runs exactly the same on your laptop as it does on a production server.',
      'Unlike a Virtual Machine (VM), a container doesn\'t bundle an entire operating system. It shares the host machine\'s OS kernel, making it incredibly lightweight (megabytes instead of gigabytes) and fast to start (seconds instead of minutes).',
      'The **Docker Engine** is the runtime that manages these containers. It uses Linux namespaces and cgroups to provide "Isolation" — two containers on the same machine think they are alone, with their own filesystem, processes, and network stack.'
    ],
    code: `// ── Traditional VM vs Docker Container ──
// [ App ] [ App ]       [ App ] [ App ]
// [ Libs] [ Libs]       [ Libs] [ Libs]
// [ Guest OS ]          [ Container Runtime ]
// [ Hypervisor]         [ Host OS ]
// [ Host OS ]           [ Infrastructure ]
// [ Infrastructure ]`
  },
  {
    id: 'doc_1',
    title: 'Images & The Dockerfile',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'A **Dockerfile** is a text file containing the "recipe" for your container image. It defines each step of the build process: choosing a base OS, copying your source code, installing dependencies, and exposing ports.',
      'Each line in a Dockerfile creates a new permanent "Layer" in the image. Docker caches these layers locally. If you only change one line of code, Docker can reuse the layers for your dependencies, making the next build nearly instantaneous.',
      'A professional Dockerfile is a "Multi-Stage Build". One stage compiles your code, and the final stage only copies the result. This keeps your production image tiny and secure because it doesn\'t contain your build tools or raw source code.'
    ],
    code: `# ── Professional Node.js Dockerfile ──

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production (Tiny & Secure)
FROM node:20-alpine
WORKDIR /app
# Only copy the essential compiled assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/index.js"]`
  },
  {
    id: 'doc_2',
    title: 'Container Lifecycle & Commands',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'To build an image, use `docker build`. To run a container from that image, use `docker run`. These are the two most important commands in the Docker ecosystem.',
      'Containers are **Ephemeral**. This means any data written inside a container is lost when the container stops. To save data (like a database), you must use **Volumes** — a way to "mount" a folder from your host computer into the container.',
      'The `docker exec` command is your Swiss Army Knife for debugging. It allows you to "step inside" a running container and run commands (like `ls` or `env`) as if you were logged in via SSH.'
    ],
    code: `# ── Essential Docker CLI ──

# 1. Build the image
docker build -t my-api .

# 2. Run with port mapping and volume
docker run -d \\
  -p 3000:3000 \\
  -v ./data:/app/data \\
  --name api-container \\
  my-api

# 3. Debugging: open a shell inside
docker exec -it api-container sh

# 4. Cleanup
docker stop api-container
docker rm api-container
docker rmi my-api`
  },
  {
    id: 'doc_3',
    title: 'Docker Compose: Multi-service Ops',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'Modern apps aren\'t just one service; they need a database, a cache (Redis), and maybe a worker. **Docker Compose** allows you to define your entire multi-container stack in a single `docker-compose.yml` file.',
      'With one command, `docker-compose up`, you can spin up your whole environment. Compose automatically links the containers together in a private network, allowing them to talk to each other by name (e.g., the API connects to `db:5432`).',
      'Compose handles the orchestration: in what order to start services, how to handle restarts if one crashes, and which environment variables to inject. It is the "gold standard" for local development environments.'
    ],
    code: `# ── docker-compose.yml ──
version: '3.8'

services:
  web:
    build: .
    ports: ["3000:3000"]
    depends_on: ["db"]    # Wait for DB to be ready
    env_file: .env

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: learning_db
      POSTGRES_PASSWORD: secret_pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`
  },
  {
    id: 'doc_4',
    title: 'Networks & DNS',
    badge: 'Infrastructure',
    badgeClass: 'badge-concept',
    content: [
      'When containers run in a Docker network, they don\'t need to know each other\'s IP addresses. Docker provides a built-in **DNS Server**. If your database service is named `db`, your API can simply connect to `http://db`.',
      'The "Bridge Network" is the default. It isolates your containers from the public internet while allowing them to communicate internally. You only "Expose" the specific ports you want the user to access (like port 80 for a web server).',
      'This network isolation is a major security feature. A hacker who breaks into your web server container cannot see your internal database ports unless you specifically allowed that connection path in your Docker network config.'
    ],
    code: `# ── Manual Network Management ──

# 1. Create a private network
docker network create secure-net

# 2. Connect containers to it
docker run -d --name db --network secure-net postgres
docker run -d --name api --network secure-net node-api

# Now 'api' can talk to 'db' using its name!`
  },
  {
    id: 'doc_5',
    title: 'Data Persistence & Volumes',
    badge: 'Practice',
    badgeClass: 'badge-concept',
    content: [
      'Because containers are immutable, you must never store critical data inside them. **Volumes** are the managed way to persist data. They are stored in a special area of the host OS where Docker handles the read/write permissions for you.',
      '**Bind Mounts** are different. They link a specific folder on your computer (like your project source code) directly into the container. This is perfect for local development: when you edit a file on your laptop, the container sees the change immediately.',
      'Using both correctly is key: use Bind Mounts for code "Hot Reloading" in development, and use Named Volumes for database storage in production to ensure high performance and automated backups.'
    ],
    code: `# ── dev docker-compose.yml snippet ──
services:
  api:
    build: .
    volumes:
      - .:/app              # Bind Mount (Sync code)
      - /app/node_modules   # Anonymous volume (Keep container deps)
    command: npm run dev    # Start dev server with reload`
  },
  {
    id: 'doc_6',
    title: 'Optimization: Layer Caching',
    badge: 'Expert',
    badgeClass: 'badge-practice',
    content: [
      'Slow Docker builds are frustrating. The key to speed is **Layer Caching**. Docker rebuilds everything from the first line that changed. If you `COPY . .` *before* `RUN npm install`, every single code change invalidates the cache for your 500MB node_modules.',
      'The "Optimization Pattern": Copy only your `package.json`, run `npm install`, and *then* copy your code. Now, when you edit a JS file, Docker skips the "install" step and jumps straight to starting your app.',
      'You should also use `.dockerignore` to tell Docker which files to ignore (like `.git` and `node_modules`). This makes the build context smaller and faster to send to the Docker daemon, especially in CI/CD pipelines.'
    ],
    code: `/* ── ❌ Bad (Slow) ── */
COPY . .
RUN npm install # Runs on EVERY code change

/* ── ✅ Good (Fast) ── */
COPY package.json .
RUN npm install # Only runs if package.json changes!
COPY . .`
  },
  {
    id: 'doc_7',
    title: 'Project Execution: Multi-container Architecture',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will create a professional Docker setup for a full-stack application. You will define a `Dockerfile` with multi-stage builds and a `docker-compose.yml` that handles networking for an API, a React frontend, and a Postgres database.',
      'The goal is to achieve "One Command Setup". A new developer should be able to clone your repo, run `docker-compose up`, and have the entire system running with hot-reloading enabled.',
      '**Studio Task**: Build the Docker manifest for "JobTrackr". Ensure that the database data persists even if the containers are deleted, and that the API can connect to Postgres using an environment variable injected by Compose.'
    ],
    code: `# ── Final Manifest Check ──
# 1. Multi-stage Dockerfile? [Yes]
# 2. Named Volumes for DB?   [Yes]
# 3. .dockerignore used?     [Yes]
# 4. Non-root user in prod?  [Yes]`
  }
];
