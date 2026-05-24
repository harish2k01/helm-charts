# Syncthing Helm Chart

This chart deploys [Syncthing](https://syncthing.net) using the official `syncthing/syncthing` container image, with persistent state, optional extra synchronized folder mounts, and optional Ingress or Gateway API HTTPRoute access for the Web UI.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install syncthing harish2k01/syncthing
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install syncthing oci://ghcr.io/harish2k01/helm-charts/syncthing --version 0.1.0
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
    - syncthing.example.com
```

Or with Ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: syncthing.example.com
      paths:
        - path: /
          pathType: Prefix
```

## Persistence

Syncthing state is stored at `/var/syncthing`. The official image keeps configuration under `/var/syncthing/config`.

```yaml
persistence:
  config:
    enabled: true
    size: 10Gi
    storageClassName: ""
```

## Sync Folders

Mount an existing PVC when you want Syncthing to manage folders outside its primary state volume. Add the same paths as folders in the Syncthing Web UI after installation.

```yaml
syncFolders:
  enabled: true
  existingClaim: shared-data-pvc
  mounts:
    - mountPath: /data/documents
      subPath: documents
    - mountPath: /data/photos
      subPath: photos
```

For access from devices outside the cluster, expose TCP/UDP `22000` and UDP `21027` with a `LoadBalancer`, `NodePort`, or other cluster networking option.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Syncthing replicas |
| `image.repository` | string | `syncthing/syncthing` | Container image repository |
| `image.tag` | string | `2.1.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.PUID` | string | `1000` | File ownership user ID |
| `env.PGID` | string | `1000` | File ownership group ID |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `env.STGUIADDRESS` | string | `0.0.0.0:8384` | Web UI bind address |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.ports` | list | Web UI, sync, discovery ports | Service ports exposed for Syncthing |
| `containerPorts` | list | Web UI, sync, discovery ports | Container ports exposed by Syncthing |
| `persistence.config.enabled` | bool | `true` | Create or mount the Syncthing home PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/var/syncthing` |
| `persistence.config.size` | string | `10Gi` | Syncthing home PVC size |
| `persistence.config.storageClassName` | string | `""` | Syncthing home PVC storage class |
| `syncFolders.enabled` | bool | `false` | Mount an existing PVC for synchronized folders |
| `syncFolders.existingClaim` | string | `""` | Existing PVC containing synchronized folders |
| `syncFolders.mounts` | list | `[]` | Paths and optional subPaths mounted from the sync folders PVC |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress for the Web UI |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute for the Web UI |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
