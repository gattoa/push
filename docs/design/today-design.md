# Today View — Interaction Design

## Metadata

| Field | Value |
|-------|-------|
| **Page** | Today (`/`) |
| **Status** | Design |
| **Traces to** | [Product Brief](../product-brief.md) — Daily Workout, In-Gym Logging, Equipment Swaps, Historical Data, Check-in, Assignment |
| **Research refs** | [[ISSUE-6-F004]] 2-3 tap quick-complete, [[ISSUE-6-F005]] no app solves dual-path logging, [[ISSUE-6-I003]] contextual AI swap, [[ISSUE-6-F014]] gym accessibility |

---

## Purpose

Today is the home screen. It answers one question: **"What do I do right now?"**

The user opens Push in the gym, between sets, with one hand, possibly poor connectivity. The Today view must deliver their workout, let them log progress with minimal friction, and get out of their way.

## The Benchmark

The experience Push replaces is a text message from a personal trainer:

```
Bench Press: 18, 15, 12, 12 drop 12, 10 drop 10 drop 10
Seated Shoulder Press: 10, 8, 6
Arnold Press: 12, 10, 8

superset:
Lateral Raise: 15, 12, 12
Rear Delt Fly: 15, 12, 12
```

This format is dense, scannable, and communicates everything in a glance. Push must match this information density while adding interactivity (completion tracking, weight logging, rest timer).

---

## Information Hierarchy

**Top → bottom, most important first:**

1. **Date + workout label** — "Monday, March 9" / "Push" — orients the user to today
2. **Progress** — "2 of 9 sets" — position in the workout
3. **Exercise tiles** — the workout, in prescribed order
4. **Rest timer** (when active) — countdown between sets

**Within an exercise tile:**

1. **Exercise name** — what to do (tappable → detail page)
2. **AI cue** — trainer modification note, if prescribed (e.g., "slow eccentric", "neutral grip", "2-sec pause")
3. **Equipment + body part** — context line (e.g., "dumbbells · chest")
4. **Sets (columnar)** — reps prominent on top row (primary), weight below (secondary context)
5. **Completion state** — how much is done (badge: ✓ or X/Y)

---

## Set Types

The AI trainer prescribes several types of sets. The data model and display must accommodate all of them, even if implementation is phased.

### Standard Set
A single bout at a specific weight and rep count.
```
135 lbs × 10
```

### Drop Set
Multiple bouts performed consecutively with decreasing weight, no rest between drops. Counts as one "set" in the workout.
```
135 × 12 drop 115 × 12
115 × 10 drop 95 × 10 drop 75 × 10
```

### Superset
Two (or more) exercises performed back-to-back without rest. The exercises are grouped and their sets are paired.
```
superset:
  Lateral Raise: 15, 12, 12
  Rear Delt Fly: 15, 12, 12
```

### Warmup Set
A lighter set before working sets. May or may not be tracked.
```
Bar × 10 (warmup)
```

---

## Display Patterns

### Columnar Set Layout

Sets are displayed as vertical columns: reps prominent on top (primary), weight below (secondary context). Each column is one set, and the whole column is a single tap target. This preserves the density of the text-message benchmark while establishing clear information hierarchy — reps are the prescription, weight is the tool.

**Standard sets, varying weight:**
```
Bench Press                              2/3
slow eccentric · dumbbells · chest

 ✓10     8      6
 135    155    175
```

**Standard sets, same weight (always shown per-set for consistency):**
```
Lateral Raise                            0/3
shoulders

  15    12     12
  15    15     15
```

**Bodyweight:**
```
Pull-ups                                 0/3
back

  10     8      6
  BW    BW     BW
```

**Drop sets:**
```
Bench Press                                    0/5
chest

 [10]   [8]   [6]   ╭ drop ──────────╮   ╭ drop ─────────────────╮
 135    155    175   │ 12  →  12      │   │ 10  →  10  →  10     │
                    │ 135    115      │   │ 115    95     75     │
                    ╰─────────────────╯   ╰──────────────────────╯
```
Each drop is a reps/weight stack (same as standard sets), with a single `→` vertically centered between stacks. The drop group sits inside a rounded container with a "drop" label integrated into the border, visually distinguishing it from standard set columns. The entire container is one tappable element — one tap completes the whole drop set.

