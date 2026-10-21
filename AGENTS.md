# Codex Instructions For This Repository

This repository publishes reusable Helm charts through GitHub Pages, GitHub Releases, and GHCR OCI. When adding or changing charts, keep the repository consistent with the existing chart catalog.

For application/dependency upgrade reviews, read [UPGRADE_REVIEW.md](UPGRADE_REVIEW.md) first. It records the datastore evidence policy, configuration audit, targeted review-time checks and delivery requirements used for manual and scheduled reviews.

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

For every new chart, check the [selfh.st icon collection](https://github.com/selfhst/icons) for the application's logo before choosing an icon. Use a matching selfh.st icon when it exists, following the existing URL pattern `https://raw.githubusercontent.com/selfhst/icons/main/png/<icon-name>.png`.

Check the actual collection filename rather than assuming it matches the chart name; a connector or exporter may use its upstream application's logo. Verify that the exact URL returns a successful HTTP response and an image before adding it to `Chart.yaml`. Do this lookup during chart authoring, not as a network dependency in the catalog generator or release checks.

If selfh.st has no matching icon, use a verified, durable upstream project logo when available; otherwise omit `icon` so the catalog displays app initials. Do not use an unrelated logo or invent an icon URL. After adding the icon, run `npm run build:catalog` so the website inherits the same URL from chart metadata.

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
- unofficial chart note naming the maintainer
- install from the Helm repository
- install from OCI
- important usage examples such as Ingress, Gateway API, persistence, secrets, media mounts, debug access, or RBAC
- values table with key, type, default, and description

Use this install pattern:

```bash
helm repo add harish2k01 https://charts.harish2k01.in
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
> This is an unofficial Helm chart maintained by [Harish](https://github.com/harish2k01). It is not affiliated with or endorsed by the upstream project. For chart issues, questions, or improvements, please open an issue in the [harish2k01/helm-charts](https://github.com/harish2k01/helm-charts) repository.
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

Keep StatefulSet volumeClaimTemplates metadata stable across chart/app upgrades. Do not use the common version-bearing labels helper inside claim templates. Use stable identity labels and explicit pinned compatibility values for existing installations; removing historical labels is also an immutable change. Add tests comparing complete claim templates across simulated chart/app-version changes, while verifying normal workload version labels still update. Do not use destructive resource replacement or cluster-dependent lookup as an automatic workaround.

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

## Catalog website

The site in `docs/` uses `docs/index.html`, `docs/assets/catalog.css`, and `docs/assets/catalog.js`. `docs/assets/homelab-mark.svg` is Harish's H/home/server mark and favicon.

After adding, removing, renaming, or updating a chart, update the root README catalog row and run:

```bash
npm ci --ignore-scripts
npm run build:catalog
npm run check:catalog
npm run test:catalog
```

Commit the generated `docs/catalog.json`. The generator reads versions, descriptions, and original app icon URLs from `charts/*/Chart.yaml`, and categories from the root README. Do not hand-edit generated JSON or duplicate chart cards/counts in HTML. Use app initials when an icon is absent or fails; do not substitute arbitrary app icons.

Preserve the approved app catalog design for catalog-only updates: all matching charts in normal page flow without pagination, search/category filters, chart detail dialog with Helm and OCI commands, icon-only sun/moon theme control, and GitHub/Artifact Hub/signing-key links beside the hero content. Describe Harish as the maintainer; do not claim community maintenance or support. Keep the canonical repository URL `https://charts.harish2k01.in` consistent with the release workflow and installation examples.

For website changes, verify desktop/mobile layouts, light/dark appearance including the first paint, search and empty states, keyboard dialog navigation, both installation sources and copying, plus icon/catalog load failures. Do not redesign the page for catalog-only changes.

## Validation

### Tests for new and changed charts

When adding a chart, add the relevant `tests/<chart-name>*.test.mjs` coverage using Node's built-in test runner and the existing Helm-rendering test patterns. Test the default workload and important supported options, especially Secret references, persistence, service/probe ports, routing and any special startup/configuration behavior. Exercise schema rejection of meaningful invalid inputs where applicable. Prefer assertions about user-visible behavior and regressions over snapshots or checks that merely repeat implementation details.

When changing an existing chart, update its relevant tests and add coverage for new behavior or a fixed bug. If it has no dedicated test yet, add focused coverage for the behavior being introduced or changed. Keep test fixtures and assumptions aligned with values/templates; do not weaken assertions solely to make a failure pass. Review supporting scripts, schema, README, changelog, metadata and generated catalog together as applicable. A new catalog entry does not establish application-specific test coverage.

`Lint Charts` discovers `tests/*.test.mjs` automatically, so use that location and filename suffix; do not add a separate GitHub workflow for each chart. The chart-coverage check requires a file named `<chart-name>.test.mjs` or `<chart-name>-<purpose>.test.mjs` for every chart. That presence check is a minimum guard, not proof of meaningful or exhaustive coverage. Run `node --test tests/*.test.mjs` before delivery and report failures or unavailable tools. Use disposable runtime checks only where the change needs them, following `UPGRADE_REVIEW.md`; never test against production state. Do not equate Helm rendering tests with upstream application runtime or migration compatibility.

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
