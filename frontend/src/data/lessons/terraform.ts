import type { Lesson } from '../../types/curriculum';

export const terraformLessons: Lesson[] = [
  {
    id: 'tf_0',
    title: 'Infrastructure as Code: The Mindset Shift',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Clicking through the AWS console to create a server is manual, error-prone, and impossible to reproduce exactly. **Infrastructure as Code (IaC)** means writing your infrastructure as text files. The code *is* the infrastructure — the same way your `package.json` describes your app\'s dependencies, your Terraform files describe your servers, databases, and networks.',
      '**Terraform** by HashiCorp is the dominant IaC tool. It is **cloud-agnostic**: the same Terraform workflow works for AWS, GCP, Azure, or even Kubernetes. You write resources in HCL (HashiCorp Configuration Language), run `terraform plan` to preview changes, and `terraform apply` to make them real.',
      'The key mental model is the **State File** (`terraform.tfstate`). Terraform records every resource it has created in this file. When you run `plan`, it compares the state file (what it thinks exists) against your code (what you want) and generates a diff. This is how Terraform knows what to create, modify, or destroy. Guard this file with your life — losing it means Terraform loses track of your infrastructure.'
    ],
    code: `# ── Install Terraform (Windows via Chocolatey) ──
choco install terraform

# ── Basic workflow ──
terraform init      # Download provider plugins (aws, google, etc.)
terraform fmt       # Auto-format HCL code
terraform validate  # Check syntax
terraform plan      # Preview changes (what will be created/modified/destroyed)
terraform apply     # Make it real (prompts for confirmation)
terraform destroy   # Tear everything down

# ── Check what Terraform knows about your infra ──
terraform show      # Human-readable state
terraform state list  # List all managed resources`
  },
  {
    id: 'tf_1',
    title: 'HCL Syntax & Providers',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'HCL (HashiCorp Configuration Language) is human-readable and declarative. A **Provider** is a plugin that understands how to talk to a cloud API (AWS, GCP, Azure). You configure providers in a `provider.tf` block and Terraform downloads them during `terraform init`. A single Terraform project can use multiple providers simultaneously — for example, AWS for servers and Cloudflare for DNS.',
      'Resources are declared as `resource "<provider>_<type>" "<name>"`. The combination of provider, type, and name uniquely identifies the resource in the state file. Terraform builds a dependency graph from these resources: if Resource B references `aws_vpc.main.id`, Terraform knows to create the VPC before the subnet.',
      'The **`required_providers` block** in `versions.tf` pins the exact version of each provider. This is critical — a provider update can have breaking changes. Treat provider versions like npm package versions: pin them in a lockfile (`terraform.lock.hcl`) and upgrade intentionally, not accidentally.'
    ],
    code: `# ── versions.tf ──
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"      # Allow 5.x but not 6.x
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# ── provider.tf ──
provider "aws" {
  region = "ap-south-1"       # Mumbai
  # Credentials: set via env vars or ~/.aws/credentials
  # AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
}

# ── main.tf: create an S3 bucket ──
resource "aws_s3_bucket" "uploads" {
  bucket = "jobtrackr-uploads-prod"
  tags = {
    Environment = "production"
    Project     = "JobTrackr"
  }
}`
  },
  {
    id: 'tf_2',
    title: 'Variables & Outputs',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      '**Variables** make your Terraform code reusable across environments. Instead of hardcoding `"ap-south-1"`, you define `variable "region" {}` and override it per environment. Variables can have types (`string`, `number`, `bool`, `list`, `object`), default values, and validation rules. Sensitive variables (passwords) are marked with `sensitive = true` to hide their values in plan output.',
      '**Locals** are computed values within your configuration — like constants you derive from other values. `local.common_tags` might merge environment-specific tags with project-wide tags. Locals keep your code DRY and centralize logic that would otherwise be copy-pasted into every resource.',
      '**Outputs** expose information about created resources. After running `terraform apply`, you can run `terraform output db_endpoint` to get the database URL, `terraform output instance_ip` to SSH in. Outputs from one Terraform project (module) can be fed as inputs to another — this is how large organizations chain infrastructure modules together.'
    ],
    code: `# ── variables.tf ──
variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}

variable "db_password" {
  type      = string
  sensitive = true             # Hidden in plan/apply output
}

# ── locals.tf ──
locals {
  common_tags = {
    Project     = "JobTrackr"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
  db_name = "jobtrackr_\${var.environment}"
}

# ── outputs.tf ──
output "db_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "PostgreSQL connection endpoint"
}

output "api_url" {
  value = "https://\${aws_lb.main.dns_name}"
}`
  },
  {
    id: 'tf_3',
    title: 'Remote State & Backends',
    badge: 'Operations',
    badgeClass: 'badge-concept',
    content: [
      'By default, `terraform.tfstate` is saved locally. This is dangerous on a team — if two engineers run `terraform apply` simultaneously, they corrupt each other\'s state. **Remote Backends** store state in a shared location (S3, GCS, Terraform Cloud). All team members point to the same state, and Terraform uses **State Locking** (via DynamoDB on AWS) to prevent concurrent modifications.',
      'Remote state also enables **State File Encryption**. S3 buckets with AES-256 encryption + a DynamoDB lock table is the standard AWS setup. Never commit the state file to Git — it contains plaintext secrets (database passwords, API keys) that Terraform stored there during resource creation.',
      '**State commands** are powerful for managing drift (when your real infrastructure diverges from what Terraform knows). `terraform import` brings an existing resource under Terraform management. `terraform state rm` removes a resource from state without destroying it. `terraform state mv` renames a resource in state without recreating it.'
    ],
    code: `# ── backend.tf: store state in S3 + lock with DynamoDB ──
terraform {
  backend "s3" {
    bucket         = "jobtrackr-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"  # Prevents concurrent applies
  }
}

# ── Create the backend infrastructure first (chicken-and-egg) ──
# Run this manually ONCE before using the backend:
resource "aws_s3_bucket" "tfstate" {
  bucket = "jobtrackr-terraform-state"
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"       # Rollback state on accident
  }
}

resource "aws_dynamodb_table" "lock" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}`
  },
  {
    id: 'tf_4',
    title: 'Modules: Reusable Infrastructure',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      'A **Module** is a reusable Terraform configuration in its own directory with variables, resources, and outputs. Instead of duplicating your RDS + security group configuration across dev, staging, and prod, you write a `modules/database` module and call it three times with different variable values. This is the Terraform equivalent of a function.',
      'The **Terraform Registry** (registry.terraform.io) has thousands of community modules for common patterns — VPCs, EKS clusters, RDS instances. Using a verified registry module means not writing the 200-line VPC setup from scratch. But always pin module versions (`version = "~> 5.0"`) to avoid surprise breaking changes.',
      'Module composition: modules can call other modules. A `modules/app-stack` module might internally call `modules/database`, `modules/cache` (Redis), and `modules/load-balancer`. Your root `main.tf` calls `app-stack` once per environment. This creates a clean hierarchy that mirrors your architecture.'
    ],
    code: `# ── modules/database/main.tf ──
variable "environment" { type = string }
variable "db_password"  { type = string; sensitive = true }
variable "instance_class" { type = string; default = "db.t3.micro" }

resource "aws_db_instance" "main" {
  identifier     = "jobtrackr-\${var.environment}"
  engine         = "postgres"
  engine_version = "16"
  instance_class = var.instance_class
  db_name        = "jobtrackr"
  username       = "admin"
  password       = var.db_password
  skip_final_snapshot = var.environment != "prod"
}

output "endpoint" { value = aws_db_instance.main.endpoint }

# ── root main.tf: call the module ──
module "prod_db" {
  source         = "./modules/database"
  environment    = "prod"
  db_password    = var.db_password
  instance_class = "db.t3.large"    # Override default for prod
}

# Use the module's output
output "prod_db_url" {
  value = "postgresql://admin@\${module.prod_db.endpoint}/jobtrackr"
}`
  },
  {
    id: 'tf_5',
    title: 'Workspaces: One Codebase, Many Environments',
    badge: 'Advanced',
    badgeClass: 'badge-practice',
    content: [
      '**Terraform Workspaces** let you manage multiple environments (dev, staging, prod) from a single configuration. Each workspace has its own isolated state file. Run `terraform workspace new staging && terraform apply` and you get a complete copy of your infrastructure with the staging configuration, without touching prod.',
      'Inside your HCL, `terraform.workspace` gives you the current workspace name. Use it to drive conditional logic: `var.environment = terraform.workspace` lets you set instance sizes, replica counts, or enable/disable features per environment. Prod gets `db.t3.large`; dev gets `db.t3.micro`.',
      'For complex organizations, the **Terragrunt** wrapper adds `keep_your_terraform_code_dry` patterns with per-directory state and automatic dependency resolution between modules. For smaller teams, workspaces in a single repo are simpler and sufficient. Choose Terragrunt when you have 5+ environments or 20+ modules.'
    ],
    code: `# ── Workspace commands ──
terraform workspace list        # See all workspaces
terraform workspace new staging # Create staging workspace
terraform workspace select prod # Switch to prod
terraform workspace show        # Current workspace

# ── Use workspace in config ──
locals {
  env = terraform.workspace     # "dev", "staging", "prod"

  instance_types = {
    dev     = "t3.micro"
    staging = "t3.small"
    prod    = "t3.large"
  }
}

resource "aws_instance" "api" {
  instance_type = local.instance_types[local.env]
  tags = { Environment = local.env }
}

# ── Different S3 backend key per workspace ──
terraform {
  backend "s3" {
    bucket = "jobtrackr-terraform-state"
    key    = "\${terraform.workspace}/terraform.tfstate"   # dev/tf.tfstate, prod/tf.tfstate
    region = "ap-south-1"
  }
}`
  },
  {
    id: 'tf_6',
    title: 'VPC & Network Setup',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'The **VPC (Virtual Private Cloud)** is your private, isolated section of the cloud. All resources (EC2, RDS, EKS) live inside a VPC. A typical production VPC uses the CIDR block `10.0.0.0/16` (65,536 IP addresses). Inside the VPC, you create **subnets** — smaller IP ranges, each tied to one availability zone.',
      '**Public subnets** (`10.0.1.0/24`, `10.0.2.0/24`) have a route to the **Internet Gateway** — resources here get public IPs and can receive traffic from the internet (your load balancer lives here). **Private subnets** (`10.0.10.0/24`, `10.0.20.0/24`) have no internet route — your databases and application servers live here, safe from direct internet access.',
      'Private resources in private subnets can still reach the internet *outbound* (to download packages, call APIs) via a **NAT Gateway** placed in a public subnet. Traffic goes: Private Subnet → NAT Gateway (public subnet) → Internet Gateway → Internet. Inbound traffic can never reach private subnets directly.'
    ],
    code: `# ── vpc.tf: production-grade 3-tier network ──
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "jobtrackr-vpc" }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "public-\${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "private-\${count.index + 1}" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id  # NAT lives in public subnet
}`
  },
  {
    id: 'tf_7',
    title: 'Terraform in CI/CD Pipelines',
    badge: 'DevOps',
    badgeClass: 'badge-practice',
    content: [
      'Manual `terraform apply` is dangerous in production — one engineer\'s mistake can take down the entire stack. The professional approach is **GitOps for infrastructure**: infrastructure changes go through the same pull request review process as code. `terraform plan` output is posted as a PR comment so reviewers can see exactly what will change before approving.',
      '**Atlantis** (open-source) and **Terraform Cloud** automate this workflow. When a PR is opened, they automatically run `terraform plan` and post the output. Merging the PR triggers `terraform apply`. Permissions are centralized — no engineer needs Terraform credentials on their laptop; the CI/CD runner has the IAM role.',
      'In GitHub Actions, use the official `hashicorp/setup-terraform` action. Store cloud credentials as GitHub Secrets. The key principle: **the main branch always represents production**. Infrastructure drift (manually changed resources) is caught during the next plan run, which shows a diff between the state file and reality.'
    ],
    code: `# ── .github/workflows/terraform.yml ──
name: Terraform CI/CD
on:
  pull_request:
    paths: ['terraform/**']
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform/

    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.0"

      - name: Terraform Init
        run: terraform init
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Terraform Plan
        run: terraform plan -out=tfplan

      # Only apply on merge to main
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply tfplan`
  },
  {
    id: 'tf_8',
    title: 'Project Execution: Cloud Infrastructure Stack',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will write a complete production-grade Terraform configuration for JobTrackr. The stack must include: a VPC with public and private subnets across 2 AZs, an S3 bucket for uploads, an RDS PostgreSQL instance in a private subnet, a security group allowing only the app servers to reach the database, and a remote backend in S3 with DynamoDB locking.',
      'Use a `modules/database` module for the RDS config and create dev and prod workspaces. The database instance class and storage size must differ between workspaces using `local` variables. All resources must have consistent tags using `local.common_tags`.',
      '**Studio Task**: Write the full Terraform config in `infrastructure/`. Run `terraform plan` and capture the output showing 12+ resources to be created. Verify the plan shows correct instance types for each workspace. Bonus: write a GitHub Actions workflow that runs `terraform plan` on PRs and applies on merge to main.'
    ],
    code: `# ── Project Checklist ──
# 1. VPC with public + private subnets?  [ ]
# 2. Internet Gateway + NAT Gateway?     [ ]
# 3. RDS in private subnet?              [ ]
# 4. Security groups (DB port 5432)?     [ ]
# 5. S3 bucket for uploads?              [ ]
# 6. Remote state in S3 + DynamoDB?      [ ]
# 7. modules/database created?           [ ]
# 8. dev + prod workspaces tested?       [ ]
# 9. All resources tagged?               [ ]
# 10. CI/CD pipeline configured?         [ ]

# ── Validate before apply ──
terraform workspace select prod
terraform validate && terraform plan -out=prod.tfplan
terraform show prod.tfplan | grep "+ resource"`
  }
];
