import type { Lesson } from '../../types/curriculum';

export const kubernetesLessons: Lesson[] = [
  {
    id: 'k8s_0',
    title: 'Container Orchestration Mental Model',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'Docker solves "it works on my machine" by packaging code and its dependencies into a portable container. But Docker alone does not solve *running* hundreds of containers in production. **Kubernetes (K8s)** is the operating system for your container fleet — it decides where containers run, restarts them if they crash, scales them under load, and rolls out new versions without downtime.',
      'The fundamental abstraction in K8s is the **desired state model**. You declare "I want 3 replicas of my API running" in a YAML file and apply it. Kubernetes\'s **control loop** continuously watches the cluster and takes actions to make reality match your declaration. If a server dies and takes 2 containers with it, K8s automatically schedules 2 new ones elsewhere.',
      'Key components: **Control Plane** (brain — stores state in etcd, schedules work via the API server) and **Worker Nodes** (muscles — physical/virtual machines that run your containers via the **kubelet** agent). As a developer, you interact with the cluster via `kubectl` — the command-line tool that talks to the Control Plane API.'
    ],
    code: `# ── Install kubectl + connect to a cluster ──
# (or use Docker Desktop's built-in Kubernetes for local dev)
kubectl version --client

# ── Inspect the cluster ──
kubectl cluster-info
kubectl get nodes              # List all worker nodes + their status

# ── The control loop in action ──
# 1. Apply desired state
kubectl apply -f deployment.yaml

# 2. Watch K8s reconcile reality to match
kubectl get pods -w            # -w = watch (live updates)

# If a pod crashes: K8s restarts it automatically
# If a node dies: K8s reschedules pods on live nodes`
  },
  {
    id: 'k8s_1',
    title: 'Pods & Deployments',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'A **Pod** is the smallest deployable unit in K8s — a wrapper around one or more containers that share the same network and storage. In practice, most Pods run a single container. Pods are **ephemeral**: when they crash or are rescheduled, they get a new IP address. You never connect directly to a Pod.',
      'A **Deployment** manages a set of identical Pods (replicas). It handles rolling updates: when you push a new Docker image, the Deployment incrementally replaces old Pods with new ones — zero downtime by default. If the new version is broken, `kubectl rollout undo` instantly reverts to the previous version.',
      '**Resource Requests & Limits** are essential for production. `requests` tell the scheduler the minimum CPU/memory needed to place the Pod on a node. `limits` are the hard cap — if exceeded, the container is throttled (CPU) or killed (memory). Without these, one misbehaving app can starve the entire cluster.'
    ],
    code: `# ── deployment.yaml ──
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3                  # Always run 3 copies
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
        - name: api
          image: myregistry/api-server:v2.1.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "250m"      # 250 millicores = 0.25 vCPU
            limits:
              memory: "256Mi"
              cpu: "500m"

# ── Common kubectl commands ──
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl rollout status deployment/api-server
kubectl rollout undo deployment/api-server   # Revert!
kubectl scale deployment api-server --replicas=5`
  },
  {
    id: 'k8s_2',
    title: 'Services: Stable Networking',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'Since Pods are ephemeral (crash, restart, get new IPs), you need a stable **Service** in front of them. A Service is a permanent virtual IP that load-balances traffic to all Pods matching a label selector. Even if all 3 Pods are replaced, the Service IP never changes.',
      'There are three main Service types: **ClusterIP** (internal only — other services in the cluster can reach it, but nothing from the internet). **NodePort** (exposes the Service on a fixed port on every node — useful for development). **LoadBalancer** (provisions a cloud load balancer with a public IP — this is how you expose services to the internet in production on EKS/GKE/AKS).',
      '**DNS in Kubernetes**: Every Service gets an automatic DNS entry inside the cluster: `<service-name>.<namespace>.svc.cluster.local`. A backend Pod can reach the database Service at `postgres-db.default.svc.cluster.local:5432`. This removes all hardcoded IPs from your application config.'
    ],
    code: `# ── service.yaml ──
apiVersion: v1
kind: Service
metadata:
  name: api-server-svc
spec:
  selector:
    app: api-server           # Routes to Pods with this label
  ports:
    - protocol: TCP
      port: 80                # Service port (external)
      targetPort: 3000        # Container port (internal)
  type: ClusterIP             # Internal only

---
# ── LoadBalancer (for cloud deployments) ──
apiVersion: v1
kind: Service
metadata:
  name: api-server-lb
spec:
  selector:
    app: api-server
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer          # Cloud provisions a public IP

# ── Verify ──
kubectl get services
kubectl describe service api-server-svc

# ── Internal DNS example ──
# From inside any pod:
curl http://api-server-svc.default.svc.cluster.local/health`
  },
  {
    id: 'k8s_3',
    title: 'ConfigMaps & Secrets',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'Hardcoding environment variables in your Docker image is wrong — each environment (dev, staging, prod) needs different values. **ConfigMaps** store non-sensitive config (API URLs, feature flags, log levels) as key-value pairs that are injected into Pods at runtime. Change the ConfigMap and redeploy; the image itself never changes.',
      '**Secrets** store sensitive data (database passwords, API keys). They are base64 encoded (not encrypted by default!) and stored in etcd. For real security, enable **Encryption at Rest** in etcd or use a dedicated secrets manager like HashiCorp Vault, AWS Secrets Manager, or the Kubernetes External Secrets Operator.',
      'Secrets can be mounted as **files** (the app reads `/etc/secrets/db-password`) or injected as **environment variables** (`DATABASE_URL=postgres://...`). The file approach is slightly more secure because secrets don\'t appear in `kubectl describe pod` output or process environment lists.'
    ],
    code: `# ── configmap.yaml ──
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  FEATURE_RAG: "true"
  API_BASE_URL: "https://api.example.com"

---
# ── secret.yaml (values must be base64 encoded!) ──
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # echo -n 'mysecretpassword' | base64
  DB_PASSWORD: bXlzZWNyZXRwYXNzd29yZA==
  JWT_SECRET: c3VwZXJzZWNyZXQ=

---
# ── Reference in a Deployment ──
spec:
  containers:
    - name: api
      image: myregistry/api:latest
      envFrom:
        - configMapRef:
            name: app-config        # All ConfigMap keys as env vars
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DB_PASSWORD`
  },
  {
    id: 'k8s_4',
    title: 'Persistent Storage: PV & PVC',
    badge: 'Deep Dive',
    badgeClass: 'badge-concept',
    content: [
      'Containers are stateless by design — when a Pod dies, all data inside it is lost. For databases, file uploads, or any persistent data, Kubernetes provides **Persistent Volumes (PV)**. A PV is a piece of storage (an EBS volume on AWS, a GCS disk on GCP, or an NFS share) that exists independently of any Pod\'s lifecycle.',
      'Developers don\'t request a specific PV directly. They create a **Persistent Volume Claim (PVC)** — a *request* for storage with specific size and access requirements. Kubernetes matches the PVC to an available PV automatically (or provisions one dynamically using a **StorageClass**). This decouples the developer from knowing the underlying infrastructure.',
      '**StatefulSets** are the correct way to run databases (PostgreSQL, Redis) in K8s. Unlike Deployments, StatefulSets give each Pod a stable network identity (`postgres-0`, `postgres-1`) and a dedicated PVC that follows the Pod if it\'s rescheduled. This allows databases to maintain their data and cluster membership correctly.'
    ],
    code: `# ── pvc.yaml: request 10GB of storage ──
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  accessModes:
    - ReadWriteOnce             # Only one node can write at a time
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard    # Cloud provider provisions EBS/GCS disk

---
# ── Use PVC in a StatefulSet (PostgreSQL) ──
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:16
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgres-data
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi`
  },
  {
    id: 'k8s_5',
    title: 'Ingress: HTTP Routing & TLS',
    badge: 'Core',
    badgeClass: 'badge-code',
    content: [
      'A **LoadBalancer Service** gives you one public IP per service — expensive in the cloud. **Ingress** is a single entry point (one cloud load balancer) that routes HTTP/S traffic to multiple services based on the URL path or hostname. One IP, many services, much cheaper.',
      'The **Ingress Controller** is software (like Nginx Ingress or Traefik) that runs inside the cluster, watches for Ingress resources, and configures itself accordingly. Cloud providers offer managed ones (AWS ALB Ingress Controller, GKE HTTP(S) Load Balancing). You deploy the rules; the controller handles the actual routing.',
      '**TLS Termination at the Ingress**: Instead of each service handling HTTPS, the Ingress decrypts traffic and forwards plain HTTP internally. Combined with **cert-manager** (which automatically provisions Let\'s Encrypt certificates and renews them), you get free HTTPS for all your services with zero manual certificate management.'
    ],
    code: `# ── ingress.yaml ──
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.myapp.com
        - admin.myapp.com
      secretName: app-tls       # cert-manager puts the cert here
  rules:
    - host: api.myapp.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-server-svc
                port:
                  number: 80
    - host: admin.myapp.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: admin-dashboard-svc
                port:
                  number: 80`
  },
  {
    id: 'k8s_6',
    title: 'Auto-Scaling: HPA & VPA',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      'The **Horizontal Pod Autoscaler (HPA)** watches a metric (usually CPU or memory utilization) and automatically scales the number of Pod replicas up or down. Set a target of 70% CPU — if average utilization climbs to 90%, HPA adds pods; if it drops to 30%, HPA removes them. This means you pay for what you use and absorb traffic spikes automatically.',
      'For GPU workloads or batch jobs, **custom metrics** (like requests per second from Prometheus) are more useful than CPU. The **KEDA (Kubernetes Event-Driven Autoscaling)** project extends HPA to trigger scaling based on queue depth, database row count, or even a Cron schedule — scaling to zero when idle.',
      '**Vertical Pod Autoscaler (VPA)** solves the opposite problem: instead of adding more Pods, it adjusts the CPU/memory `requests` of existing Pods to match actual usage. This prevents over-provisioning. VPA and HPA are complementary but need care to configure together — set HPA on replicas and VPA on resource requests for the same workload.'
    ],
    code: `# ── hpa.yaml: scale based on CPU ──
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70  # Target 70% CPU across all pods

# ── Verify HPA is working ──
kubectl get hpa
kubectl describe hpa api-server-hpa

# ── Load test to trigger scaling ──
# Install: npm install -g artillery
artillery quick --count 1000 --num 50 https://api.myapp.com/health
kubectl get pods -w   # Watch new pods spin up`
  },
  {
    id: 'k8s_7',
    title: 'Health Probes: Liveness & Readiness',
    badge: 'Operations',
    badgeClass: 'badge-practice',
    content: [
      'K8s needs to know if your app is alive and ready to serve traffic. **Liveness Probes** answer "Is the app stuck?". If the probe fails 3 times, K8s kills and restarts the container. This saves you from deadlocks or out-of-memory hangs that don\'t immediately crash the process. Your `/health` endpoint must return 200 even under load.',
      '**Readiness Probes** answer "Is the app ready to receive traffic?". A Pod passes the Readiness Probe only after startup is complete — database connections established, caches warmed. The Service only forwards traffic to Pods that are "ready". This is how rolling updates achieve zero downtime: new Pods don\'t receive traffic until they\'re truly ready.',
      '**Startup Probes** handle slow-starting containers (like Java apps with long warmup). They disable liveness and readiness checks until the app finishes starting, preventing premature restarts. Once the startup probe succeeds, liveness and readiness probes take over. Use this for any app that takes more than 30 seconds to start.'
    ],
    code: `# ── Add to your Deployment container spec ──
livenessProbe:
  httpGet:
    path: /health/live     # Must return 200
    port: 3000
  initialDelaySeconds: 15  # Wait 15s before first check
  periodSeconds: 20         # Check every 20s
  failureThreshold: 3       # Restart after 3 consecutive failures

readinessProbe:
  httpGet:
    path: /health/ready    # Returns 200 only when DB is connected
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 2

# ── Express: health check endpoints ──
app.get('/health/live', (req, res) => {
  // Basic: are we alive?
  res.status(200).json({ status: 'alive' });
});

app.get('/health/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');  // Test DB connection
    res.status(200).json({ status: 'ready', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'not ready', db: 'disconnected' });
  }
});`
  },
  {
    id: 'k8s_8',
    title: 'Rolling Updates & Rollbacks',
    badge: 'Operations',
    badgeClass: 'badge-concept',
    content: [
      'K8s Deployments use a **Rolling Update** strategy by default. When you push a new image, K8s incrementally replaces old Pods with new ones — it creates one new Pod, waits for it to become ready, then terminates one old Pod. It repeats until all Pods are updated. At no point is the service fully down.',
      '`maxSurge` controls how many extra Pods above the desired count can exist during the update (default: 25%). `maxUnavailable` controls how many Pods can be removed before new ones are ready (default: 25%). For zero-downtime, set `maxUnavailable: 0` — never remove an old Pod until a new one is fully ready.',
      '**Rollbacks** are instant with `kubectl rollout undo`. K8s keeps a history of your previous Deployment revisions (configurable with `revisionHistoryLimit`). It takes the exact previous Pod spec and begins rolling back to it, using the same rolling update mechanism. Monitor with `kubectl rollout status`.'
    ],
    code: `# ── Update the image (triggers rolling update) ──
kubectl set image deployment/api-server \
  api=myregistry/api-server:v2.2.0

# ── Watch the rollout happen ──
kubectl rollout status deployment/api-server

# ── Zero-downtime config in deployment.yaml ──
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1           # 1 extra pod during update
      maxUnavailable: 0     # Never remove old pod before new is ready

# ── View rollout history ──
kubectl rollout history deployment/api-server

# ── Rollback to previous version ──
kubectl rollout undo deployment/api-server

# ── Rollback to a specific revision ──
kubectl rollout undo deployment/api-server --to-revision=3`
  },
  {
    id: 'k8s_9',
    title: 'Project Execution: Deploy to K8s',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will write a complete Kubernetes manifest for the JobTrackr API — a multi-file YAML that includes a Deployment with health probes and resource limits, a ClusterIP Service, a ConfigMap for environment config, a Secret for database credentials, and an HPA that targets 70% CPU.',
      'You will deploy to a local Kubernetes cluster (Docker Desktop or kind), verify all Pods reach the Running state, and simulate a rolling update by changing the image tag. You must confirm the rollout completes with zero downtime by tailing the logs during the update.',
      '**Studio Task**: Write `k8s/api-server.yaml` with the full manifest. Verify with `kubectl get all`, trigger an update with `kubectl set image`, and confirm the old Pod version was cleanly replaced. Bonus: configure `kubectl rollout undo` for a one-command emergency revert.'
    ],
    code: `# ── Project Checklist ──
# 1. Deployment with 3 replicas?       [ ]
# 2. Resource limits set?               [ ]
# 3. Liveness + Readiness probes?       [ ]
# 4. ConfigMap for env vars?            [ ]
# 5. Secret for DB credentials?         [ ]
# 6. HPA targeting 70% CPU?             [ ]
# 7. Rolling update verified?           [ ]
# 8. Rollback practiced?                [ ]

# ── Validate the full manifest ──
kubectl apply -f k8s/ --dry-run=client

# ── Deploy & verify ──
kubectl apply -f k8s/
kubectl get all -n default
kubectl logs -f deployment/api-server`
  }
];
