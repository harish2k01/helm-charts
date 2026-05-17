# Bazarr Helm Chart

This chart deploys [Bazarr](https://www.bazarr.media) using the LinuxServer.io container image, with persistent configuration, optional shared media storage, and optional Ingress or Gateway API HTTPRoute access.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install bazarr harish2k01/bazarr
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install bazarr oci://ghcr.io/harish2k01/helm-charts/bazarr --version 0.1.2
```

Deploy another Bazarr instance by using a different release name and values file:

```bash
helm install bazarr4k harish2k01/bazarr -f bazarr4k-values.yaml
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
    - bazarr.example.com
```

## Persistence

Bazarr configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## Media And Hardlinks

Mount the same existing media PVC used by qBittorrent, Radarr, and Sonarr so Bazarr sees the same library paths:

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  mountPath: /vault
  readOnly: false
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Bazarr replicas |
| `image.repository` | string | `lscr.io/linuxserver/bazarr` | Container image repository |
| `image.tag` | string | `1.5.6` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `6767` | Kubernetes Service port |
| `service.targetPort` | int | `6767` | Bazarr container port |
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
