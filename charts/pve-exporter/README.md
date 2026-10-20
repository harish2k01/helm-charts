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
helm install pve-exporter oci://ghcr.io/harish2k01/helm-charts/pve-exporter --version 0.2.0
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
| `image.tag` | string | `3.10.1` | Container image tag |
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
| `collectors.qdevice` | bool | `true` | Collect QDevice state during cluster scrapes; disable if not applicable |
| `extraArgs` | list | `[]` | Additional exporter CLI flags |
| `resources` | object | `{}` | Container resource requests and limits |
| `livenessProbe` | object | HTTP GET `/` | Liveness probe |
| `readinessProbe` | object | HTTP GET `/` | Readiness probe |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |

## Upgrading from 3.8.2 to 3.10.1

3.8.3 updates dependencies; 3.9.0 adds the QDevice collector; 3.10.0 raises the image's Python minimum to 3.11 and disables the Gunicorn control socket; 3.10.1 updates runtime dependencies. Python is supplied by the container image, so no host Python changes are needed.

The new collector is enabled by upstream. With the existing `serviceMonitor.params.cluster: ["1"]`, configured QDevices expose `pve_qdevice_info` and `pve_qdevice_up`. The collector queries `/cluster/config/qdevice`; no configured QDevice produces no metrics. Check API access when enabling it, or set `collectors.qdevice: false` to skip that API call. Other collector flags are available through `extraArgs`. The chart also passes `proxmox.config.mountPath` to the exporter so a custom mount path is read correctly.

Existing Secret-backed YAML, environment configuration, HTTP probe path `/`, Service port 9221, and scrape parameters remain supported. Validate a scrape with your actual Proxmox credentials after rollout; Helm rendering cannot verify endpoint permissions or metric data.

Sources: [intervening changelog](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/CHANGELOG.rst), [source comparison](https://github.com/prometheus-pve/prometheus-pve-exporter/compare/v3.8.2...v3.10.1), [collector implementation](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/src/pve_exporter/collector/cluster.py), and [CLI defaults](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/src/pve_exporter/cli.py).
