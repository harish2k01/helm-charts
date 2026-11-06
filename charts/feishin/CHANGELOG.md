# Changelog

## 0.1.1 - 2026-10-21

### Application changes

1.12–1.17 add first-run web settings through `FS_*` environment variables, richer remote/library browsing, DLNA casting, Jellyfin Quick Connect, enhanced timed lyrics and Navidrome 0.64 smart playlist support, with follow-up playback/UI fixes. All documented `FS_*` keys can be set under the existing permissive `env` map; for example `FS_GENERAL_THEME: "defaultDark"`, `FS_GENERAL_LANGUAGE: "en"`, and `FS_GENERAL_FOLLOW_SYSTEM_THEME: "true"`. They apply only when the browser has no persisted app settings and do not overwrite existing browser preferences. Do not put server passwords/private credentials in this client-side configuration.

Existing server preconfiguration, `SERVER_LOCK`, `LEGACY_AUTHENTICATION`, `REMOTE_URL`, `ANALYTICS_DISABLED`, `PUBLIC_PATH` and HTTP port 9180 remain supported. `SERVER_LOCK` requires all of `SERVER_NAME`, `SERVER_TYPE`, and `SERVER_URL`. Desktop MPV/DLNA capabilities do not imply extra ports or host networking for this static web chart. Enhanced lyric delivery requires the corresponding music-server API/plugin and app preference; the chart does not install server plugins. See the [complete environment settings reference](https://github.com/jeffvli/feishin/blob/v1.17.0/docs/ENV_SETTINGS.md).

Reviewed upstream release sequence: [v1.12.0](https://github.com/jeffvli/feishin/releases/tag/v1.12.0), [v1.12.1](https://github.com/jeffvli/feishin/releases/tag/v1.12.1), [v1.13.0](https://github.com/jeffvli/feishin/releases/tag/v1.13.0), [v1.14.0](https://github.com/jeffvli/feishin/releases/tag/v1.14.0), [v1.15.0](https://github.com/jeffvli/feishin/releases/tag/v1.15.0), [v1.15.1](https://github.com/jeffvli/feishin/releases/tag/v1.15.1), [v1.16.0](https://github.com/jeffvli/feishin/releases/tag/v1.16.0), [v1.17.0](https://github.com/jeffvli/feishin/releases/tag/v1.17.0).

### Chart changes

- Pin image/app metadata and image annotation consistently to 1.17.0; refresh schema defaults, chart install examples, repository table and generated catalog.
- Add a complete runtime configuration reference and commented opt-in values, including existing and newly introduced settings; preserve application-owned configuration.

Validation: Helm lint, default rendering, optional configuration/Secret rendering, schema checks and generated-catalog tests. No production workload was modified or live database migration performed.
