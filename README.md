# Landscaping Estimator & Job Manager

This repository contains:
- A complete product SDLC/specification
- A runnable static prototype implementing the first working estimator and worker flows

## Core Product Philosophy

- Free and open source core
- No required backend for essential functionality
- Local-first architecture
- Optional paid cloud sync for advanced workflows
- Extremely simple worker interface for clock-in/clock-out use

## Project Layout

- `docs/SDLC.md` — Full software development life cycle and product specification
- `index.html` — Lightweight redirect entry point for GitHub Pages (`/` → `/app/`)
- `app/index.html` — Static app shell
- `app/styles.css` — UI styles
- `app/app.js` — Estimator, saved estimates, work dashboard, worker clock, and weekly pay logic (localStorage)
- `.github/workflows/deploy-pages.yml` — Automatic GitHub Pages deployment workflow
- `CONTRIBUTING.md` — Conflict resolution and contribution guidance

## Run the Static App

From the repo root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/` (redirects to `/app/`)

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow that publishes the repository root to GitHub Pages on every push to `main`. The root page redirects to `/app/`, where the actual app UI is maintained.

1. Push this branch to GitHub.
2. In GitHub: **Settings → Pages → Source**, set source to **GitHub Actions**.
3. Wait for the **Deploy static site to GitHub Pages** workflow to finish.
4. Open your site URL, typically `https://<username>.github.io/<repo>/`.

If you still see a 404 page, verify:
- You are visiting the correct repository URL path.
- The latest deploy workflow run succeeded.
- Pages is configured for GitHub Actions (not an old branch/folder source).

## Current Prototype Capabilities

- Estimate builder with template-based line items
- Material auto-calculations from dimensions (mulch, soil, square footage)
- Estimate agreement text, customer email, and payment link fields
- Status tracking and local estimate save/load/duplicate/delete flows
- Work dashboard showing accepted jobs
- Worker clock interface with large action buttons
- Local time log history
- Weekly pay tracker (hours + hourly rate)
- Browser print/export flow for estimates

## Need help merging conflicts?

Use the step-by-step guide in `CONTRIBUTING.md` (rebase flow, ours/theirs shortcuts, and GitHub UI fallback).
