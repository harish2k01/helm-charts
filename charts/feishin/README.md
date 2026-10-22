# Feishin Helm Chart

This chart deploys [Feishin](https://github.com/jeffvli/feishin), a self-hosted music streaming client for Jellyfin, Navidrome, and Subsonic-compatible servers.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install feishin harish2k01/feishin
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install feishin oci://ghcr.io/harish2k01/helm-charts/feishin --version 0.2.0
```

## Server Preconfiguration

By default, Feishin starts without a preconfigured server. To mirror the upstream Docker Compose example for Jellyfin, set these values:

```yaml
env:
  SERVER_NAME: jellyfin
  SERVER_LOCK: "false"
  SERVER_TYPE: jellyfin
  SERVER_URL: http://jellyfin:8096
  LEGACY_AUTHENTICATION: "false"
  ANALYTICS_DISABLED: "false"
```

Set `SERVER_LOCK` to `"true"` when you want users to authenticate against only the configured server.

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: feishin.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: feishin-tls
      hosts:
        - feishin.example.com
```

```bash
helm install feishin harish2k01/feishin -f values.yaml
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
      - feishin.example.com
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Feishin replicas |
| `image.repository` | string | `ghcr.io/jeffvli/feishin` | Container image repository |
| `image.tag` | string | `1.17.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.SERVER_NAME` | string | `""` | Preconfigured server display name |
| `env.SERVER_LOCK` | string | `false` | Lock Feishin to the configured server |
| `env.SERVER_TYPE` | string | `""` | Server type: jellyfin, navidrome, or subsonic |
| `env.SERVER_URL` | string | `""` | URL for the configured music server |
| `env.REMOTE_URL` | string | `""` | Optional external URL for sharing compatibility |
| `env.LEGACY_AUTHENTICATION` | string | `false` | Enable legacy auth flag when server lock is enabled |
| `env.ANALYTICS_DISABLED` | string | `false` | Disable Umami analytics tracking |
| `env.PUBLIC_PATH` | string | `/` | Public path served by the nginx container |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `9180` | Kubernetes Service port |
| `service.targetPort` | int | `9180` | Feishin container port |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoutes.main.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

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
