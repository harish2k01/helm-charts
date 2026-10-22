# Vaultwarden Helm Chart

This chart deploys [Vaultwarden](https://github.com/dani-garcia/vaultwarden), a lightweight Bitwarden-compatible password manager server, with persistent `/data` storage and optional Ingress or Gateway API HTTPRoute access.

> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install vaultwarden harish2k01/vaultwarden
```

## Install From OCI

This chart is also published as an OCI chart in GHCR. Use the same values and namespace flags with the OCI reference:

```bash
helm install vaultwarden oci://ghcr.io/harish2k01/helm-charts/vaultwarden --version 0.1.0
```

## Example Values

```yaml
env:
  DOMAIN: https://vaultwarden.example.com
  SIGNUPS_ALLOWED: "false"
  SMTP_HOST: smtp.example.com
  SMTP_FROM: vaultwarden@example.com
  SMTP_FROM_NAME: Vaultwarden
  SMTP_USERNAME: vaultwarden@example.com
  SMTP_SECURITY: starttls
  SMTP_PORT: "587"

secretEnv:
  create: true
  values:
    SMTP_PASSWORD: changeme

httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - vaultwarden.example.com
```

## Existing Secret

```yaml
secretEnv:
  existingSecret:
    name: vaultwarden-env
    keys:
      - envName: SMTP_PASSWORD
        secretKey: smtp-password
      - envName: ADMIN_TOKEN
        secretKey: admin-token
```

## Persistence

Vaultwarden data is stored at `/data`:

```yaml
persistence:
  config:
    enabled: true
    size: 5Gi
    storageClassName: ""
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Vaultwarden replicas |
| `image.repository` | string | `vaultwarden/server` | Container image repository |
| `image.tag` | string | `1.37.1` | Container image tag |
| `env.DOMAIN` | string | `""` | Public Vaultwarden URL |
| `env.SIGNUPS_ALLOWED` | string | `false` | Enable or disable public signups |
| `secretEnv.create` | bool | `false` | Create a Secret from `secretEnv.values` |
| `secretEnv.existingSecret.name` | string | `""` | Existing Secret to read env vars from |
| `service.port` | int | `80` | Kubernetes Service port |
| `persistence.config.enabled` | bool | `true` | Create or mount the `/data` PVC |
| `persistence.config.size` | string | `5Gi` | Data PVC size |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |

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
