# Navidrome Helm Chart

This chart deploys [Navidrome](https://www.navidrome.org) using the official container image, with separate persistent volumes for application data/configuration and the music library.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install navidrome harish2k01/navidrome
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install navidrome oci://ghcr.io/harish2k01/helm-charts/navidrome --version 0.1.0
```

## Web UI Access

Expose the Web UI with Gateway API:

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - navidrome.example.com
```

Or with Ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: navidrome.example.com
      paths:
        - path: /
          pathType: Prefix
```

## Persistence

Navidrome application data is stored at `/data`, while music is mounted separately at `/music`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
  music:
    enabled: true
    size: 100Gi
    storageClassName: ""
    readOnly: true
```

To reuse existing claims instead of creating new ones:

```yaml
persistence:
  config:
    existingClaim: navidrome-config
  music:
    existingClaim: music-library
    readOnly: true
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Navidrome replicas |
| `image.repository` | string | `deluan/navidrome` | Container image repository |
| `image.tag` | string | `0.61.2` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `env.ND_SCANSCHEDULE` | string | `1h` | Music library scan schedule |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `4533` | Kubernetes Web UI Service port |
| `service.targetPort` | int | `4533` | Container Web UI port |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `extraContainerPorts` | list | `[]` | Additional container ports |
| `persistence.config.enabled` | bool | `true` | Create or mount an app data/config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/data` |
| `persistence.config.size` | string | `5Gi` | App data/config PVC size |
| `persistence.config.storageClassName` | string | `""` | App data/config PVC storage class |
| `persistence.music.enabled` | bool | `true` | Create or mount a music library PVC |
| `persistence.music.existingClaim` | string | `""` | Existing PVC for `/music` |
| `persistence.music.size` | string | `100Gi` | Music library PVC size |
| `persistence.music.storageClassName` | string | `""` | Music library PVC storage class |
| `persistence.music.readOnly` | bool | `true` | Mount the music library read-only |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
