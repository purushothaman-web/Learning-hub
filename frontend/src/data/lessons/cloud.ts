import type { Lesson } from '../../types/curriculum';

export const cloudLessons: Lesson[] = [
  {
    id: 'cloud_0',
    title: 'Deployment Models & the Cloud Landscape',
    badge: 'Architecture',
    badgeClass: 'badge-concept',
    content: [
      'There are four deployment models and choosing the wrong one adds unnecessary cost or operational burden. **Serverless/Edge** (Vercel, Cloudflare Workers): zero ops, scales to zero, cold starts — ideal for frontends and stateless API routes. **Containers** (AWS ECS, Railway, Render): predictable cost, full control, no cold starts — best for long-running Node.js APIs. **VMs** (EC2, DigitalOcean Droplets): maximum control, maximum ops burden — only justified for specialised workloads. **Managed platforms** (Heroku, Fly.io): middle ground, fast to deploy, less control.',
      'The **cloud provider landscape**: AWS has the widest service catalogue and is the industry default for enterprise. GCP excels at data and ML workloads. Azure dominates in Microsoft-heavy orgs. For most startups and indie projects, **Vercel + Railway + Neon (serverless Postgres)** covers 90% of needs at a fraction of the complexity — use the big clouds when you have a specific reason, not by default.',
      "**Infrastructure as Code (IaC)** means your cloud resources are defined in version-controlled files, not clicked through a web console. A console change is invisible, unreviewable, and irreproducible. An IaC change is a pull request. Start with Terraform or Pulumi for any resource you'd be upset to lose — databases, networking, IAM roles — and treat the AWS console as read-only."
    ],
    code: `# ── Vercel: deploy a Vite + React frontend ──
# vercel.json — configuration lives in your repo
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }  // SPA fallback
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "max-age=31536000, immutable" }]
    }
  ]
}

# ── Railway: deploy a Node.js API ──
# railway.toml
[build]
builder = "nixpacks"          # auto-detects Node.js, no Dockerfile needed

[deploy]
startCommand = "node server.js"
healthcheckPath = "/health"
restartPolicyType = "on_failure"

# Environment variables set in Railway dashboard or CLI:
# railway variables set DATABASE_URL=... REDIS_URL=... ANTHROPIC_API_KEY=...

# ── Terraform: provision an RDS PostgreSQL instance (AWS) ──
# main.tf
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

resource "aws_db_instance" "learning_hub" {
  identifier           = "learning-hub-prod"
  engine               = "postgres"
  engine_version       = "16.2"
  instance_class       = "db.t4g.micro"
  allocated_storage    = 20
  storage_encrypted    = true
  deletion_protection  = true           # require explicit destroy

  db_name  = "learning_hub"
  username = "admin"
  password = var.db_password            # from terraform.tfvars (gitignored)

  backup_retention_period = 7           # 7-day automated backups
  skip_final_snapshot     = false

  tags = { Environment = "production" }
}

output "db_endpoint" {
  value     = aws_db_instance.learning_hub.endpoint
  sensitive = true
}`
  },
  {
    id: 'cloud_1',
    title: 'Docker in Production',
    badge: 'Containers',
    badgeClass: 'badge-code',
    content: [
      'A **production Dockerfile** is not a development Dockerfile. The key differences: multi-stage builds (build dependencies never reach the production image), non-root user (running as root in a container is a security vulnerability), explicit versions on base images (never `node:latest` — pin to `node:22-alpine`), and `.dockerignore` to exclude `node_modules`, `.env`, and source maps from the image.',
      "**Layer caching** is the most important Docker optimisation. Layers are cached if their inputs haven't changed. Copy `package.json` and run `npm ci` before copying your source code — that way, the expensive dependency installation layer is only invalidated when you change your dependencies, not on every code change.",
      '**Docker Compose** is for local development and integration testing, not for production. In production, use a container orchestrator (ECS, Kubernetes, Fly.io) or a platform that manages containers for you (Railway, Render). Compose on a production server is a single point of failure with no health-check restarts, no rolling deploys, and no scaling.'
    ],
    code: `# ── Production multi-stage Dockerfile ──
# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

# ✅ Copy manifests first — npm ci layer is cached unless deps change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev          # production deps only

COPY . .
RUN npm run build              # compile TypeScript / bundle frontend

# Stage 2: production image (no build tools, no source code)
FROM node:22-alpine AS runner
WORKDIR /app

# ✅ Non-root user — principle of least privilege
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Only copy what production needs
COPY --from=builder --chown=appuser:appgroup /app/dist        ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json .

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]

# ── .dockerignore — keep the image lean & secure ──
# node_modules
# .env*
# .git
# dist
# coverage
# *.test.ts
# README.md

# ── Docker Compose for local development ──
# docker-compose.yml
services:
  api:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://dev:dev@db:5432/learning_hub
      REDIS_URL: redis://redis:6379
    depends_on:
      db:    { condition: service_healthy }
      redis: { condition: service_started }
    volumes:
      - ./backend/src:/app/src  # hot reload in dev

  db:
    image: postgres:16-alpine
    environment: { POSTGRES_USER: dev, POSTGRES_PASSWORD: dev, POSTGRES_DB: learning_hub }
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "dev"]
      interval: 5s

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1  # persist every 60s

volumes:
  pgdata:`
  },
  {
    id: 'cloud_2',
    title: 'CI/CD to Production',
    badge: 'Automation',
    badgeClass: 'badge-code',
    content: [
      'A **CI/CD pipeline** is the automated path from a git push to a running production deployment. CI (Continuous Integration) runs on every push: install dependencies, lint, type-check, run tests, build. CD (Continuous Deployment) runs on merge to main: build a Docker image, push to a registry, deploy to production. The goal is that deploying becomes boring — a routine, automated event, not a stressful manual process.',
      "**Secrets management** is where most teams cut corners and pay for it later. Never put secrets in environment variables that are baked into Docker images. Never commit `.env` files. Use your CI platform's secret store (GitHub Actions Secrets, Railway variables) for deployment-time secrets, and a secrets manager (AWS Secrets Manager, HashiCorp Vault) for runtime secrets in production — your app fetches them on startup, they're never in the filesystem.",
      '**Rollback strategy** must be decided before you need it. Blue-green deployment runs two identical production environments — you switch traffic from blue to green on deploy, and roll back by switching back. Canary releases send 5% of traffic to the new version first, watch error rates, then gradually shift to 100%. At minimum, tag every Docker image with the git SHA so you can redeploy any previous version in under 2 minutes.'
    ],
    code: `# ── GitHub Actions: CI + CD pipeline ──
# .github/workflows/deploy.yml
name: CI / Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE: ghcr.io/\${{ github.repository }}/api

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/test_db

      # Spin up real Postgres for integration tests
      services:
        postgres:
          image: postgres:16-alpine
          env: { POSTGRES_USER: test, POSTGRES_PASSWORD: test, POSTGRES_DB: test_db }
          options: >-
            --health-cmd pg_isready --health-interval 5s --health-retries 5

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'   # only deploy from main
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}  # auto-provided, no setup needed

      - name: Build & push Docker image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            \${{ env.IMAGE }}:latest
            \${{ env.IMAGE }}:\${{ github.sha }}   # pin to exact commit

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service api --image \${{ env.IMAGE }}:\${{ github.sha }}
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}  # stored in GitHub Secrets`
  },
  {
    id: 'cloud_3',
    title: 'Environment Config & Secrets',
    badge: 'Security Ops',
    badgeClass: 'badge-practice',
    content: [
      "**Configuration** (values that differ between environments but aren't sensitive — feature flags, API base URLs, log levels) belongs in environment variables. **Secrets** (values that are sensitive — API keys, DB passwords, JWT signing keys) also use environment variables at the surface, but their source and storage must be different: a secrets manager, not a `.env` file or CI variable.",
      "The **12-factor app** methodology defines the gold standard: strict separation between config and code, all config loaded from environment at runtime, no hardcoded values, no config files committed to the repo. The practical rule: if rotating a value requires a code deploy, you've violated 12-factor. If you can rotate it by updating an environment variable and restarting, you're doing it right.",
      '**Secret rotation** is the most neglected ops practice. Static secrets that never change are a ticking clock — a single leak compromises you indefinitely. Automated rotation (AWS Secrets Manager can rotate RDS passwords on a schedule, automatically updating the secret and notifying your app) means a leaked secret has a maximum blast radius bounded by the rotation interval.'
    ],
    code: `// ── Config validation at startup with Zod ──
// Fail fast: crash on boot if required env vars are missing
// Better to crash immediately than to fail silently at runtime.

import { z } from 'zod';

const EnvSchema = z.object({
  // Server
  NODE_ENV:   z.enum(['development', 'test', 'production']),
  PORT:       z.coerce.number().default(3000),
  LOG_LEVEL:  z.enum(['trace','debug','info','warn','error']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL:    z.string().url(),

  // Auth
  JWT_SECRET:     z.string().min(32),  // enforce minimum key length
  JWT_EXPIRES_IN: z.string().default('7d'),

  // External APIs
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),

  // Feature flags
  FEATURE_RAG_ENABLED: z.coerce.boolean().default(false),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);  // crash immediately — don't start a broken server
}

export const config = parsed.data;

// ── Runtime secret fetching from AWS Secrets Manager ──
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const sm = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretId) {
  const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  return JSON.parse(res.SecretString);
}

// Fetch on startup — secrets stay out of env vars and disk entirely
const { db_password, anthropic_key } = await getSecret('learning-hub/production');

// ── .env.example — committed to repo, documents required vars ──
// Copy to .env and fill in values. Never commit .env itself.
//
// NODE_ENV=development
// PORT=3000
// DATABASE_URL=postgres://user:password@localhost:5432/learning_hub
// REDIS_URL=redis://localhost:6379
// JWT_SECRET=change-me-to-a-32-char-random-string
// ANTHROPIC_API_KEY=sk-ant-...
// FEATURE_RAG_ENABLED=false`
  },
  {
    id: 'cloud_4',
    title: 'Custom Domains, DNS & TLS Certificates',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'Custom domains require three steps: buy the domain, configure DNS to point to your cloud resource, and provision a TLS certificate. The DNS step creates an `A` record (or `CNAME` for load balancers) mapping `api.yourapp.com` to your server\'s IP. With AWS, you point your domain\'s nameservers to Route 53 and create records there. With Cloudflare, you set Cloudflare as your nameserver and get DDoS protection, CDN, and Anycast DNS for free.',
      '**TLS certificates** — the cryptographic files that enable HTTPS — must be issued by a trusted Certificate Authority. **Let\'s Encrypt** issues free, 90-day certificates automatically. **AWS Certificate Manager (ACM)** provisions free certificates for resources within AWS (ALB, CloudFront, API Gateway) and auto-renews them. You never touch the certificate files — ACM manages everything.',
      'For Kubernetes, **cert-manager** automates certificate issuance and renewal using Let\'s Encrypt. It integrates with your Ingress — just add the annotation `cert-manager.io/cluster-issuer: "letsencrypt-prod"` and cert-manager provisions the certificate, stores it as a Kubernetes Secret, and renews it before it expires. Zero manual certificate management in production.'
    ],
    code: `# ── Route 53: create DNS records via CLI ──
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.jobtrackr.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "my-alb-1234.ap-south-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true,
          "HostedZoneId": "ZP97RAFLXTNZK"
        }
      }
    }]
  }'

# ── ACM: request a certificate ──
aws acm request-certificate \
  --domain-name "api.jobtrackr.com" \
  --validation-method DNS \
  --subject-alternative-names "*.jobtrackr.com"
# ACM will tell you which DNS record to add for domain validation
# After adding: auto-issues and auto-renews forever

# ── Verify TLS is working ──
openssl s_client -connect api.jobtrackr.com:443 -servername api.jobtrackr.com \
  | openssl x509 -noout -dates`
  },
  {
    id: 'cloud_5',
    title: 'Cloud Object Storage: S3 Patterns',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'S3 (and its equivalents: GCS, Azure Blob Storage) is the right place for user-generated files: resumes, profile photos, job attachments. The canonical upload pattern is **client-side direct upload with presigned URLs** — your server generates a temporary signed URL, the client uploads directly to S3, your server is never in the upload path. This scales to millions of uploads without adding load to your API.',
      '**Multipart uploads** handle large files (>100MB). S3 allows splitting a file into parts, uploading them in parallel, then completing the multipart upload. The AWS SDK handles this automatically for large files via `Upload` from `@aws-sdk/lib-storage`. For very large files (video, datasets), multipart is 3-10x faster than a single PUT due to parallelism.',
      'S3 **Object Lifecycle policies** automate cost management without code changes: move objects to S3 Standard-IA after 30 days (40% cheaper), to Glacier after 90 days (80% cheaper), delete after 365 days. For access logs and cold backups, this saves thousands of dollars per year automatically. Configure via the AWS Console, CLI, or Terraform.'
    ],
    code: `// ── Presigned URL: client uploads directly to S3 ──
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-south-1' });

// 1. Server generates presigned URL
app.post('/api/uploads/presign', authenticate, async (req, res) => {
  const { fileName, contentType } = req.body;
  const key = \`resumes/\${req.user.id}/\${Date.now()}-\${fileName}\`;

  const putUrl = await getSignedUrl(s3, new PutObjectCommand({
    Bucket: 'jobtrackr-uploads',
    Key: key,
    ContentType: contentType,
    Metadata: { userId: req.user.id },
  }), { expiresIn: 900 }); // 15 minutes

  res.json({ uploadUrl: putUrl, key });
});

// 2. Client uploads directly to S3 (browser code)
async function uploadResume(file: File) {
  const { uploadUrl, key } = await api.presignUpload(file.name, file.type);
  await fetch(uploadUrl, { method: 'PUT', body: file,
    headers: { 'Content-Type': file.type } });
  await api.saveResumeKey(key); // Tell server the file is uploaded
}

// ── Lifecycle policy via AWS CLI ──
aws s3api put-bucket-lifecycle-configuration --bucket jobtrackr-uploads \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "archive-old-resumes", "Status": "Enabled",
      "Filter": {"Prefix": "resumes/"},
      "Transitions": [
        {"Days": 30, "StorageClass": "STANDARD_IA"},
        {"Days": 90, "StorageClass": "GLACIER"}
      ],
      "Expiration": {"Days": 365}
    }]
  }'`
  },
  {
    id: 'cloud_6',
    title: 'Managed Kubernetes: EKS & GKE',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      'Running Kubernetes yourself means managing the **control plane** (etcd, API server, scheduler, controller manager) — patching, backing up, upgrading, and ensuring high availability of the cluster brain. **Managed Kubernetes** (AWS EKS, Google GKE, Azure AKS) handles the control plane for you. You pay ~$0.10/hour for the cluster management fee; in return, AWS/Google operates the control plane across multiple AZs with automatic backups.',
      'Use managed K8s when: you already run containers in production, you need fine-grained resource control and scheduling, you want to run stateful workloads (databases, queues) alongside stateless ones, or your team is already familiar with Kubernetes. Use **ECS Fargate** instead when: you want zero Kubernetes YAML, you run a small number of well-defined services, and operational simplicity is more important than flexibility.',
      '**Node groups** are pools of EC2 instances (EKS) or GCE VMs (GKE) that form the worker nodes. Use **managed node groups** (cloud manages OS patches and node replacement) vs **self-managed node groups** (you control the exact AMI and patch schedule). Use **Spot/Preemptible instances** for worker nodes running stateless workloads — 70% cost reduction with the understanding that nodes can be reclaimed with 2 minutes notice.'
    ],
    code: `# ── Create EKS cluster with eksctl ──
eksctl create cluster \
  --name jobtrackr-prod \
  --region ap-south-1 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed \               # AWS manages node patching
  --spot                    # Use Spot instances for 70% savings

# ── Configure kubectl to connect to EKS ──
aws eks update-kubeconfig --name jobtrackr-prod --region ap-south-1

# ── Add Spot instance node group for batch workloads ──
eksctl create nodegroup \
  --cluster jobtrackr-prod \
  --name spot-workers \
  --spot \
  --instance-types t3.medium,t3a.medium,m5.large \
  --nodes-min 0 \
  --nodes-max 20

# ── GKE: create autopilot cluster (fully serverless K8s) ──
gcloud container clusters create-auto jobtrackr-prod \
  --region asia-south1     # Autopilot: no node management at all`
  },
  {
    id: 'cloud_7',
    title: 'Multi-Region & Disaster Recovery',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      '**RTO (Recovery Time Objective)** is the maximum acceptable time your system is down after a disaster. **RPO (Recovery Point Objective)** is the maximum acceptable data loss measured in time. If RPO = 1 hour, you can lose up to 1 hour of transactions. RTO and RPO drive your DR architecture: stricter requirements cost more. A banking system needs RTO < 5 minutes; a blog might tolerate RTO = 24 hours.',
      '**Multi-region active-passive** (cold/warm standby): your primary region handles all traffic; a secondary region has a complete copy of the infrastructure in a stopped or reduced state. On disaster, you promote the standby and update DNS to point traffic there. RDS Global Databases replicate data to a secondary region with typically 1-second lag — much better than the RPO of "last backup". Warm standby achieves typical RTO of 15-30 minutes.',
      '**Multi-region active-active**: both regions handle live traffic simultaneously (split by geography using Route 53 Latency-Based Routing). Users in India hit `ap-south-1`; users in US hit `us-east-1`. Databases are the hard part — write conflicts must be handled (DynamoDB Global Tables handles this automatically; PostgreSQL requires application-level conflict resolution or a single write region). Active-active achieves near-zero RTO but requires careful data architecture.'
    ],
    code: `# ── RDS Global Database: cross-region replication ──
aws rds create-global-cluster \
  --global-cluster-identifier jobtrackr-global \
  --engine aurora-postgresql \
  --engine-version 15.3

# Primary cluster in ap-south-1 (Mumbai)
aws rds create-db-cluster \
  --db-cluster-identifier jobtrackr-primary \
  --engine aurora-postgresql \
  --global-cluster-identifier jobtrackr-global \
  --region ap-south-1

# Secondary cluster in us-east-1 (Virginia) — read replica, ~1s lag
aws rds create-db-cluster \
  --db-cluster-identifier jobtrackr-secondary \
  --engine aurora-postgresql \
  --global-cluster-identifier jobtrackr-global \
  --region us-east-1

# ── Promote secondary on disaster (takes ~1 minute) ──
aws rds remove-from-global-cluster \
  --global-cluster-identifier jobtrackr-global \
  --db-cluster-identifier jobtrackr-secondary \
  --region us-east-1
# Secondary becomes an independent writable cluster
# Update DNS to point to secondary endpoint

# ── S3 Cross-Region Replication ──
aws s3api put-bucket-replication \
  --bucket jobtrackr-uploads \
  --replication-configuration file://replication.json`
  }
];



