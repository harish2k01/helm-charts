# Speedtest Tracker Helm Chart - Deployment Guide

This guide provides detailed instructions for deploying Speedtest Tracker on Kubernetes using Helm with different database configurations.

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │ Speedtest App   │◄───────►│ Database StatefulSet         │
│  │ (Deployment)    │         │ (MariaDB/MySQL/Postgres)    │
│  │                 │         │                  │           │
│  │ - 1-N replicas  │         │ - 1 Pod          │           │
│  │ - Config Volume │         │ - Persistent Vol │           │
│  │ - Init Container│         │ - Service        │           │
│  │   (wait for DB) │         │ - Secret         │           │
│  └─────────────────┘         └──────────────────┘           │
│         │                                                    │
│         ├─► PVC (Application config at /config)            │
│         └─► Secret (DB password, APP_KEY)                   │
│                                                              │
│  Optional:                                                   │
│  ┌──────────────────┐                                       │
│  │ Ingress/Gateway  │ ◄─── HTTP(S) Traffic                 │
│  └──────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Configuration Options

### 1. SQLite (Default) - No Additional Setup

Best for development, testing, and small single-instance deployments.

**Features:**
- No database setup required
- File-based storage
- Persisted in `/config` volume
- Single container deployment

**Installation:**
```bash
kubectl create secret generic speedtest-tracker-secrets \
  --from-literal=APP_KEY='base64:YOUR_32_CHAR_KEY'

helm install speedtest-tracker harish2k01/speedtest-tracker \
  --set speedtestTracker.secrets.existingSecret=speedtest-tracker-secrets
```

**Pros:** Simple, zero dependencies, quick startup
**Cons:** Not suitable for high-availability, limited concurrent access

---

### 2. Built-in Database StatefulSet (MariaDB/MySQL/PostgreSQL)

Database runs as a Kubernetes StatefulSet alongside the application.

#### How It Works

1. **StatefulSet Creation**: Chart creates a StatefulSet with the selected database image
2. **Initialization**: Database initializes with credentials from `values.yaml`
3. **Service Discovery**: Headless Service provides DNS name for the database
4. **Init Container**: Application waits for database to be ready before starting
5. **Connection**: Application automatically configured with DB credentials

#### Deployment Flow

```yaml
# Step 1: Create database credentials secret
kind: Secret
metadata:
  name: speedtest-tracker-db
data:
  db-password: <base64_encoded_password>

# Step 2: Create database StatefulSet
kind: StatefulSet
metadata:
  name: speedtest-tracker-db
spec:
  serviceName: speedtest-tracker-db  # Headless service
  template:
    spec:
      containers:
        - name: mysql
          image: mysql:8
          env:
            - name: MYSQL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: speedtest-tracker-db
                  key: db-password

# Step 3: Create application Deployment with init container
kind: Deployment
metadata:
  name: speedtest-tracker
spec:
  template:
    spec:
      initContainers:
        - name: wait-for-db
          image: busybox:1.35
          command:
            - sh
            - -c
            - until nc -z speedtest-tracker-db 3306; do sleep 2; done
      containers:
        - name: speedtest-tracker
          env:
            - name: DB_HOST
              value: "speedtest-tracker-db"
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: speedtest-tracker-db
                  key: db-password
```

#### Configuration Examples

**MariaDB:**
```bash
helm install speedtest-tracker harish2k01/speedtest-tracker \
  -f examples/values-mariadb.yaml
```

**MySQL:**
```bash
helm install speedtest-tracker harish2k01/speedtest-tracker \
  -f examples/values-mysql.yaml
```

**PostgreSQL:**
```bash
helm install speedtest-tracker harish2k01/speedtest-tracker \
  -f examples/values-postgresql.yaml
```

#### Auto-Configuration

When using built-in database, these variables are automatically set:

| Variable | Value | Source |
| --- | --- | --- |
| `DB_CONNECTION` | mariadb/mysql/pgsql | Enabled database section |
| `DB_HOST` | speedtest-tracker-db | Service name |
| `DB_PORT` | 3306/5432 | Service port |
| `DB_DATABASE` | speedtest_tracker | auth.database |
| `DB_USERNAME` | speedtest_tracker | auth.username |
| `DB_PASSWORD` | *** | Secret |

---

### 3. External Database

Use a database managed outside the cluster (RDS, Cloud SQL, etc.).

