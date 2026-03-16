# Push — Roadmap

## Current State

### API Integrations
| Service | Status | File |
|---------|--------|------|
| ExerciseDB (RapidAPI) | Working — search, get by ID, list muscles/bodyparts/equipment | `src/lib/api/exercisedb.ts` |
| Supabase | Client configured, no schema or auth | `src/lib/api/supabase.ts` |
| Anthropic (Claude) | Client configured, not yet used | `src/lib/api/anthropic.ts` |

### Data Model
Full TypeScript types in `src/lib/types/index.ts`:
- `WeeklyPlan`, `PlannedDay`, `PlannedExercise`, `PlannedSet`
- `WorkoutLog`, `SetLog`, `CheckInState`
- `OnboardingData`, `GeneratedPlan`
- `WeekHistory`, `WeekMomentum`, `CalendarWeek`, `PersonalRecord`
- `ExerciseDBExercise`, `ExerciseDBSearchResult`
- `AppPreferences`, `WeightUnit`, `ReviewDay`, `RestTimerSeconds`

### Service Layer
| Service | Purpose | File |
|---------|---------|------|
| `workout.ts` | Current week plan, exercises, sets, logs | `src/lib/services/workout.ts` |
| `history.ts` | 4 weeks of mock historical data | `src/lib/services/history.ts` |
| `plan-generator.ts` | Mock plan generation from onboarding data | `src/lib/services/plan-generator.ts` |

### Mock Data
- 25 exercises with real ExerciseDB IDs across a full PPL split
- Static exercise data seeded from ExerciseDB in `src/lib/data/exercises.json`
- 4 weeks of history with varying completion patterns
- 7-day PPL split: Push / Pull / Legs / Rest / Push / Pull / Rest

### Pages
| Route | Status |
|-------|--------|
| `/` (Today) | Done — workout execution with quick-complete set logging |
| `/plan` | Done — 7-day week schedule with exercises and completion state |
| `/profile` | Done — avatar, context chips, WeekCard, MuscleCard, streak/PRs |
| `/history` | Done — calendar grid, lifetime stats, PRs, progress photos |
| `/exercise/[id]` | Done — tabbed detail (Log / Guide / History), dual-path logging |
| `/session/[date]` | Done — day detail from calendar drill-down |
| `/onboarding` | Done — 4-screen flow (experience, days, goals, injuries) |
| `/settings` | Sunset — config distributed to Profile editable chips |

### Components
| Component | Purpose |
|-----------|---------|
| `Navigation` | Icon-driven top bar: Plan (calendar) · Today (text) · Profile (avatar) |
| `DailyWorkout` | Renders workout or rest day content on Today |
| `ExerciseTile` | Exercise with set columns, target muscles, completion state |
| `SetRow` | Per-set editable input (weight, reps, toggle) |
| `SetCheckbox` | Quick set toggle for Today page |
| `QuickComplete` | Batch-complete all sets |
| `DropSetColumn` | Drop set display with stacked reps/weights |
| `WeekSchedule` | 7-day itinerary on Plan page |
| `WeekCard` | Compact read-only week progress on Profile |
| `MuscleCard` | Interactive muscle group breakdown by body region |
| `ExerciseHistory` | Past performance, est. 1RM, trends |
| `CalendarGrid` | Full calendar with day-detail interaction |
| `DayDetailPanel` | Slide panel for calendar day drill-down |
| `CheckInCard` | Progress photo upload (end-of-week) |
| `PhotoUpload` / `PhotoViewer` | Camera input and full-screen overlay |
| `BottomSheet` | Reusable modal for option selection or custom content |
| `AccountSheet` | Email/account settings sheet |

---

## MVP Milestones

> **Philosophy:** Build all screens and interactions with mock data first to discover the true data shape. Supabase comes last as a mechanical swap once the data model is proven through real UI usage.

### Milestone 1: Complete All Screens (Mock Data)

Core screens and interactions with mock data:

- [x] **Navigation restructure** — Plan (calendar) · Today (text) · Profile (avatar)
- [x] **Today page** — workout execution with quick-complete and dual-path logging
- [x] **Exercise Detail** — tabbed content (Log / Guide / History), muscles in header, trainer cue
- [x] **Week plan view** — `WeekSchedule` on `/plan` with exercises and completion state
- [x] **Profile page** — WeekCard, MuscleCard, streak/PRs, editable context chips
- [x] **History page** — calendar grid, lifetime stats, PRs, progress photos
- [x] **Check-in & activity model** — photo upload after last workout, independent overlay activity
- [x] **Rest day UI** — mid-week shows next session, end-of-week shows completion
- [x] **Onboarding flow** — 4 screens: experience, training days, goals, injuries
- [x] **ExerciseDB seed** — 25 exercises with real IDs, body parts, muscles
- [ ] **Onboarding → plan wiring** — completion generates a real plan that populates Today and Plan pages

### Milestone 2: AI Plan Generation (Claude)

Prototype the AI loop with mock I/O before wiring to persistence:

- [ ] Claude prompt template with ExerciseDB exercise grounding
- [ ] Structured JSON output schema for weekly plans
- [ ] Post-generation validation (safety rules, rep ranges, injury exclusions)
- [ ] Week 1 handling (no prescribed weights)
- [ ] Adaptive generation (accept previous week performance as input)
- [ ] Wire onboarding screen → Claude → plan display
- [ ] Iterate on prompt quality until output matches product brief expectations

### Milestone 3: Supabase Integration

Every screen and data contract is proven with mocks — now persist:

- [ ] Design database schema directly from finalized TypeScript types
- [ ] Row-level security policies
- [ ] Auth (sign up, sign in, session management, SvelteKit hooks)
- [ ] Server-side Supabase client
- [ ] Replace mock data imports with Supabase queries (screen by screen)
- [ ] Persistent set logging

### Milestone 4: PWA + Polish

- [ ] Offline caching (IndexedDB for current week + pending logs)
- [ ] Background sync on reconnection
- [ ] PWA install prompt
- [ ] Accessibility audit (44x44px targets, 16pt+ fonts, 4.5:1 contrast)
- [ ] Design system / global CSS tokens
- [ ] Page transitions and loading states

---

## Enhancements

Post-MVP features that improve the experience but aren't required for the core loop:

- [ ] **Rest timer** — countdown between sets (90s hypertrophy / 180s strength)
- [ ] **PR indicators** — surface PRs on exercise tiles and detail page (detection logic exists in `workout-stats.ts`)
- [ ] **Exercise swaps** — tap exercise → 3 alternatives from ExerciseDB by target muscle
- [ ] **Historical performance display** — trends on exercise detail (est. 1RM trajectory, session comparison)
- [ ] **Deload detection** — 1RM trend stall over 2+ weeks triggers deload recommendation
- [ ] **Assignment narrative** — Claude summarizes week and delivers next plan with trainer message

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
