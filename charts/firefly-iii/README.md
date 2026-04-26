# Firefly III Helm Chart

This chart deploys [Firefly III](https://www.firefly-iii.org/) with an internal PostgreSQL database, upload storage, and the Firefly cron endpoint runner.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install firefly-iii harish2k01/firefly-iii
```

The default inline secrets are placeholders for evaluation only. For persistent or public deployments, provide your own Kubernetes Secret and set `firefly.secrets.existingSecret`.

Minimum secret keys:

```text
APP_KEY
DB_PASSWORD
STATIC_CRON_TOKEN
```

`APP_KEY` and `STATIC_CRON_TOKEN` must each be exactly 32 characters.

## Install With Ingress

```yaml
firefly:
  env:
    APP_URL: https://firefly.example.com

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: firefly.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: firefly-iii-tls
      hosts:
        - firefly.example.com
```

## Install With Gateway API HTTPRoute

```yaml
firefly:
  env:
    APP_URL: https://firefly.example.com

httpRoute:
  enabled: true
  parentRefs:
    - name: gateway
      namespace: gateway-system
      sectionName: https
  hostnames:
    - firefly.example.com
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of Firefly III replicas |
| `image.repository` | string | `fireflyiii/core` | Firefly III image repository |
| `image.tag` | string | `version-6.6.1` | Firefly III image tag |
| `service.port` | int | `80` | Kubernetes Service port |
| `service.targetPort` | int | `8080` | Firefly III container port |
| `ingress.enabled` | bool | `false` | Create a Kubernetes Ingress |
| `httpRoute.enabled` | bool | `false` | Create a Gateway API HTTPRoute |
| `persistence.upload.enabled` | bool | `true` | Create upload storage PVC |
| `postgres.enabled` | bool | `true` | Deploy the internal PostgreSQL StatefulSet |
| `postgres.persistence.enabled` | bool | `true` | Create PostgreSQL storage |
| `cronjob.enabled` | bool | `true` | Enable the Firefly III cron endpoint runner |
| `firefly.secrets.existingSecret` | string | `""` | Existing Secret containing Firefly secret keys |
| `firefly.env.APP_URL` | string | `http://localhost` | External Firefly III URL |
