# Helm Charts

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
| [`bentopdf`](charts/bentopdf) | `0.1.1` | `2.8.4` | Deploys BentoPDF on Kubernetes |
| [`firefly-iii`](charts/firefly-iii) | `0.1.0` | `version-6.6.1` | Deploys Firefly III with PostgreSQL on Kubernetes |
| [`speedtest-tracker`](charts/speedtest-tracker) | `0.1.0` | `1.14.0` | Deploys Speedtest Tracker on Kubernetes |

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

Install Speedtest Tracker:

```bash
helm install speedtest-tracker harish2k01/speedtest-tracker
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
helm install bentopdf harish2k01/bentopdf --version 0.1.1
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
