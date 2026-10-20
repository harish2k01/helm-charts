# FlareSolverr Helm Chart

This chart deploys [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr), typically as an internal service used by Prowlarr or other applications that need challenge solving.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install flaresolverr harish2k01/flaresolverr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install flaresolverr oci://ghcr.io/harish2k01/helm-charts/flaresolverr --version 0.1.3
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
httpRoute:
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
| `env.BROWSER_WAIT_TIMEOUT` | string | `1` | Seconds per browser state/challenge wait attempt; increase on slow hosts or sites |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8191` | Kubernetes Service port |
| `service.targetPort` | int | `8191` | FlareSolverr container port |
| `persistence.config.enabled` | bool | `false` | Create or mount a config PVC |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

## Upgrading from v3.4.6 to v3.5.2

v3.5.0 adds Turnstile request support and formatted file logs and returns the container to Python 3.11. v3.5.1 adds `BROWSER_WAIT_TIMEOUT`, fixes challenge verification and cookies collected after `waitInSeconds`, disables the Chromium Local Network Access popup, and updates Chromium/dependencies. v3.5.2 fixes binary packaging. The container still supplies its own browser, Python, and entrypoint.

Set `env.BROWSER_WAIT_TIMEOUT: "3"` on slow hosts; the default `"1"` retains the previous fixed one-second wait. This controls each browser state wait, while request `maxTimeout` still controls the API request timeout. The new `tabs_till_verify` request field and `turnstile_token` result are API features; clients choose them per request, so no chart-wide defaults are introduced. File logging remains opt-in via `env.LOG_FILE` and a writable `extraVolumeMounts` destination.

The HTTP port (8191), `/health` probes, optional metrics port (8192), and persistence behavior remain unchanged. Keep the API internal or restrict access because it can initiate browser requests.

Sources: [intervening changelog](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/CHANGELOG.md), [source comparison](https://github.com/FlareSolverr/FlareSolverr/compare/v3.4.6...v3.5.2), and [environment configuration](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/README.md#environment-variables).
