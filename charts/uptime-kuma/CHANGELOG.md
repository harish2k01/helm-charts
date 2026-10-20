# Upgrade notes

## 0.1.3 — 2.5.6-slim

Upgrade from 2.2.1-slim, preserving the slim image variant. Reviewed every release 2.3.0, 2.3.1, 2.3.2, 2.4.0 and 2.5.0–2.5.6 and the [source comparison](https://github.com/louislam/uptime-kuma/compare/2.2.1...2.5.6).

2.3 removes status-page sorting because of performance problems and introduces UPTIME_KUMA_SQLITE_SINGLE_CONNECTION; 2.3.2 restores single-connection SQLite as the default, so no chart override is imposed. If you previously set this variable to false, reconsider it on constrained devices. 2.4–2.5 add notification providers, NTP/SFTP monitors, expanded authentication options, and fixes for SQL migrations, TCP memory use, badges and security dependencies. These are configured in the application and need no extra Kubernetes ports or default credentials. NTP monitoring makes outbound UDP123 requests; SFTP uses its configured target port.

Existing env accepts UPTIME_KUMA_SQLITE_SINGLE_CONNECTION (string true/false). UPTIME_KUMA_DEBUG_INSPECTOR=1 is an opt-in upstream debugging switch; it is deliberately not enabled or exposed. The slim image still omits browser-monitor dependencies; use the full image explicitly if real-browser monitors are required.

Back up /app/data and any external MariaDB before automatic schema migration, including widened status-stat columns and analytics-type fixes. Helm rollback cannot reverse database migrations; restore a matched data backup when downgrading.

Validation: Helm lint, default and SQLite-env/Ingress/HTTPRoute rendering, catalog regeneration/check and catalog tests. Monitor execution and persistent database upgrades were not tested live.
