# qBittorrent Helm Chart

This chart deploys [qBittorrent](https://www.qbittorrent.org) using the LinuxServer.io container image, with persistent configuration, optional shared media storage, and optional Ingress or Gateway API HTTPRoute access for the Web UI.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install qbittorrent harish2k01/qbittorrent
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install qbittorrent oci://ghcr.io/harish2k01/helm-charts/qbittorrent --version 0.1.2
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
    - qbittorrent.example.com
```

Or with Ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: qbittorrent.example.com
      paths:
        - path: /
          pathType: Prefix
```

## Persistence

qBittorrent configuration is stored at `/config`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## Downloads And Hardlinks

For media automation stacks, mount the same existing PVC into qBittorrent and the related Radarr/Sonarr/Bazarr pods at the same path. This keeps downloads and imported libraries on one filesystem, so hardlinks can work.

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  mountPath: /vault
  readOnly: false
```

By default, this chart creates only the Web UI Service port. The BitTorrent TCP/UDP port is declared as a container port but is not exposed through the Service unless you add it to `service.extraPorts`.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of qBittorrent replicas |
| `image.repository` | string | `lscr.io/linuxserver/qbittorrent` | Container image repository |
| `image.tag` | string | `5.2.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `3000` | LinuxServer user ID |
| `env.PGID` | string | `3000` | LinuxServer group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `env.WEBUI_PORT` | string | `8080` | qBittorrent Web UI port |
| `env.TORRENTING_PORT` | string | `6881` | qBittorrent listening port |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8080` | Kubernetes Web UI Service port |
| `service.targetPort` | int | `8080` | Container Web UI port |
| `service.extraPorts` | list | `[]` | Additional Service ports, for example BitTorrent TCP/UDP |
| `extraContainerPorts` | list | BitTorrent TCP/UDP `6881` | Additional container ports |
| `persistence.config.enabled` | bool | `true` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/config` |
| `persistence.config.size` | string | `5Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `media.enabled` | bool | `false` | Mount an existing media/downloads PVC |
| `media.existingClaim` | string | `""` | Existing media PVC name |
| `media.mountPath` | string | `/vault` | Media PVC mount path |
| `media.readOnly` | bool | `false` | Mount media PVC read-only |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
