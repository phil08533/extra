# ReadSound

ReadSound turns a book into a background reading soundtrack. Search Open Library for a book, derive lightweight themes from its metadata, then search the iTunes Search API for matching music previews.

## What this version does

- Search Open Library by title, author, or subject.
- Display book cover, title, author, subjects, and description.
- Build a soundtrack from book metadata without an AI service.
- Query iTunes for multiple genre/theme searches and de-duplicate tracks.
- Play 30-second previews in-browser with previous/next controls.
- Shuffle and rebuild the soundtrack.
- Keep the current book and playlist in localStorage.
- Responsive, dependency-free frontend that can run as a static GitHub Pages site.

## APIs

### Open Library
Used for book discovery and metadata.

`https://openlibrary.org/search.json`

### iTunes Search API
Used for music discovery and preview URLs.

`https://itunes.apple.com/search`

The application uses preview audio only. It does not download or re-host music.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## GitHub Pages

The app has no build step. Publish the repository root with GitHub Pages, or use any static web host.

## Project structure

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Design direction

The first release deliberately avoids accounts, databases, paid services, and AI. The interesting part is the matching algorithm: book metadata becomes a set of music-search signals, and the app ranks a mixed playlist from those signals.

## Next ideas

- Track reading progress and vary soundtrack intensity by chapter.
- Add ambient-only, instrumental-only, and vocal-heavy modes.
- Let users save named reading sessions locally.
- Add more open music sources where licensing permits actual streaming.
- Improve theme scoring using more books and music metadata.
