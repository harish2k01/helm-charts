# Tailscale Helm Chart

This chart deploys the official [Tailscale](https://tailscale.com) container as Kubernetes subnet router and exit node pods. It is intended for homelab clusters where you want the same behavior as a normal host/LXC install without using the Tailscale Kubernetes operator.

The chart follows the standard Tailscale container environment variables documented by Tailscale, including `TS_AUTHKEY`, `TS_STATE_DIR`, `TS_USERSPACE`, `TS_ROUTES`, `TS_EXTRA_ARGS`, and the health/metrics endpoint.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install tailscale harish2k01/tailscale
```

Create an auth key Secret before installing, or set `authKey.create=true` only for private values files:

```bash
kubectl create namespace networking
kubectl create secret generic tailscale-auth \
  --namespace networking \
  --from-literal=TS_AUTHKEY='tskey-auth-...'

helm install tailscale harish2k01/tailscale \
  --namespace networking \
  --set authKey.existingSecret=tailscale-auth
```

After the pod starts, approve the advertised routes and exit node in the Tailscale admin console.

## Subnet Router And Exit Node

The default values advertise `192.168.0.0/24` and enable `--advertise-exit-node`, mirroring a normal installation that runs:

```bash
tailscale up --advertise-routes=192.168.0.0/24 --advertise-exit-node
```

Change the route to match your LAN:

```yaml
tailscale:
  hostname: homelab-router
  advertiseExitNode: true
  routes:
    - 192.168.1.0/24
```

## Security Notes

Kernel networking requires `/dev/net/tun`, `NET_ADMIN`, and `NET_RAW`. The chart also enables an init container that sets IPv4 and IPv6 forwarding inside the pod network namespace, matching the sysctl step commonly used for bare-metal and LXC installs.

Persistent state is enabled by default at `/var/lib/tailscale` so each pod keeps the same tailnet identity across restarts. The chart uses a StatefulSet, so `replicaCount: 2` creates two independent routers, for example `tailscale-0` and `tailscale-1`, each with its own state PVC. Approve the advertised routes and exit-node setting for each router in the Tailscale admin console.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of independent Tailscale router pods |
| `image.repository` | string | `tailscale/tailscale` | Container image repository |
| `image.tag` | string | `v1.96.5` | Versioned container image tag, suitable for Renovate updates |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `securityContext.privileged` | bool | `true` | Enables privileges required for tun/kernel networking |
| `sysctl.enabled` | bool | `true` | Runs an init container to enable IP forwarding |
| `authKey.existingSecret` | string | `""` | Existing Secret containing the Tailscale auth key |
| `authKey.existingSecretKey` | string | `TS_AUTHKEY` | Secret key name for the auth key |
| `authKey.create` | bool | `false` | Create an auth Secret from `authKey.value` |
| `authKey.value` | string | `""` | Auth key value when `authKey.create=true` |
| `tailscale.hostname` | string | `tailscale-router` | Tailnet hostname |
| `tailscale.hostnameFromPodName` | bool | `true` | Use the StatefulSet pod name as the tailnet hostname |
| `tailscale.hostnamePrefix` | string | `""` | Optional prefix for pod-derived hostnames |
| `tailscale.stateDir` | string | `/var/lib/tailscale` | Tailscale state directory |
| `tailscale.kubeSecret` | string | `""` | Disables Kubernetes Secret state when using PVC-backed state |
| `tailscale.userspace` | bool | `false` | Use userspace networking instead of kernel networking |
| `tailscale.acceptDns` | bool | `false` | Accept DNS settings from the tailnet |
| `tailscale.authOnce` | bool | `true` | Authenticate only when state is not already present |
| `tailscale.advertiseExitNode` | bool | `true` | Add `--advertise-exit-node` to `TS_EXTRA_ARGS` |
| `tailscale.routes` | list | `[192.168.0.0/24]` | Subnet routes advertised to the tailnet through `TS_ROUTES` |
| `tailscale.extraArgs` | list | `[]` | Additional flags appended to `TS_EXTRA_ARGS` |
| `tailscale.tailscaledExtraArgs` | list | `[]` | Additional flags passed through `TS_TAILSCALED_EXTRA_ARGS` |
| `persistence.enabled` | bool | `true` | Persist Tailscale state |
| `persistence.size` | string | `1Gi` | State PVC size |
| `persistence.storageClassName` | string | `""` | Optional storage class |
| `service.enabled` | bool | `true` | Expose health and metrics endpoint |
| `service.port` | int | `9002` | Health and metrics service port |
| `tunDevice.enabled` | bool | `true` | Mount `/dev/net/tun` from the host |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
| `topologySpreadConstraints` | list | `[]` | Pod topology spread constraints for separating replicas across zones or nodes |
