# Vaultwarden Helm Chart

This chart deploys [Vaultwarden](https://github.com/dani-garcia/vaultwarden), a lightweight Bitwarden-compatible password manager server, with persistent `/data` storage and optional Ingress or Gateway API HTTPRoute access.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install vaultwarden harish2k01/vaultwarden
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
| `image.tag` | string | `1.36.0` | Container image tag |
| `env.DOMAIN` | string | `""` | Public Vaultwarden URL |
| `env.SIGNUPS_ALLOWED` | string | `false` | Enable or disable public signups |
| `secretEnv.create` | bool | `false` | Create a Secret from `secretEnv.values` |
| `secretEnv.existingSecret.name` | string | `""` | Existing Secret to read env vars from |
| `service.port` | int | `80` | Kubernetes Service port |
| `persistence.config.enabled` | bool | `true` | Create or mount the `/data` PVC |
| `persistence.config.size` | string | `5Gi` | Data PVC size |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
