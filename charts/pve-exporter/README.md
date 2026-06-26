# PVE Exporter Helm Chart

This chart deploys [prometheus-pve/prometheus-pve-exporter](https://github.com/prometheus-pve/prometheus-pve-exporter), a Prometheus exporter for Proxmox VE.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install pve-exporter harish2k01/pve-exporter
```

## Install From OCI

```bash
helm install pve-exporter oci://ghcr.io/harish2k01/helm-charts/pve-exporter --version 0.1.0
```

## Proxmox Configuration

The exporter expects a `pve.yml` config file mounted from a Kubernetes Secret. Use an existing Secret for GitOps deployments:

```yaml
proxmox:
  config:
    existingSecret: pve-exporter
    secretKey: pve.yaml
```

For local testing, the chart can create a normal Kubernetes Secret from an inline config value:

```yaml
proxmox:
  config:
    createSecret: true
    value: |
      default:
        user: prometheus@pve
        token_name: exporter
        token_value: change-me
        verify_ssl: false
```

## ServiceMonitor

Enable a Prometheus Operator `ServiceMonitor` when your cluster has the CRD installed:

```yaml
proxmox:
  targets:
    - 10.10.10.100

serviceMonitor:
  enabled: true
  labels:
    release: kube-prometheus-stack
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of exporter pods |
| `image.repository` | string | `prompve/prometheus-pve-exporter` | Container image repository |
| `image.tag` | string | `3.8.2` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `proxmox.targets` | list | `[10.10.10.100]` | Proxmox endpoints to scrape |
| `proxmox.config.existingSecret` | string | `""` | Existing Secret containing exporter config |
| `proxmox.config.createSecret` | bool | `false` | Create a normal Secret from `proxmox.config.value` |
| `proxmox.config.secretKey` | string | `pve.yaml` | Secret key containing the exporter config |
| `proxmox.config.value` | string | `""` | Inline exporter config used when creating a Secret |
| `proxmox.config.mountPath` | string | `/etc/prometheus/pve.yml` | Config file mount path |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `9221` | Service port |
| `service.targetPort` | int | `9221` | Container target port |
| `serviceMonitor.enabled` | bool | `false` | Create Prometheus Operator ServiceMonitor resources |
| `serviceMonitor.interval` | string | `30s` | Scrape interval |
| `serviceMonitor.path` | string | `/pve` | Exporter scrape path |
| `serviceMonitor.params` | object | default module, cluster, node params | ServiceMonitor scrape params |
| `resources` | object | `{}` | Container resource requests and limits |
| `livenessProbe` | object | HTTP GET `/` | Liveness probe |
| `readinessProbe` | object | HTTP GET `/` | Readiness probe |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
