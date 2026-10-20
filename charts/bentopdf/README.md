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
helm install bentopdf oci://ghcr.io/harish2k01/helm-charts/bentopdf --version 0.2.0
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
