# ReadSound

ReadSound is a static GitHub Pages app that turns a book into a focused reading soundtrack and opens the soundtrack in YouTube without requiring the visitor to log in.

## What it does

1. Searches Open Library for a book.
2. Extracts the book's subjects plus title-specific hints.
3. Builds a small theme/genre profile instead of relying on one generic genre.
4. Searches iTunes for music previews and scores tracks against those themes.
5. Penalizes weak matches such as unrelated genres, generic covers/remixes, and seasonal tracks that do not fit the book.
6. Lets you preview the resulting soundtrack in the browser.
7. Searches YouTube for matching videos using a browser-restricted API key.
8. Opens all matched YouTube videos as a no-login multi-video queue/temporary playlist.

There is no ReadSound account, Spotify integration, Google login, or ReadSound backend.

## YouTube export without visitor login

A normal saved YouTube playlist belongs to a user's YouTube account, and the official YouTube Data API requires OAuth for playlist creation and playlist-item insertion. ReadSound deliberately avoids that login flow. Instead, it uses the YouTube Data API only for public video search, then opens the selected video IDs through YouTube's multi-video `watch_videos` queue URL. The visitor can use the queue immediately and can save it in YouTube themselves if desired.

The only developer setup is a YouTube Data API v3 browser key stored in `config.js`. This is not a user credential. Restrict the key to your GitHub Pages origin and to the YouTube Data API v3 in Google Cloud Console.

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

The matcher is intentionally conservative. It combines Open Library subjects with title/author hints, searches several targeted queries, scores theme/genre overlap, and drops low-scoring results. This is still heuristic matching rather than AI, so unusual books may need a rebuild or may produce fewer tracks.

YouTube matching scores title/artist agreement and prefers official audio, official videos, lyrics, Topic/VEVO-style uploads, and plain audio while penalizing karaoke, tribute, covers, nightcore, slowed/sped-up versions, reaction videos, remixes, concerts, and long-form compilation videos.

## APIs and services

ReadSound uses the Open Library Search API for book data/covers and the iTunes Search API for music discovery and previews. Open Library asks applications to keep requests low-volume and cache where possible. The app keeps requests user-driven and bounded.

Apple documents the iTunes Search API as a web search service and exposes 30-second preview URLs for tracks. Preview usage is subject to Apple's promotional-content terms.

The YouTube Data API permits unauthenticated public search when a valid API key is supplied, but playlist insertion requires OAuth. ReadSound intentionally uses the public-search portion only, then uses YouTube's multi-video queue URL so the visitor does not have to grant account access. This queue workaround is not the same thing as creating a saved playlist in the visitor's account.

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
- Better mood weighting and manual genre controls
- Optional saved local bookshelves
- PWA/offline shell
- Optional server-side YouTube integration for users who want permanent saved playlists
