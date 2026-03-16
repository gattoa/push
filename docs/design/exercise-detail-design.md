# Exercise Detail — Interaction Design

## Metadata

| Field | Value |
|-------|-------|
| **Page** | Exercise Detail (`/exercise/[id]`) |
| **Status** | Design |
| **Traces to** | [Product Brief](../product-brief.md) — Exercise Detail, In-Gym Logging, Historical Data |
| **Research refs** | [[ISSUE-6-F004]] 2-3 tap quick-complete, [[ISSUE-6-F005]] no app solves dual-path logging, [[ISSUE-6-F014]] gym accessibility |

---

## Purpose

Exercise Detail is the "adjust" surface in the dual-path logging model. The athlete navigates here from the Today page to refine their performance data — editing actual weight and reps, reviewing form guidance, and checking historical trends.

From the [Today design](./today-design.md):

> **Today = execute** (tap to complete). **Detail page = adjust** (edit weight/reps, see history, swap).

Today is the gym's quick path — tap a set column and move on. Exercise Detail is the accurate path — the data refinement surface where the athlete says "I did 225 not 235" or "only got 9 reps." This is what the AI trainer actually learns from.

---

## The Two-Surface Model

```
Today (gym speed)              Exercise Detail (refinement)
┌──────────────────────┐       ┌──────────────────────┐
│ Bench Press    3/3 ✓ │  ──►  │ Bench Press          │
│ [✓10] [✓8] [✓6]     │       │ [Pec Major] [Triceps]│
│ 135   155   175      │       │ "slow eccentric"     │
└──────────────────────┘       │ Barbell · Flat Bench │
                               │                      │
  Quick toggle                 │ [Log] [Guide] [Hist] │
  Auto-fills planned values    │  1  [135] × [10]  ●  │
  Tap exercise name → Detail   │  2  [155] × [ 8]  ○  │
                               │  3  [175] × [ 6]  ○  │
                               └──────────────────────┘
                                 Editable inputs
                                 Actual reps/weight
                                 Form video & history
```

Both surfaces read/write the **same** set logs via a shared workout store. The Today page is the fast path; Exercise Detail is the accurate path.

---

## Information Hierarchy

The page has two zones: an **identity header** and **tabbed content**.

### Header (always visible)

The header identifies the exercise and communicates today's prescription. Ordered from identity to context:

1. **Exercise name + completion badge** — what to do
2. **Muscle chips** — what the exercise works (target muscles as primary chips, secondary muscles as secondary chips)
3. **Cue** — the trainer's personalized instruction for today (e.g., "slow eccentric", "2-sec pause")
4. **Equipment** — what to grab, inline text (e.g., "Barbell · Flat Bench")

### Tabbed content (below header)

Three tabs, with **Log** as the default active tab:

1. **Log** — per-set input rows + QuickComplete footer
2. **Guide** — form video/gif, overview, instructions, tips
3. **History** — past sessions, est. 1RM, trends

---

## Design Decisions

### 1. Muscles as identity chips, not body part chips

Body parts ("CHEST") and target muscles ("Pectoralis Major") convey the same information at different granularity. On the Today page, body parts belong in the exercise tile context line — they're sufficient for scanning a list of exercises. On the Detail page, the athlete has navigated to a specific exercise; the more specific target/secondary muscles describe what the movement IS, completing the exercise's identity.

Target muscles render as primary chips. Secondary muscles render as secondary chips (visually lighter). Body part chips are not shown — they're redundant with muscle data.

**Traces to:** [Today design](./today-design.md) — body parts appear in the exercise tile context line ("equipment + body part"). The detail page is a different surface with different needs. [Product brief](../product-brief.md): the detail page shows more than the tile.

### 2. Header ordering: name → muscles → cue → equipment

This separates **identity** (name + muscles) from **today's context** (cue + equipment).

- **Name** — identifies the exercise. Always first.
- **Muscles** — what the exercise works. Part of what the exercise IS. On the Today page, body parts serve this role in the context line; on the Detail page, the more specific muscle names replace them.
- **Cue** — the trainer's personalized instruction. [Product brief](../product-brief.md): "Each exercise includes: name, sets, reps, grips/**modifications**." The cue IS the modification. It's layered ON TOP of the exercise identity — "today, do bench press with slow eccentric."
- **Equipment** — what to grab. Practical context, inline text. Matches the Today page context line format.

