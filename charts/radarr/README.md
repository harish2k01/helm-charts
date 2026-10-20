# Radarr Helm Chart

This chart deploys [Radarr](https://radarr.video) using the LinuxServer.io container image, with persistent configuration, optional shared media storage, and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install radarr harish2k01/radarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install radarr oci://ghcr.io/harish2k01/helm-charts/radarr --version 0.2.0
```

Deploy another Radarr instance by using a different release name and values file:

```bash
helm install radarr4k harish2k01/radarr -f radarr4k-values.yaml
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
    - radarr.example.com
```

## Persistence

Radarr configuration is stored at `/config`:

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

Configure Radarr paths inside the application to stay under that shared mount.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Radarr replicas |
| `image.repository` | string | `lscr.io/linuxserver/radarr` | Container image repository |
| `image.tag` | string | `6.4.4` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `7878` | Kubernetes Service port |
| `service.targetPort` | int | `7878` | Radarr container port |
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

## Upgrading from 6.1.1 to 6.4.4

New hostname validation and trusted proxy settings affect reverse proxies. Configure `env.RADARR__SERVER__ALLOWEDHOSTS` with the externally used hostname and service DNS names (no scheme or port), and `env.RADARR__SERVER__TRUSTEDNETWORKS` with only your actual ingress/controller source CIDRs. Empty trusted networks now trust loopback only; forwarded client/protocol headers from ingress are otherwise ignored. No cluster CIDR is assumed. The chart sends `Host: localhost` in HTTP health probes so enabling an allowlist does not reject kubelet's pod-IP Host header.

PostgreSQL connection strings are newly available through `RADARR__POSTGRES__MAINDBCONNECTIONSTRING` and `RADARR__POSTGRES__LOGDBCONNECTIONSTRING`; put credentials in an existing Secret and reference it with `envFrom`. Existing SQLite/PVC deployments remain unchanged. qBittorrent API/auth compatibility and integration fixes are app-level settings. Configure new download clients, external IDs, search/filter features and indexers in the app; the chart preserves existing `/config`, ports, media mounts and LinuxServer PUID/PGID. Never update the binary using the app's in-container updater.

Example (replace the documentation CIDR and names with your actual proxy and hosts):

```yaml
env:
  RADARR__SERVER__ALLOWEDHOSTS: "radarr.example.com,radarr,radarr.default.svc.cluster.local"
  RADARR__SERVER__TRUSTEDNETWORKS: "192.0.2.0/24"
envFrom:
  - secretRef:
      name: radarr-database
```

Reviewed upstream release sequence: [v6.2.1.10461](https://github.com/Radarr/Radarr/releases/tag/v6.2.1.10461), [v6.3.0.10514](https://github.com/Radarr/Radarr/releases/tag/v6.3.0.10514), [v6.4.4.10685](https://github.com/Radarr/Radarr/releases/tag/v6.4.4.10685).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-radarr/).
