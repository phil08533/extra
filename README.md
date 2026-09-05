# ReadSound

ReadSound is a static GitHub Pages app that turns a book into a focused reading soundtrack and can export that soundtrack to Spotify.

## What it does

1. Searches Open Library for a book.
2. Extracts the book's subjects plus title-specific hints.
3. Builds a small theme/genre profile instead of relying on one generic genre.
4. Searches iTunes for music previews and scores tracks against those themes.
5. Penalizes weak matches such as unrelated genres, generic covers/remixes, and seasonal tracks that do not fit the book.
6. Lets you preview the resulting soundtrack in the browser.
7. Uses Spotify OAuth with PKCE so you can create a private Spotify playlist and open it in Spotify.

There is no ReadSound account and no ReadSound backend. Book/music discovery happens in the browser.

## GitHub Pages

Set GitHub Pages to deploy from the `main` branch and the repository root (`/`). There is no build step and no server-side code.

## Spotify setup

Spotify requires a developer app/client ID before ReadSound can create playlists. The Client ID is safe to use in a browser; **do not put a Spotify Client Secret into this project**.

1. Create an app in the Spotify Developer Dashboard.
2. Copy its Client ID.
3. In the app settings, add the exact Redirect URI shown by ReadSound. For a normal GitHub Pages deployment this will look like `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
4. Open ReadSound and click **Connect Spotify**.
5. Paste the Client ID. Spotify will handle the login/permission screen.
6. After a book soundtrack is generated, click **Create Spotify playlist**.
7. ReadSound creates a private playlist, adds the tracks Spotify can match, and gives you an **Open playlist in Spotify** link.

ReadSound uses Authorization Code with PKCE, which is appropriate for browser applications because the client secret does not need to be shipped to the browser. The requested permissions are limited to private/public playlist modification and basic profile access.

## Music matching

The matcher is intentionally conservative. It combines Open Library subjects with title/author hints, searches several targeted queries, scores theme/genre overlap, and drops low-scoring results. This is still heuristic matching rather than AI, so unusual books may need a rebuild or may produce fewer tracks.

## APIs

ReadSound uses the Open Library Search API for book data/covers and the iTunes Search API for music discovery and previews. Open Library asks applications to keep requests low-volume, identify themselves when making regular frequent requests, and cache where possible. The app keeps requests user-driven and bounded. citeturn438356search0turn438356search1

Apple documents the iTunes Search API as a web search service and exposes 30-second preview URLs for tracks. Apple also notes a roughly 20-calls-per-minute limit for the Search API, so ReadSound deliberately limits the number of music searches per book. Preview usage is subject to Apple's promotional-content terms. citeturn938565search0turn938565search1turn938565search2

Spotify playlist creation uses the Spotify Web API. OAuth/PKCE happens directly between the browser and Spotify; ReadSound does not receive your Spotify password or client secret.

## Privacy

- No ReadSound account is created.
- The Spotify Client ID is stored locally in your browser.
- Spotify access tokens are kept in the current browser session only.
- Book and music searches are sent directly to Open Library and Apple/iTunes.
- Spotify playlist creation is sent directly to Spotify.

## Roadmap

- Chapter-aware soundtrack progression
- Reading timer / session mode
- Better mood weighting and manual genre controls
- Apple Music export
- Optional MusicBrainz/Last.fm enrichment
- Saved local bookshelves and playlists
- PWA/offline shell
