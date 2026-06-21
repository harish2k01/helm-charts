# qBittorrent Exporter Helm Chart

This chart deploys [martabal/qbittorrent-exporter](https://github.com/martabal/qbittorrent-exporter), a Prometheus exporter for qBittorrent.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install qbittorrent-exporter harish2k01/qbittorrent-exporter
```

## Install From OCI

```bash
helm install qbittorrent-exporter oci://ghcr.io/harish2k01/helm-charts/qbittorrent-exporter --version 0.1.0
```

## qBittorrent Authentication

qBittorrent exporter v2 supports the authentication changes introduced by qBittorrent 5.2.0.

For qBittorrent 5.2.0 or newer, create an API key in the qBittorrent WebUI and use `auth.method: apiKey`:

```yaml
qbittorrent:
  baseUrl: http://qbittorrent.media.svc.cluster.local:8080
  auth:
    method: apiKey
    existingSecret: qbittorrent-exporter-auth
    apiKeySecretKey: api-key
```

For older qBittorrent versions, use username and password credentials:

```yaml
qbittorrent:
  auth:
    method: legacy
    existingSecret: qbittorrent-exporter-auth
    usernameSecretKey: username
    passwordSecretKey: password
```

## ServiceMonitor

Enable a Prometheus Operator `ServiceMonitor` when your cluster has the CRD installed:

```yaml
serviceMonitor:
  enabled: true
  labels:
    release: kube-prometheus-stack
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of exporter pods |
| `image.repository` | string | `ghcr.io/martabal/qbittorrent-exporter` | Container image repository |
| `image.tag` | string | `v2.0.1` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `qbittorrent.baseUrl` | string | `http://qbittorrent:8080` | qBittorrent WebUI URL |
| `qbittorrent.auth.method` | string | `legacy` | Auth mode: `legacy`, `apiKey`, `cookieName`, or `none` |
| `qbittorrent.auth.existingSecret` | string | `""` | Secret containing credentials |
| `qbittorrent.auth.createSecret` | bool | `false` | Create a normal Secret from inline credentials |
| `qbittorrent.auth.usernameSecretKey` | string | `username` | Secret key for legacy username |
| `qbittorrent.auth.passwordSecretKey` | string | `password` | Secret key for legacy password |
| `qbittorrent.auth.apiKeySecretKey` | string | `api-key` | Secret key for qBittorrent API key |
| `qbittorrent.auth.cookieName` | string | `""` | qBittorrent cookie name for cookie-based auth |
| `qbittorrent.exporter.port` | int | `8090` | Exporter listen port |
| `qbittorrent.exporter.path` | string | `/metrics` | Metrics path |
| `qbittorrent.exporter.logLevel` | string | `INFO` | Exporter log level |
| `qbittorrent.features.enableTracker` | bool | `true` | Collect tracker metrics |
| `qbittorrent.features.enableHighCardinality` | bool | `false` | Enable high-cardinality metrics |
| `qbittorrent.features.enableIncreasedCardinality` | bool | `false` | Enable increased-cardinality metrics |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8090` | Service port |
| `serviceMonitor.enabled` | bool | `false` | Create a Prometheus Operator ServiceMonitor |
| `resources` | object | `{}` | Container resource requests and limits |
| `livenessProbe` | object | HTTP GET `/metrics` | Liveness probe |
| `readinessProbe` | object | HTTP GET `/metrics` | Readiness probe |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
