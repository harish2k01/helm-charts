# navidrome runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 142 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/navidrome/navidrome/blob/v0.64.2/conf/configuration.go), [full application comparison](https://github.com/navidrome/navidrome/compare/v0.61.2...v0.64.2).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `ND_CONFIGFILE` | "./navidrome.toml" | Load configurations from an external config file |
| `ND_MUSICFOLDER` | "./music" | Folder where your music library is stored. Can be read-only. This becomes the default library when using multi-library setup |
| `ND_DATAFOLDER` | "./data" | Folder to store application data (DB) |
| `ND_CACHEFOLDER` | "dynamic/cache" | Folder to store cache data (transcoding, images...) |
| `ND_LOGLEVEL` | "info" | Log level. Useful for troubleshooting. Possible values: error, warn, info, debug, trace |
| `ND_LOGFILE` | _Empty_ (log to stderr) | Path to log file for output. When specified, logs will be written to this file instead of stderr |
| `ND_ADDRESS` | 0.0.0.0 and :: (all IPs) | Address the server will bind to. Can be an IPv4, IPv6 or a UNIX socket file (unix:/path/to/file) |
| `ND_BASEURL` | _Empty_ | Base URL to configure Navidrome behind a proxy (examples: /music, https://music.example.com) |
| `ND_PORT` | 4533 | HTTP port Navidrome will listen to |
| `ND_ENABLEINSIGHTSCOLLECTOR` | true | Controls whether the server will run its Anonymous Data Collection feature to help improve the project. |
| `ND_AGENTS` | "deezer,lastfm,listenbrainz" | Comma-separated list of metadata agents to use for retrieving artist information, biographies, and images. Available agents: lastfm, listenbrainz, and deezer. The order determines priority - agents are tried in the specified order until one succeeds. Only enabled and configured agents will be used. |
| `ND_ALBUMPLAYCOUNTMODE` | "absolute" | Change how album play count is computed. When set to "normalized", album play count will be divided by the number of album tracks |
| `ND_AUTHREQUESTLIMIT` | 5 | How many login requests can be processed from a single IP during the AuthWindowLength. Set to 0 to disable the limit rater |
| `ND_AUTHWINDOWLENGTH` | "20s" | Window Length for the authentication rate limit |
| `ND_AUTOIMPORTPLAYLISTS` | true | Enable/disable .m3u playlist auto-import |
| `ND_AUTOTRANSCODEDOWNLOAD` | false | Use the client's transcoding configuration for downloads, if the client does not specify the desired format. If false, the original format will be used, without any transcoding. |
| `ND_DEFAULTPLAYLISTPUBLICVISIBILITY` | false | Set imported playlists as public by default |
| `ND_ARTISTARTPRIORITY` | "artist.*, album/artist.*, external" | Configure the order to look for artist images. |
| `ND_ARTISTIMAGEFOLDER` | _Empty_ | Configure a centralized folder for artist image lookups. When set and image-folder is included in ArtistArtPriority, Navidrome looks for images in this folder named after the artist's MusicBrainz ID or name |
| `ND_BACKUP_PATH` | "" (disabled) | Path to store backups. Set to "" to disable backups. Click here for details |
| `ND_BACKUP_SCHEDULE` | "" (disabled) | Schedule for automatic backups. Use Cron syntax |
| `ND_BACKUP_COUNT` | 0 (disabled) | Number of backups to keep |
| `ND_COVERARTPRIORITY` | "cover.*, folder.*, front.*, embedded, external" | Configure the order to look for cover art images. Use special embedded value to get embedded images from the audio files |
| `ND_COVERARTQUALITY` | 75 | Set quality percentage for resized cover art images (JPEG and WebP. Does not apply to PNG) |
| `ND_DEEZER_ENABLED` | true | Set this to false to completely disable Deezer integration |
| `ND_DEEZER_LANGUAGE` | "en" | Language to be used by Deezer integration |
| `ND_DEFAULTDOWNSAMPLINGFORMAT` | "opus" | Format to transcode to when client requests downsampling (specify maxBitrate without a format) |
| `ND_DEFAULTLANGUAGE` | "en" | Sets the default language used by the UI when logging in from a new browser. This value must match one of the file names in the resources/i18n. Ex: for Chinese Simplified it has to be zh-Hans (case sensitive) |
| `ND_DEFAULTTHEME` | "Dark" | Sets the default theme used by the UI when logging in from a new browser. This value must match one of the options in the UI |
| `ND_DEFAULTSHAREEXPIRATION` | "8760h" (1 year) | Sets the default expiration time for new shares (public links). Accepts durations like "24h" or "45m". |
| `ND_DEFAULTDOWNLOADABLESHARE` | false | Sets the default downloadable state for new shares (public links). When enabled, newly created shares will be downloadable by default |
| `ND_DEFAULTUIVOLUME` | 100 | Sets the default volume used by the UI when logging in from a new browser. This value must be between 0 and 100 |
| `ND_DISCARTPRIORITY` | "disc*.*, cd*.*, cover.*, folder.*, front.*, discsubtitle, embedded" | Configure the priority order for disc-level cover art sources in multi-disc albums. Uses the same pattern format as CoverArtPriority. The special keyword discsubtitle matches image files whose filenames equal the disc's subtitle |
| `ND_ENFORCENONROOTUSER` | false | When enabled on Unix-like systems, Navidrome will exit with an error if it detects it's running as root (UID 0). This validation happens early, before any filesystem operations. This option has no effect on Windows systems |
| `ND_ENABLEARTWORKPRECACHE` | true | Enable image pre-caching of new added music |
| `ND_ENABLEARTWORKUPLOAD` | true | Enable artwork upload functionality for playlists, artists, and internet radios via the web UI. Accepted formats: JPEG, PNG, WebP, GIF (max 10 MB). When disabled, only admins can upload artwork |
| `ND_MAXIMAGEUPLOADSIZE` | 10MB | Maximum allowed image upload size in for artwork uploads |
| `ND_MAXIMAGESIZE` | 20MB | Largest artwork image Navidrome reads, from your files or from external URLs. Navidrome skips larger images. If set below MaxImageUploadSize, Navidrome raises it to that value |
| `ND_ENABLECOVERANIMATION` | true | Controls whether the player in the UI will animate the album cover (rotation) |
| `ND_ENABLEDOWNLOADS` | true | Enable the option in the UI to download music/albums/artists/playlists from the server |
| `ND_ENABLEEXTERNALSERVICES` | true | Set this to false to completely disable ALL external integrations, including the anonymous data collection and the nice login background images |
| `ND_ENABLEFAVOURITES` | true | Enable toggling "Heart"/"Loved" for songs/albums/artists in the UI (maps to "Star"/"Starred" in Subsonic Clients) |
| `ND_ENABLEGRAVATAR` | false | Use Gravatar images as the user profile image. Needs the user's email to be filled |
| `ND_ENABLELOGREDACTING` | true | Whether or not sensitive information (like tokens and passwords) should be redacted (hidden) in the logs |
| `ND_ENABLEM3UEXTERNALALBUMART` | false | Allow HTTP/HTTPS URLs in M3U #EXTALBUMARTURL directives for playlist artwork. Local file paths are always accepted regardless of this setting |
| `ND_ENABLEMEDIAFILECOVERART` | true | If set to false, it will return the album CoverArt when a song CoverArt is requested |
| `ND_ENABLENATURALSORTING` | false | Sort names containing numbers in human order (Foo 2 before Foo 10). Off by default because it can slow down large libraries, see #6015 |
| `ND_ENABLENOWPLAYING` | true | Enable/disable the Now Playing feature that tracks what songs users are currently listening to. When disabled, the "Now Playing" functionality and admin panel will be unavailable |
| `ND_ENABLEREPLAYGAIN` | true | Enable ReplayGain options in the UI |
| `ND_ENABLESCHEDULEDDBANALYZE` | true | Every 30 minutes, check if the database query statistics are more than 24 hours old or were marked stale by a database change, and refresh them with SQLite's ANALYZE. Navidrome skips the check while a scan runs. Stale statistics can make queries slow on large libraries |
| `ND_ENABLESCROBBLEHISTORY` | true | Enable/disable scrobble history |
| `ND_ENABLESHARING` | true | Enable the Sharing feature |
| `ND_ENABLESTARRATING` | true | Enable 5-star ratings in the UI |
| `ND_ENABLETRANSCODINGCONFIG` | false | Enables transcoding configuration in the UI |
| `ND_ENABLEUSEREDITING` | true | Enable regular users to edit their details and change their password |
| `ND_ENABLEWEBPENCODING` | false | Encode resized cover art as WebP instead of JPEG/PNG. Produces smaller images, at the cost of more CPU when resizing. Some older clients may not be able to display WebP images |
| `ND_EXTAUTH_TRUSTEDSOURCES` | _Empty_ | Comma separated list of IP CIDRs (or when listening on a UNIX socket the special value @) which are allowed to use reverse proxy authentication. Empty means "deny all". Click here for details. Note: This option is unnecessary for most reverse proxy setups, only for _authenticating_ reverse proxies. |
| `ND_EXTAUTH_USERHEADER` | "Remote-User" | HTTP header containing the user name from an authenticating proxy. Click here for details. |
| `ND_EXTAUTH_LOGOUTURL` | _Empty_ | URL to redirect users to after logout when using externalized authentication. Allows completing logout from the external auth provider (SSO, OIDC, etc.) |
| `ND_FFMPEGPATH` | _Empty_ (search in the PATH) | Path to ffmpeg executable. Use it when Navidrome cannot find it, or you want to use a specific version |
| `ND_GATRACKINGID` | _Empty_ (disabled) | Send basic info to your own Google Analytics account. Must be in the format UA-XXXXXXXX |
| `ND_HTTPHEADERS_FRAMEOPTIONS` | "DENY" | Allows the X-Frame-Options header value to be set with a custom value. Ex: "SAMEORIGIN" |
| `ND_IGNOREDARTICLES` | "The El La Los Las Le Les Os As O A" | List of ignored articles when sorting/indexing artists |
| `ND_IMAGECACHESIZE` | "100MB" | Size of image (art work) cache. Set to "0" to disable cache |
| `ND_INDEXGROUPS` | "A B C D E F G H I J K L M N O P Q R S T U V W X-Z(XYZ) Unknown" | Space-separated list of entries used to build the artist/folder index (the alphabetical shortcut list). Each entry is normally a single character, but can be a multi-character label (e.g. The) or a group like X-Z(XYZ), which displays as X-Z and links anything starting with X, Y or Z. Anything not covered is placed under # |
| `ND_INSPECT_BACKLOGLIMIT` | 100 | Backlog limit for inspect request throttling |
| `ND_INSPECT_BACKLOGTIMEOUT` | "1m" | Backlog timeout for inspect request throttling |
| `ND_INSPECT_ENABLED` | true | Enable/disable inspect endpoints |
| `ND_INSPECT_MAXREQUESTS` | 1 | Maximum concurrent inspect requests |
| `ND_JELLYFIN_ENABLED` | false | Enable the experimental Jellyfin API, so Jellyfin music clients can connect to Navidrome |
| `ND_JELLYFIN_SERVERNAME` | "Navidrome dynamic" | Server name that Jellyfin clients show |
| `ND_JELLYFIN_EXPOSEDPUBLICUSERS` | _Empty_ (no users shown) | Comma-separated list of usernames that Jellyfin clients can show on their login screen. Anyone who can reach the server can see this list |
| `ND_JELLYFIN_AUTODISCOVERY` | false | Answer Jellyfin client searches on the local network (UDP port 7359), so clients can find the server without a typed address |
| `ND_JELLYFIN_QUICKCONNECT` | true | Let users log in new Jellyfin client devices with a 6-digit code, approved from the web UI or another logged-in client |
| `ND_JELLYFIN_MAXCONCURRENTSTREAMS` | Half the DB connection pool, at least 2 | How many large list responses Navidrome sends to Jellyfin clients at the same time. Each one holds a database connection until it ends. Extra requests wait |
| `ND_JUKEBOX_ENABLED` | false | Enable Jukebox mode (play audio on server's hardware) Click here for details |
| `ND_JUKEBOX_ADMINONLY` | true | By default, Jukebox mode is only available to Admins. Set this option to false to allow any valid user to control it |
| `ND_JUKEBOX_DEFAULT` | _Empty_ (auto detect) | Device to use for Jukebox mode, if there are multiple Jukebox.Devices entries. Click here for details |
| `ND_LASTFM_ENABLED` | true | Set this to false to completely disable Last.fm integration |
| `ND_LASTFM_APIKEY` | _Empty_ | Last.fm API Key Secret/sensitive: use an existing Secret. |
| `ND_LASTFM_SECRET` | _Empty_ | Last.fm API Secret Secret/sensitive: use an existing Secret. |
| `ND_LASTFM_LANGUAGE` | "en" | Two letter-code for language to be used to retrieve biographies from Last.fm |
| `ND_LASTFM_SCROBBLEFIRSTARTISTONLY` | false | When enabled, only the first artist will be scrobbled for tracks with multiple artists, instead of the display artist or concatenated list |
| `ND_LISTENBRAINZ_BASEURL` | https://api.listenbrainz.org/1/ | Set this to override the default ListenBrainz base URL (useful with self-hosted solutions like Maloja\* |
| `ND_LISTENBRAINZ_ENABLED` | true | Set this to false to completely disable ListenBrainz integration |
| `ND_LISTENBRAINZ_ARTISTALGORITHM` | "session_based_days_9000_session_300_contribution_5_threshold_15_limit_50_skip_30" | Algorithm used when querying the ListenBrainz Labs similar-artists API for similar artists. Only change this if you know what you are doing |
| `ND_LISTENBRAINZ_TRACKALGORITHM` | "session_based_days_9000_session_300_contribution_5_threshold_15_limit_50_skip_30" | Algorithm used when querying the ListenBrainz Labs similar-recordings API for similar/top songs. Only change this if you know what you are doing |
| `ND_LYRICSPRIORITY` | ".ttml,.yaml,.yml,.elrc,.lrc,.srt,.txt,embedded" | Controls the order and sources for fetching lyrics. Comma-separated list of sources checked in order: embedded (from tags), file extensions like .lrc, .txt, or any custom extension. Navidrome will search for lyrics files with the same name as the audio file but with the specified extension. |
| `ND_MAXSIDEBARPLAYLISTS` | 100 | Set the maximum number of playlists shown in the UI's sidebar. Note that a very large number can cause UI performance issues. |
| `ND_MATCHER_FUZZYTHRESHOLD` | 85 | Minimum similarity score (0-100) for the fuzzy matcher when looking up similar songs. Higher values require closer matches |
| `ND_MATCHER_PREFERSTARRED` | true | Bias the fuzzy matcher toward starred and highly-rated tracks when scoring similar songs |
| `ND_MPVPATH` | _Empty_ (search in PATH) | Path to mpv executable. Used for Jukebox mode |
| `ND_MPVCMDTEMPLATE` | mpv --audio-device=%d --no-audio-display %f --input-ipc-server=%s | Cmd template used to construct the call of the mpv executable. Used for Jukebox mode |
| `ND_PASSWORDENCRYPTIONKEY` | - | Passphrase used to encrypt passwords in the DB. Click here for details Secret/sensitive: use an existing Secret. |
| `ND_PID_ALBUM` | albumartistid,album,albumversion,releasedate | Set the tag(s) to use as the Album ID. Click here for details |
| `ND_PID_TRACK` | albumid,discnumber,tracknumber,title | Set the tag(s) to use as the Track ID. Click here for details |
| `ND_PLAYLISTSPATH` | _Empty_ (meaning any playlist files in your library will be imported) | Limit where to search for and import playlists from. Can be a list of folders/globs (separated by : (or ; on Windows). Paths **MUST** be relative to MusicFolder |
| `ND_PLUGINS_ENABLED` | true | Enable the plugin system |
| `ND_PLUGINS_FOLDER` | "dynamic/plugins" | Folder where your plugins are stored. Place your .ndp files in here |
| `ND_PLUGINS_AUTORELOAD` | false | Automatically detect when .ndp files in Plugins.Folder are updated and reload plugins immediately |
| `ND_PLUGINS_LOGLEVEL` | LogLevel (LogLevel of your Navidrome instance) | Log level. Useful for troubleshooting. Possible values: error, warn, info, debug, trace |
| `ND_PLUGINS_CACHESIZE` | "200MB" | Size of the plugin compilation cache |
| `ND_PREFERSORTTAGS` | false | Use Sort\_\* tags to sort columns in the UI. |
| `ND_PROMETHEUS_ENABLED` | false | Enable extra endpoint with Prometheus metrics. |
| `ND_PROMETHEUS_METRICSPATH` | "/metrics" | Custom path for Prometheus metrics. Useful for blocking unauthorized metrics requests. |
| `ND_PROMETHEUS_PASSWORD` | _Empty_ (no password/authentication) | Enables Basic Auth protection for Prometheus endpoint. User will be navidrome. Leave empty to disable Basic Auth protection. Secret/sensitive: use an existing Secret. |
| `ND_RECENTLYADDEDBYMODTIME` | false | Uses music files' modification time when sorting by "Recently Added". Otherwise use import time |
| `ND_SCANNER_ENABLED` | true | Enable/disable the scanner. Set to false to disable automatic scanning of the music library. |
| `ND_SCANNER_SCHEDULE` | 0 (disabled) | Schedule for automatic scans. Use Cron syntax |
| `ND_SCANNER_WATCHERWAIT` | "5s" | Time to wait after a file change is detected before starting a scan. Useful to avoid scanning incomplete files. Set it to 0 to disable the watcher |
| `ND_SCANNER_SCANONSTARTUP` | true | Enable/disable scanning the music library on startup. Set to false to disable |
| `ND_SCANNER_ARTISTJOINER` | " • " | Character string used to join multiple artists in display. Change this if you prefer a different separator between artist names |
| `ND_SCANNER_ARTISTSPLITEXCEPTIONS` | _Empty_ | Comma-separated list of artist names that must never be split by the artist tag separators. Use this to protect names that legitimately contain a separator character (e.g. AC/DC) |
| `ND_SCANNER_FOLLOWSYMLINKS` | true | Whether to follow symbolic links when scanning directories. When enabled, the scanner will traverse symlinked directories and include their contents in the library. When disabled, symlinked directories are ignored during scanning |
| `ND_SCANNER_IGNOREDOTFOLDERS` | true | Whether to ignore folders whose name starts with a dot (e.g. .stfolder) when scanning. Set to false to index dot-prefixed folders |
| `ND_SCANNER_PURGEMISSING` | "never" | Controls when missing files, albums, and artists are purged from the database during scans. Possible values: "never" (default, just mark as missing), "always" (purge after every scan), "full" (purge only after a full scan). |
| `ND_SEARCH_BACKEND` | "fts" | Select the search backend. fts uses FTS5 full-text search with BM25 ranking. legacy uses the previous search implementation |
| `ND_SEARCH_FULLSTRING` | false | Match query strings anywhere in searchable fields, not only in word boundaries. Useful for languages where words are not space separated |
| `ND_SESSIONTIMEOUT` | "48h" | How long Navidrome will wait before closing web ui idle sessions |
| `ND_SHAREURL` | _Empty_ (use server address) | Base URL for shared links. Useful when your server address is not a public (ex: when using Tailscale). See discussion here |
| `ND_SMARTPLAYLISTREFRESHDELAY` | "5s" | How often to refresh Smart Playlists. Check the smart playlists docs |
| `ND_SUBSONIC_APPENDSUBTITLE` | true | Append the subtitle tag to the song title in all Subsonic API responses |
| `ND_SUBSONIC_ARTISTPARTICIPATIONS` | false | When Subsonic clients request artist's albums, include albums where the artist participates (ex: Various Artists compilations) |
| `ND_SUBSONIC_APPENDALBUMVERSION` | true | Append album version/edition information to album names in Subsonic API responses (e.g., "Album Name (Deluxe Edition)") |
| `ND_SUBSONIC_DEFAULTREPORTREALPATH` | false | Set to true to report the real path of the music files in the API. Can be customized individually for each client/player. This can be a security risk, so it is disabled by default |
| `ND_SUBSONIC_ENABLEAVERAGERATING` | true | Controls whether the averageRating attribute is included in Subsonic API responses. When disabled, the average rating across all users is not exposed in API responses, though it is still calculated internally. Set to false to hide other users' rating data |
| `ND_SUBSONIC_LEGACYCLIENTS` | "DSub" | List of clients that does not work with the new OpenSubsonic API improvements. |
| `ND_SUBSONIC_MINIMALCLIENTS` | "SubMusic" | List of clients that should receive a minimal response for songs and playlists, containing only the bare minimum fields (id, title, etc). Useful for clients that get confused by the extra metadata |
| `ND_TLSCERT` | _Empty_ (disable TLS) | Path for the TLS certificate file, which should include the signature chain if any |
| `ND_TLSKEY` | _Empty_ (disable TLS) | Path for the TLS key file |
| `ND_TRANSCODING_ENABLECANCELLATION` | false | Stop the underlying ffmpeg process as soon as a client disconnects mid-stream (e.g. when the user skips, stops, or closes playback). Disabled by default so that an in-progress transcode runs to completion even after the client disconnects: the finished file is stored in the transcoding cache and served instantly the next time it is requested. Enable this to free CPU immediately on disconnect, at the cost of discarding that partially-transcoded work |
| `ND_TRANSCODING_MAXCONCURRENT` | 0 (unlimited) | Maximum number of concurrent transcodes server-wide. Set to 0 for unlimited. Helps prevent an ffmpeg-based denial of service |
| `ND_TRANSCODING_MAXCONCURRENTPERUSER` | 0 (unlimited) | Maximum number of concurrent transcodes per user. Set to 0 for unlimited |
| `ND_TRANSCODINGCACHESIZE` | "100MB" | Size of transcoding cache. Set to "0" to disable cache |
| `ND_UICOVERARTSIZE` | 300 | Size (in pixels) of the cover art images requested by the web UI. Larger values look sharper on high-DPI displays, but use more bandwidth and cache space. Values are clamped to the range 200-1200 |
| `ND_UILOGINBACKGROUNDURL` | _random music image from this Unsplash.com collection_ | Change background image used in the Login page |
| `ND_UIPLAYBACKREPORTINTERVAL` | "1m" | How often the web UI reports playback progress to the server (used by the Now Playing feature and the playbackReport OpenSubsonic extension) |
| `ND_UISEARCHDEBOUNCEMS` | 200 | Debounce delay in milliseconds for the search input in the UI. Higher values reduce search requests while typing |
| `ND_UIWELCOMEMESSAGE` | _Empty_ | Add a welcome message to the login screen |
| `ND_UNIXSOCKETPERM` | "0660" | Set file permissions for Unix Socket File.\* |
| `ND_SYSTEMD_PRIORITY_LOGGING` | _Empty_ (disabled) | Enable syslog priority prefixes for systemd-journald. Both this variable and the JOURNAL_STREAM environment variable must be set for journal format logging to activate |
| `ND_SCANNER_EXTRACTOR` | taglib (image backend) | Advanced scanner metadata extraction backend; retain the image-supported default unless troubleshooting. |

## Existing Secrets and files

The chart does not create application credentials. Reference an existing Secret with `envFrom`; its keys must be the exact environment names in the table. Explicit `env` entries take precedence, so remove any conflicting entry when moving it to a Secret.

```yaml
envFrom:
  - secretRef:
      name: application-runtime
extraVolumes:
  - name: runtime-files
    secret:
      secretName: application-files
extraVolumeMounts:
  - name: runtime-files
    mountPath: /run/application-secrets
    readOnly: true
```

Config-file-only options remain supported by the application UI and its existing persistent config volume. Mount additional files with `extraVolumes`/`extraVolumeMounts` when necessary. Avoid replacing the entire writable config directory with a read-only ConfigMap/Secret: apps write configuration and migration state there. No existing config file is generated or overwritten by this chart.

## File-only, internal and database options

The [public configuration reference](https://www.navidrome.org/docs/usage/configuration/options/) was checked against target-version `configOptions` and nested structs. Nested names use `_` separators (`ND_SCANNER_SCHEDULE`, not `ND_SCANSCHEDULE`). `ND_CONFIGFILE` can select a mounted TOML file; default image paths are `/data`, `/music`, `/data/navidrome.toml`. Complex `Tags`, custom `HTTPHeaders`, `DevLogLevels` maps and plugin manifests are file-based structures; use the persisted TOML/mounted files rather than inventing JSON-in-env formats. `Dev*` flags, computed BasePath/BaseHost/BaseScheme and computed language lists are internal/debug fields, not supported production configuration examples. Deprecated aliases remain accepted upstream but are not new chart defaults: use ExtAuth.TrustedSources/UserHeader, HTTPHeaders.FrameOptions, CoverArtQuality, Matcher.FuzzyThreshold and Transcoding.EnableCancellation replacements. Removed Spotify.ID/Secret settings should be deleted.

All application state uses embedded SQLite under `/data`; there is no supported external PostgreSQL/MySQL setting or database image to bump. Upstream 0.63 makes sharing default-on when unset. This chart leaves it unset to preserve explicit persisted choices; set `env.ND_ENABLESHARING: "false"` to retain the old default behavior. `ND_JELLYFIN_ENABLED` stays optional/off upstream. UDP discovery remains optional and requires network/Service exposure in addition to its env setting.
