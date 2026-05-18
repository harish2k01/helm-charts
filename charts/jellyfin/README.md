# Jellyfin Helm Chart

This chart deploys [Jellyfin](https://jellyfin.org) using the LinuxServer.io container image, with persistent configuration, optional media library mounts, optional hardware acceleration device mounts, and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install jellyfin harish2k01/jellyfin
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install jellyfin oci://ghcr.io/harish2k01/helm-charts/jellyfin --version 0.1.2
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
    - jellyfin.example.com
```

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: jellyfin.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: jellyfin-tls
      hosts:
        - jellyfin.example.com
```

## Persistence

Jellyfin configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 20Gi
    storageClassName: ""
```

To reuse an existing PVC:

```yaml
persistence:
  config:
    enabled: true
    existingClaim: jellyfin-config
```

## Media Libraries

Mount media from an existing PVC with either a single mount or specific folder mounts. Specific folder mounts are useful when Jellyfin should see friendly library paths while every application still uses the same backing filesystem.

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  readOnly: true
  mounts:
    - mountPath: /movies
      subPath: Movies
    - mountPath: /tv
      subPath: Shows
    - mountPath: /music
      subPath: Music
```

## Hardware Acceleration

For Intel or AMD GPU acceleration, mount `/dev/dri` from nodes that expose it and set any needed supplemental groups through `podSecurityContext`.

```yaml
podSecurityContext:
  supplementalGroups:
    - 44
    - 105

hostDevices:
  enabled: true
  devices:
    - name: dri
      hostPath: /dev/dri
      mountPath: /dev/dri
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Jellyfin replicas |
| `image.repository` | string | `lscr.io/linuxserver/jellyfin` | Container image repository |
| `image.tag` | string | `10.11.8` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8096` | Kubernetes Service port |
| `service.targetPort` | int | `8096` | Jellyfin container HTTP port |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/config` |
| `persistence.config.size` | string | `20Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `media.enabled` | bool | `false` | Mount an existing media PVC |
| `media.existingClaim` | string | `""` | Existing media PVC name |
| `media.mountPath` | string | `/vault` | Default media mount path when `media.mounts` is empty |
| `media.readOnly` | bool | `true` | Default media mount read-only mode |
| `media.mounts` | list | `[]` | Per-folder media mounts using `mountPath`, optional `subPath`, and optional `readOnly` |
| `hostDevices.enabled` | bool | `false` | Mount host devices |
| `hostDevices.devices` | list | `[]` | Host device mounts with `name`, `hostPath`, `mountPath`, and optional `type` |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
