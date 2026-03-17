# Push — Roadmap

## Current State (as of March 2026)

### Infrastructure
| Layer | Status |
|-------|--------|
| **Auth** | Google OAuth via Supabase SSR — login, callback, route guards, session management |
| **Supabase** | Plans + set logs persisted. Dual-write: localStorage (immediate) + Supabase (async). Device UUID replaced with auth user ID |
| **AI Plan Generation** | Claude API with ExerciseDB grounding. Structured JSON output. Mock fallback on failure |
| **ExerciseDB** | Search, get by ID, list muscles/bodyparts/equipment |

### Pages
| Route | Status |
|-------|--------|
| `/` (Today) | Done — workout execution, quick-complete, dual-path logging, check-in overlay |
| `/plan` | Done — 7-day week schedule, day shuffle (tap-to-swap) |
| `/profile` | Done — avatar, identity chips, WeekCard, MuscleCard, streak/PRs, History link |
| `/history` | Done — calendar grid, lifetime stats, PRs, progress photos. Linked from Profile |
| `/exercise/[id]` | Done — tabbed detail (Log / Guide / History), ExerciseDB data |
| `/session/[date]` | Done — historical session detail |
| `/onboarding` | Done — 8 steps (experience, days, duration, equipment, goals, injuries, demographics, review) |
| `/settings` | Done — account, demographics, training config, preferences. All editable via bottom sheets |
| `/login` | Done — Google OAuth |

### Data Model
Full TypeScript types in `src/lib/types/index.ts`:
- `WeeklyPlan`, `PlannedDay`, `PlannedExercise`, `PlannedSet`
- `WorkoutLog`, `SetLog`, `CheckInState`
- `OnboardingData`, `GeneratedPlan`
- `WeekHistory`, `WeekMomentum`, `CalendarWeek`, `PersonalRecord`
- `ExerciseDBExercise`, `ExerciseDBSearchResult`
- `AppPreferences`, `WeightUnit`, `ReviewDay`, `RestTimerSeconds`

---

## Completed Milestones

### Milestone 1: Complete All Screens (Mock Data) ✅

- [x] Navigation restructure — Plan (calendar) · Today (text) · Profile (avatar)
- [x] Today page — workout execution with quick-complete and dual-path logging
- [x] Exercise Detail — tabbed content (Log / Guide / History), muscles in header, trainer cue
- [x] Week plan view — `WeekSchedule` on `/plan` with exercises and completion state
- [x] Profile page — WeekCard, MuscleCard, streak/PRs, identity chips
- [x] History page — calendar grid, lifetime stats, PRs, progress photos
- [x] Check-in & activity model — photo upload after last workout
- [x] Rest day UI — mid-week shows next session, end-of-week shows completion
- [x] Onboarding flow — 8 screens with all plan-quality inputs
- [x] ExerciseDB seed — 25 exercises with real IDs, body parts, muscles
- [x] Onboarding → plan wiring — completion generates a plan that populates Today and Plan pages

### Milestone 2: AI Plan Generation (Claude) ✅

- [x] Claude prompt template with ExerciseDB exercise grounding
- [x] Structured JSON output schema for weekly plans
- [x] Post-generation validation (safety rules, rep ranges, injury exclusions)
- [x] Week 1 handling (no prescribed weights)
- [x] Wire onboarding screen → Claude → plan display
- [x] Mock fallback when Claude API fails

### Milestone 3: Supabase Integration ✅

- [x] Database schema from finalized TypeScript types
- [x] Google OAuth (login, callback, route guards, session management)
- [x] Server-side Supabase client (`hooks.server.ts`)
- [x] Replace device UUID with auth user ID
- [x] Persistent set logging (localStorage + Supabase dual-write)
- [x] Plan persistence to Supabase
- [x] Day shuffle on Plan page

---

## Open Items

### Critical — App-breaking

- [x] **Week rollover** — Detects stale `week_start` in localStorage, clears week-scoped data, Today page auto-triggers new plan generation.
- [x] **Logout doesn't clear localStorage** — `clearSessionData()` wipes all 6 localStorage keys before `signOut()`.
- [x] **Supabase RLS** — All 5 tables have RLS enabled with ownership policies (see `docs/rls-policies.sql`).

### High — Data integrity

- [x] **Settings synced to Supabase** — Onboarding data and preferences stored in `user_settings` table with Supabase-first fetch + localStorage fallback.
- [x] **Settings changes trigger plan regeneration** — Changing plan-affecting fields (days, duration, equipment, goals, injuries, experience) prompts user to generate a new plan.

### Medium — UX gaps

- [ ] **Rest timer** — Preference exists in Settings but no timer UI during workouts. Either implement or remove.
- [ ] **Review day unused** — Preference stored but wired to nothing. Originally intended to control when check-in appears.
- [ ] **Photos only in IndexedDB** — No cloud sync. Lost on device change or cache clear.
- [ ] **History uses mock data** — Past weeks are hardcoded. Only current week is real. Need Supabase queries for historical plans.
- [ ] **No plan regeneration UI** — No way to request a new plan mid-week.
- [ ] **Error handling** — Supabase/network failures show "loading..." forever. No timeout, retry, or offline indicator.
- [ ] **Mock plan ignores user profile** — Fallback plan doesn't respect injuries, equipment, or training days.

### Low — Cleanup

- [ ] **Dead code: device.ts** — `getDeviceId()` only used as fallback in `auth.ts`. Can remove.
- [ ] **HTTP status codes** — Invalid exercises/sessions return 200 instead of 404.
- [ ] **Check-in photos not linked to weeks** — Flat list, no weekly context.

---

## Enhancements (Post-MVP)

Features that improve the experience but aren't required for the core loop:

- [ ] **Adaptive generation** — Accept previous week's performance as input to Claude for progressive overload
- [ ] **Exercise swaps** — Tap exercise → 3 alternatives from ExerciseDB by target muscle
- [ ] **Deload detection** — 1RM trend stall over 2+ weeks triggers deload recommendation
- [ ] **PR indicators on tiles** — Surface PRs on exercise tiles (detection logic exists in `workout-stats.ts`)
- [ ] **PWA install prompt** — Offline caching, background sync, install prompt
- [ ] **Accessibility audit** — 44x44px targets, 16pt+ fonts, 4.5:1 contrast

---

## Research-Driven Constraints

Rules from the [Research Findings Report](./Research-Findings-Report.md):

| Constraint | Source |
|-----------|--------|
| ExerciseDB grounding required for safe AI generation (4.8/5.0 vs 3.1/5.0 safety) | LLM-SPTRec study |
| Week 1 retention is make-or-break (77% drop in 3 days) | Engagement research |
| All periodization models equally effective — consistency > model | Meta-analysis (29 studies) |
| Injury exclusion lists must be hard-coded safety constraints | Expert consensus |
| Autoregulated deloads > fixed schedules | 100% expert consensus |

## Out of Scope

Per the [product brief](./product-brief.md):

- AI chat/feedback mechanism
- Equipment/gym memory or location tracking
- Dynamic UI per fitness level
