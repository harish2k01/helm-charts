# Navidrome Helm Chart

This chart deploys [Navidrome](https://www.navidrome.org) using the official container image, with separate persistent volumes for application data/configuration and the music library.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install navidrome harish2k01/navidrome
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install navidrome oci://ghcr.io/harish2k01/helm-charts/navidrome --version 0.2.0
```

## Web UI Access

Expose the Web UI with Gateway API:

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - navidrome.example.com
```

Or with Ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: navidrome.example.com
      paths:
        - path: /
          pathType: Prefix
```

## Persistence

Navidrome application data is stored at `/data`, while music is mounted separately at `/music`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
  music:
    enabled: true
    size: 100Gi
    storageClassName: ""
    readOnly: true
```

To reuse existing claims instead of creating new ones:

```yaml
persistence:
  config:
    existingClaim: navidrome-config
  music:
    existingClaim: music-library
    readOnly: true
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Navidrome replicas |
| `image.repository` | string | `deluan/navidrome` | Container image repository |
| `image.tag` | string | `0.64.2` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `env.ND_SCANNER_SCHEDULE` | string | `1h` | Music library scan schedule |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `4533` | Kubernetes Web UI Service port |
| `service.targetPort` | int | `4533` | Container Web UI port |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `extraContainerPorts` | list | `[]` | Additional container ports |
| `persistence.config.enabled` | bool | `true` | Create or mount an app data/config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/data` |
| `persistence.config.size` | string | `5Gi` | App data/config PVC size |
| `persistence.config.storageClassName` | string | `""` | App data/config PVC storage class |
| `persistence.music.enabled` | bool | `true` | Create or mount a music library PVC |
| `persistence.music.existingClaim` | string | `""` | Existing PVC for `/music` |
| `persistence.music.size` | string | `100Gi` | Music library PVC size |
| `persistence.music.storageClassName` | string | `""` | Music library PVC storage class |
| `persistence.music.readOnly` | bool | `true` | Mount the music library read-only |
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

## Upgrading from 0.61.2 to 0.64.2

**Back up the complete `/data` volume before upgrading.** 0.64 re-encodes all internal IDs and migrates every table; cached/offline clients may need a full resync. Rollback requires restoring the matching database backup. The startup probe permits 15 minutes for migration; increase it for large libraries or slow storage. 0.64.2 fixes scanner lock contention and 32-bit invalid-number migrations; 0.64.0/0.64.1 also contain authentication/SSRF/ownership/security fixes.

The chart corrects the scan setting to `ND_SCANNER_SCHEDULE` (default `1h`) and explicitly keeps `ND_ENABLESHARING: "false"`, preserving the previous upstream default after 0.63 made sharing default-on. Set it to `"true"` to opt in. Remove old `ND_SCANSCHEDULE` overrides and use the new key. Existing user choices in config files should be reviewed because explicit environment values override the config.

All new options are available through `env` (string values); no chart template additions are required for app settings:

| Release | Environment settings | Behavior |
| --- | --- | --- |
| 0.62 | `ND_ENFORCENONROOTUSER`, `ND_TRANSCODING_MAXCONCURRENT`, `ND_TRANSCODING_MAXCONCURRENTPERUSER`, `ND_MATCHER_PREFERSTARRED`, `ND_UIPLAYBACKREPORTINTERVAL` | Optional non-root enforcement, transcode limits, matching and UI reporting. Preserve upstream defaults unless needed. |
| 0.62 | `ND_TRANSCODING_ENABLECANCELLATION`, `ND_MATCHER_FUZZYTHRESHOLD` | Replacements for deprecated `ND_ENABLETRANSCODINGCANCELLATION` and `ND_SIMILARSONGSMATCHTHRESHOLD`. |
| 0.63 | `ND_SCANNER_ARTISTSPLITEXCEPTIONS`, `ND_SCANNER_IGNOREDOTFOLDERS`, `ND_LYRICSPRIORITY` | Artist split exceptions, dot-folder scanning, and added sidecar lyric formats. |
| 0.64 | `ND_JELLYFIN_ENABLED`, `ND_JELLYFIN_SERVERNAME`, `ND_JELLYFIN_EXPOSEDPUBLICUSERS`, `ND_JELLYFIN_MAXCONCURRENTSTREAMS` | Experimental Jellyfin Music API stays disabled. Public user advertisement is empty by default. |
| 0.64 | `ND_ENABLENATURALSORTING`, `ND_MAXIMAGESIZE`, `ND_ENABLESCHEDULEDDBANALYZE` | Natural ordering, image safety limit and query-planner maintenance. |
| 0.64.1 | `ND_JELLYFIN_AUTODISCOVERY`, `ND_JELLYFIN_QUICKCONNECT` | UDP discovery defaults off; Quick Connect defaults on only for the optional Jellyfin API. Discovery additionally needs deliberate UDP 7359 exposure using existing `service.extraPorts`/`extraContainerPorts` and suitable LAN routing. |

Plugin authors must replace Extism built-in HTTP with host HTTP services; private/loopback HTTP/WebSocket targets need explicit manifest IP/CIDR permissions. Negative durations now fail startup; unknown options warn. Existing `/data`, `/music`, read-only library mounts and HTTP port 4533 remain unchanged. New API and lyric capabilities are client/application features; they do not require another container.

Reviewed upstream release sequence: [v0.62.0](https://github.com/navidrome/navidrome/releases/tag/v0.62.0), [v0.63.0](https://github.com/navidrome/navidrome/releases/tag/v0.63.0), [v0.63.1](https://github.com/navidrome/navidrome/releases/tag/v0.63.1), [v0.63.2](https://github.com/navidrome/navidrome/releases/tag/v0.63.2), [v0.64.0](https://github.com/navidrome/navidrome/releases/tag/v0.64.0), [v0.64.1](https://github.com/navidrome/navidrome/releases/tag/v0.64.1), [v0.64.2](https://github.com/navidrome/navidrome/releases/tag/v0.64.2).

Configuration/source review: [full comparison](https://github.com/navidrome/navidrome/compare/v0.61.2...v0.64.2). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.
