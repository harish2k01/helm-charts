# Prowlarr Helm Chart

This chart deploys [Prowlarr](https://prowlarr.com) using the LinuxServer.io container image, with persistent configuration and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install prowlarr harish2k01/prowlarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install prowlarr oci://ghcr.io/harish2k01/helm-charts/prowlarr --version 0.3.0
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
    - prowlarr.example.com
```

## Persistence

Prowlarr configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## FlareSolverr

If you deploy the `flaresolverr` chart in the same namespace, configure Prowlarr inside the application to use:

```text
http://flaresolverr.<namespace>.svc.cluster.local:8191
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Prowlarr replicas |
| `image.repository` | string | `lscr.io/linuxserver/prowlarr` | Container image repository |
| `image.tag` | string | `2.6.5` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `9696` | Kubernetes Service port |
| `service.targetPort` | int | `9696` | Prowlarr container port |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/config` |
| `persistence.config.size` | string | `5Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
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

Use `httpRoutes` to attach separate hostnames to separate Gateways. The existing
`httpRoute` configuration remains supported and independent; disable it when
replacing it with named routes to avoid overlapping rules.

```yaml
httpRoute:
  enabled: false
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
| `httpRoutes` | `{}` | Additional named HTTPRoutes; empty creates none. |
| `httpRoutes.<name>.enabled` | `true` | Set false to omit an entry, including its attachments. |
| `httpRoutes.<name>.parentRefs` | Required when enabled | Gateway references, with optional namespace and listener section. |
| `httpRoutes.<name>.hostnames` | Required when enabled | Independent explicit hostname list. |
| `httpRoutes.<name>.annotations` | `{}` | Per-route annotations. |
| `httpRoutes.<name>.rules` | Path prefix `/` | Gateway API matches and filters. Backend references are always supplied by the chart using its application Service and HTTP port. |

Named routes do not inherit hostnames, attachments, annotations, or rules from
`httpRoute`. They retain chart-specific backend behavior, including Ghost's
ActivityPub endpoints when enabled. Gateway API CRDs and a compatible controller
are required; the referenced Gateway must allow attachment from this namespace.
