# Helm Charts

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/kubernetes-homelab-helm-charts)](https://artifacthub.io/packages/search?repo=kubernetes-homelab-helm-charts)
[![Release Charts](https://github.com/harish2k01/helm-charts/actions/workflows/release.yaml/badge.svg)](https://github.com/harish2k01/helm-charts/actions/workflows/release.yaml)
[![Lint Charts](https://github.com/harish2k01/helm-charts/actions/workflows/lint.yaml/badge.svg)](https://github.com/harish2k01/helm-charts/actions/workflows/lint.yaml)

Reusable Helm charts for Kubernetes and self-hosted apps.

## Requirements

- Helm 3
- Access to a Kubernetes cluster
- A configured `kubectl` context for the target cluster
- Optional: an Ingress controller or Gateway API implementation if you want external HTTP access

## Add This Repository

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
```

## Available Charts

| Chart | Chart Version | App Version | Description |
| --- | --- | --- | --- |
| [`bazarr`](charts/bazarr) | `0.1.2` | `1.5.6` | Deploys Bazarr subtitle automation on Kubernetes |
| [`bentopdf`](charts/bentopdf) | `0.1.3` | `2.8.4` | Deploys BentoPDF on Kubernetes |
| [`cloudflared`](charts/cloudflared) | `0.1.1` | `2026.3.0` | Deploys Cloudflare Tunnel cloudflared connectors on Kubernetes |
| [`firefly-iii`](charts/firefly-iii) | `0.1.2` | `version-6.6.1` | Deploys Firefly III with PostgreSQL on Kubernetes |
| [`flaresolverr`](charts/flaresolverr) | `0.1.2` | `v3.4.6` | Deploys FlareSolverr on Kubernetes |
| [`jellyfin`](charts/jellyfin) | `0.1.2` | `10.11.8` | Deploys Jellyfin media server on Kubernetes |
| [`prowlarr`](charts/prowlarr) | `0.1.2` | `2.3.5` | Deploys Prowlarr indexer manager on Kubernetes |
| [`qbittorrent`](charts/qbittorrent) | `0.1.2` | `5.2.0` | Deploys qBittorrent on Kubernetes |
| [`radarr`](charts/radarr) | `0.1.2` | `6.1.1` | Deploys Radarr movie automation on Kubernetes |
| [`scrutiny`](charts/scrutiny) | `0.2.2` | `v0.9.2-web` | Deploys Scrutiny web/API with InfluxDB for remote collectors |
| [`seerr`](charts/seerr) | `0.1.2` | `v3.2.0` | Deploys Seerr media request manager on Kubernetes |
| [`sonarr`](charts/sonarr) | `0.1.2` | `4.0.17` | Deploys Sonarr TV automation on Kubernetes |
| [`speedtest-tracker`](charts/speedtest-tracker) | `0.1.3` | `1.14.0` | Deploys Speedtest Tracker on Kubernetes |
| [`tailscale`](charts/tailscale) | `0.1.2` | `v1.96.5` | Deploys Tailscale as a Kubernetes subnet router and exit node |
| [`tor-proxy`](charts/tor-proxy) | `0.1.2` | `latest` | Deploys a Tor SOCKS proxy on Kubernetes |
| [`uptime-kuma`](charts/uptime-kuma) | `0.1.2` | `2.2.1-slim` | Deploys Uptime Kuma on Kubernetes |

## Media Automation Charts

The media charts are designed to be installed independently. Apps such as Radarr, Sonarr, and Bazarr can be installed more than once by reusing the same chart with different release names and values files:

```bash
helm install radarr harish2k01/radarr
helm install radarr4k harish2k01/radarr -f radarr4k-values.yaml
helm install sonarr-anime harish2k01/sonarr -f sonarr-anime-values.yaml
```

For qBittorrent and the media automation apps, mount the same existing PVC at the same path to preserve hardlinks and atomic moves:

```yaml
media:
  enabled: true
  existingClaim: media-vault-pvc
  mountPath: /vault
  readOnly: false
```

Jellyfin can mount selected folders from the same PVC as read-only libraries:

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
```

To list all published chart versions:

```bash
helm search repo harish2k01 --versions
```

## Install A Chart

Install BentoPDF:

```bash
helm install bentopdf harish2k01/bentopdf
```

Install Firefly III:

```bash
helm install firefly-iii harish2k01/firefly-iii
```

Install Tor proxy:

```bash
helm install tor-proxy harish2k01/tor-proxy
```

Install Tailscale:

```bash
helm install tailscale harish2k01/tailscale
```

Install into a namespace:

```bash
helm install bentopdf harish2k01/bentopdf --namespace apps --create-namespace
```

## Customize A Chart

Each chart includes a default `values.yaml` file and a chart README with the most commonly used settings:

Create your own values file and pass it during install:

```bash
helm install bentopdf harish2k01/bentopdf -f values.yaml
```

## Install A Specific Version

```bash
helm install bentopdf harish2k01/bentopdf --version 0.1.3
```

## Upgrade

Update your local chart index, then upgrade the release:

```bash
helm repo update
helm upgrade bentopdf harish2k01/bentopdf -f values.yaml
```

## Uninstall

```bash
helm uninstall bentopdf
```

If you installed into a namespace, include the namespace:

```bash
helm uninstall bentopdf --namespace apps
```

## Repository URL

Use this URL for both the Helm repository and the human-readable chart index:

```text
https://harish2k01.github.io/helm-charts
```

Helm reads the repository index from:

```text
https://harish2k01.github.io/helm-charts/index.yaml
```
