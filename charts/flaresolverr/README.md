# FlareSolverr Helm Chart

This chart deploys [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr), typically as an internal service used by Prowlarr or other applications that need challenge solving.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install flaresolverr harish2k01/flaresolverr
```

By default, this chart creates only an internal ClusterIP Service.

## In-Cluster URL

Applications in the same namespace can use:

```text
http://flaresolverr:8191
```

Applications in other namespaces can use:

```text
http://flaresolverr.<namespace>.svc.cluster.local:8191
```

## Optional HTTPRoute

FlareSolverr is usually kept internal, but HTTPRoute is available when needed:

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - flaresolverr.example.com
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of FlareSolverr replicas |
| `image.repository` | string | `ghcr.io/flaresolverr/flaresolverr` | Container image repository |
| `image.tag` | string | `v3.4.6` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `env.LOG_LEVEL` | string | `info` | FlareSolverr log level |
| `env.LOG_HTML` | string | `false` | Log HTML responses |
| `env.CAPTCHA_SOLVER` | string | `none` | Captcha solver backend |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `8191` | Kubernetes Service port |
| `service.targetPort` | int | `8191` | FlareSolverr container port |
| `persistence.config.enabled` | bool | `false` | Create or mount a config PVC |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
