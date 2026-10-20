# Changelog

## 0.1.3

### Application upgrade from v3.4.6 to v3.5.2

v3.5.0 adds Turnstile request support and formatted file logs and returns the container to Python 3.11. v3.5.1 adds `BROWSER_WAIT_TIMEOUT`, fixes challenge verification and cookies collected after `waitInSeconds`, disables the Chromium Local Network Access popup, and updates Chromium/dependencies. v3.5.2 fixes binary packaging. The container still supplies its own browser, Python, and entrypoint.

Set `env.BROWSER_WAIT_TIMEOUT: "3"` on slow hosts; the default `"1"` retains the previous fixed one-second wait. This controls each browser state wait, while request `maxTimeout` still controls the API request timeout. The new `tabs_till_verify` request field and `turnstile_token` result are API features; clients choose them per request, so no chart-wide defaults are introduced. File logging remains opt-in via `env.LOG_FILE` and a writable `extraVolumeMounts` destination.

The HTTP port (8191), `/health` probes, optional metrics port (8192), and persistence behavior remain unchanged. Keep the API internal or restrict access because it can initiate browser requests.

Sources: [intervening changelog](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/CHANGELOG.md), [source comparison](https://github.com/FlareSolverr/FlareSolverr/compare/v3.4.6...v3.5.2), and [environment configuration](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/README.md#environment-variables).

### Runtime configuration coverage

The values comments cover all 17 documented target environment variables, including existing logging, proxy, browser, host/port, startup test, and metrics settings. Add optional `envFrom` so proxy credentials can come from Secrets rather than committed literal values. Document matching metrics port hooks without enabling metrics. The app is stateless and has no database schema migration; browser sessions are in memory. Request-only API fields and app-initialized certificate variables are classified separately from deployment settings.

Sources: [complete target environment table](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/README.md#environment-variables), [app environment parser](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/src/flaresolverr.py), and [browser configuration](https://github.com/FlareSolverr/FlareSolverr/blob/v3.5.2/src/utils.py).
