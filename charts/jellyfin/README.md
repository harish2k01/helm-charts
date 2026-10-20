# Jellyfin Helm Chart

This chart deploys [Jellyfin](https://jellyfin.org) using the LinuxServer.io container image, with persistent configuration, optional media library mounts, optional hardware acceleration device mounts, and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install jellyfin harish2k01/jellyfin
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install jellyfin oci://ghcr.io/harish2k01/helm-charts/jellyfin --version 0.2.0
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
    - jellyfin.example.com
```

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: jellyfin.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: jellyfin-tls
      hosts:
        - jellyfin.example.com
```

## Persistence

Jellyfin configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 20Gi
    storageClassName: ""
```

To reuse an existing PVC:

```yaml
persistence:
  config:
    enabled: true
    existingClaim: jellyfin-config
```

## Media Libraries

Mount media from an existing PVC with either a single mount or specific folder mounts. Specific folder mounts are useful when Jellyfin should see friendly library paths while every application still uses the same backing filesystem.

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  readOnly: true
  mounts:
    - mountPath: /movies
      subPath: Movies
    - mountPath: /tv
      subPath: Shows
    - mountPath: /music
      subPath: Music
```

## Hardware Acceleration

For Intel or AMD GPU acceleration, mount `/dev/dri` from nodes that expose it and set any needed supplemental groups through `podSecurityContext`.

```yaml
podSecurityContext:
  supplementalGroups:
    - 44
    - 105

hostDevices:
  enabled: true
  devices:
    - name: dri
      hostPath: /dev/dri
      mountPath: /dev/dri
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Jellyfin replicas |
| `image.repository` | string | `lscr.io/linuxserver/jellyfin` | Container image repository |
| `image.tag` | string | `10.11.11` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8096` | Kubernetes Service port |
| `service.targetPort` | int | `8096` | Jellyfin container HTTP port |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/config` |
| `persistence.config.size` | string | `20Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `media.enabled` | bool | `false` | Mount an existing media PVC |
| `media.existingClaim` | string | `""` | Existing media PVC name |
| `media.mountPath` | string | `/vault` | Default media mount path when `media.mounts` is empty |
| `media.readOnly` | bool | `true` | Default media mount read-only mode |
| `media.mounts` | list | `[]` | Per-folder media mounts using `mountPath`, optional `subPath`, and optional `readOnly` |
| `hostDevices.enabled` | bool | `false` | Mount host devices |
| `hostDevices.devices` | list | `[]` | Host device mounts with `name`, `hostPath`, `mountPath`, and optional `type` |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

### Additional upgrade controls

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `startupProbe` | object | HTTP `/`, up to 15 minutes | Protect initial database migration from liveness restarts; tune for your library. |

## Upgrading from 10.11.8 to 10.11.11

10.11.9–10.11.11 include security fixes, normalized-username database migrations/user-manager locking fixes, stale userdata-cache fixes, and AV1 AMF/QSV/HDR10 encoder corrections. No new required container environment variable, config path, Service port or hardware device mount was introduced. Existing `/config`, published URL, media mounts and GPU devices remain supported. Preserve the complete `/config` PVC backup before upgrade; restore the backup together with the previous image if rolling back a migrated database. The startup probe allows 15 minutes for migration before liveness checks begin. Hardware acceleration/tonemapping features are selected in Jellyfin and still require the correct device mount, permissions and compatible drivers; the chart does not enable hardware settings automatically.

Reviewed upstream release sequence: [v10.11.9](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.9), [v10.11.10](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.10), [v10.11.11](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.11).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-jellyfin/).

Configuration/source review: [full comparison](https://github.com/jellyfin/jellyfin/compare/v10.11.8...v10.11.11). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.
