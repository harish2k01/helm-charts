# Homepage Helm Chart

This chart deploys [Homepage](https://gethomepage.dev/), a customizable application dashboard/startpage, using the upstream container image.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install homepage harish2k01/homepage
```

## Install From OCI

```bash
helm install homepage oci://ghcr.io/harish2k01/helm-charts/homepage --version 0.1.0
```

## Web UI Access

Homepage requires `HOMEPAGE_ALLOWED_HOSTS` for non-local access. This chart always includes the pod IP for health probes; add your external hostname with `homepage.allowedHosts`.

Expose with Gateway API:

```yaml
homepage:
  allowedHosts:
    - homepage.example.com

httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - homepage.example.com
```

Or with Ingress:

```yaml
homepage:
  allowedHosts:
    - homepage.example.com

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: homepage.example.com
      paths:
        - path: /
          pathType: Prefix
```

## Configuration

The chart generates Homepage config files from `homepage.config.files` and mounts them under `/app/config`:

```yaml
homepage:
  config:
    enabled: true
    files:
      settings.yaml: |
        title: HomeLab
      services.yaml: |
        - Monitoring:
            - Uptime Kuma:
                href: https://uptime.example.com
                description: Status checks
```

To provide your own ConfigMap:

```yaml
homepage:
  existingConfigMap: homepage-config
```

Keep the keys in that ConfigMap aligned with the files listed in `homepage.config.files`, or override `homepage.config.files` to match your keys.

To provide `/app/config` through your own volume mount instead, disable generated config files:

```yaml
homepage:
  config:
    enabled: false
```

## Kubernetes Discovery

By default, `kubernetes.yaml` uses `mode: cluster` and the chart creates RBAC for pods, nodes, namespaces, ingresses, Gateway API HTTPRoutes, Traefik IngressRoutes, and metrics. Disable RBAC branches you do not need:

```yaml
rbac:
  gatewayApi: false
  traefik: false
  metrics: false
```

## Persistence

Generated ConfigMap files are enough for most GitOps-style installs. Enable a config PVC when you want persistent `/app/config` storage:

```yaml
persistence:
  config:
    enabled: true
    size: 1Gi
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Homepage replicas |
| `image.repository` | string | `ghcr.io/gethomepage/homepage` | Container image repository |
| `image.tag` | string | `v1.13.1` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `serviceAccount.create` | bool | `true` | Create a ServiceAccount |
| `serviceAccount.automount` | bool | `true` | Automount the ServiceAccount token |
| `rbac.create` | bool | `true` | Create RBAC for Kubernetes discovery |
| `rbac.gatewayApi` | bool | `true` | Include Gateway API read permissions |
| `rbac.traefik` | bool | `true` | Include Traefik IngressRoute read permissions |
| `rbac.metrics` | bool | `true` | Include metrics.k8s.io read permissions |
| `env.TZ` | string | `Asia/Kolkata` | Container timezone |
| `homepage.allowedHosts` | list | `[]` | Additional allowed hosts for external access |
| `homepage.existingConfigMap` | string | `""` | Existing ConfigMap with Homepage config files |
| `homepage.config.enabled` | bool | `true` | Generate and mount Homepage config files |
| `homepage.config.files` | object | see `values.yaml` | Homepage config file contents mounted under `/app/config` |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `3000` | Kubernetes Service port |
| `service.targetPort` | int | `3000` | Container Web UI port |
| `service.extraPorts` | list | `[]` | Additional Service ports |
| `persistence.config.enabled` | bool | `false` | Create or mount a config PVC |
| `persistence.config.existingClaim` | string | `""` | Existing PVC for `/app/config` |
| `persistence.config.size` | string | `1Gi` | Config PVC size |
| `persistence.config.storageClassName` | string | `""` | Config PVC storage class |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `resources` | object | `{}` | Container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
