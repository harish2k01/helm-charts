# Codex Instructions For This Repository

This repository publishes reusable Helm charts through GitHub Pages, GitHub Releases, and GHCR OCI. When adding or changing charts, keep the repository consistent with the existing chart catalog.

## Chart Structure

Every chart under `charts/<chart-name>/` should include:

- `Chart.yaml`
- `values.yaml`
- `values.schema.json`
- `README.md`
- `templates/_helpers.tpl`
- workload templates such as `deployment.yaml`, `statefulset.yaml`, `service.yaml`, `pvc.yaml`, `ingress.yaml`, `httproute.yaml`, `secret.yaml`, or `NOTES.txt` when applicable

Use existing charts as the primary pattern before inventing a new structure. Prefer the closest matching chart:

- Simple internal service: `tor-proxy`
- External token or Secret handling: `cloudflared`
- Media app with PVC, Ingress, and HTTPRoute: `jellyfin`, `prowlarr`, `radarr`, `sonarr`
- Database-backed app: `speedtest-tracker`, `firefly-iii`
- Operations/debug chart: `k8s-debug-pod`

## Chart.yaml Requirements

`Chart.yaml` should include complete metadata:

- `apiVersion: v2`
- `name`
- `description`
- `type: application`
- `version`
- `appVersion`
- `home`
- `sources`
- `keywords`
- `maintainers`
- `annotations.artifacthub.io/license`
- `annotations.artifacthub.io/images`
- `icon` when a relevant stable upstream icon exists

For icons, prefer stable project icons such as `https://raw.githubusercontent.com/selfhst/icons/main/png/<name>.png` when available. If there is no trustworthy icon for the chart, either omit `icon` or choose a durable upstream project asset. Do not add random or fragile image URLs.

Keep `version` as the Helm chart version. Keep `appVersion` as the application or image version. Bump chart versions intentionally when chart behavior, defaults, templates, or documentation change.

## values.yaml

`values.yaml` must be commented enough that a user understands when to change each setting.

Comments should explain practical intent, for example:

- when to change `replicaCount`
- why the image tag should be pinned
- when `imagePullSecrets` are needed
- what `nameOverride` and `fullnameOverride` are for
- how annotations and labels are commonly used
- why security context or Linux capabilities are present
- what ServiceAccount and RBAC settings allow
- when command or args overrides are appropriate
- when to use `env` or `envFrom`
- when to increase resources
- when to mount extra volumes or volume mounts
- when scheduling controls like `nodeSelector`, `tolerations`, and `affinity` are useful

Keep comments concise and operational. Avoid generic comments that only restate the key name.

## values.schema.json

Every chart must have `values.schema.json`.

The schema should:

- use JSON Schema draft-07
- set `additionalProperties: true` at the top level and for Kubernetes-native object blobs
- validate known scalar values such as booleans, strings, integers, and enums
- include descriptions for user-facing values
- include defaults that match `values.yaml`
- stay permissive for Kubernetes objects like `resources`, `affinity`, `tolerations`, `extraVolumes`, `extraVolumeMounts`, `envFrom`, probes, and annotations

After adding or changing schema, run `helm lint charts/<chart-name>` and at least one `helm template` command with a few value overrides that exercise the schema.

## README.md

Each chart README should match the style of existing chart READMEs.

Include, as applicable:

- title in the form `# <Chart Name> Helm Chart`
- short description of what the chart deploys
- unofficial community chart note
- install from the Helm repository
- install from OCI
- important usage examples such as Ingress, Gateway API, persistence, secrets, media mounts, debug access, or RBAC
- values table with key, type, default, and description

Use this install pattern:

```bash
helm repo add harish2k01 https://harish2k01.github.io/helm-charts
helm repo update
helm install <release-name> harish2k01/<chart-name>
```

Use this OCI pattern:

```bash
helm install <release-name> oci://ghcr.io/harish2k01/helm-charts/<chart-name> --version <chart-version>
```

For unofficial chart notes, use language similar to existing charts:

```markdown
> [!NOTE]
> This is an unofficial community Helm chart maintained by [harish2k01](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.
```

Adjust the upstream project wording when the chart is first-party or maintained in another repo.

## Templates

Use helper templates consistently:

- `<chart-name>.name`
- `<chart-name>.fullname`
- `<chart-name>.chart`
- `<chart-name>.labels`
- `<chart-name>.selectorLabels`

Apply standard labels to all resources:

- `helm.sh/chart`
- `app.kubernetes.io/name`
- `app.kubernetes.io/instance`
- `app.kubernetes.io/version` when `appVersion` exists
- `app.kubernetes.io/managed-by`

Prefer values-driven optional resources. Gate optional ServiceAccounts, RBAC, PVCs, Ingress, HTTPRoute, Secrets, and SealedSecrets behind explicit values.

Avoid cluster-specific defaults such as personal domains, private storage classes, fixed namespaces, or environment-specific Secret names unless the chart exists only for that cluster-specific purpose.

## Repository README

When adding, removing, or renaming a chart, update the root `README.md` chart catalog table.

The catalog row should include:

- chart link
- chart version
- app version
- category
- concise description

Keep the catalog sorted consistently with the surrounding table.

## docs/index.html

When adding, removing, or renaming a chart, update `docs/index.html`.

Update:

- chart count in the release flow panel
- chart count in the overview stat
- category wording if the new chart introduces a new category
- chart catalog card with chart name, chart version, description, app version pill, category pill, and link to chart docs

Match the existing static HTML structure. Do not redesign the page for catalog-only changes.

## Validation

Before finishing chart work, run:

```bash
helm lint charts/<chart-name>
helm template <release-name> charts/<chart-name> --namespace <namespace>
```

For repo-wide chart changes, run:

```powershell
Get-ChildItem charts -Directory | ForEach-Object { helm lint $_.FullName }
```

If a chart has optional branches such as `rbac.create=false`, `serviceAccount.create=false`, `ingress.enabled=true`, `httpRoute.enabled=true`, or persistence toggles, render at least one command that exercises the changed branches.

If validation cannot be run because a tool is unavailable, clearly say so in the final response.

## Git Hygiene

Do not modify unrelated charts or generated files unless the requested change requires it. Preserve user changes in the working tree. Do not revert unrelated untracked or modified files.