**Traces to:** [Product brief](../product-brief.md): "grips/modifications." [Today design](./today-design.md) hierarchy adapted for the detail surface.

### 3. Tabbed content: Log | Guide | History

The header identifies the exercise. Everything below is managed by tabs — the athlete flips between logging, form reference, and history without scrolling past irrelevant content. Log is the default active tab since it's the primary action (why you navigated here).

**Tab labels:**

- **"Log"** — [Product brief](../product-brief.md): "In-Gym Logging", "log per-set weight, reps." [Today design](./today-design.md): "Detail page = adjust (edit weight/reps, see history, swap)." The action verb matches the product language.
- **"Guide"** — [Product brief](../product-brief.md): "form video", "instructions and tips." Captures all reference content: visual form guide (video) + step-by-step guide (instructions) + coaching guidance (tips). "Form" was considered but only covers the video, not text instructions.
- **"History"** — [Product brief](../product-brief.md): "exercise history chart." [Today design](./today-design.md): "Historical data lives on the exercise detail page." Competitor benchmark (Strong, Hevy) uses "History" for past performance data.

**Tab visibility:** Only tabs with content are shown. If only Log has content (no ExerciseDB data, no history), the tab UI is hidden entirely.

**Traces to:** Research [[ISSUE-6-F005]]: no app balances quick-complete with seamless detailed logging — tabs provide lightweight mode-switching (one tap, content swaps in place) vs. scrolling past irrelevant content.

### 4. Variations excluded

The trainer already chose this specific exercise. Variations ("try Incline Bench Press instead") are AI/trainer context — useful for the plan generator and the exercise swap feature, not for the athlete during a workout.

**Traces to:** Exercise swap feature (future, [product brief](../product-brief.md)). Research [[ISSUE-6-I003]]: contextual AI swap is Push's clearest differentiation — variations data feeds that feature, not this page.

### 5. History as trend context, not per-set comparison

[Today design](./today-design.md) explicitly states: "the prescribed weight IS the recommendation. Showing 'Last: 135 × 10' is redundant when the current prescription is '140 × 10' (the AI already factored in the history)."

History shows the trajectory — estimated 1RM, session-over-session progress, PRs — not per-set "last time" values cluttering the log inputs.

**Traces to:** [Today design](./today-design.md) Historical Performance Indicator section.

### 6. Log section: column headers + QuickComplete footer

Column headers (SET, WEIGHT, REPS) orient the input fields without adding weight. They're dim and uppercase — they orient the eye once, then disappear. QuickComplete is the batch action for the set rows — it belongs with the rows it operates on as a footer, not as a separate element.

**Traces to:** [Product brief](../product-brief.md): per-set input rows. Research [[ISSUE-6-F004]]: Strong/Hevy 2-3 tap quick-complete pattern. Research [[ISSUE-6-F014]]: 44x44px tap targets, gym readability.

---

## Page Structure

```
‹ Back

Exercise Name                  [completion badge]
[Pectoralis Major] [Triceps] [Ant. Delt]    ← muscle chips
"slow eccentric"                             ← cue
Barbell · Flat Bench                         ← equipment

[ Log* ]  [ Guide ]  [ History ]             ← segment control
┌─────────────────────────────────┐
│ (content for selected tab)      │
└─────────────────────────────────┘
```

---

## Tab Content

### Log (default active)

The primary interaction surface. Per-set input rows for editing weight and reps.

```
SET  WEIGHT  REPS
 1   [135] × [10]          ●
 2   [155] × [ 8]          ○
 3   [175] × [ 6]          ○
 4   [135] × [12]          ○    ← drop set
     drop  [115] × [12]
 5   [115] × [10]          ○    ← drop set
     drop  [ 95] × [10]
     drop  [ 75] × [10]

Complete All Sets
```

**SetRow behavior:**
- Number inputs pre-filled with target values from the plan
- Toggle button (right side) marks set complete, auto-fills actual = target
- When actual differs from target, values turn blue with small gray "was" annotation
- Warmup sets have a subtle background distinction and "warm" tag
- Drop set children show "drop" tag where set number would be
- Completed rows reduce to 0.4 opacity

