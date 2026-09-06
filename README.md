# ReadSound

ReadSound is a static GitHub Pages app that turns a book into a focused reading soundtrack and opens the soundtrack in YouTube without requiring the visitor to log in.

## What it does

1. Searches Open Library for a book.
2. Extracts the book's subjects plus title-specific hints.
3. Builds a small theme/genre profile instead of relying on one generic genre.
4. Searches iTunes for music previews and scores tracks against those themes.
5. Penalizes weak matches such as unrelated genres, generic covers/remixes, and seasonal tracks that do not fit the book.
6. Lets you preview the resulting soundtrack in the browser.
7. Searches public Invidious instances for matching YouTube videos and builds a no-login YouTube queue from the resulting video IDs.

There is no ReadSound account, Spotify integration, Google login, or ReadSound backend.

## YouTube export without login

A normal saved YouTube playlist belongs to a user's YouTube account and the official YouTube Data API requires OAuth for playlist creation and playlist-item insertion. ReadSound deliberately avoids that login flow. Instead, it finds the videos and opens them with YouTube's multi-video `watch_videos` queue URL. This behaves like a temporary playlist/queue in YouTube but is not saved to the visitor's account.

The video search is performed through public Invidious instances so the static site does not need to expose a YouTube API key. Public Invidious instances can be intermittent, so the app tries more than one trusted instance and shows direct YouTube search links for any tracks it cannot match automatically.

## GitHub Pages

Set GitHub Pages to deploy from the `main` branch and the repository root (`/`). There is no build step and no server-side code.

## Music matching

The matcher is intentionally conservative. It combines Open Library subjects with title/author hints, searches several targeted queries, scores theme/genre overlap, and drops low-scoring results. This is still heuristic matching rather than AI, so unusual books may need a rebuild or may produce fewer tracks.

YouTube matching also scores candidates for title/artist agreement and prefers official audio, official videos, lyrics, Topic/VEVO-style uploads, and plain audio while penalizing karaoke, tribute, covers, nightcore, slowed/sped-up versions, reaction videos, remixes, concerts, and long-form compilation videos.

## APIs and services

ReadSound uses the Open Library Search API for book data/covers and the iTunes Search API for music discovery and previews. Open Library asks applications to keep requests low-volume, identify themselves when making regular frequent requests, and cache where possible. The app keeps requests user-driven and bounded.

Apple documents the iTunes Search API as a web search service and exposes 30-second preview URLs for tracks. Preview usage is subject to Apple's promotional-content terms.

YouTube's official Data API requires an API key or OAuth token for requests, and insert/update/delete operations require OAuth. ReadSound does not use the official API for playlist creation because doing that without a user login is not supported. Public Invidious instances provide the search layer instead.

## Privacy

- No ReadSound account is created.
- No Spotify credentials are requested or stored.
- No Google/YouTube account login is requested.
- Book and music searches are sent directly to Open Library and Apple/iTunes.
- YouTube matching is sent to the configured public Invidious instances.

## Roadmap

- Chapter-aware soundtrack progression
- Reading timer / session mode
- Better mood weighting and manual genre controls
- Optional saved local bookshelves
- PWA/offline shell
- Optional server-side YouTube integration for users who want permanent saved playlists
