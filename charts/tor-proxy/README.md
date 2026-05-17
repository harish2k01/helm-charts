# Tor Proxy Helm Chart

This chart deploys [peterdavehello/tor-socks-proxy](https://github.com/peterdavehello/tor-socks-proxy), a small Tor SOCKS proxy, on Kubernetes.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install tor-proxy harish2k01/tor-proxy
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install tor-proxy oci://ghcr.io/harish2k01/helm-charts/tor-proxy --version 0.1.2
```

By default, this chart creates an internal `ClusterIP` Service only.

## In-Cluster URL

Applications in the same namespace can use:

```text
socks5h://tor-proxy:9150
```

Applications in other namespaces can use:

```text
socks5h://tor-proxy.<namespace>.svc.cluster.local:9150
```

Use `socks5h` when the client supports it so DNS resolution also goes through the proxy.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Tor proxy replicas |
| `image.repository` | string | `peterdavehello/tor-socks-proxy` | Container image repository |
| `image.tag` | string | `latest` | Container image tag |
| `image.pullPolicy` | string | `Always` | Container pull policy |
| `env` | object | `{}` | Environment variables passed to the container |
| `envFrom` | list | `[]` | `envFrom` entries for ConfigMaps or Secrets |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `9150` | Kubernetes Service port |
| `service.targetPort` | int | `9150` | Tor SOCKS container port |
| `service.annotations` | object | `{}` | Service annotations |
| `extraContainerPorts` | list | `[]` | Additional container ports |
| `command` | list | `[]` | Optional command override |
| `args` | list | `[]` | Optional args override |
| `extraVolumes` | list | `[]` | Additional pod volumes |
| `extraVolumeMounts` | list | `[]` | Additional container volume mounts |
| `resources` | object | `{}` | Container resource requests and limits |
| `livenessProbe` | object | TCP probe on `socks` | Liveness probe configuration |
| `readinessProbe` | object | TCP probe on `socks` | Readiness probe configuration |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
