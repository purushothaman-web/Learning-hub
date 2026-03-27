import type { Lesson } from '../../types/curriculum';

export const awsLessons: Lesson[] = [
  {
    id: 'aws_0',
    title: 'AWS Mental Model: Regions, AZs & the Console',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      '**AWS (Amazon Web Services)** is a collection of 200+ cloud services running in data centers worldwide. The top-level concept is a **Region** — a geographic cluster of data centers (e.g., `ap-south-1` = Mumbai, `us-east-1` = N. Virginia). Each Region is completely independent — data in Mumbai never leaves unless you explicitly configure it to.',
      'Within each Region are multiple **Availability Zones (AZs)** — isolated data centers connected by low-latency links. Deploying your app across 2+ AZs means if one data center has a power failure, your service stays up automatically. This is the foundation of **high availability**. Most managed services (RDS, ELB, EKS) spread across AZs automatically.',
      'The **Shared Responsibility Model** is the most important concept for security: AWS is responsible for security *of* the cloud (hardware, networking, hypervisor). You are responsible for security *in* the cloud — your OS patches, your app code, your IAM policies, your S3 bucket permissions. Most cloud breaches happen because of customer misconfigurations, not AWS failures.'
    ],
    code: `# ── Install and configure AWS CLI ──
# Download: https://aws.amazon.com/cli/

# Configure credentials (from IAM → Users → Security Credentials)
aws configure
# AWS Access Key ID:     AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Default region name:   ap-south-1
# Default output format: json

# ── Verify the CLI works ──
aws sts get-caller-identity    # Shows your account ID and IAM user

# ── List key services ──
aws ec2 describe-regions       # All available regions
aws s3 ls                      # List your S3 buckets
aws rds describe-db-instances  # List databases`
  },
  {
    id: 'aws_1',
    title: 'IAM: Identity & Access Management',
    badge: 'Security',
    badgeClass: 'badge-concept',
    content: [
      '**IAM (Identity and Access Management)** controls who can do what in your AWS account. The golden rule is **Least Privilege** — every user, service, and role should have only the permissions it needs and nothing more. Your deployment bot needs `s3:PutObject` on one specific bucket — not `s3:*` on all buckets.',
      '**IAM Roles** are temporary identities assumed by AWS services. When your EC2 instance needs to read from S3, you attach an IAM Role to the instance — it gets temporary, auto-rotating credentials automatically. Never hardcode access keys in application code on EC2. This removes the credential management problem entirely while being more secure.',
      '**IAM Policies** are JSON documents defining Allow/Deny rules. The evaluation logic: explicit Deny always wins → if there is an Allow matching the action → access granted. Policies attach to users, groups, or roles. **Service Control Policies (SCPs)** in AWS Organizations are the security team\'s override — they can prevent any account in the organization from ever granting public access to S3, regardless of what individual account admins do.'
    ],
    code: `# ── Create an IAM policy (least privilege for S3 upload) ──
aws iam create-policy \
  --policy-name JobTrackrUploadPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::jobtrackr-uploads/*"
    }]
  }'

# ── Create a role for EC2 instances ──
aws iam create-role \
  --role-name EC2AppRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# ── Attach policy to role ──
aws iam attach-role-policy \
  --role-name EC2AppRole \
  --policy-arn arn:aws:iam::123456789:policy/JobTrackrUploadPolicy`
  },
  {
    id: 'aws_2',
    title: 'EC2: Virtual Machines in the Cloud',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      '**EC2 (Elastic Compute Cloud)** is AWS\'s virtual machine service. You choose an **Instance Type** (e.g., `t3.micro` = 2 vCPU, 1GB RAM, free tier eligible; `c5.2xlarge` = 8 vCPU, 16GB RAM for compute-heavy tasks). The type family tells you the workload it\'s optimized for: `t` = burstable general purpose, `c` = compute intensive, `r` = memory intensive, `g` = GPU.',
      'A **Security Group** is EC2\'s firewall. It controls inbound and outbound traffic by port, protocol, and source IP. Best practice: only open the ports you need, and prefer **whitelisting specific CIDR blocks or other Security Group IDs** over `0.0.0.0/0` (open to the entire internet). Never open port 22 (SSH) to `0.0.0.0/0` — use AWS Systems Manager Session Manager instead.',
      '**User Data** is a startup script that runs when the instance first launches. This is how you automate server setup: install Node.js, clone your repo, start your service. Combined with **Launch Templates** (saved EC2 configurations) and **Auto Scaling Groups**, you can automatically add and configure new servers within minutes of needing them.'
    ],
    code: `# ── Launch an EC2 instance via CLI ──
aws ec2 run-instances \
  --image-id ami-0f5ee92e2d63afc18 \   # Amazon Linux 2023 (ap-south-1)
  --instance-type t3.micro \
  --key-name MyKeyPair \
  --security-group-ids sg-0abcdef1234 \
  --subnet-id subnet-0abcdef \
  --iam-instance-profile Name=EC2AppRole \
  --user-data '#!/bin/bash
    yum update -y
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
    cd /home/ec2-user
    git clone https://github.com/yourUsername/jobtrackr.git
    cd jobtrackr && npm install
    npm start &'

# ── SSH into the instance ──
aws ec2 describe-instances --query \
  'Reservations[*].Instances[*].PublicIpAddress' --output text

ssh -i MyKeyPair.pem ec2-user@<PUBLIC_IP>

# ── Stop vs Terminate (DANGER!) ──
aws ec2 stop-instances --instance-ids i-1234567890  # Pauses, data preserved
aws ec2 terminate-instances --instance-ids i-1234   # PERMANENT deletion`
  },
  {
    id: 'aws_3',
    title: 'S3: Object Storage at Scale',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      '**S3 (Simple Storage Service)** is object storage — not a file system, not a database, but a key-value store for files where the "key" is the file path and the "value" is the content. It\'s infinitely scalable, 11 nines durable (99.999999999%), and serves as the foundation of most cloud architectures: static website hosting, data lakes, backup storage, and application file uploads.',
      '**Presigned URLs** are the secure way to allow uploads/downloads without exposing your AWS credentials. You generate a temporary URL (valid for e.g. 15 minutes) that allows one specific operation on one specific file. The user uploads their resume directly from the browser to S3 — your server never handles the file bytes. This scales to millions of uploads without touching your server.',
      '**S3 Lifecycle Policies** automate cost management. Files in Standard storage cost ~$0.023/GB/month. Files moved to **S3 Glacier** cost ~$0.004/GB/month. Set a rule: "move objects not accessed in 90 days to Glacier, delete after 365 days". For access logs or old backups, this can cut storage costs by 80% automatically.'
    ],
    code: `# ── Create a private S3 bucket ──
aws s3 mb s3://jobtrackr-uploads-prod --region ap-south-1

# Block all public access (essential for user data buckets)
aws s3api put-public-access-block \
  --bucket jobtrackr-uploads-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# ── Node.js: generate a presigned upload URL ──
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-south-1' });

async function getUploadUrl(filename: string, userId: string) {
  const key = \`uploads/\${userId}/\${Date.now()}-\${filename}\`;
  const command = new PutObjectCommand({
    Bucket: 'jobtrackr-uploads-prod',
    Key: key,
    ContentType: 'application/pdf',
  });
  // One-time URL, expires in 15 minutes
  const url = await getSignedUrl(s3, command, { expiresIn: 900 });
  return { url, key };
}

// Client uploads directly to S3:
// await fetch(url, { method: 'PUT', body: file })`
  },
  {
    id: 'aws_4',
    title: 'RDS & ElastiCache: Managed Databases',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**RDS (Relational Database Service)** runs PostgreSQL, MySQL, or SQL Server in the cloud — fully managed. AWS handles OS patching, backups (automated daily snapshots with point-in-time recovery), Multi-AZ failover (synchronized standby replica promoted within 60-120 seconds if primary fails), and storage auto-scaling. You pay more than self-managing a database on EC2, but save 20+ hours of DBA work per month.',
      '**RDS Multi-AZ** vs **Read Replicas**: Multi-AZ is for high availability (same data, failover). Read Replicas are for read performance (asynchronous copies, slight lag, offload heavy reporting queries). You can promote a read replica to standalone RDS if needed for disaster recovery in a different region.',
      '**ElastiCache** is AWS\'s managed Redis and Memcached. It lives inside your VPC (no public access) and integrates with RDS-based apps to layer caching. Since it\'s managed: automatic failover with ElastiCache for Redis (single-digit millisecond recovery), cluster mode for sharding across nodes, and automatic backup. The setup that takes hours manually is ready in 10 minutes via CLI.'
    ],
    code: `# ── Create RDS PostgreSQL in a private subnet ──
aws rds create-db-instance \
  --db-instance-identifier jobtrackr-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username admin \
  --master-user-password $(openssl rand -base64 24) \
  --db-name jobtrackr \
  --vpc-security-group-ids sg-0abcdef \
  --db-subnet-group-name private-subnet-group \
  --multi-az \
  --storage-type gp3 \
  --allocated-storage 20

# ── Create ElastiCache Redis ──
aws elasticache create-replication-group \
  --replication-group-id jobtrackr-redis \
  --description "JobTrackr cache" \
  --node-type cache.t3.micro \
  --num-cache-clusters 2 \     # Primary + 1 replica
  --engine redis \
  --engine-version 7.0 \
  --security-group-ids sg-cache

# ── Get connection endpoint ──
aws rds describe-db-instances \
  --query 'DBInstances[0].Endpoint.Address' --output text`
  },
  {
    id: 'aws_5',
    title: 'ECS & ECR: Container Deployments',
    badge: 'Advanced',
    badgeClass: 'badge-code',
    content: [
      '**ECR (Elastic Container Registry)** is AWS\'s private Docker registry. Push your images here and ECS/EKS can pull them securely within your AWS account without authentication overhead. ECR integrates with IAM (the EC2 IAM role grants ECR pull access), does vulnerability scanning on push, and lifecycle policies automatically delete old image tags to save storage costs.',
      '**ECS (Elastic Container Service)** is AWS\'s simpler alternative to Kubernetes for running Docker containers. Instead of Pods and Deployments, ECS has **Tasks** (one running container) and **Services** (manages desired task count, load balancing, rolling deploys). **Fargate** launch type is serverless ECS — you define CPU/memory, AWS manages the underlying EC2 instances completely.',
      'The **ECS Deployment Flow**: Build image → `docker build` → Push to ECR → Update ECS Task Definition (new image tag) → ECS Service rolling update begins (new task started, old task drained and stopped). This is zero-downtime deployment with 5 commands. Combined with GitHub Actions, this becomes your automated CD pipeline.'
    ],
    code: `# ── Push Docker image to ECR ──
# 1. Create the registry
aws ecr create-repository --repository-name jobtrackr-api --region ap-south-1

# 2. Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.ap-south-1.amazonaws.com

# 3. Build, tag, push
docker build -t jobtrackr-api .
docker tag jobtrackr-api:latest \
  123456789.dkr.ecr.ap-south-1.amazonaws.com/jobtrackr-api:latest
docker push \
  123456789.dkr.ecr.ap-south-1.amazonaws.com/jobtrackr-api:latest

# ── Update ECS service (triggers rolling deploy) ──
aws ecs update-service \
  --cluster jobtrackr-prod \
  --service api-service \
  --force-new-deployment

# ── Monitor deployment ──
aws ecs describe-services \
  --cluster jobtrackr-prod \
  --services api-service \
  --query 'services[0].deployments'`
  },
  {
    id: 'aws_6',
    title: 'CloudWatch: Monitoring & Alerts',
    badge: 'Operations',
    badgeClass: 'badge-practice',
    content: [
      '**CloudWatch** is the unified observability service for AWS — it collects metrics, logs, and traces from every AWS service automatically. EC2 sends CPU/network metrics every minute; RDS sends database connections, read/write IOPS, and storage; ALB sends request count, latency, and 5xx error rates. All of this is available in dashboards seconds after your resources are created.',
      '**CloudWatch Alarms** trigger actions when metrics cross thresholds. "If ALB 5xx error rate > 1% for 5 consecutive minutes → send SNS notification → page on-call engineer". Combine with **Auto Scaling policies** to automatically add servers when CPU > 70% and remove them when CPU < 30%. The alarm → scaling action chain is the foundation of automated reliability.',
      '**CloudWatch Logs Insights** is a query engine for your log data. Instead of `grep`-ing through gigabytes of log files on a server, you write SQL-like queries against all your logs simultaneously: "Find all requests that took more than 2 seconds in the last 1 hour, sorted by latency". This takes seconds and costs fractions of a cent per query.'
    ],
    code: `# ── Create an alarm: alert if API error rate > 1% ──
aws cloudwatch put-metric-alarm \
  --alarm-name "HighErrorRate" \
  --alarm-description "API 5xx errors above 1%" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:ap-south-1:123456:alert-oncall

# ── Send custom metrics from your Node.js app ──
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
const cw = new CloudWatch({ region: 'ap-south-1' });

async function recordJobPostCreated() {
  await cw.putMetricData({
    Namespace: 'JobTrackr/App',
    MetricData: [{
      MetricName: 'JobPostsCreated',
      Value: 1,
      Unit: 'Count',
    }]
  });
}

# ── CloudWatch Logs Insights query ──
# In AWS Console → CloudWatch → Logs Insights:
fields @timestamp, status, duration
| filter duration > 2000
| sort @timestamp desc
| limit 100`
  },
  {
    id: 'aws_7',
    title: 'Project Execution: Deploy to AWS',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will deploy the JobTrackr API to AWS using the CLI and Terraform. The infrastructure includes: a VPC with public/private subnets, an ALB (Application Load Balancer) in the public subnet, an ECS Fargate service in the private subnet, an RDS PostgreSQL instance in the private subnet, an S3 bucket for resume uploads, and CloudWatch alarms for CPU and error rate.',
      'The deployment pipeline: push the Docker image to ECR, update the ECS Task Definition with the new image tag, trigger a rolling update via the ECS Service, and confirm all new tasks pass the health check before old ones are drained. Set a CloudWatch alarm to notify via email if the deployment causes a spike in 5xx errors.',
      '**Studio Task**: Write a `deploy.sh` script that automates the full deploy cycle — build image, push to ECR, register new Task Definition revision, and trigger ECS service update. Verify the deployment completes successfully by polling `aws ecs describe-services` until `runningCount == desiredCount`.'
    ],
    code: `#!/bin/bash
# ── deploy.sh: automated ECS deployment ──

set -e  # Exit immediately on error

REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URL="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
REPO="jobtrackr-api"
TAG=$(git rev-parse --short HEAD)   # Git commit hash as image tag
CLUSTER="jobtrackr-prod"
SERVICE="api-service"

echo "Building and pushing $REPO:$TAG"

# Authenticate + build + push
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_URL

docker build -t $REPO:$TAG .
docker tag $REPO:$TAG $ECR_URL/$REPO:$TAG
docker push $ECR_URL/$REPO:$TAG

# Update ECS service
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --force-new-deployment \
  --region $REGION

echo "Deployment triggered for $REPO:$TAG"
echo "Monitor: aws ecs describe-services --cluster $CLUSTER --services $SERVICE"`
  }
];
