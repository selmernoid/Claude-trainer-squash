# Squash Trainer («Сквош-тренер»)

An anonymous web portal that helps squash players improve in any area: technique, serve and return, movement, tactics, fitness, the mental game, rules and equipment.

**The portal is in Ukrainian only.** All UI text and content is Ukrainian; there is no language switcher. Code, comments and these docs stay in English.

There are no accounts, no tracking and no backend. Personal data (assessments, practice log, saved drills, settings) stays in the browser's `localStorage` and can be exported or imported as JSON from the Practice log page.

See **[FEATURES.md](FEATURES.md)** for the full list of features, both built and planned.

## What's inside

- **Learn**: 8 areas and 39 topic guides (key points, common mistakes and fixes, coaching cues, linked drills and videos)
- **Videos**: 120 curated YouTube videos (lessons, drills, full sessions, tips, pro analysis, matches), 10 ordered sets, embedded in topic pages
- **Fun** («Цікаве»): trick shots, best rallies, legendary matches, bloopers, squash at the Olympics
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
`.github/workflows/deploy.yml` builds and rsyncs `dist/` to a VPS (served by Caddy behind Cloudflare) on every push to `master`. Setup steps are in [`deploy/README.md`](deploy/README.md).

## Project layout

```
src/
  data/        content: areas & topics, drills, quiz, glossary, assessment
  lib/         localStorage helpers, session builder
  components/  layout, court SVG, radar chart, drill card
  pages/       one file per route
```

Content is plain TypeScript data in `src/data/`. Adding a topic or drill means adding an object there.

## Video database

Videos live in [`src/data/videos.json`](src/data/videos.json) so that a separate process can add and maintain them without touching code. The format is described by [`src/data/videos.schema.json`](src/data/videos.schema.json). Each entry has a stable `id` (used in `/videos/<id>` URLs), a Ukrainian `title` and `note`, a `kind` (`lesson`, `drill`, `session`, `howto`, `analysis`, `match`, `fun`), `areas`, and optionally `topics` (`<areaId>/<topicId>`, shown on that topic page), `drills`, `level`, and `tags` (sections of the «Цікаве» page). `collections` are ordered sets of video ids.

An entry needs one of:

- `youtubeId`: embedded directly;
- `playlistId`: embedded as a playlist;
- `query` only: the portal shows a "Шукати на YouTube" button until the id is resolved.

Maintenance commands (`scripts/videos.mjs`, Node 22+):

```bash
npm run videos:validate                 # structure + cross-references; also runs before every build
npm run videos:check                    # oEmbed: hide removed / non-embeddable videos, fill channel + originalTitle
YOUTUBE_API_KEY=… npm run videos:resolve  # fill youtubeId for entries that only have a query
```

All three accept `--dry-run` and `--only=<id,id>`; `check` also takes `--stale-days=N`.

The deploy workflow runs `videos:check` before every build (the result is used for that build only, not committed), so removed or non-embeddable videos disappear from the site and every video gets its real YouTube title and channel. That means a video can be added with just an `id`, `youtubeId`, `kind`, `lang` and `areas`: without a `title` the portal shows the YouTube title. A typical populating process: append entries with a `query`, run `videos:resolve` (new matches get `status: "auto"`), have a person review them and set `status: "ok"`, then run `videos:check` on a schedule. Entries with status `unavailable` or `not-embeddable` are hidden from the portal automatically.

Players use `youtube-nocookie.com` and load only after a click; until then only the thumbnail from `i.ytimg.com` is fetched. Most videos are in English, so the portal tells viewers how to switch on auto-translated Ukrainian subtitles.

Advice assumes a right-handed player; left-handers should mirror it. Rules summaries are simplified, so check the World Squash Federation rules for the official wording.
