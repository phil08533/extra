# ReadSound

ReadSound is a static GitHub Pages app that turns a book into a reading soundtrack.

## What it does

1. Searches Open Library for a book.
2. Uses the book's subjects and title to infer a small set of music genres.
3. Searches the iTunes Search API for tracks and 30-second previews.
4. Scores tracks locally and builds a soundtrack in the browser.
5. Lets you preview, skip, shuffle by rebuilding, and continue reading without an account.

The app is intentionally dependency-free: `index.html`, `styles.css`, and `app.js` are all that GitHub Pages needs.

## GitHub Pages

Set GitHub Pages to deploy from the `main` branch and the repository root (`/`). There is no build step and no server-side code.

## APIs

ReadSound uses the Open Library Search API for book data and the iTunes Search API for music discovery/previews. The browser calls both services directly, so API keys are not stored in this repository.

Open Library asks applications making regular frequent requests to identify themselves and to cache where possible. This project keeps searches user-driven and only fetches a small number of results. See the Open Library API guidance before scaling the app. citeturn438356search0turn438356search1

Apple documents the iTunes Search API as a web search service and exposes 30-second preview URLs for tracks. Apple also notes a roughly 20-calls-per-minute limit for the Search API, so the UI intentionally keeps music requests bounded. Preview usage is subject to Apple's promotional-content terms. citeturn938565search0turn938565search1turn938565search2

## Roadmap

- Chapter-aware soundtrack progression
- Reading timer / session mode
- Better genre and mood scoring
- Optional MusicBrainz/Last.fm enrichment
- Saved local bookshelves and playlists
- PWA/offline shell
