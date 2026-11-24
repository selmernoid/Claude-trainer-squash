# Squash Trainer — feature list

An anonymous web portal for improving at squash. No accounts and no tracking. Anything personal is kept in the browser's `localStorage` and can be exported or imported as JSON.

✅ = built in this version · 🔜 = suggested next · 💡 = idea for later

## 1. Knowledge base: "how do I improve X?"

| Status | Feature | Why it helps |
|---|---|---|
| ✅ | **8 skill areas**: Technique, Serve & Return, Movement, Tactics, Fitness, Mental Game, Rules & Etiquette, Equipment | One place to start for any weakness |
| ✅ | **39 topic guides**, each with key points, common mistakes with fixes, coaching cues and linked drills | Practical, quick to read before or during a session |
| ✅ | Level tag on each topic (beginner / intermediate / advanced) | Shows players what to learn now and what to leave for later |
| ✅ | "New to squash?" path and a tip of the day on the home page | Gives first-time visitors somewhere to start |
| ✅ | Glossary of 31 terms | Explains the jargon (nick, boast, tramline, let…) |
| ✅ | Search across topics, drills and glossary | Find "volley" or "lunge" in one step |
| 🔜 | Diagrams of shot paths and footwork on a court SVG for each topic | Shows ideas that are hard to explain in text |
| 🔜 | Curated video links (pro matches, technique breakdowns) per topic | Lets players see what good technique looks like |
| 🔜 | Left-handed mode that mirrors all left/right advice | Fairer to the ~10% of players who are left-handed |
| 💡 | Multilingual content | Squash is popular in non-English-speaking countries |
| 💡 | Doubles and junior/parent sections | Covers other groups of players |

## 2. Practice and drills

| Status | Feature | Why it helps |
|---|---|---|
| ✅ | **Drill library** (31 drills) for solo, pairs and group, with steps, goal and progression | Gives players something concrete to do on court |
| ✅ | Filters by area, players, level and text, kept in the URL so a filtered view can be shared | Find the right drill fast |
| ✅ | Save (star) favourite drills | Build a personal drill set |
| ✅ | **Session builder**: time, players, level and focus give a warm-up, focus drills, a finisher and a cool-down; shuffle, print, log | Turns "I have 45 minutes alone" into a plan |
| ✅ | **Ghosting trainer**: random corner calls with voice, beeps, work/rest rounds, presets, position selection; keeps the screen awake | A squash-specific fitness and movement tool for a phone propped courtside |
| 🔜 | Multi-week training plans (e.g. "4 weeks to better length", "pre-season fitness") | Structure beyond a single session |
| 🔜 | Solo target challenges with scores (e.g. "20 drives in the tramline") saved to personal bests | Measurable progress, plus a reason to come back |
| 🔜 | Offline mode (PWA, installable on a phone) | Courts often have poor signal |
| 💡 | Reaction trainer with flashing lights instead of voice, for noisy clubs | Works where voice calls can't be heard |
| 💡 | Partner-feeding guides for coaches and parents | Better feeding makes better drills |

## 3. Self-assessment and progress

| Status | Feature | Why it helps |
|---|---|---|
| ✅ | **Self-assessment**: 17 statements, radar chart, estimated level, three weakest areas with drills | Points players at the areas that will help most |
| ✅ | Comparison with the previous assessment (▲/▼ per area, dashed radar) | Shows progress over time |
| ✅ | Assessment results pre-fill the session builder | Goes straight from diagnosis to training |
| ✅ | **Practice log**: sessions, matches (W/L and score), focus areas, feel, notes | Builds the habit of reflecting after each session |
| ✅ | Stats: last 7 and 28 days, match record, minutes per week (8 weeks), focus balance | Shows when training is one-sided or has stopped |
| ✅ | Export, import and delete all data | Keeps the user in control while staying anonymous |
| 🔜 | Match analysis sheet: tally winners, errors, lets and strokes by shot type during or after a match | Objective data instead of gut feel |
| 🔜 | Video self-review checklist with timestamps | Structured reflection on recorded matches |
| 💡 | Optional anonymous sync via a one-time code (no email) | Use the same data on phone and laptop |

## 4. Rules and match play

| Status | Feature | Why it helps |
|---|---|---|
| ✅ | **Rules quiz**: 13 let/stroke/no-let, serve and scoring scenarios with explanations; best score saved | The most common source of confusion at club level |
| ✅ | Rules summaries: scoring, serving, interference, etiquette and safety | Quick reference |
| 🔜 | Courtside scoreboard (PAR-11, serve side tracking, game history) | Useful in every friendly match |
| 🔜 | Refereeing guide with animated scenarios | Visual learning for interference rules |
| 💡 | Pre-match plan builder: opponent notes, plan A and plan B | Brings in the mental-game material |

## 5. Platform and quality

| Status | Feature |
|---|---|
| ✅ | Static single-page app (Vite + React + TypeScript), deploys to any static host; GitHub Pages workflow included |
| ✅ | Hash routing, so deep links work without server config |
| ✅ | Light and dark themes (follows the system), works at phone width, print styles for session plans |
| ✅ | No cookies, no analytics, no backend |
| 🔜 | Content stored as Markdown/JSON so coaches can contribute through pull requests |
| 🔜 | Unit tests for the session builder and a Playwright smoke test in CI |
| 💡 | Accessibility audit (screen-reader pass on the ghosting trainer and the charts) |
