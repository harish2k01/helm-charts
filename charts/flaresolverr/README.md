# FlareSolverr Helm Chart

This chart deploys [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr), typically as an internal service used by Prowlarr or other applications that need challenge solving.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://charts.harish2k01.in
helm repo update
helm install flaresolverr harish2k01/flaresolverr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install flaresolverr oci://ghcr.io/harish2k01/helm-charts/flaresolverr --version 0.2.0
```

By default, this chart creates only an internal ClusterIP Service.

## In-Cluster URL

Applications in the same namespace can use:

```text
http://flaresolverr:8191
```

Applications in other namespaces can use:

```text
http://flaresolverr.<namespace>.svc.cluster.local:8191
```

## Optional HTTPRoute

FlareSolverr is usually kept internal, but HTTPRoute is available when needed:

```yaml
httpRoutes:
  main:
    enabled: true
    parentRefs:
      - name: gateway
        namespace: gateway-system
        sectionName: https
    hostnames:
      - flaresolverr.example.com
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of FlareSolverr replicas |
| `image.repository` | string | `ghcr.io/flaresolverr/flaresolverr` | Container image repository |
| `image.tag` | string | `v3.5.2` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.LOG_LEVEL` | string | `info` | FlareSolverr log level |
| `env.LOG_HTML` | string | `false` | Log HTML responses |
| `env.CAPTCHA_SOLVER` | string | `none` | Captcha solver backend |
| `env.BROWSER_WAIT_TIMEOUT` | string/int | `1` | Seconds per browser state/challenge wait attempt; increase on slow hosts or sites |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `envFrom` | list | `[]` | Secret/ConfigMap environment sources, including proxy credentials |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8191` | Kubernetes Service port |
| `service.targetPort` | int | `8191` | FlareSolverr container port |
| `persistence.config.enabled` | bool | `false` | Create or mount a config PVC |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoutes.main.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

## Upgrade history

See [CHANGELOG.md](CHANGELOG.md) for application changes and compatibility notes.

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
