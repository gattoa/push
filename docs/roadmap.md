# Push — Roadmap

## Current State

### API Integrations
| Service | Status | File |
|---------|--------|------|
| ExerciseDB (RapidAPI) | Working — search, get by ID, list muscles/bodyparts/equipment | `src/lib/api/exercisedb.ts` |
| Supabase | Client configured, no schema or auth | `src/lib/api/supabase.ts` |
| Anthropic (Claude) | Client configured, not yet used | `src/lib/api/anthropic.ts` |

### Data Model
Full TypeScript types defined in `src/lib/types/index.ts`:
- `WeeklyPlan`, `PlannedDay`, `PlannedExercise`, `PlannedSet`
- `WorkoutLog`, `SetLog`
- `ExerciseDBExercise`, `ExerciseDBSearchResult`
- `Exercise`, `WorkoutSet`, `User`

### Mock Data
7-day PPL split with 21 exercises and 70+ sets in `src/lib/mock/workouts.ts`:
- Mon: Push (Bench Press, Shoulder Press, Tricep Pushdown)
- Tue: Pull (Barbell Row, Pull-ups, Bicep Curls)
- Wed: Legs (Squat, RDL, Leg Press, Calf Raises)
- Thu: Rest
- Fri: Push (Incline DB Press, Lateral Raises, Dips)
- Sat: Pull (Lat Pulldown, Seated Cable Row, Hammer Curls)
- Sun: Review

### Components
| Component | Purpose |
|-----------|---------|
| `DailyWorkout` | Renders workout/rest/review day |
| `ExerciseTile` | Exercise with set checkboxes |
| `SetRow` | Detailed set logging (weight, reps, complete toggle) |
| `SetCheckbox` | Quick set toggle |
| `QuickComplete` | Batch-complete all sets |
| `ReviewSummary` | Weekly completion summary |
| `WeekStrip` | Day selector navigation |
| `ExerciseCard` | Exercise name + muscle group link |
| `Navigation` | Fixed top nav bar |

### Pages
| Route | Status |
|-------|--------|
| `/` (Home/Today) | Working — today's workout with DailyWorkout, week plan view accessible from here |
| `/exercise/[id]` | Working — ExerciseDB content + set logging + exercise history |
| `/profile` | In progress — historical calendar, stats, PRs, photos |
| `/settings` | Working — preferences, training config, about you |

---

## Milestones

> **Philosophy:** Build all screens and interactions with mock data first to discover the true data shape. Supabase comes last as a mechanical swap once the data model is proven through real UI usage.

### Milestone 1: Complete All Screens (Mock Data)

Build every remaining screen from the product brief using mock data:

- [ ] **Onboarding flow** — 4 screens: experience level, training days/week, goals, injuries. Mock output as a generated plan.
- [ ] **Exercise swaps UI** — tap/swipe on exercise tile → 3 alternatives from ExerciseDB by target muscle
- [ ] **Review Day page** — weekly summary, achievements, "Start Next Week" transition
- [x] **Navigation restructure** — icon-driven nav (gear | date | avatar)
- [ ] **Week plan view** — this week's 7-day schedule view with day shuffle capability, accessible from Today page
- [x] **Profile page** — historical calendar (date-indexed archive), lifetime stats, PRs, progress photos
- [x] **Settings page** — review day config, training days, goals, injuries
- [ ] **PR indicators** — on exercise tiles and detail page
- [ ] **Rest timer** — countdown between sets (90s hypertrophy / 180s strength)
- [ ] **Historical performance** — "Last: 135lb x 10" on exercise detail
- [ ] Expand mock data as needed to support each screen

### Milestone 2: AI Plan Generation (Claude)

Prototype the AI loop with mock I/O before wiring to persistence:

- [ ] Claude prompt template with ExerciseDB exercise grounding
- [ ] Structured JSON output schema for weekly plans
- [ ] Post-generation validation (safety rules, rep ranges, injury exclusions)
- [ ] Week 1 handling (no prescribed weights)
- [ ] Adaptive generation (accept previous week performance as input)
- [ ] Wire onboarding screen → Claude → mock plan display
- [ ] Iterate on prompt quality until output matches product brief expectations

### Milestone 3: Core Workout Refinements

Polish the daily workout experience based on what Milestones 1-2 reveal:

- [ ] PR detection logic (Epley formula: `1RM = weight * (1 + reps/30)`)
- [ ] Deload detection (1RM trend stall over 2+ weeks)
- [ ] Review Day AI narrative (Claude summarizes week, previews next)
- [ ] Quick-complete auto-fill with "previous performance" data
- [ ] Finalize all TypeScript types based on actual screen needs

### Milestone 4: Supabase Integration

Every screen and data contract is proven with mocks — now persist:

- [ ] Design database schema directly from finalized TypeScript types
- [ ] Row-level security policies
- [ ] Auth (sign up, sign in, session management, SvelteKit hooks)
- [ ] Server-side Supabase client
- [ ] Replace mock data imports with Supabase queries (screen by screen)
- [ ] Persistent set logging

### Milestone 5: PWA + Polish

- [ ] Offline caching (IndexedDB for current week + pending logs)
- [ ] Background sync on reconnection
- [ ] PWA install prompt
- [ ] Accessibility audit (44x44px targets, 16pt+ fonts, 4.5:1 contrast)
- [ ] Design system / global CSS tokens
- [ ] Page transitions and loading states

---

## Research-Driven Constraints

Rules from the [Research Findings Report](./Research-Findings-Report.md) that must be respected:

| Constraint | Source |
|-----------|--------|
| ExerciseDB grounding required for safe AI generation (4.8/5.0 vs 3.1/5.0 safety) | LLM-SPTRec study |
| 4 onboarding inputs max (<2 min to first workout) | Competitive analysis |
| Week 1 retention is make-or-break (77% drop in 3 days) | Engagement research |
| All periodization models equally effective — consistency > model | Meta-analysis (29 studies) |
| Injury exclusion lists must be hard-coded safety constraints | Expert consensus |
| Autoregulated deloads > fixed schedules | 100% expert consensus |

## Out of Scope

Per the [product brief](./product-brief.md):

- AI chat/feedback mechanism
- Equipment/gym memory or location tracking
- Dynamic UI per fitness level
