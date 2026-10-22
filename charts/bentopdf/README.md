# BentoPDF Helm Chart

This chart deploys [BentoPDF](https://github.com/alam00000/BentoPDF) on Kubernetes.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install bentopdf harish2k01/bentopdf
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install bentopdf oci://ghcr.io/harish2k01/helm-charts/bentopdf --version 0.3.0
```

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: bentopdf.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: bentopdf-tls
      hosts:
        - bentopdf.example.com
```

```bash
helm install bentopdf harish2k01/bentopdf -f values.yaml
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
    - bentopdf.example.com
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of BentoPDF replicas |
| `image.repository` | string | `ghcr.io/alam00000/bentopdf-simple` | Container image repository |
| `image.tag` | string | `2.8.10` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `80` | Kubernetes Service port |
| `service.targetPort` | int | `8080` | BentoPDF container port |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

## Runtime indexing control

```yaml
env:
  ROBOTS_NOINDEX: "true"
envFrom: []
```

`env` accepts runtime environment values and `envFrom` accepts Kubernetes Secret/ConfigMap references. `ROBOTS_NOINDEX` defaults to `"false"`; when enabled the image edits bundled HTML at startup, so do not mount its HTML directory read-only. `SITE_URL` and `DISABLE_GITHUB_STARS` are build arguments and require your own image. See [upgrade notes](CHANGELOG.md) for this version.

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
