# Uptime Kuma Helm Chart

This chart deploys [Uptime Kuma](https://github.com/louislam/uptime-kuma) on Kubernetes with persistent application data, optional MariaDB support, and optional Ingress or Gateway API HTTPRoute access.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install uptime-kuma harish2k01/uptime-kuma
```

By default, Uptime Kuma stores data in SQLite under `/app/data` with a persistent volume.

## Install With Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: uptime.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: uptime-kuma-tls
      hosts:
        - uptime.example.com
```

```bash
helm install uptime-kuma harish2k01/uptime-kuma -f values.yaml
```

## Install With Gateway API HTTPRoute

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - uptime.example.com
```

## Persistence

Application data is stored in `/app/data`:

```yaml
persistence:
  enabled: true
  size: 2Gi
  storageClassName: ""
  accessModes:
    - ReadWriteOnce
```

To use an existing PVC:

```yaml
persistence:
  enabled: true
  existingClaim: uptime-kuma-data
```

## Database Configuration

Uptime Kuma uses SQLite by default. The chart can also configure MariaDB, either as a built-in StatefulSet or as an external database.

### Built-In MariaDB

Create a Secret for the MariaDB user password:

```bash
kubectl create secret generic uptime-kuma-db \
  --from-literal=db-password='your_password'
```

Enable the built-in MariaDB StatefulSet:

```yaml
database:
  mariadb:
    enabled: true
    auth:
      database: uptime_kuma
      username: uptime_kuma
      existingSecret: uptime-kuma-db
      passwordKey: db-password
    persistence:
      enabled: true
      size: 2Gi
```

### External MariaDB

```yaml
database:
  external:
    enabled: true
    type: mariadb
    host: mariadb.example.com
    port: "3306"
    database: uptime_kuma
    username: uptime_kuma
    existingSecret: uptime-kuma-db-external
    passwordKey: db-password
```

The referenced Secret must contain the key configured by `database.external.passwordKey`.

## Environment Variables

Set non-secret Uptime Kuma environment variables with `env`:

```yaml
env:
  UPTIME_KUMA_HOST: "0.0.0.0"
  UPTIME_KUMA_PORT: "3001"
  UPTIME_KUMA_WS_ORIGIN_CHECK: "cors-like"
```

Database-related environment variables are managed by the chart when `database.mariadb.enabled` or `database.external.enabled` is true.

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Uptime Kuma replicas |
| `image.repository` | string | `louislam/uptime-kuma` | Container image repository |
| `image.tag` | string | `2.2.1-slim` | Container image tag |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `service.type` | string | `ClusterIP` | Kubernetes Service type |
| `service.port` | int | `3001` | Kubernetes Service port |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `persistence.enabled` | bool | `true` | Enable persistent storage for `/app/data` |
| `persistence.size` | string | `2Gi` | Application PVC size |
| `persistence.storageClassName` | string | `""` | Storage class for the application PVC |
| `persistence.existingClaim` | string | `""` | Use an existing PVC for application data |
| `database.mariadb.enabled` | bool | `false` | Deploy built-in MariaDB |
| `database.mariadb.auth.existingSecret` | string | `""` | Existing Secret with MariaDB credentials |
| `database.mariadb.persistence.enabled` | bool | `true` | Enable MariaDB persistent storage |
| `database.external.enabled` | bool | `false` | Use an external MariaDB database |
| `database.external.host` | string | `""` | External MariaDB host |
| `env` | object | `{}` | Additional non-secret environment variables |
| `resources` | object | `{}` | Uptime Kuma container resource requests and limits |
| `nodeSelector` | object | `{}` | Pod node selector |
| `tolerations` | list | `[]` | Pod tolerations |
| `affinity` | object | `{}` | Pod affinity |
