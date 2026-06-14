# Portfolio Tracker Helm Chart

This chart deploys [Portfolio Tracker](https://github.com/harish2k01/portfolio-tracker), a self-hosted investment portfolio tracker, with PostgreSQL.

> [!NOTE]
> This chart is maintained by [harish2k01](https://github.com/harish2k01) for the Portfolio Tracker project. For chart issues or improvements, open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install From Repository

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install portfolio-tracker harish2k01/portfolio-tracker
```

## Install From OCI

```bash
helm install portfolio-tracker oci://ghcr.io/harish2k01/helm-charts/portfolio-tracker --version 0.1.0
```

## Production Secrets

Create separate application and database secrets:

```bash
kubectl create secret generic portfolio-tracker-app-secret \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=SMTP_USER='' \
  --from-literal=SMTP_PASS=''

kubectl create secret generic portfolio-tracker-postgresql-secret \
  --from-literal=db-password='change-me'
```

Reference them in values:

```yaml
portfolioTracker:
  secrets:
    existingSecret: portfolio-tracker-app-secret

database:
  postgresql:
    auth:
      existingSecret: portfolio-tracker-postgresql-secret
```

For an external PostgreSQL instance, provide the full `DATABASE_URL` through a Secret:

```yaml
database:
  postgresql:
    enabled: false
  external:
    enabled: true
    existingSecret: portfolio-tracker-db-external
    databaseUrlKey: DATABASE_URL
```

## Gateway API HTTPRoute

```yaml
portfolioTracker:
  env:
    NEXTAUTH_URL: https://portfolio.example.com
    APP_BASE_URL: https://portfolio.example.com

httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: websecure
  hostnames:
    - portfolio.example.com
```

## Values Reference

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of application replicas. |
| `image.repository` | string | `ghcr.io/harish2k01/portfolio-tracker` | Portfolio Tracker image repository. |
| `image.tag` | string | `0.1.0` | Semantic application release to deploy. |
| `service.port` | int | `3000` | Kubernetes Service port. |
| `ingress.enabled` | bool | `false` | Create an Ingress resource. |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute. |
| `database.postgresql.enabled` | bool | `true` | Deploy bundled PostgreSQL. |
| `database.postgresql.auth.existingSecret` | string | `""` | Existing Secret containing `db-password`. |
| `database.postgresql.persistence.enabled` | bool | `true` | Persist bundled PostgreSQL data. |
| `database.external.enabled` | bool | `false` | Use an external PostgreSQL connection URL. |
| `database.external.existingSecret` | string | `""` | Existing Secret containing `DATABASE_URL`. |
| `portfolioTracker.secrets.existingSecret` | string | `""` | Existing Secret containing `NEXTAUTH_SECRET` and optional SMTP credentials. |
| `portfolioTracker.env` | object | See `values.yaml` | Non-secret NextAuth, public URL, and SMTP settings. |
| `portfolioTracker.envFrom` | list | `[]` | Additional ConfigMap or Secret environment sources. |
| `portfolioTracker.resources` | object | `{}` | Application CPU and memory resources. |
| `nodeSelector` | object | `{}` | Application pod node selector. |
| `tolerations` | list | `[]` | Application pod tolerations. |
| `affinity` | object | `{}` | Application pod affinity rules. |
