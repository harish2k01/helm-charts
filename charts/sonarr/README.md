# Sonarr Helm Chart

This chart deploys [Sonarr](https://sonarr.tv) using the LinuxServer.io container image, with persistent configuration, optional shared media storage, and optional Ingress or Gateway API HTTPRoute access.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install sonarr harish2k01/sonarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install sonarr oci://ghcr.io/harish2k01/helm-charts/sonarr --version 0.1.2
```

Deploy another Sonarr instance by using a different release name and values file:

```bash
helm install sonarr-anime harish2k01/sonarr -f sonarr-anime-values.yaml
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
| `image.tag` | string | `4.0.17` | Container image tag |
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
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
