# Tailscale Helm Chart

This chart deploys the official [Tailscale](https://tailscale.com) container as Kubernetes subnet router and exit node pods. It is intended for homelab clusters where you want the same behavior as a normal host/LXC install without using the Tailscale Kubernetes operator.

The chart follows the standard Tailscale container environment variables documented by Tailscale, including `TS_AUTHKEY`, `TS_STATE_DIR`, `TS_USERSPACE`, `TS_ROUTES`, `TS_EXTRA_ARGS`, and the health/metrics endpoint.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install tailscale harish2k01/tailscale
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install tailscale oci://ghcr.io/harish2k01/helm-charts/tailscale --version 0.1.2
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

## Kubernetes Netfilter Troubleshooting

Subnet router and exit-node traffic requires Linux forwarding plus firewall/NAT rules. If the pod is running and can reach your LAN itself, but tailnet clients cannot reach the advertised subnet, check the Tailscale health output and logs:

```bash
kubectl -n <namespace> exec tailscale-0 -- tailscale status
kubectl -n <namespace> exec tailscale-0 -- tailscale debug prefs
kubectl -n <namespace> logs statefulset/tailscale --tail=100
```

If you see errors like `can't initialize iptables table 'filter'`, `can't initialize iptables table 'nat'`, or `modprobe: can't change directory to '/lib/modules'`, the container cannot use the legacy iptables path to create the rules needed for subnet routing. In clusters where nftables is available, you can let Tailscale auto-detect the firewall backend:

```yaml
tailscale:
  extraEnv:
    TS_DEBUG_FIREWALL_MODE: auto
```

After applying the value, restart the StatefulSet and confirm the logs report the selected firewall mode. If netfilter still cannot be configured from the pod, load the required kernel modules on the Kubernetes nodes or run the subnet router on a normal host, VM, or LXC where Tailscale can manage firewall rules.

When using persisted state with `tailscale.authOnce=true`, previously saved preferences can survive value changes. If you remove exit-node advertisement or change route settings and the pod still shows old preferences, temporarily set:

```yaml
tailscale:
  authOnce: false
  extraArgs:
    - --reset
```

Then restart the pod so the official container resets old non-default preferences and re-applies `TS_ROUTES` and `TS_EXTRA_ARGS` from the current Helm values. After the pod starts cleanly and `tailscale debug prefs` shows only the expected routes, you can remove `--reset` and set `authOnce` back to your preferred value.

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
| `tailscale.extraEnv` | object | `{}` | Additional official Tailscale container environment variables, such as `TS_DEBUG_FIREWALL_MODE` |
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
