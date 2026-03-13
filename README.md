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
- `app/index.html` — Static app shell
- `app/styles.css` — UI styles
- `app/app.js` — Estimator, work dashboard, and worker clock logic (localStorage)

## Run the Static App

From the repo root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/app/`

## Current Prototype Capabilities

- Estimate builder with template-based line items
- Material auto-calculations from dimensions (mulch, soil, square footage)
- Estimate agreement text, customer email, and payment link fields
- Save, load, duplicate, and delete estimates locally
- Work dashboard showing accepted jobs
- Worker clock interface with large action buttons
- Local time log history
- Weekly pay tracker (hours + hourly rate)
- Browser print/export flow for estimates

## Need help merging conflicts?

Use the step-by-step guide in `CONTRIBUTING.md` (rebase flow, ours/theirs shortcuts, and GitHub UI fallback).
