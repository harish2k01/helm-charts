# Portfolio Next Helm Chart

Deploys [Harish's Astro portfolio](https://github.com/harish2k01/portfolio-next) with unprivileged NGINX, health probes, and optional Ingress or Gateway API routing.

> [!NOTE]
> This first-party chart is maintained by [harish2k01](https://github.com/harish2k01). Report chart issues in [helm-charts](https://github.com/harish2k01/helm-charts). The chart is covered by this repository's MIT license; that does not license the site's portrait or personal content.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install portfolio-next harish2k01/portfolio-next --version 0.1.0
```

```bash
helm install portfolio-next oci://ghcr.io/harish2k01/helm-charts/portfolio-next --version 0.1.0
```

The image must already be published. A chart release does not build the application image. The default image release is `v0.1.0`; override it with a successfully published tag or digest.

## Gateway API

```yaml
image:
  tag: v0.1.0
  # Set digest to the sha256:... value from the release's image.json.
httpRoute:
  enabled: true
  parentRefs:
    - name: public-gateway
      namespace: ingress
      sectionName: https
  hostnames:
    - portfolio.example.com
```

Configure DNS and the Gateway's TLS certificate separately. Enable either HTTPRoute or Ingress, not both. The HTTPRoute backend targets this chart's Service on port 80, which forwards to NGINX on port 8080. Probes use `/healthz`.

## Immutable images and blog updates

`image.digest` takes precedence over `image.tag`. Updating the digest changes the pod template and causes a rolling deployment even when the release tag stays the same. Roll back by restoring a previous digest. Publishing a new registry digest alone cannot restart existing pods.

The image contains static HTML and its article snapshot. No runtime environment variable can change the canonical origin: build the image with the desired `SITE_URL`.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | integer | `1` | Stateless replicas. |
| `image.repository` | string | `ghcr.io/harish2k01/portfolio-next` | Application image repository. |
| `image.tag` | string | `""` | Falls back to chart appVersion. |
| `image.digest` | string | `""` | Immutable digest; overrides tag. |
| `image.pullPolicy` | string | `IfNotPresent` | Image pull policy. |
| `imagePullSecrets` | list | `[]` | Credentials for private GHCR packages. |
| `nameOverride`, `fullnameOverride` | string | `""` | Resource naming overrides. |
| `podAnnotations`, `podLabels` | object | `{}` | Additional pod metadata. |
| `automountServiceAccountToken` | boolean | `false` | Kubernetes API credentials are unnecessary. |
| `podSecurityContext` | object | UID/GID 101, non-root, RuntimeDefault | Pod isolation. |
| `securityContext` | object | Read-only root, no capabilities/escalation | Container isolation; writable `/tmp` uses bounded emptyDir. |
| `service.type`, `service.port` | string / integer | `ClusterIP` / `80` | Service configuration. |
| `ingress.enabled` | boolean | `false` | Enable Ingress routing. |
| `ingress.className`, `ingress.annotations` | string / object | `""` / `{}` | Controller selection and annotations. |
| `ingress.hosts`, `ingress.tls` | list | Example host / `[]` | HTTP and TLS mappings. |
| `httpRoute.enabled` | boolean | `false` | Enable Gateway API routing. |
| `httpRoute.parentRefs`, `httpRoute.hostnames` | list | `[]` | Gateway attachments and DNS names. |
| `httpRoute.annotations` | object | `{}` | Route annotations. |
| `resources` | object | Requests 10m/32Mi, limits 250m/128Mi | CPU and memory budget. |
| `livenessProbe`, `readinessProbe` | object | HTTP `/healthz` | Container health probes. |
| `nodeSelector`, `affinity` | object | `{}` | Scheduling constraints. |
| `tolerations` | list | `[]` | Allowed node taints. |
