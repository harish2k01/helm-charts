# feishin runtime configuration

This chart passes the existing/new supported runtime options through the extensible `env` map; 103 documented names are listed below. Optional examples in `values.yaml` are commented so they cannot enable a feature or override an existing application setting. All environment values must be quoted strings. Upstream defaults are distinct from chart defaults. Environment overrides take precedence over persisted app configuration.

Sources: [target-version configuration](https://github.com/jeffvli/feishin/blob/v1.17.0/docs/ENV_SETTINGS.md), [full application comparison](https://github.com/jeffvli/feishin/compare/v1.11.0...v1.17.0).

| Environment variable | Upstream default when unset | Purpose |
| --- | --- | --- |
| `SERVER_NAME` | empty | Preconfigured music server display name |
| `SERVER_TYPE` | empty | Preconfigured protocol: jellyfin, navidrome or subsonic |
| `SERVER_URL` | empty | Music server URL accessible from browser |
| `SERVER_LOCK` | false | Lock server fields when name/type/URL are all supplied |
| `REMOTE_URL` | empty | External URL for the configured server |
| `LEGACY_AUTHENTICATION` | empty in image; chart=false | Subsonic plaintext authentication flag |
| `ANALYTICS_DISABLED` | empty in image; chart=false | Disable web analytics |
| `PUBLIC_PATH` | / | Web hosting path; change routing/probes together |
| `FS_GENERAL_ACCENT` | rgb(53, 116, 252) | general.accent: CSS rgb(r, g, b) string (e.g. rgb(53, 116, 252)). Invalid values are ignored. |
| `FS_GENERAL_ALBUM_BACKGROUND` | false | general.albumBackground: true / false — Show album background image. |
| `FS_GENERAL_ALBUM_BACKGROUND_BLUR` | 3 | general.albumBackgroundBlur: Blur amount for album background (number). |
| `FS_GENERAL_ARTIST_BACKGROUND` | true | general.artistBackground: true / false — Show artist background image. |
| `FS_GENERAL_ARTIST_BACKGROUND_BLUR` | 3 | general.artistBackgroundBlur: Blur amount for artist background (number). |
| `FS_GENERAL_BLUR_EXPLICIT_IMAGES` | false | general.blurExplicitImages: true / false — Blur explicit images. |
| `FS_GENERAL_COMBINED_LYRICS_AND_VISUALIZER` | false | general.combinedLyricsAndVisualizer: true / false — Combine lyrics and visualizer panel. |
| `FS_GENERAL_ENABLE_GRID_MULTI_SELECT` | false | general.enableGridMultiSelect: true / false — Enable multi-select in grid views. |
| `FS_GENERAL_EXTERNAL_LINKS` | true | general.externalLinks: true / false — Show external links in UI. |
| `FS_GENERAL_FOLLOW_CURRENT_SONG` | true | general.followCurrentSong: true / false — Follow current song in list. |
| `FS_GENERAL_FOLLOW_SYSTEM_THEME` | false | general.followSystemTheme: true / false — Use OS light/dark preference. |
| `FS_GENERAL_HOME_FEATURE` | true | general.homeFeature: true / false — Show home featured carousel. |
| `FS_GENERAL_HOME_FEATURE_STYLE` | single | general.homeFeatureStyle: multiple / single - Home featured carousel style. |
| `FS_GENERAL_IMAGE_PLACEHOLDER_PRIORITY` | thumbhash | general.imagePlaceholderPriority: thumbhash / blurhash / dominantColor / off - Which image placeholder shows first while art loads; off disables placeholders. |
| `FS_GENERAL_LANGUAGE` | en | general.language: UI language code (e.g. en, de, fr). |
| `FS_GENERAL_THEME` | defaultDark | general.theme: One of: ayuDark, ayuLight, catppuccinLatte, catppuccinMocha, defaultDark, defaultLight, dracula, githubDark, githubLight, glassyDark, gruvboxDark, gruvboxLight, highContrastDark, highContrastLight, materialDark, materialLight, monokai, nightOwl, nord, oneDark, rosePine, rosePineDawn, rosePineMoon, shadesOfPurple, solarizedDark, solarizedLight, tokyoNight, vscodeDarkPlus, vscodeLightPlus. |
| `FS_GENERAL_THEME_DARK` | defaultDark | general.themeDark: Same as theme (used when system is dark). |
| `FS_GENERAL_THEME_LIGHT` | defaultLight | general.themeLight: Same as theme (used when system is light). |
| `FS_GENERAL_LASTFM_API_KEY` | *(empty)* | general.lastfmApiKey: Last.fm API key. Secret/sensitive: web-visible; do not supply private credentials. |
| `FS_GENERAL_LAST_FM` | true | general.lastFM: true / false — Enable Last.fm. |
| `FS_GENERAL_LISTEN_BRAINZ` | true | general.listenBrainz: true / false — ListenBrainz links. |
| `FS_GENERAL_MUSIC_BRAINZ` | true | general.musicBrainz: true / false — MusicBrainz links. |
| `FS_GENERAL_NATIVE_ASPECT_RATIO` | false | general.nativeAspectRatio: true / false — Use native cover art aspect ratio. |
| `FS_GENERAL_PATH_REPLACE` | *(empty)* | general.pathReplace: Path pattern to replace (e.g. server path in Docker). |
| `FS_GENERAL_PATH_REPLACE_WITH` | *(empty)* | general.pathReplaceWith: Replacement path. |
| `FS_GENERAL_PLAYERBAR_OPEN_DRAWER` | false | general.playerbarOpenDrawer: true / false — Open queue/lyrics as drawer from player bar. |
| `FS_GENERAL_PRIMARY_SHADE` | 6 | general.primaryShade: Mantine primary shade 0–9 (number). |
| `FS_GENERAL_QOBUZ` | true | general.qobuz: true / false — Qobuz links. |
| `FS_GENERAL_RESUME` | true | general.resume: true / false — Resume playback on load. |
| `FS_GENERAL_SHOW_LYRICS_IN_SIDEBAR` | true | general.showLyricsInSidebar: true / false — Show lyrics in sidebar. |
| `FS_GENERAL_SHOW_RATINGS` | true | general.showRatings: true / false — Show star ratings. |
| `FS_GENERAL_SHOW_VISUALIZER_IN_SIDEBAR` | true | general.showVisualizerInSidebar: true / false — Show visualizer in sidebar. |
| `FS_GENERAL_SIDEBAR_COLLAPSED_NAVIGATION` | true | general.sidebarCollapsedNavigation: true / false — Start with collapsed sidebar nav. |
| `FS_GENERAL_SIDEBAR_COLLAPSE_SHARED` | false | general.sidebarCollapseShared: true / false — Share sidebar collapse state. |
| `FS_GENERAL_SIDEBAR_IMAGE_EXPAND` | false | general.sidebarImageExpand: true / false — Show the player-bar album-art button that expands art into the sidebar. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_FOLDERS` | true | general.sidebarPlaylistFolders: true / false — Group playlists into folders by name separator. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_FOLDER_SEPARATOR` | / | general.sidebarPlaylistFolderSeparator: Character or string that separates folder levels in a playlist name. Empty = use default. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_FOLDER_TREE_INDENT` | 16 | general.sidebarPlaylistFolderTreeIndent: Pixels each tree level is indented (0–64). |
| `FS_GENERAL_SIDEBAR_PLAYLIST_FOLDER_TREE_LINE_COLOR` | *(empty)* | general.sidebarPlaylistFolderTreeLineColor: CSS color for tree connecting lines. Empty = theme default. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_FOLDER_VIEW` | tree | general.sidebarPlaylistFolderView: single / tree / navigation — How folders are displayed in the sidebar. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_LIST` | true | general.sidebarPlaylistList: true / false — Show playlist list in sidebar. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_MODE` | expanded | general.sidebarPlaylistMode: compact / expanded — Sidebar playlist row layout. |
| `FS_GENERAL_SIDEBAR_PLAYLIST_SORTING` | false | general.sidebarPlaylistSorting: true / false — Enable playlist sorting in sidebar. |
| `FS_GENERAL_SIDE_QUEUE_TYPE` | sideQueue | general.sideQueueType: sideDrawerQueue / sideQueue — Side play queue style. |
| `FS_GENERAL_SIDE_QUEUE_LAYOUT` | horizontal | general.sideQueueLayout: horizontal / vertical — Attached side queue layout orientation. |
| `FS_GENERAL_USE_THEME_ACCENT_COLOR` | false | general.useThemeAccentColor: true / false — Use theme’s accent color instead of custom. |
| `FS_GENERAL_USE_THEME_PRIMARY_SHADE` | true | general.useThemePrimaryShade: true / false — Use theme’s primary shade. |
| `FS_GENERAL_ZOOM_FACTOR` | 100 | general.zoomFactor: UI zoom percentage (number). |
| `FS_PLAYBACK_MEDIA_SESSION` | false | playback.mediaSession: true / false — Media Session API (e.g. browser/media keys). |
| `FS_PLAYBACK_WEB_AUDIO` | true | playback.webAudio: true / false — Use Web Audio for playback. |
| `FS_PLAYBACK_AUDIO_FADE_ON_STATUS_CHANGE` | true | playback.audioFadeOnStatusChange: true / false — Fade on play/pause. |
| `FS_PLAYBACK_PRESERVE_PITCH` | true | playback.preservePitch: true / false — Preserve pitch when changing speed. |
| `FS_PLAYBACK_SCROBBLE_ENABLED` | true | playback.scrobble.enabled: true / false — Enable scrobbling. |
| `FS_PLAYBACK_SCROBBLE_NOTIFY` | false | playback.scrobble.notify: true / false — Scrobble notifications. |
| `FS_PLAYBACK_SCROBBLE_AT_DURATION` | 240 | playback.scrobble.scrobbleAtDuration: Seconds of playback before scrobble. |
| `FS_PLAYBACK_SCROBBLE_AT_PERCENTAGE` | 75 | playback.scrobble.scrobbleAtPercentage: Percentage of track before scrobble. |
| `FS_PLAYBACK_TRANSCODE_ENABLED` | false | playback.transcode.enabled: true / false — Enable transcoding. |
| `FS_PLAYBACK_TRANSCODE_FORMAT` | *(unset)* | playback.transcode.format: Transcode format string (codec/container), e.g. server-specific value. Empty = use default. |
| `FS_PLAYBACK_TRANSCODE_BITRATE` | *(unset)* | playback.transcode.bitrate: Transcode bitrate (number, kbps or as defined by server). |
| `FS_PLAYBACK_FILTERS` | [] | playback.filters: JSON array of player filters: each object needs id, field, operator, value; optional isEnabled. Invalid JSON or shape is ignored. |
| `FS_DISCORD_ENABLED` | false | discord.enabled: true / false — Discord rich presence. |
| `FS_DISCORD_CLIENT_ID` | *(built-in)* | discord.clientId: Custom Discord application ID. |
| `FS_DISCORD_DISPLAY_TYPE` | feishin | discord.displayType: artist / feishin / song. |
| `FS_DISCORD_LINK_TYPE` | none | discord.linkType: last_fm / musicbrainz / musicbrainz_last_fm / none. |
| `FS_DISCORD_SHOW_AS_LISTENING` | false | discord.showAsListening: true / false. |
| `FS_DISCORD_SHOW_PAUSED` | true | discord.showPaused: true / false — Show paused state. |
| `FS_DISCORD_SHOW_SERVER_IMAGE` | false | discord.showServerImage: true / false. |
| `FS_DISCORD_SHOW_STATE_ICON` | true | discord.showStateIcon: true / false. |
| `FS_LYRICS_FETCH` | true | lyrics.fetch: true / false — Fetch lyrics. |
| `FS_LYRICS_FOLLOW` | true | lyrics.follow: true / false — Follow current line. |
| `FS_LYRICS_DELAY_MS` | 0 | lyrics.delayMs: Sync delay in milliseconds. |
| `FS_LYRICS_LINE_LEAD_TIME_MS` | 800 | lyrics.lineLeadTimeMs: Milliseconds before a line becomes active while following. |
| `FS_LYRICS_FOLLOW_SCROLL_ALIGNMENT` | 0 | lyrics.followScrollAlignment: Vertical follow position. 0 centers the active line; negative moves it higher, positive moves it lower (-50 to 50). |
| `FS_LYRICS_PREFER_LOCAL` | true | lyrics.preferLocalLyrics: true / false — Prefer local lyric files. |
| `FS_LYRICS_SHOW_MATCH` | true | lyrics.showMatch: true / false. |
| `FS_LYRICS_SHOW_PROVIDER` | true | lyrics.showProvider: true / false. |
| `FS_LYRICS_ENABLE_AUTO_TRANSLATION` | false | lyrics.enableAutoTranslation: true / false. |
| `FS_LYRICS_TRANSLATION_API_KEY` | *(empty)* | lyrics.translationApiKey: API key for lyric translation. Secret/sensitive: web-visible; do not supply private credentials. |
| `FS_LYRICS_TRANSLATION_TARGET_LANGUAGE` | en | lyrics.translationTargetLanguage: Target language code. |
| `FS_LYRICS_ALIGNMENT` | center | lyrics.alignment: center / left / right. |
| `FS_LYRICS_PADDING_LEFT` | 0 | lyricsDisplay.default.paddingLeft: Left content padding as a percentage (0–20). |
| `FS_LYRICS_PADDING_RIGHT` | 0 | lyricsDisplay.default.paddingRight: Right content padding as a percentage (0–20). |
| `FS_AUTO_DJ_ALBUM_STRATEGY` | similar | autoDJ.albumStrategy: similar / library_random. |
| `FS_AUTO_DJ_ALLOW_DUPLICATES` | false | autoDJ.allowDuplicates: true / false — Allow songs or albums already in the queue to be added again. |
| `FS_AUTO_DJ_ENABLED` | false | autoDJ.enabled: true / false. |
| `FS_AUTO_DJ_ITEM_COUNT` | 5 | autoDJ.itemCount: Number of items to add. |
| `FS_AUTO_DJ_MODE` | songs | autoDJ.mode: songs / albums. |
| `FS_AUTO_DJ_ONLY_SIMILAR` | false | autoDJ.onlySimilar: true / false — Treat item count as a maximum; use the first non-empty source (similar, then genre, artist, or random) and do not fill from later sources. |
| `FS_AUTO_DJ_SONG_STRATEGY` | similar | autoDJ.songStrategy: similar / library_random. |
| `FS_AUTO_DJ_TIMING` | 1 | autoDJ.timing: Timing value (number). |
| `FS_CSS_CONTENT` | *(empty)* | css.content: Custom CSS string (sanitized like in-app custom CSS). Set FS_CSS_ENABLED=true to apply. |
| `FS_CSS_ENABLED` | false | css.enabled: true / false — Enable custom CSS. |
| `FS_FONT_TYPE` | builtIn | font.type: builtIn / system / custom. |
| `FS_FONT_BUILT_IN` | Inter | font.builtIn: Built-in font name. |
| `FS_FONT_SYSTEM` | *(empty)* | font.system: System font name (when type is system). |

## Client-side visibility

Every value is rendered into browser-accessible JavaScript. Secret injection cannot protect a private credential here; do not configure user passwords or private API tokens. `FS_*` settings initialize the web app only when browser-persisted settings do not exist. Existing browser preferences win. Environment variables for Node/Electron development or image building do not become runtime controls for the nginx image. Desktop-only MPV/DLNA/OS integration settings can be stored as client preferences but do not provision native capabilities in the web container.

