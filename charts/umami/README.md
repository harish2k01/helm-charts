# Umami Helm Chart

This chart deploys [Umami](https://github.com/umami-software/umami), a privacy-focused web analytics platform, on Kubernetes.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install From Repository

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install umami harish2k01/umami
```

## Install From OCI

```bash
helm install umami oci://ghcr.io/harish2k01/helm-charts/umami --version 0.1.0
```

## Database Configuration

Umami v3 requires PostgreSQL. The chart enables a bundled PostgreSQL StatefulSet by default for simple installs:

```yaml
database:
  postgresql:
    enabled: true
    auth:
      database: umami
      username: umami
      existingSecret: umami-db
      passwordKey: db-password
```

For production, create the database password Secret yourself:

```bash
kubectl create secret generic umami-db --from-literal=db-password='change-me'
```

Use an external PostgreSQL database by disabling the bundled database and providing a `DATABASE_URL` Secret:

```bash
kubectl create secret generic umami-db-external \
  --from-literal=DATABASE_URL='postgresql://umami:password@postgres.example.com:5432/umami'
```

```yaml
database:
  postgresql:
    enabled: false
  external:
    enabled: true
    existingSecret: umami-db-external
    databaseUrlKey: DATABASE_URL
```

## Application Secret

Umami requires `APP_SECRET` for authentication tokens. Create it outside Helm for production:

```bash
kubectl create secret generic umami-secrets \
  --from-literal=APP_SECRET="$(openssl rand -hex 32)"
```

```yaml
umami:
  secrets:
    existingSecret: umami-secrets
```

The default inline values are suitable only for quick local evaluation.

## Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: umami.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: umami-tls
      hosts:
        - umami.example.com
```

## Gateway API HTTPRoute

```yaml
httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - umami.example.com
```

## Helm Values Reference

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Umami replicas. |
| `image.repository` | string | `ghcr.io/umami-software/umami` | Umami container image repository. |
| `image.tag` | string | `3.1.0` | Umami container image tag. |
| `image.pullPolicy` | string | `IfNotPresent` | Container image pull policy. |
| `service.type` | string | `ClusterIP` | Kubernetes Service type. |
| `service.port` | int | `3000` | Service port. |
| `service.targetPort` | int | `3000` | Umami container port. |
| `ingress.enabled` | bool | `false` | Create an Ingress resource. |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute. |
| `database.postgresql.enabled` | bool | `true` | Deploy bundled PostgreSQL. |
| `database.postgresql.auth.database` | string | `umami` | Bundled PostgreSQL database name. |
| `database.postgresql.auth.username` | string | `umami` | Bundled PostgreSQL username. |
| `database.postgresql.auth.password` | string | `umami` | Inline database password for evaluation. |
| `database.postgresql.auth.existingSecret` | string | `""` | Existing Secret containing the database password. |
| `database.postgresql.persistence.enabled` | bool | `true` | Enable PostgreSQL persistent storage. |
| `database.postgresql.persistence.size` | string | `8Gi` | PostgreSQL storage size. |
| `database.external.enabled` | bool | `false` | Use an external PostgreSQL `DATABASE_URL`. |
| `database.external.url` | string | `""` | Inline external `DATABASE_URL` for evaluation. |
| `database.external.existingSecret` | string | `""` | Existing Secret containing `DATABASE_URL`. |
| `umami.secrets.existingSecret` | string | `""` | Existing Secret containing `APP_SECRET`. |
| `umami.secrets.inline.APP_SECRET` | string | `replace-me-with-a-random-string` | Inline `APP_SECRET` for evaluation. |
| `umami.env` | object | `{PORT: "3000", DISABLE_TELEMETRY: "1"}` | Non-secret Umami runtime environment variables. |
| `umami.envFrom` | list | `[]` | Extra `envFrom` entries. |
| `umami.extraVolumes` | list | `[]` | Additional pod volumes. |
| `umami.extraVolumeMounts` | list | `[]` | Additional container volume mounts. |
| `umami.resources` | object | `{}` | Umami CPU and memory requests/limits. |
| `nodeSelector` | object | `{}` | Umami pod node selector. |
| `tolerations` | list | `[]` | Umami pod tolerations. |
| `affinity` | object | `{}` | Umami pod affinity rules. |
