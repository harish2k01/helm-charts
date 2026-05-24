# Ghost Helm Chart

This chart deploys [Ghost](https://ghost.org), a publishing platform for blogs, newsletters, memberships, and content sites, using the official `ghost` container image.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install ghost harish2k01/ghost
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install ghost oci://ghcr.io/harish2k01/helm-charts/ghost --version 0.1.2
```

## Database Configuration

The default values deploy a MySQL 8 StatefulSet and configure Ghost to use it. For production, replace the inline database password with an existing Kubernetes Secret.

```yaml
env:
  url: https://blog.example.com

mysql:
  auth:
    existingSecret: ghost-db
    passwordKey: password
```

To use an external MySQL 8 database instead, disable the internal StatefulSet and provide Ghost database settings yourself:

```yaml
mysql:
  enabled: false

env:
  url: https://blog.example.com
  NODE_ENV: production
  database__client: mysql
  database__connection__host: mysql.example.svc.cluster.local
  database__connection__user: ghost
  database__connection__database: ghost

secretEnv:
  existingSecret:
    name: ghost-db
    keys:
      - envName: database__connection__password
        secretKey: password
```

## Production Hardening

The chart includes production-oriented controls similar to larger application charts:

```yaml
serviceAccount:
  automountServiceAccountToken: false

podSecurityContext:
  fsGroup: 1000
  fsGroupChangePolicy: OnRootMismatch

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  seccompProfile:
    type: RuntimeDefault

resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    memory: 1Gi

networkPolicy:
  enabled: true

podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

Use `extraInitContainers`, `sidecars`, `extraEnv`, `extraVolumes`, `extraVolumeMounts`, scheduling controls, and Service load balancer settings for cluster-specific integrations.

## Web Access

Expose Ghost with Gateway API:

```yaml
env:
  url: https://blog.example.com

httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - blog.example.com
```

Or with Ingress:

```yaml
env:
  url: https://blog.example.com

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: blog.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ghost-tls
      hosts:
        - blog.example.com
```

Ghost Admin is available at `https://blog.example.com/ghost`.

## Persistence

Ghost stores uploaded media, themes, adapters, and logs under `/var/lib/ghost/content`:

```yaml
persistence:
  content:
    enabled: true
    size: 10Gi
    storageClassName: ""
```

To reuse an existing claim:

```yaml
persistence:
  content:
    existingClaim: ghost-content
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Ghost replicas |
| `image.repository` | string | `ghost` | Container image repository |
| `image.tag` | string | `6.39.0-alpine` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `serviceAccount.create` | bool | `true` | Create a ServiceAccount for Ghost |
| `serviceAccount.automountServiceAccountToken` | bool | `false` | Mount Kubernetes API token into the Ghost pod |
| `podSecurityContext` | object | `{fsGroup: 1000, fsGroupChangePolicy: OnRootMismatch}` | Pod-level security context |
| `securityContext` | object | hardened defaults | Container-level security context |
| `deployment.revisionHistoryLimit` | int | `3` | Number of old ReplicaSets to retain |
| `deployment.strategy` | object | `{type: Recreate}` | Deployment update strategy |
| `env.url` | string | `http://localhost:2368` | Public URL where users access Ghost |
| `env.NODE_ENV` | string | `production` | Ghost runtime environment |
| `envFrom` | list | `[]` | Additional environment sources |
| `extraEnv` | list | `[]` | Additional Kubernetes EnvVar entries |
| `secretEnv.create` | bool | `false` | Create a Kubernetes Secret from `secretEnv.values` |
| `secretEnv.name` | string | `""` | Override generated Secret name |
| `secretEnv.existingSecret.name` | string | `""` | Existing Secret containing sensitive values |
| `secretEnv.existingSecret.keys` | list | `[]` | Existing Secret key mappings |
| `extraInitContainers` | list | `[]` | Extra init containers appended to the pod |
| `sidecars` | list | `[]` | Extra sidecar containers appended to the pod |
| `mysql.enabled` | bool | `true` | Deploy a chart-managed MySQL StatefulSet |
| `mysql.image.repository` | string | `mysql` | MySQL image repository |
| `mysql.image.tag` | string | `8` | MySQL image tag |
| `mysql.auth.database` | string | `ghost` | MySQL database name |
| `mysql.auth.username` | string | `ghost` | MySQL username |
| `mysql.auth.password` | string | `CHANGE_ME_GHOST_DB_PASSWORD` | MySQL password used when `existingSecret` is empty |
| `mysql.auth.existingSecret` | string | `""` | Existing Secret containing MySQL credentials |
| `mysql.auth.passwordKey` | string | `db-password` | Secret key containing the Ghost DB password |
| `mysql.persistence.enabled` | bool | `true` | Persist MySQL data |
| `mysql.persistence.existingClaim` | string | `""` | Existing PVC for MySQL data |
| `mysql.persistence.size` | string | `10Gi` | MySQL PVC size |
| `mysql.resources` | object | `{}` | MySQL resource requests and limits |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `2368` | Kubernetes Service port |
| `service.targetPort` | string | `http` | Service target port |
| `service.loadBalancerIP` | string | `""` | Static LoadBalancer IP |
| `service.loadBalancerSourceRanges` | list | `[]` | Allowed source ranges for LoadBalancer services |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `containerPorts` | list | `[{name: http, containerPort: 2368, protocol: TCP}]` | Container ports |
| `persistence.content.enabled` | bool | `true` | Create or mount a content PVC |
| `persistence.content.existingClaim` | string | `""` | Existing PVC for `/var/lib/ghost/content` |
| `persistence.content.size` | string | `10Gi` | Content PVC size |
| `persistence.content.storageClassName` | string | `""` | Content PVC storage class |
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
