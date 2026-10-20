# Changelog

## 0.2.0

### Application upgrade from 2.1.0 to 2.1.6

The intervening patch releases fix protocol validation, symlink handling, permissions, folder health checks, SQLite connection/migration behavior, introducer authorization, and HTTP/network handling. 2.1.5 has no separate detailed release notes and there is no GitHub release entry for 2.1.4; the complete tag-to-tag source comparison covers those commits. The grouping, proxy, block-indexing, and GUI-session options repeated in 2.1.6 release notes were already available in 2.1.0. They are configured in Syncthing rather than new chart defaults.

The target includes a SQLite migration that sets directory/non-file sizes to zero. Back up the persistent Syncthing home and configuration with the process stopped before upgrading. The default startup probe allows up to ten minutes for startup before liveness checks begin; increase `startupProbe.failureThreshold` for a larger library. Restore a consistent pre-upgrade snapshot if rollback is required rather than assuming a binary downgrade reverses database changes.

The official container entrypoint, PUID/PGID ownership settings, `/var/syncthing` storage, HTTP health path, and sync/discovery ports remain compatible. Deprecated `cacheIgnoredFiles` and `urPostInsecurely` configuration fields are removed upstream; review externally managed configuration using these fields. Keep one writer per Syncthing home/PVC.

Sources: [release history](https://github.com/syncthing/syncthing/releases), [complete source comparison](https://github.com/syncthing/syncthing/compare/v2.1.0...v2.1.6), [SQLite migration](https://github.com/syncthing/syncthing/blob/v2.1.6/internal/db/sqlite/sql/migrations/folder/06-zero-size-dirs.sql), and [configuration source](https://github.com/syncthing/syncthing/blob/v2.1.6/lib/config/optionsconfiguration.go).

### Runtime configuration coverage

Audit the official Dockerfile/entrypoint, target CLI struct and environment manual, and persisted GUI/folder/options structs. Commented values now cover ownership/umask/capabilities, persistent directories, GUI/API Secret references, SQLite maintenance and retention, audit/logging, startup, proxies, and diagnostic settings. Operator-facing settings remain opt-in. Internal process markers, Windows-only settings and build arguments are classified separately. Folder grouping/block indexing and GUI session options remain persisted GUI/API configuration rather than being overwritten at startup. The target continues to use its built-in SQLite database; it does not require an external database version change.

Sources: [container contract](https://github.com/syncthing/syncthing/blob/v2.1.6/Dockerfile), [entrypoint](https://github.com/syncthing/syncthing/blob/v2.1.6/script/docker-entrypoint.sh), [CLI/environment contract](https://github.com/syncthing/syncthing/blob/v2.1.6/cmd/syncthing/main.go), [manual](https://github.com/syncthing/syncthing/blob/v2.1.6/man/syncthing.1), and [GUI configuration](https://github.com/syncthing/syncthing/blob/v2.1.6/lib/config/guiconfiguration.go).
