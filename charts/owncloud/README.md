# ownCloud Helm Chart

This chart deploys [ownCloud Server](https://owncloud.com), a self-hosted file sync, share, and collaboration server, using the official `owncloud/server` container image with optional chart-managed MariaDB and Redis StatefulSets.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install owncloud harish2k01/owncloud
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install owncloud oci://ghcr.io/harish2k01/helm-charts/owncloud --version 0.1.0
```

## Initial Configuration

For a real deployment, set the public hostname and initial admin credentials before the first install:

```yaml
owncloud:
  domain: cloud.example.com
  trustedDomains:
    - cloud.example.com
  admin:
    existingSecret: owncloud-admin
    usernameKey: username
    passwordKey: password
```

The admin credentials are only used when ownCloud initializes a fresh data volume. Changing them later does not rotate the existing admin account.

## Database And Redis

The default values deploy MariaDB 10.11 and Redis 6, matching the upstream Docker Compose deployment pattern.

```yaml
database:
  existingSecret: owncloud-db
  passwordKey: password

mariadb:
  enabled: true

redis:
  enabled: true
  internal: true
```

To use an external MySQL or MariaDB database:

```yaml
mariadb:
  enabled: false

database:
  host: mariadb.database.svc.cluster.local
  name: owncloud
  username: owncloud
  existingSecret: owncloud-db
  passwordKey: password
```

To reuse an external Redis instance:

```yaml
redis:
  enabled: true
  internal: false
  host: redis.database.svc.cluster.local
```

## Web Access

Expose ownCloud with Gateway API:

```yaml
owncloud:
  domain: cloud.example.com
  trustedDomains:
    - cloud.example.com

httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - cloud.example.com
```

Or with Ingress:

```yaml
owncloud:
  domain: cloud.example.com
  trustedDomains:
    - cloud.example.com

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: cloud.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: owncloud-tls
      hosts:
        - cloud.example.com
```

## Persistence

ownCloud stores config, apps, files, and runtime state under `/mnt/data`:

```yaml
persistence:
  data:
    enabled: true
    size: 200Gi
    storageClassName: ""
```

To reuse an existing claim:

```yaml
persistence:
  data:
    existingClaim: owncloud-data
```

## Production Hardening

Use existing Secrets for credentials, set resources, enable network policy if your CNI enforces it, and tune storage sizes for your file workload:

```yaml
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    memory: 2Gi

networkPolicy:
  enabled: true

podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

Use `extraInitContainers`, `sidecars`, `extraEnv`, `extraVolumes`, `extraVolumeMounts`, scheduling controls, and Service load balancer settings for cluster-specific integrations.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of ownCloud replicas |
| `image.repository` | string | `owncloud/server` | Container image repository |
| `image.tag` | string | `10.16.2` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `serviceAccount.create` | bool | `true` | Create a ServiceAccount for ownCloud |
| `serviceAccount.automountServiceAccountToken` | bool | `false` | Mount Kubernetes API token into the ownCloud pod |
| `podSecurityContext` | object | `{}` | Pod-level security context |
| `securityContext` | object | `{}` | Container-level security context |
| `deployment.revisionHistoryLimit` | int | `3` | Number of old ReplicaSets to retain |
| `deployment.strategy` | object | `{type: Recreate}` | Deployment update strategy |
| `owncloud.domain` | string | `localhost:8080` | Domain and optional port ownCloud uses for generated URLs |
| `owncloud.trustedDomains` | list | `[localhost]` | Hostnames and IPs allowed by ownCloud trusted domain checks |
| `owncloud.mysqlUtf8mb4` | bool | `true` | Enable utf8mb4 support for MySQL/MariaDB |
| `owncloud.admin.username` | string | `admin` | Initial admin username when no existing Secret is used |
| `owncloud.admin.password` | string | `CHANGE_ME_OWNCLOUD_ADMIN_PASSWORD` | Initial admin password when no existing Secret is used |
| `owncloud.admin.existingSecret` | string | `""` | Existing Secret containing admin credentials |
| `database.type` | string | `mysql` | ownCloud database type |
| `database.name` | string | `owncloud` | Database name |
| `database.username` | string | `owncloud` | Database username |
| `database.password` | string | `CHANGE_ME_OWNCLOUD_DB_PASSWORD` | Database password when no existing Secret is used |
| `database.host` | string | `""` | External database host; empty uses the chart-managed MariaDB service |
| `database.existingSecret` | string | `""` | Existing Secret containing the database password |
| `env` | object | `{}` | Additional non-secret ownCloud environment variables |
| `envFrom` | list | `[]` | Additional environment sources |
| `extraEnv` | list | `[]` | Additional Kubernetes EnvVar entries |
| `secretEnv.create` | bool | `false` | Create a Kubernetes Secret from `secretEnv.values` |
| `secretEnv.existingSecret.name` | string | `""` | Existing Secret containing sensitive values |
| `mariadb.enabled` | bool | `true` | Deploy a chart-managed MariaDB StatefulSet |
| `mariadb.image.repository` | string | `mariadb` | MariaDB image repository |
| `mariadb.image.tag` | string | `10.11` | MariaDB image tag |
| `mariadb.auth.rootPassword` | string | `""` | Optional MariaDB root password |
| `mariadb.args` | list | upstream defaults | MariaDB container args |
| `mariadb.persistence.enabled` | bool | `true` | Persist MariaDB data |
| `mariadb.persistence.size` | string | `10Gi` | MariaDB PVC size |
| `mariadb.resources` | object | `{}` | MariaDB resource requests and limits |
| `redis.enabled` | bool | `true` | Configure ownCloud to use Redis |
| `redis.internal` | bool | `true` | Deploy a chart-managed Redis StatefulSet |
| `redis.host` | string | `""` | External Redis host when `redis.internal=false` |
| `redis.image.repository` | string | `redis` | Redis image repository |
| `redis.image.tag` | string | `6` | Redis image tag |
| `redis.persistence.enabled` | bool | `true` | Persist Redis data |
| `redis.persistence.size` | string | `1Gi` | Redis PVC size |
| `redis.resources` | object | `{}` | Redis resource requests and limits |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8080` | Kubernetes Service port |
| `service.targetPort` | string | `http` | Service target port |
| `service.loadBalancerIP` | string | `""` | Static LoadBalancer IP |
| `service.loadBalancerSourceRanges` | list | `[]` | Allowed source ranges for LoadBalancer services |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `containerPorts` | list | `[{name: http, containerPort: 8080, protocol: TCP}]` | Container ports |
| `persistence.data.enabled` | bool | `true` | Create or mount the ownCloud data PVC |
| `persistence.data.existingClaim` | string | `""` | Existing PVC for `/mnt/data` |
| `persistence.data.size` | string | `50Gi` | ownCloud data PVC size |
| `persistence.data.storageClassName` | string | `""` | ownCloud data PVC storage class |
| `extraVolumes` | list | `[]` | Additional pod volumes |
| `extraVolumeMounts` | list | `[]` | Additional container volume mounts |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `podDisruptionBudget.enabled` | bool | `false` | Create a PodDisruptionBudget |
| `networkPolicy.enabled` | bool | `false` | Create a NetworkPolicy |
| `resources` | object | `{}` | Container resource requests and limits |
| `topologySpreadConstraints` | list | `[]` | Pod topology spread constraints |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
