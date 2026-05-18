# Harish's Helm Charts

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/kubernetes-homelab-helm-charts)](https://artifacthub.io/packages/search?repo=kubernetes-homelab-helm-charts)
[![Release Charts](https://github.com/harish2k01/helm-charts/actions/workflows/release.yaml/badge.svg)](https://github.com/harish2k01/helm-charts/actions/workflows/release.yaml)
[![Lint Charts](https://github.com/harish2k01/helm-charts/actions/workflows/lint.yaml/badge.svg)](https://github.com/harish2k01/helm-charts/actions/workflows/lint.yaml)

Reliable Helm charts for self-hosted Kubernetes applications. This repository provides practical, versioned charts for media automation, networking, monitoring, finance, security, and homelab services.

Every chart is published through both the classic Helm repository format and as an OCI chart in GHCR, so users can install through the workflow they already prefer.

## Highlights

- Dual publishing: GitHub Pages `index.yaml` and GHCR OCI charts.
- Portable defaults: no personal domains, namespaces, storage classes, or cluster-specific controllers assumed.
- Versioned releases: chart packages are attached to GitHub Releases and available from the public repository index.
- Homelab friendly: charts are small, readable, and easy to customize with values files.

## Distribution

| Channel | Location | Best for |
| --- | --- | --- |
| Helm repository | `https://harish2k01.github.io/helm-charts` | Classic Helm workflows with `helm repo add`, `helm search repo`, and `index.yaml`. |
| OCI registry | `oci://ghcr.io/harish2k01/helm-charts/<chart-name>` | Direct registry installs without adding a Helm repository first. |
| GitHub Releases | Per-chart version tags | Release notes and downloadable `.tgz` chart assets. |

## Quick Start

Install from the Helm repository:

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install bentopdf harish2k01/bentopdf --version 0.1.3
```

Install the same chart from GHCR OCI:

```bash
helm install bentopdf oci://ghcr.io/harish2k01/helm-charts/bentopdf --version 0.1.3
```

Customize with your own values:

```bash
helm install bentopdf harish2k01/bentopdf -f values.yaml
```

Browse every published version:

```bash
helm search repo harish2k01 --versions
```

## Requirements

- Helm 3
- Access to a Kubernetes cluster
- A configured `kubectl` context for the target cluster
- Optional: an Ingress controller or Gateway API implementation for external HTTP access

## Chart Catalog

The catalog is intentionally focused on deployable self-hosted services. Each chart keeps cluster assumptions out of defaults so it can be reused across different Kubernetes environments.

| Chart | Chart Version | App Version | Category | Description |
| --- | ---: | ---: | --- | --- |
| [`bazarr`](charts/bazarr) | `0.1.2` | `1.5.6` | Media | Deploys Bazarr subtitle automation on Kubernetes. |
| [`bentopdf`](charts/bentopdf) | `0.1.3` | `2.8.4` | Documents | Deploys BentoPDF document conversion on Kubernetes. |
| [`cloudflared`](charts/cloudflared) | `0.1.1` | `2026.3.0` | Network | Deploys Cloudflare Tunnel cloudflared connectors on Kubernetes. |
| [`feishin`](charts/feishin) | `0.1.0` | `1.11.0` | Media | Deploys Feishin music streaming client on Kubernetes. |
| [`firefly-iii`](charts/firefly-iii) | `0.1.2` | `version-6.6.1` | Finance | Deploys Firefly III with PostgreSQL for personal finance tracking. |
| [`flaresolverr`](charts/flaresolverr) | `0.1.2` | `v3.4.6` | Media | Deploys FlareSolverr request solving for automation stacks. |
| [`jellyfin`](charts/jellyfin) | `0.1.2` | `10.11.8` | Media | Deploys Jellyfin media server with library mount support. |
| [`navidrome`](charts/navidrome) | `0.1.0` | `0.61.2` | Media | Deploys Navidrome music streaming with separate app data and music PVCs. |
| [`prowlarr`](charts/prowlarr) | `0.1.2` | `2.3.5` | Media | Deploys Prowlarr indexer management for media automation. |
| [`qbittorrent`](charts/qbittorrent) | `0.1.2` | `5.2.0` | Media | Deploys qBittorrent with persistent configuration and media mounts. |
| [`radarr`](charts/radarr) | `0.1.2` | `6.1.1` | Media | Deploys Radarr movie automation with reusable release values. |
| [`scrutiny`](charts/scrutiny) | `0.2.2` | `v0.9.2-web` | Monitoring | Deploys Scrutiny web and API components for S.M.A.R.T. collectors. |
| [`seerr`](charts/seerr) | `0.1.2` | `v3.2.0` | Media | Deploys Seerr media request management for shared libraries. |
| [`sonarr`](charts/sonarr) | `0.1.2` | `4.0.17` | Media | Deploys Sonarr TV automation with PVC and ingress options. |
| [`speedtest-tracker`](charts/speedtest-tracker) | `0.1.3` | `1.14.0` | Monitoring | Deploys Speedtest Tracker for scheduled network performance checks. |
| [`tailscale`](charts/tailscale) | `0.1.2` | `v1.96.5` | Network | Deploys Tailscale as a Kubernetes subnet router and exit node. |
| [`tor-proxy`](charts/tor-proxy) | `0.1.2` | `latest` | Network | Deploys a Tor SOCKS proxy for workloads that need routed egress. |
| [`uptime-kuma`](charts/uptime-kuma) | `0.1.2` | `2.2.1-slim` | Monitoring | Deploys Uptime Kuma for self-hosted uptime monitoring. |
| [`vaultwarden`](charts/vaultwarden) | `0.1.0` | `1.36.0` | Security | Deploys Vaultwarden password management on Kubernetes. |

## Media Automation Pattern

Media charts are designed to be installed independently. Install the same chart more than once by using different release names and values files:

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

## Common Commands

Install into a namespace:

```bash
helm install bentopdf harish2k01/bentopdf --namespace apps --create-namespace
```

Upgrade a release:

```bash
helm repo update
helm upgrade bentopdf harish2k01/bentopdf -f values.yaml
```

Upgrade from OCI:

```bash
helm upgrade bentopdf oci://ghcr.io/harish2k01/helm-charts/bentopdf --version 0.1.3 -f values.yaml
```

Uninstall a release:

```bash
helm uninstall bentopdf
```

## Repository URLs

```text
Helm repository: https://harish2k01.github.io/helm-charts
Index file:      https://harish2k01.github.io/helm-charts/index.yaml
OCI registry:   oci://ghcr.io/harish2k01/helm-charts/<chart-name>
```
