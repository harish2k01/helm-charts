# Chart tests

Run from the repository root with Helm and Node.js installed:

```sh
npm ci --ignore-scripts
node --test tests/*.test.mjs
```

The existing Lint Charts workflow runs this suite. Chart tests render Kubernetes manifests locally; they do not install releases, contact the cluster or run database upgrades. Shared helpers in `helpers/` parse rendered YAML and check relationships such as Service selectors, target ports, probes and existing PVC mounts.

Each chart has a dedicated `<chart-name>*.test.mjs` file. The coverage check detects charts with no matching file, but reviewers must still assess assertion quality. Coverage focuses on chart contracts: defaults, supported configuration branches, Secret and PVC reuse, database resource selection, routing and invalid configurations where supported. It is not exhaustive across all Kubernetes values, upstream features, database versions or production environments.

For new charts, add behavior-specific tests rather than copying assertions about unrelated applications. For changed charts, extend relevant tests for changed user behavior. Keep independent datastore versions unchanged unless the upstream evidence gate in `../UPGRADE_REVIEW.md` permits a change. Disposable runtime smoke scripts remain review-time tools rather than additional standing workflows.
