# Prowlarr Helm Chart

This chart deploys [Prowlarr](https://prowlarr.com) using the LinuxServer.io container image, with persistent configuration and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install prowlarr harish2k01/prowlarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install prowlarr oci://ghcr.io/harish2k01/helm-charts/prowlarr --version 0.2.0
```

## Install With Gateway API HTTPRoute

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - prowlarr.example.com
```

## Persistence

Prowlarr configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## FlareSolverr

If you deploy the `flaresolverr` chart in the same namespace, configure Prowlarr inside the application to use:

```text
http://flaresolverr.<namespace>.svc.cluster.local:8191
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Prowlarr replicas |
| `image.repository` | string | `lscr.io/linuxserver/prowlarr` | Container image repository |
| `image.tag` | string | `2.6.5` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `9696` | Kubernetes Service port |
| `service.targetPort` | int | `9696` | Prowlarr container port |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/config` |
| `persistence.config.size` | string | `5Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

### Additional upgrade controls

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `envFrom` | list | `[]` | Existing Secret or ConfigMap environment sources; explicit `env` takes precedence. |

## Upgrading from 2.3.5 to 2.6.5

New hostname validation and trusted proxy settings affect reverse proxies. Configure `env.PROWLARR__SERVER__ALLOWEDHOSTS` with the externally used hostname and service DNS names (no scheme or port), and `env.PROWLARR__SERVER__TRUSTEDNETWORKS` with only your actual ingress/controller source CIDRs. Empty trusted networks now trust loopback only; forwarded client/protocol headers from ingress are otherwise ignored. No cluster CIDR is assumed. The chart sends `Host: localhost` in HTTP health probes so enabling an allowlist does not reject kubelet's pod-IP Host header.

PostgreSQL connection strings are newly available through `PROWLARR__POSTGRES__MAINDBCONNECTIONSTRING` and `PROWLARR__POSTGRES__LOGDBCONNECTIONSTRING`; put credentials in an existing Secret and reference it with `envFrom`. Existing SQLite/PVC deployments remain unchanged. qBittorrent API/auth compatibility and integration fixes are app-level settings. Configure new download clients, external IDs, search/filter features and indexers in the app; the chart preserves existing `/config`, ports, media mounts and LinuxServer PUID/PGID. Never update the binary using the app's in-container updater.

Example (replace the documentation CIDR and names with your actual proxy and hosts):

```yaml
env:
  PROWLARR__SERVER__ALLOWEDHOSTS: "prowlarr.example.com,prowlarr,prowlarr.default.svc.cluster.local"
  PROWLARR__SERVER__TRUSTEDNETWORKS: "192.0.2.0/24"
envFrom:
  - secretRef:
      name: prowlarr-database
```

Reviewed upstream release sequence: [v2.4.0.5397](https://github.com/Prowlarr/Prowlarr/releases/tag/v2.4.0.5397), [v2.5.2.5491](https://github.com/Prowlarr/Prowlarr/releases/tag/v2.5.2.5491), [v2.6.5.5623](https://github.com/Prowlarr/Prowlarr/releases/tag/v2.6.5.5623).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-prowlarr/).

Configuration/source review: [full comparison](https://github.com/Prowlarr/Prowlarr/compare/v2.3.5.5327...v2.6.5.5623). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.
