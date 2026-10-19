# Profilarr Helm Chart

Deploys [Profilarr](https://github.com/Dictionarry-Hub/profilarr) for managing Radarr and Sonarr quality profiles, custom formats, naming, and media settings. An optional parser sidecar enables custom-format tests and release-ranking simulations in the UI.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install profilarr harish2k01/profilarr --version 0.1.0
```

## Install From OCI

```bash
helm install profilarr oci://ghcr.io/harish2k01/helm-charts/profilarr --version 0.1.0
```

## Gateway API HTTPRoute

Set `ORIGIN` to the URL used by the browser so the application handles reverse-proxy requests correctly. Authentication is enabled by default; complete the initial account setup in the UI.

```yaml
env:
  ORIGIN: https://profilarr.example.com
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - profilarr.example.com
```

Ingress is also supported:

```yaml
env:
  ORIGIN: https://profilarr.example.com
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: profilarr.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: profilarr-tls
      hosts: [profilarr.example.com]
```

Enable one routing mechanism at a time. Neither mechanism is enabled by default. The Service exposes only Profilarr's HTTP port, not the parser port.

## Persistence and Security

The chart runs one replica with a `Recreate` update strategy because SQLite state and cloned configuration repositories share `/config`. A 2 GiB PVC is created by default. Use `persistence.config.existingClaim` to mount an existing claim instead. Disabling persistence mounts an ephemeral `emptyDir`; configuration is then lost when the pod is replaced.

The upstream image supports direct non-root execution. The chart uses UID/GID 1000 and `fsGroup: 1000` for volume access, drops capabilities, and disables Kubernetes API token mounting. Adjust the security contexts to suit your storage permissions. The application needs outbound access to profile Git repositories and the Arr APIs; it does not need a media-volume mount or Kubernetes RBAC.

Back up `/config` independently, including the application database and cloned configuration repositories. Local application backups on the same PVC do not protect against losing that PVC.

## Parser

The parser sidecar defaults to the same pinned release as Profilarr. The app connects over `127.0.0.1:5000`; the chart generates `PARSER_HOST` and `PARSER_PORT` when the sidecar is enabled. Keep app and parser versions compatible when overriding images.

For synchronization without release testing:

```yaml
parser:
  enabled: false
```

To use a separately managed parser, disable the sidecar and set `env.PARSER_HOST` and `env.PARSER_PORT` to its host and port. Parser health checks use `/health`; application readiness uses the public `/api/v1/health` endpoint. Application startup and liveness use the HTTP listener to avoid restart loops caused by repository health failures.

## App Connections and Profile Databases

Configure Radarr/Sonarr URLs and API keys through Profilarr's UI after installation. The chart does not create app connections, import profile databases, or schedule synchronization automatically. For same-namespace services, connection URLs can use service DNS names, such as `http://radarr:7878` and `http://sonarr:8989`.

Profilarr can link curated profile configuration databases, including the [TRaSH PCD](https://github.com/Dictionarry-Hub/trash-pcd). Back up the Arr applications and review profile differences before synchronizing existing profiles; synchronization can change release selection and upgrade behavior.

Use existing Kubernetes Secrets for optional runtime secrets rather than placing values in plain-text Helm files:

```yaml
envFrom:
  - secretRef:
      name: profilarr-auth
```

For OIDC on the pinned 2.2.0 release, supply the upstream OIDC environment variables, set `AUTH` appropriately, and configure `ORIGIN` and the identity provider's callback URL. Do not disable authentication merely because the app is behind a reverse proxy.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Single writer; other replica counts are rejected |
| `image.repository` | string | `ghcr.io/dictionarry-hub/profilarr` | App image |
| `image.tag` | string | `2.2.0` | Pinned app version |
| `image.pullPolicy` | string | `IfNotPresent` | Image pull policy |
| `imagePullSecrets` | list | `[]` | Registry credentials |
| `nameOverride` / `fullnameOverride` | string | `""` | Resource naming overrides |
| `podAnnotations` / `podLabels` | object | `{}` | Additional pod metadata |
| `podSecurityContext` | object | See values.yaml | Non-root user/group and PVC access |
| `securityContext` | object | See values.yaml | Container privilege restrictions |
| `env` | object | See values.yaml | Non-secret variables; quote scalar values |
| `env.AUTH` | string | `on` | Authentication enabled by default |
| `env.TZ` | string | `Etc/UTC` | Application timezone |
| `envFrom` | list | `[]` | Existing Secret/ConfigMap environment sources |
| `service.type` | string | `ClusterIP` | Service exposure type |
| `service.port` | int | `6868` | Service HTTP port |
| `service.targetPort` | int | `6868` | App listener; also sets `PORT` |
| `service.extraPorts` | list | `[]` | Additional explicitly configured Service ports |
| `persistence.config.enabled` | bool | `true` | Use a config PVC instead of emptyDir |
| `persistence.config.mountPath` | string | `/config` | Required upstream data path |
| `persistence.config.existingClaim` | string | `""` | Mount an existing PVC |
| `persistence.config.accessModes` | list | `[ReadWriteOnce]` | Config volume access modes |
| `persistence.config.size` | string | `2Gi` | Requested config storage |
| `persistence.config.storageClassName` | string | `""` | Cluster default StorageClass |
| `parser.enabled` | bool | `true` | Include release testing/simulation backend |
| `parser.image.repository` | string | `ghcr.io/dictionarry-hub/profilarr-parser` | Parser image |
| `parser.image.tag` | string | `2.2.0` | Pinned parser version |
| `parser.port` | int | `5000` | Parser listener; must differ from app listener |
| `parser.resources` | object | `{}` | Parser resource requests/limits |
| `parser.securityContext` | object | See values.yaml | Parser privilege restrictions |
| `parser.startupProbe` / `parser.livenessProbe` / `parser.readinessProbe` | object | See values.yaml | Parser health probes |
| `extraVolumes` / `extraVolumeMounts` | list | `[]` | Additional application mounts |
| `ingress.enabled` | bool | `false` | Publish using Ingress |
| `httpRoute.enabled` | bool | `false` | Publish using Gateway API |
| `httpRoute.parentRefs` | list | `[]` | Required Gateway references when enabled |
| `httpRoute.hostnames` | list | `[]` | Route hostnames |
| `httpRoute.rules` | list | Root path prefix | HTTP matches and optional filters |
| `resources` | object | `{}` | App resource requests/limits |
| `startupProbe` / `livenessProbe` / `readinessProbe` | object | See values.yaml | App health probes |
| `nodeSelector` / `affinity` | object | `{}` | Scheduling constraints |
| `tolerations` | list | `[]` | Scheduling tolerations |
