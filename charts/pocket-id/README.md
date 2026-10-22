# Pocket ID Helm Chart

This chart deploys [Pocket ID](https://pocket-id.org), a simple passkey-based OIDC provider, using the official `ghcr.io/pocket-id/pocket-id` container image.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install pocket-id harish2k01/pocket-id
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install pocket-id oci://ghcr.io/harish2k01/helm-charts/pocket-id --version 0.3.0
```

## Required Configuration

Pocket ID needs a stable public `APP_URL` and an encryption key. For passkey flows, the public URL should be HTTPS.

```yaml
env:
  APP_URL: https://id.example.com
  TRUST_PROXY: "true"

secretEnv:
  existingSecret:
    name: pocket-id-secret
    keys:
      - envName: ENCRYPTION_KEY
        secretKey: encryption-key
```

For a simple test install, the chart can create the Secret:

```yaml
secretEnv:
  create: true
  values:
    ENCRYPTION_KEY: "replace-with-openssl-rand-base64-32"
```

## Web UI Access

Expose Pocket ID with Gateway API:

```yaml
env:
  APP_URL: https://id.example.com
  TRUST_PROXY: "true"

httpRoutes:
  main:
    enabled: true
    parentRefs:
      - name: gateway
        namespace: gateway-system
        sectionName: https
    hostnames:
      - id.example.com
```

Or with Ingress:

```yaml
env:
  APP_URL: https://id.example.com
  TRUST_PROXY: "true"

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: id.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: pocket-id-tls
      hosts:
        - id.example.com
```

Create the first admin account at `https://id.example.com/setup`.

## Persistence

Pocket ID stores application data under `/app/data` by default:

```yaml
persistence:
  data:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

To reuse an existing claim:

```yaml
persistence:
  data:
    existingClaim: pocket-id-data
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Pocket ID replicas |
| `image.repository` | string | `ghcr.io/pocket-id/pocket-id` | Container image repository |
| `image.tag` | string | `v2.18.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.APP_URL` | string | `http://localhost:1411` | Public URL where users access Pocket ID |
| `env.TRUST_PROXY` | string | `false` | Trust reverse proxy forwarding headers |
| `env.PUID` | string | `1000` | Container user ID for mounted files |
| `env.PGID` | string | `1000` | Container group ID for mounted files |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `env.ANALYTICS_DISABLED` | string | `false` | Disable analytics heartbeat |
| `env.VERSION_CHECK_DISABLED` | string | `false` | Disable automatic version checks |
| `envFrom` | list | `[]` | Additional environment sources |
| `secretEnv.create` | bool | `false` | Create a Kubernetes Secret from `secretEnv.values` |
| `secretEnv.name` | string | `""` | Override generated Secret name |
| `secretEnv.values.ENCRYPTION_KEY` | string | `""` | Encryption key for Pocket ID |
| `secretEnv.existingSecret.name` | string | `""` | Existing Secret containing sensitive values |
| `secretEnv.existingSecret.keys` | list | `[]` | Existing Secret key mappings |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `1411` | Kubernetes Web UI/OIDC Service port |
| `service.targetPort` | string | `http` | Service target port |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `containerPorts` | list | `[{name: http, containerPort: 1411, protocol: TCP}]` | Container ports |
| `persistence.data.enabled` | bool | `true` | Create or mount an app data PVC |
| `persistence.data.existingClaim` | string | `""` | Existing PVC for `/app/data` |
| `persistence.data.size` | string | `5Gi` | App data PVC size |
| `persistence.data.storageClassName` | string | `""` | App data PVC storage class |
| `extraVolumes` | list | `[]` | Additional pod volumes |
| `extraVolumeMounts` | list | `[]` | Additional container volume mounts |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoutes.main.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

## Optional process and application configuration

`values.yaml` lists commented process/runtime settings and UI-backed application settings from the exact target source. Keep UI-backed examples commented to preserve settings stored in the database. Use `env` for non-secret settings, `envFrom` for existing Secret/ConfigMap sources, and `secretEnv.existingSecret.keys` for individual Secret key mappings. TLS file paths and projected JWT files use `extraVolumes` and `extraVolumeMounts`. The public Service exposes only the OIDC/web listener; configure the embedded actor or experimental external runtime separately. See [CHANGELOG.md](CHANGELOG.md) for compatibility and migration details.

## Multiple HTTPRoutes

Use `httpRoutes` to define one or more routes, each with its own Gateway
references, hostnames, annotations, and rules. The default `main` entry is disabled.

```yaml
httpRoutes:
  internal:
    parentRefs:
      - name: internal-gateway
        namespace: ingress
        sectionName: https
    hostnames: [app.internal.example.com]
  external:
    parentRefs:
      - name: external-gateway
        namespace: ingress
        sectionName: https
    hostnames: [app.example.com]
```

Each map key is a lowercase DNS label of up to 40 characters and becomes the
resource-name suffix (`<app-fullname>-internal`, for example). Long base names are
shortened to keep the suffix and stay within 63 characters; collisions fail rendering.

| Key | Default | Description |
|---|---|---|
| `httpRoutes` | Disabled `main` entry | Named HTTPRoutes; defaults create no routes. |
| `httpRoutes.<name>.enabled` | `true` | Set false to omit an entry, including its attachments. |
| `httpRoutes.<name>.parentRefs` | Required when enabled | Gateway references, with optional namespace and listener section. |
| `httpRoutes.<name>.hostnames` | Required when enabled | Independent explicit hostname list. |
| `httpRoutes.<name>.annotations` | `{}` | Per-route annotations. |
| `httpRoutes.<name>.rules` | Path prefix `/` | Gateway API matches and filters. Backend references are always supplied by the chart using its application Service and HTTP port. |

Each route has independent hostnames, attachments, annotations, and rules.
Chart-specific backend behavior is retained; Ghost also includes its ActivityPub
endpoints when enabled. Gateway API CRDs and a compatible controller
are required; the referenced Gateway must allow attachment from this namespace.

### Migration from the single-route option

`httpRoute` has been removed. Move its settings under `httpRoutes.main` and remove
the old key entirely, including `httpRoute.enabled: false`. Old values fail
rendering with a migration message instead of silently dropping traffic. The old
resource `<app-fullname>` is replaced by `<app-fullname>-main`; coordinate the
upgrade with your GitOps pruning policy to avoid overlapping or missing routes.
Multiple hostnames and parent references apply to the whole route; use separate
entries when each hostname group must attach to a different Gateway.