**Supersets:**
Supersetted exercises remain as independent tiles — each with its own name, sets, and completion state. A vertical connector between them communicates "do these back-to-back":
```
┌──────────────────────────────┐
│ Lateral Raise · shoulders    │
│  15    12    12               │
│  15    15    20               │
└──────────────────────────────┘
               |
          ○ superset
               |
┌──────────────────────────────┐
│ Chest Dip · chest            │
│  12    10     8              │
│  BW    BW    BW              │
└──────────────────────────────┘
```
The connector is a vertical line with a small pill label ("superset") centered between the tiles, with negative margin pulling them closer together. Each exercise is tapped independently — the connector is purely informational. Data model: exercises in a superset share a `superset_group` ID on `PlannedExercise`.

### Interaction on a Set Column

- **Tap column** → mark complete (auto-fills actual weight/reps from prescribed values). Whole column is the tap target (44px+ min).
- **Tap completed column** → undo
- **No inline editing** — Today is quick-complete only. To adjust weight/reps, tap the exercise name → detail page.

### Week 1 (No Weights)

The AI prescribes exercises, sets, and reps — but not weights. The user enters weights for the first time.

```
Bench Press                              0/3
chest

  10     8      6
  —      —      —
```

The `—` is a clear placeholder. Tapping a column with no prescribed weight navigates to the detail page where the user enters their weight via SetRow inputs. Baseline data collection is routed through the detailed path, which is appropriate since entering weight for the first time IS a detailed action.

---

## Logging Paths

**Product brief requirement:** Quick-complete and granular logging paths, both available, user chooses depth.

**Research finding (F005):** No app has solved dual-path logging without mode-switching.

### Quick Path (Today view)
Tap set column → done. Auto-fills weight/reps from the plan. **2 taps: see set → tap → logged.** This is the default for users who trust the prescribed values and just want to track completion.

### Detailed Path (Exercise detail page)
Tap the exercise name → navigate to `/exercise/[id]`. Full page with:
- Per-set input rows (SetRow component) for editing weight/reps
- Form video
- Exercise history chart
- Instructions and tips
- Swap exercise option

For users who want to adjust values, see history, or get form guidance.

**Key design decision:** Today is execute-only (tap to complete). The detail page handles all adjustments. This is a deliberate separation:
- **Today** = execute (tap to complete)
- **Detail page** = adjust (edit weight/reps, see history, swap)

---

## Active Exercise

The first exercise with incomplete sets is the "active" exercise. It receives a subtle visual distinction (e.g., border emphasis) to answer "what's next?" at a glance. As exercises complete, the active indicator moves down the list. Completed exercises recede visually.

---

## State Transitions

### Training Day Flow
```
Open app → See workout → Tap set column → Set logged
→ Tap next set → ... → All sets done → Completion summary → Done
```

### Rest Day
See [Rest Day & Post-Workout Completion Design](./rest-day-design.md). Rest day shows the next training session's exercises below the header.

### Activity Overlays (Check-in & Assignment)

The old "Review Day" concept has been decomposed into four independent activity types:

1. **Workout** — user sees exercises and logs sets
2. **Rest** — no workout scheduled
3. **Check-in** — user uploads progress photos (optional). Appears as a card on the Today page above the day's base content. Photos are supplementary data for the AI trainer — never a gate for plan generation.
4. **Assignment** — trainer delivers next week's plan (deferred — the new plan activates silently, and the Plan page handles visibility). Trainer message with itinerary, progress notes, and encouragement will be added when real AI exists.

A day's label always reflects its workout status ("Push", "Pull", "Rest"), never "Review." Activities overlay on the day as cards — the day's base content (workout tiles or rest preview) is unchanged.

#### Check-in Trigger

The check-in card appears after the user completes their last scheduled workout of the week — not on a configured day. It persists across app opens until the new week's plan activates. There is no "Skip" button; the non-action is the skip. If the user never uploads photos before the new week starts, the check-in window simply closes. The LLM generates the next week's plan from performance data regardless.

