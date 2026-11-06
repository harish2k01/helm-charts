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
helm install sonarr oci://ghcr.io/harish2k01/helm-charts/sonarr --version 0.3.1
```

Deploy another Sonarr instance by using a different release name and values file:

```bash
helm install sonarr-anime harish2k01/sonarr -f sonarr-anime-values.yaml
```

## Install With Gateway API HTTPRoute

```yaml
httpRoutes:
  main:
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
| `httpRoutes.main.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

### Additional configuration controls

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `envFrom` | list | `[]` | Existing Secret or ConfigMap environment sources; explicit `env` takes precedence. |

## Configuration and releases

See [runtime configuration](CONFIGURATION.md) for supported environment variables, upstream defaults, persisted settings and Secret examples. See [CHANGELOG.md](CHANGELOG.md) for application release changes, chart changes and upgrade notes.

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

### Health probes

Liveness and readiness probes use the unauthenticated `/ping` endpoint on the
application HTTP port. They retain `Host: localhost` for compatibility with host
allowlists and avoid redirects to the login page. Override
`livenessProbe.httpGet.path` and `readinessProbe.httpGet.path` when using a custom
URL base.
