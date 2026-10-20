# Seerr Helm Chart

This chart deploys [Seerr](https://docs.seerr.dev), a media request manager, with persistent configuration and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install seerr harish2k01/seerr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install seerr oci://ghcr.io/harish2k01/helm-charts/seerr --version 0.2.0
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
    - seerr.example.com
```

## Persistence

Seerr configuration is stored at `/app/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Seerr replicas |
| `image.repository` | string | `ghcr.io/seerr-team/seerr` | Container image repository |
| `image.tag` | string | `v3.5.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `env.PORT` | string | `5055` | Seerr HTTP port |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `5055` | Kubernetes Service port |
| `service.targetPort` | int | `5055` | Seerr container port |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/app/config` |
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

## Upgrading from v3.2.0 to v3.5.0

3.3 introduces optional `DB_POOL_SIZE` (upstream default `10`) for external PostgreSQL; set it under `env` and inject database credentials from an existing Secret with `envFrom`. Default SQLite storage remains `/app/config`. IPv6 literal `HOST` values are now accepted. Existing probes at `/api/v1/settings/public` remain valid. Back up `/app/config` and any external database before automatic migrations.

**API consumers:** 3.5 makes `GET /settings/plex/library` and `GET /settings/jellyfin/library` read-only; `sync`/`enable` query parameters no longer work. Use `POST /settings/{plex|jellyfin}/library/sync` and `PUT /settings/{plex|jellyfin}/library/{libraryId}`. Update direct integrations before upgrading.

**Webhook consumers:** 3.3 changes `discordID` (string) to `discordIDs` (array of strings). Update custom consumers accordingly. Discord thread IDs, ntfy tags, Gotify poster embeds, user sync and override rules are configured within Seerr; no additional Service ports or enabled-by-default integration is needed. 3.4.1 fixes an ImageProxy path-traversal/RCE vulnerability; 3.5 also fixes migrated Overseerr status handling. Do not enable the upstream demo environment option in a production deployment.

Reviewed upstream release sequence: [v3.3.0](https://github.com/seerr-team/seerr/releases/tag/v3.3.0), [v3.4.0](https://github.com/seerr-team/seerr/releases/tag/v3.4.0), [v3.4.1](https://github.com/seerr-team/seerr/releases/tag/v3.4.1), [v3.5.0](https://github.com/seerr-team/seerr/releases/tag/v3.5.0).

Configuration/source review: [full comparison](https://github.com/seerr-team/seerr/compare/v3.2.0...v3.5.0). Helm lint, default rendering, opt-in configuration rendering and catalog consistency are checked locally; this does not verify a live upgraded workload.