**Features:**
- Database managed separately
- Better for production HA/DR
- Supports managed services
- Easier backup/recovery

**Installation:**
```bash
helm install speedtest-tracker harish2k01/speedtest-tracker \
  -f examples/values-external-db.yaml
```

**Manual Configuration:**
```bash
helm install speedtest-tracker harish2k01/speedtest-tracker \
  --set database.external.enabled=true \
  --set database.external.type=mysql \
  --set database.external.host='mysql.example.com' \
  --set database.external.port='3306' \
  --set database.external.username='speedtest_user' \
  --set database.external.existingSecret='speedtest-tracker-db-external'
```

---

## Installation Procedures

### Prerequisites

```bash
# Check Kubernetes version
kubectl version

# Verify Helm is installed
helm version

# Add the helm repository (if not already added)
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
```

### 1. Simple SQLite Deployment

```bash
# Create namespace
kubectl create namespace speedtest

# Install with SQLite
helm install speedtest-tracker harish2k01/speedtest-tracker \
  --namespace speedtest \
  --set speedtestTracker.secrets.inline.APP_KEY='base64:a_very_secret_32_character_key' \
  --set speedtestTracker.persistence.enabled=true \
  --set speedtestTracker.persistence.size=5Gi
```

### 2. MySQL with Persistent Storage

```bash
# Create namespace
kubectl create namespace speedtest

# Create values file with MySQL config
cat > /tmp/mysql-values.yaml <<EOF
database:
  mysql:
    enabled: true
    auth:
      existingSecret: speedtest-tracker-db
      passwordKey: db-password

speedtestTracker:
  secrets:
    inline:
      APP_KEY: "base64:a_very_secret_32_character_key"
  persistence:
    enabled: true
    size: 5Gi
    storageClassName: "fast-ssd"

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: speedtest.example.com
      paths:
        - path: /
          pathType: Prefix
EOF

# Install
helm install speedtest-tracker harish2k01/speedtest-tracker \
  --namespace speedtest \
  -f /tmp/mysql-values.yaml
```

### 3. PostgreSQL with External Database

```bash
# Create namespace
kubectl create namespace speedtest

# Create values file
cat > /tmp/postgres-external.yaml <<EOF
database:
  external:
    enabled: true
    type: "pgsql"
    host: "postgres.example.com"
    port: "5432"
    database: "speedtest_tracker"
    username: "speedtest_user"
    existingSecret: speedtest-tracker-db-external
    passwordKey: db-password

speedtestTracker:
  secrets:
    inline:
      APP_KEY: "base64:a_very_secret_32_character_key"
EOF

# Install
helm install speedtest-tracker harish2k01/speedtest-tracker \
  --namespace speedtest \
  -f /tmp/postgres-external.yaml
```

---

## Verification and Debugging

### 1. Check Deployment Status

```bash
# View all resources
kubectl get all -n speedtest

# View pods
kubectl get pods -n speedtest
kubectl describe pod -n speedtest speedtest-tracker-0

# View StatefulSet
kubectl get statefulset -n speedtest
kubectl describe statefulset -n speedtest speedtest-tracker-db

# View PVC
kubectl get pvc -n speedtest
```

### 2. Check Logs

```bash
# Application logs
kubectl logs -n speedtest speedtest-tracker-0

# Database logs
kubectl logs -n speedtest speedtest-tracker-db-0

# Init container logs
kubectl logs -n speedtest speedtest-tracker-0 -c wait-for-db
```

### 3. Verify Database Connection

```bash
# Connect to app pod
kubectl exec -it -n speedtest speedtest-tracker-0 -- bash

# Test database connectivity
mysql -h speedtest-tracker-db -u speedtest_tracker -p -D speedtest_tracker -e "SELECT 1"

# Or for PostgreSQL:
psql -h speedtest-tracker-db -U speedtest_tracker -d speedtest_tracker -c "SELECT 1"
```

### 4. Common Issues and Solutions

**Issue: Init container timeout waiting for database**
```bash
# Check if database pod is running
kubectl get pod -n speedtest speedtest-tracker-db-0

# View database pod logs
kubectl logs -n speedtest speedtest-tracker-db-0

# Solution: Increase init container timeout in values.yaml
# or wait for database to fully initialize before checking deployment
```

