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
helm install jellyfin oci://ghcr.io/harish2k01/helm-charts/jellyfin --version 0.3.0
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
| `image.tag` | string | `10.11.11` | Container image tag |
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

### Additional configuration controls

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `startupProbe` | object | HTTP `/`, up to 15 minutes | Protect initial database migration from liveness restarts; tune for your library. |

## Configuration and releases

See [runtime configuration](CONFIGURATION.md) for supported environment variables, upstream defaults, persisted settings and Secret examples. See [CHANGELOG.md](CHANGELOG.md) for application release changes, chart changes and upgrade notes.

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
