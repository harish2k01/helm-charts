# Changelog

## 0.2.0

### Application upgrade from 3.8.2 to 3.10.1

3.8.3 updates dependencies; 3.9.0 adds the QDevice collector; 3.10.0 raises the image's Python minimum to 3.11 and disables the Gunicorn control socket; 3.10.1 updates runtime dependencies. Python is supplied by the container image, so no host Python changes are needed.

The new collector is enabled by upstream. With the existing `serviceMonitor.params.cluster: ["1"]`, configured QDevices expose `pve_qdevice_info` and `pve_qdevice_up`. The collector queries `/cluster/config/qdevice`; no configured QDevice produces no metrics. Check API access when enabling it, or set `collectors.qdevice: false` to skip that API call. Other collector flags are available through `extraArgs`. The chart also passes `proxmox.config.mountPath` to the exporter so a custom mount path is read correctly.

Existing Secret-backed YAML, environment configuration, HTTP probe path `/`, Service port 9221, and scrape parameters remain supported. Validate a scrape with your actual Proxmox credentials after rollout; Helm rendering cannot verify endpoint permissions or metric data.

Sources: [intervening changelog](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/CHANGELOG.rst), [source comparison](https://github.com/prometheus-pve/prometheus-pve-exporter/compare/v3.8.2...v3.10.1), [collector implementation](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/src/pve_exporter/collector/cluster.py), and [CLI defaults](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/src/pve_exporter/cli.py).

### Runtime configuration coverage

Document every target exporter CLI collector/listener/TLS switch and all six supported PVE environment variables in commented values examples. Password/token values use `envFrom.secretRef`. Add `proxmox.config.enabled` (default true) so an environment-auth deployment can disable the otherwise mandatory config-file Secret volume. File-backed multi-module installations retain their existing default behavior and custom `mountPath` is passed to the CLI. This exporter does not manage a database; compatibility concerns are Proxmox API privileges and collector availability.

Sources: [environment configuration parser](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/src/pve_exporter/config.py) and [full CLI contract](https://github.com/prometheus-pve/prometheus-pve-exporter/blob/v3.10.1/src/pve_exporter/cli.py).
