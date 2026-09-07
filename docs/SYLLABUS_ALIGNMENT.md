# Syllabus alignment (ICSE-style EVS · Grade 2 / NEP-friendly)

FunBerry’s **zones and EVS themes** are structured to mirror the common **ICSE Class 2 Environmental Studies** theme set (15 themes) used by many schools and publishers. Public summaries of that structure appear in resources such as [BYJU’S ICSE Class 2 EVS syllabus](https://byjus.com/icse-class-2-evs-syllabus/) and similar curriculum pages.

We **do not** copy textbook wording or images from any single publisher. This app is an **original game layer** aligned at the **theme / outcome** level. For strict page-by-page alignment with a specific “New Learning Science” or NEP-labelled book, you need that book’s **table of contents and learning outcomes** in hand; paste or attach them and we can map items to `gameId`s in `@funberry/game-engine`.

The separate **Computer Lab** world is supplemental exam practice built from seven school-provided
Computer Studies revision PDFs. It is not presented as a sixteenth EVS theme. Its source-item
coverage is enforced in `packages/game-engine/src/games/evs/computers.test.ts`.

## Theme ↔ FunBerry zone (current)

| Typical ICSE EVS theme (Grade 2) | FunBerry `zone.id` |
|----------------------------------|-------------------|
| About Me | `about-me` |
| Others in My World | `others-in-my-world` |
| My Needs – Food | `food` |
| My Needs – Water | `water` |
| My Need – Shelter | `shelter` |
| My Need – Clothing | `clothing` |
| My Need – Air | `air` |
| Keeping Oneself Clean, Safe and Healthy | `health-safety` |
| Places in the Neighbourhood | `neighbourhood` |
| Plants | `plants` |
| Animals | `animals` |
| Transport | `transport` |
| Communication | `communication` |
| Sun, Moon, Sky and Stars (world around me) | `sun-moon-stars` |
| Time, Space, Direction | `time-space-direction` |

## What “in sync” means here

- **In sync today:** Theme names, strand reporting on the parent report, and game **types** (quiz, sort, memory, story, etc.) that exercise cognitive skills those themes need.
- **Not automatic:** Adding every **exact question** from a named textbook without the source text would be guesswork. Use this doc to verify **coverage**; use book PDFs/outlines for **item-level** updates in `allEvsGames` and related configs.

## Next steps for deeper alignment

1. Export **learning outcomes** from your chosen book (chapter → outcomes).
2. For each outcome, tag an existing `gameId` or add a new game config under the right zone in `@funberry/game-engine`.
3. Re-run parent reports — they aggregate by **zone / game type** automatically once `progress.game_id` matches client `GameConfig.id`.
