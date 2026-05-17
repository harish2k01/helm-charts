# BentoPDF Helm Chart

This chart deploys [BentoPDF](https://github.com/alam00000/BentoPDF) on Kubernetes.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install bentopdf harish2k01/bentopdf
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install bentopdf oci://ghcr.io/harish2k01/helm-charts/bentopdf --version 0.1.3
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
| `image.tag` | string | `2.8.4` | Container image tag |
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
