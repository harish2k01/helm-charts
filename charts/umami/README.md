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
helm install umami oci://ghcr.io/harish2k01/helm-charts/umami --version 0.3.0
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
| `image.tag` | string | `3.4.0` | Umami container image tag. |
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

## Optional runtime configuration

`umami.env` contains commented examples for collection, privacy, proxy, framing and geo settings. Use `umami.extraEnv` for individual Secret references or `umami.envFrom` for a complete Secret/ConfigMap. `DATABASE_URL` and `APP_SECRET` remain controlled by the database and Secret sections.

```yaml
umami:
  env:
    MCP_ENABLED: "1"
  extraEnv:
    - name: TWO_FACTOR_ENCRYPTION_KEY
      valueFrom:
        secretKeyRef:
          name: umami-2fa
          key: encryption-key
```

The 2FA key must be 64 hexadecimal characters and stable across pod replacements. MCP requires an Umami API key. `startupProbe` defaults to a 20-minute migration/startup budget and may be customized as a Kubernetes probe. Build-time frontend options require a custom image. See [CHANGELOG.md](CHANGELOG.md) for release and migration details.

### StatefulSet claim labels

Claim templates use stable identity labels so chart/app version changes do not modify immutable storage metadata. Normal workload labels still report the current versions. The following values merge explicitly pinned labels into each claim template:

- `database.postgresql.persistence.claimTemplateLabels`

For an existing StatefulSet created by an older chart, copy the labels from its current `spec.volumeClaimTemplates[].metadata.labels` into the corresponding map **before the first upgrade**. Keep any historical `helm.sh/chart` and `app.kubernetes.io/version` labels fixed there; they describe the original claim template, not the running app. This preserves the immutable template without deleting or replacing the StatefulSet/PVC. Empty defaults suit new installations. Helm lookup is not required, so GitOps/offline rendering remains deterministic. Do not remove pinned labels later without a separately planned migration. Storage size, claim names, access modes and other immutable fields have their own migration constraints.

## Multiple HTTPRoutes

Use `httpRoutes` to attach separate hostnames to separate Gateways. The existing
`httpRoute` configuration remains supported and independent; disable it when
replacing it with named routes to avoid overlapping rules.

```yaml
httpRoute:
  enabled: false
httpRoutes:
  internal:
    parentRefs:
      - name: internal-gateway
        namespace: ingress
        sectionName: https
    hostnames: [app.internal.example.com]
  external:
    parentRefs:
      - name: external-gateway
        namespace: ingress
        sectionName: https
    hostnames: [app.example.com]
```

Each map key is a lowercase DNS label of up to 40 characters and becomes the
resource-name suffix (`<app-fullname>-internal`, for example). Long base names are
shortened to keep the suffix and stay within 63 characters; collisions fail rendering.

| Key | Default | Description |
|---|---|---|
| `httpRoutes` | `{}` | Additional named HTTPRoutes; empty creates none. |
| `httpRoutes.<name>.enabled` | `true` | Set false to omit an entry, including its attachments. |
| `httpRoutes.<name>.parentRefs` | Required when enabled | Gateway references, with optional namespace and listener section. |
| `httpRoutes.<name>.hostnames` | Required when enabled | Independent explicit hostname list. |
| `httpRoutes.<name>.annotations` | `{}` | Per-route annotations. |
| `httpRoutes.<name>.rules` | Path prefix `/` | Gateway API matches and filters. Backend references are always supplied by the chart using its application Service and HTTP port. |

Named routes do not inherit hostnames, attachments, annotations, or rules from
`httpRoute`. They retain chart-specific backend behavior, including Ghost's
ActivityPub endpoints when enabled. Gateway API CRDs and a compatible controller
are required; the referenced Gateway must allow attachment from this namespace.
