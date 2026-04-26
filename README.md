# Helm Charts

[![Release Charts](https://github.com/harish2k01/helm-charts/actions/workflows/release.yaml/badge.svg)](https://github.com/harish2k01/helm-charts/actions/workflows/release.yaml)
[![Lint Charts](https://github.com/harish2k01/helm-charts/actions/workflows/lint.yaml/badge.svg)](https://github.com/harish2k01/helm-charts/actions/workflows/lint.yaml)

Reusable Helm charts for Kubernetes and self-hosted apps, published through GitHub Pages.

## Add Repository

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
```

## Available Charts

| Chart | Chart Version | App Version | Description |
| --- | --- | --- | --- |
| [`bentopdf`](charts/bentopdf) | `0.1.1` | `2.8.4` | Deploys BentoPDF on Kubernetes |
| [`firefly-iii`](charts/firefly-iii) | `0.1.0` | `version-6.6.1` | Deploys Firefly III with PostgreSQL on Kubernetes |

List all published versions:

```bash
helm search repo harish2k01 --versions
```

## Install

```bash
helm install bentopdf harish2k01/bentopdf
helm install firefly-iii harish2k01/firefly-iii
```

Install with your own values:

```bash
helm install bentopdf harish2k01/bentopdf -f values.yaml
helm install firefly-iii harish2k01/firefly-iii -f values.yaml
```

Install a specific chart version:

```bash
helm install bentopdf harish2k01/bentopdf --version 0.1.1
```

## Repository Site

The human page and Helm repository are served from the same URL:

```text
https://harish2k01.github.io/helm-charts
```

Helm reads:

```text
https://harish2k01.github.io/helm-charts/index.yaml
```

## GitHub Releases

Every new chart version also gets a GitHub Release with release notes and the packaged chart attached.

Release tags use this format:

```text
<chart-name>-<chart-version>
```

Examples:

```text
bentopdf-0.1.1
firefly-iii-0.1.0
```

## Publishing

The release workflow packages charts, creates GitHub Releases for new chart versions, preserves older chart packages from the published site, regenerates `index.yaml`, copies the human website from `docs/`, and deploys everything with GitHub Pages Actions.

GitHub Pages should be configured as:

```text
Source: GitHub Actions
```

To publish a new chart release:

1. Update the chart under `charts/<name>`.
2. Bump `version` in that chart's `Chart.yaml`.
3. Commit and push to `main`.
4. Let the `Release Charts` workflow deploy the site and Helm index.
