# Helm Charts

Reusable Helm charts for Kubernetes applications.

## Add This Repository

After GitHub Pages is enabled for this repository, users can add it with:

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
```

## Available Charts

| Chart | Description |
| --- | --- |
| `bentopdf` | Deploys BentoPDF on Kubernetes |

## Install BentoPDF

```bash
helm install bentopdf harish2k01/bentopdf
```

With custom values:

```bash
helm install bentopdf harish2k01/bentopdf -f values.yaml
```

Example values are available in [`examples/`](examples/).

## Publishing

This repository includes a GitHub Actions workflow that packages changed charts and publishes them to the `gh-pages` branch with a Helm `index.yaml`.

To enable `helm repo add`:

1. Push this repository to GitHub as `harish2k01/helm-charts`.
2. Go to repository settings.
3. Open **Pages**.
4. Set the source to the `gh-pages` branch.
5. Push a change to `main` under `charts/**`.

The chart release workflow will publish packages to:

```text
https://harish2k01.github.io/helm-charts
```
