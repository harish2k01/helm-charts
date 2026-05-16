# Cloudflared Helm Chart

This chart deploys the official Cloudflare `cloudflared` container as one or more Kubernetes Tunnel connector pods.

It runs `cloudflared tunnel --no-autoupdate --loglevel info --metrics 0.0.0.0:2000 run` by default and reads the tunnel token from a Kubernetes Secret. The chart can reference a Secret managed outside Helm, create a normal Secret from private values, or create a Bitnami SealedSecret.

## Install

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update

kubectl create namespace cloudflare
kubectl create secret generic cloudflare-tunnel-token \
  --namespace cloudflare \
  --from-literal=token='eyJhIjoi...'

helm install cloudflared harish2k01/cloudflared --namespace cloudflare
```

## Sealed Secret

For GitOps deployments with Bitnami Sealed Secrets, enable the SealedSecret template and provide encrypted data:

```yaml
token:
  secretName: cloudflare-tunnel-token
  secretKey: token
  sealedSecret:
    enabled: true
    encryptedData:
      token: Ag...
```

## Values

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `replicaCount` | int | `1` | Number of cloudflared connector pods |
| `image.repository` | string | `cloudflare/cloudflared` | Container image repository |
| `image.tag` | string | `2026.3.0` | Versioned container image tag, suitable for Renovate updates |
| `image.pullPolicy` | string | `IfNotPresent` | Container pull policy |
| `selectorLabels` | object | `{pod: cloudflared}` | Deployment selector labels |
| `podSecurityContext` | object | ICMP ping sysctl | Pod security context |
| `cloudflared.logLevel` | string | `info` | Cloudflared log level |
| `cloudflared.noAutoupdate` | bool | `true` | Add `--no-autoupdate` |
| `cloudflared.metrics.enabled` | bool | `true` | Enable cloudflared metrics and readiness endpoint |
| `cloudflared.metrics.address` | string | `0.0.0.0:2000` | Metrics bind address passed to `--metrics` |
| `cloudflared.extraArgs` | list | `[]` | Extra args inserted before `run` |
| `token.secretName` | string | `cloudflare-tunnel-token` | Secret containing the tunnel token |
| `token.secretKey` | string | `token` | Secret key containing the tunnel token |
| `token.create` | bool | `false` | Create a normal Secret from `token.value` |
| `token.sealedSecret.enabled` | bool | `false` | Create a Bitnami SealedSecret |
| `service.enabled` | bool | `false` | Expose the metrics endpoint with a Service |
| `resources` | object | `{}` | Container resource requests and limits |
| `topologySpreadConstraints` | list | `[]` | Pod topology spread constraints |
