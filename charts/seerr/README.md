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
helm install seerr oci://ghcr.io/harish2k01/helm-charts/seerr --version 0.1.2
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
| `image.tag` | string | `v3.2.0` | Container image tag |
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
