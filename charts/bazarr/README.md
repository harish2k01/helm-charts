# Bazarr Helm Chart

This chart deploys [Bazarr](https://www.bazarr.media) using the LinuxServer.io container image, with persistent configuration, optional shared media storage, and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install bazarr harish2k01/bazarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install bazarr oci://ghcr.io/harish2k01/helm-charts/bazarr --version 0.2.0
```

Deploy another Bazarr instance by using a different release name and values file:

```bash
helm install bazarr4k harish2k01/bazarr -f bazarr4k-values.yaml
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
    - bazarr.example.com
```

## Persistence

Bazarr configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## Media And Hardlinks

Mount the same existing media PVC used by qBittorrent, Radarr, and Sonarr so Bazarr sees the same library paths:

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  mountPath: /vault
  readOnly: false
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Bazarr replicas |
| `image.repository` | string | `lscr.io/linuxserver/bazarr` | Container image repository |
| `image.tag` | string | `1.6.2` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `6767` | Kubernetes Service port |
| `service.targetPort` | int | `6767` | Bazarr container port |
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
| `startupProbe` | object | HTTP `/`, up to 15 minutes | Protect initial database migration from liveness restarts; tune for your library. |

## Upgrading from 1.5.6 to 1.6.2

1.6 adds subtitle-table/database migrations and WAL handling, removes custom scoring sections and the obsolete Podnapisi provider, migrates a single Gemini key to the new multi-key list, and adds Jellyfin library refresh, Whisper fallback, language equivalence, subtitle quality checks and provider integrations. Configure these through the app UI or its persisted configuration; no extra Kubernetes Service or port is required. Back up the whole `/config` PVC before upgrade and review custom score workflows because their settings are removed upstream.

The new `BAZARR_CONFIG_BASE_FILE_PATH` environment variable selects the directory containing `config.yaml`/`config.ini` (not a file). It can be set via `env`; leave it unset to retain `/config/config`, or mount an alternative writable persistent directory with `extraVolumes`/`extraVolumeMounts`. The startup probe gives migrations up to 15 minutes. Provider API keys and postprocessing commands stay application-owned. Existing writable media mounts must remain available for subtitle changes.

Reviewed upstream release sequence: [v1.6.0](https://github.com/morpheus65535/bazarr/releases/tag/v1.6.0), [v1.6.1](https://github.com/morpheus65535/bazarr/releases/tag/v1.6.1), [v1.6.2](https://github.com/morpheus65535/bazarr/releases/tag/v1.6.2).

Container contract: [LinuxServer documentation](https://docs.linuxserver.io/images/docker-bazarr/).

Configuration/source review: [full comparison](https://github.com/morpheus65535/bazarr/compare/v1.5.6...v1.6.2). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.
