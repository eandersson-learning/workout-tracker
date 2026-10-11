# Workout Tracker

A mobile-friendly web app for logging dumbbell workouts. It runs entirely in the browser: data is kept in IndexedDB on your device, so there is no server or account.

## Features

- **Exercise library** with a start/finish illustration (or your own image/GIF, by URL or upload) and a one-line form cue for each exercise.
- **Templates**: ordered exercises grouped into blocks, with target sets, rep ranges, timed holds, holds to failure, and per-side counts. A block with more than one round runs as a circuit.
- **Live tracking**: start a template (or an empty workout), pick the weight, tick off sets, and use the built-in stopwatch for timed holds and carries. Weights carry forward to later sets and are prefilled from your last session.
- **PowerBlock Sport weights only**: the weight picker offers 3–24 lb in 3 lb steps.
- **History** of finished workouts, plus recent sets on each exercise.

The library and templates are seeded from the *30-Day Intensive Forearm & Ab Routine*: Day 1 Push (repeat Day 4), Day 2 Pull (repeat Day 5), Day 3 Conditioning circuit (repeat Day 6), and Day 7 Active Recovery.

## Using it

Open the GitHub Pages link (https://eandersson-learning.github.io/workout-tracker/ once Pages is on) in any browser, on a phone or a computer. Nothing to install.

- Data is saved in that browser on that device, so a phone and a laptop each keep their own history.
- After the first visit it also works offline. On a phone you can optionally use "Add to Home Screen" to open it full-screen like an app.

### Turning on GitHub Pages (one time)

In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**. Every push to `main` then rebuilds and publishes the site via `.github/workflows/deploy.yml`. GitHub Pages on a private repo needs a paid GitHub plan; on a free plan, make the repo public first.

## Developing

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/, deployable to any static host
npm run lint
```

Pull requests run lint and build in CI.

## Code map

- `src/data/seed.ts`: built-in exercises and templates.
- `src/data/figures.json`: illustrations, regenerated with `python3 scripts/extract-figures.py <routine.html>`.
- `src/types.ts`: data model (exercises, templates, workouts).
- `src/workout.ts`: turning a template into a live workout.
- `src/storage.ts`: IndexedDB persistence (localStorage fallback).
- `src/pages/`: Templates, Session (live tracking), Exercises, History.
- `public/sw.js`, `public/manifest.webmanifest`: offline support and home-screen install.
