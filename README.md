# ReadSound

ReadSound is a static GitHub Pages app that turns a book into a focused **instrumental** reading soundtrack and opens the soundtrack in YouTube without requiring the visitor to log in.

## What it does

1. Searches Open Library for a book.
2. Extracts meaningful book subjects while stripping bibliographic noise such as nationality, century, literature, and criticism labels.
3. Adds title-specific story hints for things such as fantasy, science fiction, mystery, horror, and classic romance.
4. Searches iTunes for music previews using several targeted instrumental queries.
5. Scores tracks against the book's themes and musical profile, while strongly penalizing vocal, karaoke, cover, remix, live, and holiday results.
6. Builds a fuller soundtrack of up to 12 tracks instead of stopping after only a few weak matches.
7. Lets you preview the resulting soundtrack in the browser.
8. Searches YouTube for the matched instrumental tracks using a browser-restricted API key when configured.
9. Opens the matched YouTube video IDs as a no-login multi-video queue/temporary playlist.

There is no ReadSound account, Spotify integration, Google login, or ReadSound backend.

## YouTube export without visitor login

A normal saved YouTube playlist belongs to a user's YouTube account, and the official YouTube Data API requires OAuth for playlist creation and playlist-item insertion. ReadSound deliberately avoids that login flow. Instead, it uses the YouTube Data API only for public video search, then opens the selected video IDs through YouTube's multi-video queue URL. The visitor can use the queue immediately and can save it in YouTube themselves if desired.

The only developer setup is a YouTube Data API v3 browser key stored in `config.js`. This is not a user credential. Restrict the key to your GitHub Pages origin and to the YouTube Data API v3 in Google Cloud Console.

If the key is not configured, the button now still works: ReadSound opens a normal YouTube search containing several of the selected instrumental tracks instead of silently doing nothing.

## YouTube API key setup

1. Create/select a Google Cloud project.
2. Enable **YouTube Data API v3**.
3. Create an **API key**.
4. Restrict the key by HTTP referrer to your GitHub Pages URL and restrict the API to YouTube Data API v3.
5. Replace `PASTE_YOUR_RESTRICTED_YOUTUBE_API_KEY_HERE` in `config.js` with the restricted key.

Do not add a Google OAuth client or client secret. Visitors do not log in.

## GitHub Pages

Set GitHub Pages to deploy from the `main` branch and the repository root (`/`). There is no build step and no server-side code.

## Music matching

The matcher is heuristic rather than AI, but it now favors instrumental music by querying for instrumental terms and scoring piano, orchestral, score, soundtrack, ambient, acoustic, strings, and classical signals. It penalizes explicit vocal/lyric/singer/choir/rap indicators and common low-quality variants. It uses several fallback instrumental queries so a book is much less likely to end with only a couple of tracks.

YouTube matching scores title/artist agreement and prefers official audio, audio, instrumental, soundtrack/score, Topic/VEVO-style uploads, while penalizing lyrics, vocals, karaoke, tribute, covers, nightcore, slowed/sped-up versions, reaction videos, remixes, concerts, and long-form compilations.

## APIs and services

ReadSound uses the Open Library Search API for book data/covers, the iTunes Search API for music discovery and previews, and the YouTube Data API for public video search.

The YouTube Data API's `search.list` endpoint supports video-only searches and filters such as music category and embeddability. Each `search.list` call costs one unit and current default quotas include 100 search calls per day, so ReadSound keeps YouTube matching to one small search per soundtrack track. citeturn119096search0turn119096search2

## Privacy

- No ReadSound account is created.
- No Spotify credentials are requested or stored.
- No Google/YouTube account login is requested.
- The public YouTube API key is restricted to the site's origin and only used for public video search.
- Book and music searches are sent directly to Open Library and Apple/iTunes.
- YouTube search requests are sent to Google's YouTube Data API.

## Roadmap

- Chapter-aware soundtrack progression
- Reading timer / session mode
- Manual mood weighting and genre controls
- Optional saved local bookshelves
- PWA/offline shell
- Optional server-side YouTube integration for users who want permanent saved playlists
