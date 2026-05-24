# k8s-debug-pod Helm Chart

Deploys an Ubuntu-based Kubernetes troubleshooting pod with common cluster, network, DNS, TLS, process, and database client tools.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by Canonical, Ubuntu, or Kubernetes. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install k8s-debug-pod harish2k01/k8s-debug-pod \
  --namespace debug \
  --create-namespace
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install k8s-debug-pod oci://ghcr.io/harish2k01/helm-charts/k8s-debug-pod --version 0.1.0 --namespace debug --create-namespace
```

## Connect

```bash
kubectl -n debug exec -it deploy/k8s-debug-pod -- bash
```

## Remove

```bash
helm uninstall k8s-debug-pod --namespace debug
kubectl delete namespace debug
```

## RBAC

By default the chart creates a ServiceAccount and binds it to the built-in `view` ClusterRole. Disable RBAC or use a different ClusterRole through values:

```yaml
rbac:
  create: true
  clusterRoleName: view
```

## Image Releases

The container image is built in the separate [harish2k01/k8s-debug-pod](https://github.com/harish2k01/k8s-debug-pod) repository and published to:

```text
ghcr.io/harish2k01/k8s-debug-pod
```

That repository publishes images from GitHub Releases with semantic version tags. A stable release such as `v1.2.3` publishes `1.2.3`, `1.2`, `1`, and `latest`. A prerelease such as `v1.2.3-rc.1` publishes only `1.2.3-rc.1`.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of debug pod replicas |
| `image.repository` | string | `ghcr.io/harish2k01/k8s-debug-pod` | Container image repository |
| `image.tag` | string | `0.1.0` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `imagePullSecrets` | list | `[]` | Image pull secrets |
| `nameOverride` | string | `""` | Override the chart name |
| `fullnameOverride` | string | `""` | Override the full release name |
| `podAnnotations` | object | `{}` | Additional pod annotations |
| `podLabels` | object | `{}` | Additional pod labels |
| `podSecurityContext` | object | `{}` | Pod security context |
| `securityContext` | object | NET_ADMIN and NET_RAW with privilege escalation disabled | Container security context |
| `serviceAccount.create` | bool | `true` | Create a ServiceAccount |
| `serviceAccount.annotations` | object | `{}` | ServiceAccount annotations |
| `serviceAccount.name` | string | `""` | ServiceAccount name override |
| `rbac.create` | bool | `true` | Create a ClusterRoleBinding |
| `rbac.clusterRoleName` | string | `view` | ClusterRole to bind to the ServiceAccount |
| `command` | list | `[]` | Optional command override |
| `args` | list | `[]` | Optional args override |
| `env` | object | `{}` | Environment variables passed to the container |
| `envFrom` | list | `[]` | `envFrom` entries for ConfigMaps or Secrets |
| `resources` | object | CPU and memory requests/limits | Container resource requests and limits |
| `extraVolumes` | list | `[]` | Additional pod volumes |
| `extraVolumeMounts` | list | `[]` | Additional container volume mounts |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