**Design rationale:** The user finishes their last set in the gym but won't take progress photos there — they'll do it at home, in a locker room, whenever they're comfortable. The card needs to be passive, not urgent. It's there when they're ready. The copy ("Optional snapshot for your trainer") communicates zero pressure.

Check-in and assignment are independent — they don't need to be connected in the UI. The user uploads photos and leaves. The plan generates asynchronously. No competitive precedent for this model — core differentiator per research [[ISSUE-6-I009]].

### Rest Timer
*Separate design doc needed.* Interaction between rest timer and set completion needs its own design thinking.

---

## Workout Completion

When all sets across all exercises are done:
- Progress bar text changes to "Complete" (the full bar IS the completion signal)
- Exercise tiles stay at full opacity with checkmarks — the tiles ARE the completion evidence
- User can still undo sets (tiles remain interactive; undoing reverts progress bar)
- No separate completion card, no tile dimming, no additional content below tiles
- No automatic navigation away

**Design rationale:** The trainer-text benchmark has no celebration moment — you cross off the last exercise and you're done. The tiles with checkmarks and the full progress bar are one clear signal. Additional elements (cards, previews, week summaries) are redundant or solve problems the user doesn't have.

See [Rest Day & Post-Workout Completion Design](./rest-day-design.md) for stat highlight rules (future).

---

## Exercise Swaps

**Research finding (I003):** Contextual AI swap is Push's clearest differentiation. "Tap → 3 AI alternatives → pick."

Initiated from the exercise tile (gesture or button TBD — swipe or tap icon). Shows 3 alternative exercises targeting the same muscle group, sourced from ExerciseDB. User picks one, it replaces the exercise in the current plan. One-time swap, no persistent memory.

*Not in current build scope — requires ExerciseDB query-by-muscle integration.*

---

## Data Model

### Current (Implemented)

```typescript
PlannedSet: {
  id: string;
  planned_exercise_id: string;
  set_number: number;
  set_type?: 'standard' | 'drop' | 'warmup';
  target_reps: number;
  target_weight: number | null; // null = bodyweight
  drops?: { target_reps: number; target_weight: number | null }[];
}

PlannedExercise: {
  ...existing fields,
  equipments: string[];    // denormalized from ExerciseDB
  cue?: string;            // AI-prescribed modification
  superset_group?: string; // exercises sharing a group ID are supersetted
  order: number;
}

SetLog: {
  ...existing fields,
  drop_logs?: { actual_reps: number | null; actual_weight: number | null }[];
}

CheckInState: {
  weekPlanId: string;
  photoIds: string[];
  completedAt: string | null; // window closes when new week starts
}
```

---

## Historical Performance Indicator

**Decision:** Not shown on the Today tile. The AI prescribes weight based on the user's history — the prescribed weight IS the recommendation. Showing "Last: 135 × 10" is redundant when the current prescription is "140 × 10" (the AI already factored in the history). Historical data lives on the exercise detail page for users who want to see their trend.

---

## Open Questions

1. **Swap gesture:** Swipe on tile vs. dedicated swap button/icon? Swipe is discoverable for mobile users but invisible. Button is explicit but adds visual noise.
2. ~~**Superset display:**~~ **Resolved:** Separate tiles with a vertical connector (line + pill label) between them. Each exercise keeps its own tile and completion state.
3. ~~**Drop set completion:**~~ **Resolved:** One tap completes the whole drop set. The container treatment (rounded border + "drop" label) makes it visually clear that the group is one unit = one action.
4. **PR indicator on Today:** When the user logs a weight/rep combo that exceeds their previous best, should a PR badge appear immediately on the set chip?

---

## Accessibility (Research-Backed)

Per [[ISSUE-6-R014]]:
- All tap targets ≥ 44×44px (iOS HIG)
- Font sizes ≥ 16pt for primary content
- Contrast ratio ≥ 4.5:1 (WCAG AA)
- Bottom-reachable interactions (one-handed use in gym)
- Test under gym lighting conditions