**QuickComplete behavior:**
- Footer of the log section with a top divider
- Marks all remaining sets as complete (auto-fills planned values)
- Disabled when all sets are already done

### Guide

Form reference content from ExerciseDB. Only shown when ExerciseDB data is available.

- **Video/GIF** — exercise demonstration
- **Overview** — text description of the exercise
- **Instructions** — numbered step-by-step guide
- **Tips** — coaching cues for form

No variations — those are trainer/AI context (see Decision 4).

### History

Past performance data. Only shown when exercise history exists.

- **Summary** — est. 1RM with percent change, or best reps for bodyweight exercises
- **Sessions** — chronological list of past sessions with date, day label, set data, and PR badges

The `ExerciseHistory` component renders in embedded mode (no redundant title, since the tab label provides context).

---

## Set Types

All set types from the [Today design](./today-design.md) are supported with editable inputs:

### Standard Set
Single bout at a specific weight and rep count. Editable weight and reps inputs.

### Drop Set
Multiple bouts with decreasing weight. The parent set has a toggle; child drops have editable inputs but no individual toggle. One toggle completes the entire drop set (matching Today page behavior).

### Warmup Set
Lighter set before working sets. Visually distinguished with a subtle background and "warm" tag. Editable like standard sets.

### Bodyweight
Weight input replaced with "BW" label. Only reps are editable.

---

## Data Flow

```
ExerciseDB API (server)          Shared Workout Store (client)
       │                                    │
  exercise data                    plannedExercise
  (video, muscles,                 plannedSets
   instructions)                   setLogs
       │                                    │
       └──────────── +page.svelte ──────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
           Guide tab  Log tab  History tab
              │          │          │
         ExerciseDB   SetRow    ExerciseHistory
           data      + store     (mock history)
                    mutations
```

The page receives ExerciseDB data from the server load function and queries the shared workout store for planned sets and logs. All mutations (toggle, update weight/reps, complete all) go through the store, which syncs state back to the Today page.

---

## State Sync

Both Today and Exercise Detail read/write the same workout store:

1. Toggle set on Today → navigate to Exercise Detail → set shows as completed with correct values
2. Edit actual reps/weight on Exercise Detail → navigate back to Today → values reflected
3. Quick Complete on Exercise Detail → Today shows all sets done
4. Drop sets: single-toggle on Today, per-drop editable inputs on Exercise Detail

---

## Accessibility

Per research [[ISSUE-6-F014]]:

- All tap targets (set toggles, tab buttons, back button) ≥ 44x44px
- Font sizes ≥ 16pt for primary content (set numbers, weight/reps values)
- Contrast ratio ≥ 4.5:1 (WCAG AA)
- Tab buttons span full width for easy one-handed reach
- Number inputs use `type="number"` with `min="0"` for appropriate mobile keyboard

---

## Open Questions

1. **Exercise swap UI:** Where does the swap action live on this page? Button in the header? Gesture? Deferred until the swap feature is designed (requires ExerciseDB query-by-muscle integration).
2. **Rest timer integration:** Should completing a set on the Detail page trigger the rest timer? Requires rest timer design doc.
3. **Week 1 (no weights):** When the AI prescribes reps but not weights, weight inputs show 0. Should they show a placeholder instead? The Today page uses `—` as a placeholder.

---

## Components

| Component | Role |
|-----------|------|
| `SetRow` | Per-set editable input row with toggle. Handles standard, drop, warmup, and bodyweight sets. |
| `QuickComplete` | Batch complete action. Footer of the log section. |
| `ExerciseHistory` | Past performance display with summary and session list. Supports `embedded` mode for tab context. |

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/routes/(app)/exercise/[id]/+page.svelte` | Page component: header, tab state, tab content rendering |
| `src/routes/(app)/exercise/[id]/+page.server.ts` | Server load: fetches ExerciseDB data by ID |
| `src/lib/components/SetRow.svelte` | Set logging row with editable inputs |
| `src/lib/components/QuickComplete.svelte` | Batch complete button |
| `src/lib/components/ExerciseHistory.svelte` | History display with embedded mode |
| `src/lib/stores/workout.svelte.ts` | Shared workout state: getters and mutations |