**Issue: PVC stuck in Pending**
```bash
# Check storage class
kubectl get storageclass

# Check PVC status
kubectl describe pvc -n speedtest

# Solution: Verify storageClassName in values.yaml matches available classes
helm get values -n speedtest speedtest-tracker | grep storageClass
```

**Issue: Database credentials not working**
```bash
# Verify secret was created
kubectl get secret -n speedtest speedtest-tracker-db -o yaml

# Check environment variables
kubectl exec -n speedtest speedtest-tracker-0 -c speedtest-tracker -- env | grep DB_

# Solution: Ensure password matches in values.yaml and secret
```

---

## Upgrade Procedures

### Upgrade Application

```bash
# Fetch latest chart
helm repo update

# Upgrade
helm upgrade speedtest-tracker harish2k01/speedtest-tracker \
  --namespace speedtest

# View changes
helm get values -n speedtest speedtest-tracker
```

### Database Schema Migrations

The application automatically runs migrations on startup. No additional steps required.

```bash
# Monitor migration progress
kubectl logs -f -n speedtest speedtest-tracker-0
```

### Database Version Upgrade

**For Built-in Databases:**

⚠️ **Important**: Database version upgrades require planning:

1. **Backup data:**
   ```bash
   # Backup MariaDB
   kubectl exec -n speedtest speedtest-tracker-db-0 -- \
     mysqldump -u speedtest_tracker -pPASSWORD speedtest_tracker > backup.sql
   ```

2. **Update chart:**
   ```bash
   # Update database image tag in values.yaml
   sed -i 's/tag: "8"/tag: "5.7"/g' values.yaml
   ```

3. **Redeploy StatefulSet:**
   ```bash
   helm upgrade speedtest-tracker harish2k01/speedtest-tracker \
     --namespace speedtest \
     -f values.yaml
   ```

**For External Databases:**

Coordinate with your database administrator. No chart changes needed.

---

## Backup and Recovery

### Built-in Database Backup

**Automated Backup (Recommended):**
```bash
cat > /tmp/backup-job.yaml <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: speedtest-db-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mysql:8
            command:
            - /bin/sh
            - -c
            - |
              mkdir -p /backup
              mysqldump -h speedtest-tracker-db -u speedtest_tracker -p\${MYSQL_PASSWORD} \
                speedtest_tracker > /backup/speedtest-tracker-\$(date +%Y%m%d-%H%M%S).sql
            env:
            - name: MYSQL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: speedtest-tracker-db
                  key: db-password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-storage
          restartPolicy: OnFailure
EOF

kubectl apply -f /tmp/backup-job.yaml -n speedtest
```

**Manual Backup:**
```bash
# Backup
kubectl exec -n speedtest speedtest-tracker-db-0 -- \
  mysqldump -u speedtest_tracker -pPASSWORD speedtest_tracker | \
  gzip > speedtest-tracker-backup-$(date +%Y%m%d).sql.gz

# Restore
gunzip < speedtest-tracker-backup-20240101.sql.gz | \
  kubectl exec -i -n speedtest speedtest-tracker-db-0 -- \
  mysql -u speedtest_tracker -pPASSWORD speedtest_tracker
```

---

## Performance Tuning

### Database Resource Allocation

```yaml
database:
  mysql:
    enabled: true
    resources:
      requests:
        memory: "512Mi"
        cpu: "500m"
      limits:
        memory: "1Gi"
        cpu: "1000m"
```

### Storage Performance

```yaml
database:
  mysql:
    enabled: true
    persistence:
      storageClassName: "fast-ssd"  # Use high-performance storage
      size: "50Gi"
```

### Application Replication

```yaml
replicaCount: 3  # For load balancing
```

---

## Cleanup

### Delete Deployment

```bash
# Delete Helm release
helm uninstall speedtest-tracker --namespace speedtest

# Keep data (PVCs persist)
kubectl get pvc -n speedtest

# Delete namespace
kubectl delete namespace speedtest
```

### Cleanup with Data Deletion

```bash
# Delete everything including data
helm uninstall speedtest-tracker --namespace speedtest

# Delete PVCs
kubectl delete pvc -n speedtest --all

# Delete namespace
kubectl delete namespace speedtest
```

---

## Additional Resources

- [Helm Chart Repository](https://github.com/harish2k01/helm-charts)
- [Speedtest Tracker Documentation](https://docs.speedtest-tracker.dev)
- [Kubernetes StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
