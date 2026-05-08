# Speedtest Tracker Helm Chart

This chart deploys [Speedtest Tracker](https://github.com/alexjustesen/speedtest-tracker) on Kubernetes.

## Database Configuration

The chart supports three deployment options for databases:

1. **SQLite (Default)** - Best for single-instance deployments and testing
2. **Built-in Database** - MariaDB, MySQL, or PostgreSQL as a StatefulSet
3. **External Database** - Connect to an existing database outside the cluster

### Option 1: SQLite (Default - No Setup Required)

SQLite is the default and requires no additional configuration:

```bash
kubectl create secret generic speedtest-tracker-secrets \
  --from-literal=APP_KEY='base64:YOUR_GENERATED_KEY'

helm install speedtest-tracker harish2k01/speedtest-tracker \
  --set speedtestTracker.secrets.existingSecret=speedtest-tracker-secrets
```

Data is persisted in `/config` volume. Suitable for:
- Development and testing
- Small single-instance deployments
- Homelab environments

### Option 2: Built-in Database (Managed as StatefulSet)

Deploy with MariaDB, MySQL, or PostgreSQL as a Kubernetes StatefulSet:

#### Using MariaDB

```yaml
database:
  mariadb:
    enabled: true
    image:
      tag: "11"
    auth:
      database: speedtest_tracker
      username: speedtest_tracker
      existingSecret: speedtest-tracker-db
      passwordKey: db-password
    persistence:
      size: 10Gi
      storageClassName: fast-ssd
```

```bash
helm install speedtest-tracker harish2k01/speedtest-tracker -f values.yaml
```

#### Using MySQL

```yaml
database:
  mysql:
    enabled: true
    image:
      tag: "8"
    auth:
      database: speedtest_tracker
      username: speedtest_tracker
      existingSecret: speedtest-tracker-db
      passwordKey: db-password
    persistence:
      size: 10Gi
      storageClassName: fast-ssd
```

#### Using PostgreSQL

```yaml
database:
  postgresql:
    enabled: true
    image:
      tag: "18"
    auth:
      database: speedtest_tracker
      username: speedtest_tracker
      existingSecret: speedtest-tracker-db
      passwordKey: db-password
    persistence:
      size: 10Gi
      storageClassName: fast-ssd
```

**Benefits:**
- Database managed alongside the application
- Automatic database initialization
- Built-in health checks
- Persistent storage via StatefulSet

**Considerations:**
- Requires sufficient storage
- Single replica by default (no automatic replication)
- For production, consider external database for better management

### Option 3: External Database

Use an existing database managed outside the cluster:

```yaml
database:
  external:
    enabled: true
    type: "mysql"  # mariadb, mysql, or pgsql
    host: "mysql.example.com"
    port: "3306"
    database: "speedtest_tracker"
    username: "speedtest_user"
    existingSecret: speedtest-tracker-db-external
    passwordKey: db-password
```

Create the secret beforehand:

```bash
kubectl create secret generic speedtest-tracker-db-external \
  --from-literal=db-password='your_password'
```

**Benefits:**
- Database managed separately from application
- Better for high-availability setups
- Easier backup and recovery
- Recommended for production

**Use Cases:**
- Multi-application environments
- Managed database services (RDS, Cloud SQL, etc.)
- HA/DR requirements

## Database Persistence

### Built-in Database

Built-in databases use StatefulSet with VolumeClaimTemplates for persistent storage:

```yaml
database:
  mariadb:
    enabled: true
    persistence:
      enabled: true
      size: 10Gi
      storageClassName: "fast-ssd"  # Use your storage class
      accessModes:
        - ReadWriteOnce
```

### Application Configuration

Application configuration is persisted separately:

```yaml
speedtestTracker:
  persistence:
    enabled: true
    size: 1Gi
    storageClassName: "standard"
    mountPath: /config
```

## Database Environment Variables

When using built-in databases, the following variables are automatically configured:

| Variable | Auto-Configured | Description |
| --- | --- | --- |
| `DB_CONNECTION` | Yes | Set from the enabled database section |
| `DB_HOST` | Yes | Set to database service name |
| `DB_PORT` | Yes | Set to database service port |
| `DB_DATABASE` | Yes | Set from database config |
| `DB_USERNAME` | Yes | Set from database config |
| `DB_PASSWORD` | Yes | Injected from Secret |

When using external databases, enable `database.external`:

```yaml
database:
  external:
    enabled: true
    type: "mysql"
    host: "mysql.example.com"
    port: "3306"
    database: "speedtest_tracker"
    username: "speedtest_user"
    existingSecret: speedtest-tracker-db-external
    passwordKey: db-password
```

## Multi-Database Setup Example

Deploy with MySQL, persistent storage, and ingress:

```yaml
database:
  mysql:
    enabled: true
    auth:
      database: speedtest_tracker
      username: speedtest_user
      existingSecret: speedtest-tracker-db
      passwordKey: db-password
    persistence:
      size: 20Gi
      storageClassName: ssd

speedtestTracker:
  persistence:
    enabled: true
    size: 5Gi
    storageClassName: standard

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: speedtest.example.com
      paths:
        - path: /
          pathType: Prefix

speedtestTracker:
  secrets:
    existingSecret: speedtest-tracker-secrets
  env:
    DISPLAY_TIMEZONE: "UTC"
    SPEEDTEST_SCHEDULE: "0 */6 * * *"
```



```bash
kubectl create secret generic speedtest-tracker-secrets \
  --from-literal=APP_KEY='base64:YOUR_GENERATED_KEY'

helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install speedtest-tracker harish2k01/speedtest-tracker \
  --set speedtestTracker.secrets.existingSecret=speedtest-tracker-secrets
```

### Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: speedtest.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: speedtest-tracker-tls
      hosts:
        - speedtest.example.com
```

```bash
kubectl create secret generic speedtest-tracker-secrets \
  --from-literal=APP_KEY='base64:YOUR_GENERATED_KEY'

helm install speedtest-tracker harish2k01/speedtest-tracker \
  -f values.yaml \
  --set speedtestTracker.secrets.existingSecret=speedtest-tracker-secrets
```

### Install With Gateway API HTTPRoute

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - speedtest.example.com
```

## Secret Management

### Option 1: Using Existing Kubernetes Secret (Recommended for Production)

Create a secret outside of Helm:

```bash
kubectl create secret generic speedtest-tracker-secrets \
  --from-literal=APP_KEY='base64:YOUR_GENERATED_KEY' \
  --from-literal=ADMIN_PASSWORD='your_admin_password' \
  --from-literal=MAIL_USERNAME='smtp_user' \
  --from-literal=MAIL_PASSWORD='smtp_password'
```

Reference it in your values:

```yaml
speedtestTracker:
  secrets:
    existingSecret: speedtest-tracker-secrets
```

Then install:

```bash
helm install speedtest-tracker harish2k01/speedtest-tracker -f values.yaml
```

### Option 2: Helm-Managed Secrets (For Testing/Development)

Pass secrets directly to Helm:

```bash
helm install speedtest-tracker harish2k01/speedtest-tracker \
  --set speedtestTracker.secrets.inline.APP_KEY='base64:YOUR_GENERATED_KEY' \
  --set speedtestTracker.secrets.inline.ADMIN_PASSWORD='myadminpass'
```

Or use a values file:

```yaml
speedtestTracker:
  secrets:
    existingSecret: ""
    inline:
      APP_KEY: "base64:YOUR_GENERATED_KEY"
      ADMIN_PASSWORD: "myadminpass"
      MAIL_USERNAME: "smtp_user"
      MAIL_PASSWORD: "smtp_password"
```

## Environment Variables

### Application Settings

| Variable | Default | Description | Required |
| --- | --- | --- | --- |
| `APP_NAME` | `Speedtest Tracker` | Application display name | No |
| `TZ` | `Etc/UTC` | Container timezone used by the LinuxServer image | Yes |
| `APP_ENV` | `production` | Environment mode: production, development, testing | No |
| `APP_DEBUG` | `false` | Enable debug mode for detailed error logging | No |
| `APP_URL` | `http://localhost` | Public URL for the application; set this to your ingress/HTTPRoute URL for production | Yes |
| `APP_LOCALE` | `en` | Application locale/language code | No |
| `APP_FALLBACK_LOCALE` | `en` | Fallback locale if primary is unavailable | No |

### Display & UI Settings

| Variable | Default | Description |
| --- | --- | --- |
| `DISPLAY_TIMEZONE` | `Asia/Kolkata` | Timezone for displaying results (e.g., UTC, America/New_York) |
| `DATETIME_FORMAT` | `M. j, Y g:ia` | Format string for datetime display |
| `CHART_DATETIME_FORMAT` | `M. j - G:i` | Format string for chart labels |
| `CHART_BEGIN_AT_ZERO` | `true` | Start charts at zero value |
| `CONTENT_WIDTH` | `7xl` | UI container width (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl) |
| `DEFAULT_CHART_RANGE` | `24h` | Default time range for charts (24h, 7d, 30d, etc) |

### Database Configuration

| Variable | Default | Description | Notes |
| --- | --- | --- | --- |
| `DB_CONNECTION` | `sqlite` | Database driver: sqlite, mariadb, mysql, pgsql | Auto-managed from the enabled database section unless you use manual DB env vars |
| `DB_HOST` | - | Database hostname | Required for MySQL/PostgreSQL |
| `DB_PORT` | - | Database port (3306 for MySQL, 5432 for PostgreSQL) | Required for MySQL/PostgreSQL |
| `DB_DATABASE` | - | Database name | Required for MySQL/PostgreSQL |
| `DB_USERNAME` | - | Database username | Required for MySQL/PostgreSQL |
| `DB_PASSWORD` | - | Database password | **Secret** - Use secrets for sensitive data |
| `DB_URL` | - | Full database URL (alternative to separate DB_* vars) | e.g., `mysql://user:pass@host:3306/dbname` |
| `DB_SOCKET` | - | Unix socket path for local connections | Optional |

### Speedtest Scheduling & Configuration

| Variable | Default | Description | Examples |
| --- | --- | --- | --- |
| `SPEEDTEST_SCHEDULE` | `0 */3 * * *` | Cron expression for automated speedtest runs | `0 0 * * *` = daily, `0 */6 * * *` = every 6 hours |
| `SPEEDTEST_SERVERS` | - | Comma-separated Ookla server IDs to use (leave empty for auto-selection) | `1234,5678,9012` |
| `SPEEDTEST_BLOCKED_SERVERS` | - | Comma-separated Ookla server IDs to exclude | `1234,5678` |
| `SPEEDTEST_INTERFACE` | - | Network interface to use for speedtests | e.g., `eth0`, `wlan0` |
| `SPEEDTEST_EXTERNAL_IP_URL` | `https://icanhazip.com` | URL to check external IP for connectivity verification | Alternative: https://api.ipify.org |
| `SPEEDTEST_SKIP_IPS` | - | Comma-separated IPs to skip during speedtest | `192.168.1.1,10.0.0.1` |

### Dashboard & Public Access

| Variable | Default | Description |
| --- | --- | --- |
| `PUBLIC_DASHBOARD` | `false` | Allow unauthenticated access to dashboard (true/false) |

### Data Retention

| Variable | Default | Description | Notes |
| --- | --- | --- | --- |
| `PRUNE_RESULTS_OLDER_THAN` | `90` | Days to retain speedtest results (0 = keep all results) | Results older than this are automatically deleted |

### Threshold Monitoring (Optional)

Enable notifications when speeds fall below thresholds:

| Variable | Default | Description |
| --- | --- | --- |
| `THRESHOLD_ENABLED` | `false` | Enable threshold-based alerts |
| `THRESHOLD_DOWNLOAD` | `0` | Minimum download speed in Mbps (0 = disabled) |
| `THRESHOLD_UPLOAD` | `0` | Minimum upload speed in Mbps (0 = disabled) |
| `THRESHOLD_PING` | `0` | Maximum ping latency in ms (0 = disabled) |

### Admin User (Initial Setup Only)

These are used only on first installation to create the initial admin account:

| Variable | Default | Description |
| --- | --- | --- |
| `ADMIN_NAME` | `Admin` | Admin user display name |
| `ADMIN_EMAIL` | `admin@example.com` | Admin user email address |
| `ADMIN_PASSWORD` | - | Admin user password | **Secret** - Use secrets for sensitive data |

### API Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `API_RATE_LIMIT` | `60` | API request rate limit (requests per minute) |

### IP Filtering (Optional)

| Variable | Default | Description |
| --- | --- | --- |
| `ALLOWED_IPS` | - | Comma-separated list of allowed IP addresses/CIDR ranges | e.g., `192.168.1.0/24,10.0.0.5` |

### Mail/Notification Configuration (Optional)

| Variable | Default | Description | Sensitive |
| --- | --- | --- | --- |
| `MAIL_MAILER` | `log` | Mail driver: log, smtp, mailgun, sendmail, etc | No |
| `MAIL_HOST` | - | SMTP server hostname | No |
| `MAIL_PORT` | `587` | SMTP server port | No |
| `MAIL_SCHEME` | - | Optional mail scheme: smtp or smtps | No |
| `MAIL_FROM_ADDRESS` | `speedtest-tracker@example.com` | From address for outgoing emails | No |
| `MAIL_FROM_NAME` | `Speedtest Tracker` | From name for outgoing emails | No |
| `MAIL_USERNAME` | - | SMTP username | Yes - use secrets |
| `MAIL_PASSWORD` | - | SMTP password | Yes - use secrets |

## Advanced Configuration

### Using an External MySQL/PostgreSQL Database

```yaml
database:
  external:
    enabled: true
    type: "mysql"
    host: "mysql.default.svc.cluster.local"
    port: "3306"
    database: "speedtest_tracker"
    username: "speedtest"
    existingSecret: speedtest-tracker-db-external
    passwordKey: db-password
```

### Using with Custom Cron Schedule

Schedule speedtests at specific times:

```yaml
speedtestTracker:
  env:
    # Run speedtests at 6 AM and 6 PM daily
    SPEEDTEST_SCHEDULE: "0 6,18 * * *"
    # Or every hour
    SPEEDTEST_SCHEDULE: "0 * * * *"
    # Or only on weekdays at 9 AM
    SPEEDTEST_SCHEDULE: "0 9 * * 1-5"
```

### Using with Specific Speedtest Servers

```yaml
speedtestTracker:
  env:
    # Use only these specific Ookla server IDs
    SPEEDTEST_SERVERS: "1234,5678,9012"
    # Or block specific servers
    SPEEDTEST_BLOCKED_SERVERS: "1234,5678"
```

### Enable Threshold Alerts

```yaml
speedtestTracker:
  env:
    THRESHOLD_ENABLED: "true"
    THRESHOLD_DOWNLOAD: "100"  # Alert if download < 100 Mbps
    THRESHOLD_UPLOAD: "20"     # Alert if upload < 20 Mbps
    THRESHOLD_PING: "50"       # Alert if ping > 50 ms
```

## Helm Values Reference

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Speedtest Tracker replicas |
| `image.repository` | string | `lscr.io/linuxserver/speedtest-tracker` | Container image repository |
| `image.tag` | string | `latest` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container image pull policy |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `80` | Kubernetes Service port |
| `service.targetPort` | int | `80` | Speedtest Tracker container port |
| `database.mariadb.enabled` | bool | `false` | Deploy built-in MariaDB |
| `database.mysql.enabled` | bool | `false` | Deploy built-in MySQL |
| `database.postgresql.enabled` | bool | `false` | Deploy built-in PostgreSQL |
| `database.external.enabled` | bool | `false` | Use an external database |
| `database.external.type` | string | `mysql` | External database driver: `mariadb`, `mysql`, or `pgsql` |
| `ingress.enabled` | bool | `false` | Create Kubernetes Ingress |
| `ingress.className` | string | - | Ingress class (nginx, traefik, etc) |
| `httpRoute.enabled` | bool | `false` | Create Gateway API HTTPRoute |
| `speedtestTracker.persistence.enabled` | bool | `true` | Enable persistent storage for `/config` |
| `speedtestTracker.persistence.size` | string | `1Gi` | PersistentVolumeClaim size |
| `speedtestTracker.persistence.storageClassName` | string | - | Storage class for PVC |
| `speedtestTracker.persistence.existingClaim` | string | - | Use existing PVC instead of creating new |
| `speedtestTracker.secrets.existingSecret` | string | - | Name of existing Secret for credentials |
| `speedtestTracker.secrets.inline.APP_KEY` | string | - | Application encryption key with the `base64:` prefix |
| `speedtestTracker.secrets.inline.ADMIN_PASSWORD` | string | - | Initial admin password |
| `speedtestTracker.secrets.inline.MAIL_USERNAME` | string | - | SMTP username |
| `speedtestTracker.secrets.inline.MAIL_PASSWORD` | string | - | SMTP password |
| `speedtestTracker.resources` | object | `{}` | Speedtest Tracker container resource requests/limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity rules |

## Values File Examples

### Minimal Setup (SQLite with Auto-Scheduling)

```yaml
speedtestTracker:
  secrets:
    inline:
      APP_KEY: "base64:your_generated_key"
  env:
    SPEEDTEST_SCHEDULE: "0 0 * * *"  # Daily at midnight
```

### Production Setup (MySQL with Ingress)

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: speedtest.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: speedtest-tracker-tls
      hosts:
        - speedtest.example.com

speedtestTracker:
  secrets:
    existingSecret: speedtest-tracker-secrets  # Pre-created Secret
  env:
    SPEEDTEST_SCHEDULE: "0 */3 * * *"  # Every 3 hours
    THRESHOLD_ENABLED: "true"
    THRESHOLD_DOWNLOAD: "100"
    THRESHOLD_UPLOAD: "20"
    THRESHOLD_PING: "50"

database:
  mysql:
    enabled: true
    auth:
      database: speedtest_tracker
      username: speedtest
      existingSecret: speedtest-tracker-db
      passwordKey: db-password

speedtestTracker:
  persistence:
    size: 5Gi
    storageClassName: fast-ssd
```

### Homelab Setup (SQLite with Gateway API)

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: my-gateway
      namespace: gateway-system
  hostnames:
    - speedtest.home.local

speedtestTracker:
  secrets:
    inline:
      APP_KEY: "base64:your_generated_key"
  env:
    DISPLAY_TIMEZONE: "America/Chicago"
    SPEEDTEST_SCHEDULE: "0 */6 * * *"  # Every 6 hours
    PRUNE_RESULTS_OLDER_THAN: "180"  # Keep 6 months
```

## Notes

### APP_KEY Generation

Generate a valid APP_KEY with:

```bash
# Using Laravel (if you have the source)
php artisan key:generate

# Or generate a key with OpenSSL
echo -n 'base64:'; openssl rand -base64 32
```

### Database Connections

- **SQLite** (default): Perfect for small deployments, requires persistent storage
- **MySQL**: For multi-instance deployments, external database recommended
- **PostgreSQL**: Production-grade alternative to MySQL

### Cron Expression Syntax

Speedtest schedules use standard cron syntax: `minute hour day month weekday`

Common patterns:
- `0 0 * * *` - Daily at midnight UTC
- `0 */6 * * *` - Every 6 hours
- `0 3 * * 0` - Weekly on Sunday at 3 AM
- `0 9,17 * * 1-5` - Weekdays at 9 AM and 5 PM
