# Sonarr Helm Chart

This chart deploys [Sonarr](https://sonarr.tv) using the LinuxServer.io container image, with persistent configuration, optional shared media storage, and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install sonarr harish2k01/sonarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install sonarr oci://ghcr.io/harish2k01/helm-charts/sonarr --version 0.2.0
```

Deploy another Sonarr instance by using a different release name and values file:

```bash
helm install sonarr-anime harish2k01/sonarr -f sonarr-anime-values.yaml
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
    - sonarr.example.com
```

## Persistence

Sonarr configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## Media And Hardlinks

For hardlinks and atomic moves, mount the same existing PVC used by qBittorrent and other media automation apps at the same path:

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  mountPath: /vault
  readOnly: false
```

Configure Sonarr paths inside the application to stay under that shared mount.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Sonarr replicas |
| `image.repository` | string | `lscr.io/linuxserver/sonarr` | Container image repository |
| `image.tag` | string | `4.0.20` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8989` | Kubernetes Service port |
| `service.targetPort` | int | `8989` | Sonarr container port |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/config` |
| `persistence.config.size` | string | `5Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `media.enabled` | bool | `false` | Mount an existing media PVC |
| `media.existingClaim` | string | `""` | Existing media PVC name |
| `media.mountPath` | string | `/vault` | Media PVC mount path |
| `media.readOnly` | bool | `false` | Mount media PVC read-only |
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

## Upgrading from 4.0.17 to 4.0.20

New hostname validation and trusted proxy settings affect reverse proxies. Configure `env.SONARR__SERVER__ALLOWEDHOSTS` with the externally used hostname and service DNS names (no scheme or port), and `env.SONARR__SERVER__TRUSTEDNETWORKS` with only your actual ingress/controller source CIDRs. Empty trusted networks now trust loopback only; forwarded client/protocol headers from ingress are otherwise ignored. No cluster CIDR is assumed. The chart sends `Host: localhost` in HTTP health probes so enabling an allowlist does not reject kubelet's pod-IP Host header.

qBittorrent API/auth compatibility and integration fixes are app-level settings. Configure new download clients, external IDs, search/filter features and indexers in the app; the chart preserves existing `/config`, ports, media mounts and LinuxServer PUID/PGID. Never update the binary using the app's in-container updater.

Example (replace the documentation CIDR and names with your actual proxy and hosts):

```yaml
env:
  SONARR__SERVER__ALLOWEDHOSTS: "sonarr.example.com,sonarr,sonarr.default.svc.cluster.local"
  SONARR__SERVER__TRUSTEDNETWORKS: "192.0.2.0/24"
envFrom:
  - secretRef:
      name: sonarr-database
```

Reviewed upstream release sequence: [v4.0.18.2971](https://github.com/Sonarr/Sonarr/releases/tag/v4.0.18.2971), [v4.0.19.2979](https://github.com/Sonarr/Sonarr/releases/tag/v4.0.19.2979), [v4.0.20.3014](https://github.com/Sonarr/Sonarr/releases/tag/v4.0.20.3014).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-sonarr/).

Configuration/source review: [full comparison](https://github.com/Sonarr/Sonarr/compare/v4.0.17.2952...v4.0.20.3014). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.
