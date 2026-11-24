# Squash Trainer

An anonymous web portal that helps squash players improve in any area: technique, serve and return, movement, tactics, fitness, the mental game, rules and equipment.

There are no accounts, no tracking and no backend. Personal data (assessments, practice log, saved drills, settings) stays in the browser's `localStorage` and can be exported or imported as JSON from the Practice log page.

See **[FEATURES.md](FEATURES.md)** for the full list of features, both built and planned.

## What's inside

- **Learn**: 8 areas and 39 topic guides (key points, common mistakes and fixes, coaching cues, linked drills)
- **Drills**: 31 solo, pairs and group drills, with filters and favourites
- **Self-assessment**: radar chart, estimated level and the three areas to focus on
- **Session builder**: a structured session for your time, partner(s), level and focus
- **Ghosting trainer**: random corner calls with voice, beeps and work/rest intervals
- **Practice log**: sessions and matches, with weekly stats
- **Rules quiz**: let / stroke / no let scenarios
- **Glossary** and **search**

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check and production build into dist/
npm run preview   # serve the production build
```

## Deploy

The build is fully static (`base: './'`, hash routing), so `dist/` can be served from any static host.
`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`. To use it, enable **Settings → Pages → Source: GitHub Actions** in the repository.

## Project layout

```
src/
  data/        content: areas & topics, drills, quiz, glossary, assessment
  lib/         localStorage helpers, session builder
  components/  layout, court SVG, radar chart, drill card
  pages/       one file per route
```

Content is plain TypeScript data in `src/data/`. Adding a topic or drill means adding an object there.

Advice assumes a right-handed player; left-handers should mirror it. Rules summaries are simplified, so check the World Squash Federation rules for the official wording.
