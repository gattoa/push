# Rest Day & Post-Workout Completion — Interaction Design

## Metadata

| Field | Value |
|-------|-------|
| **Page** | Today (`/`) — rest day state + post-workout completion state |
| **Status** | Design |
| **Traces to** | [Product Brief](./product-brief.md) — Weekly Cycle, Daily Workout |
| **Research refs** | [[ISSUE-6-F020]] 77% drop within 3 days without engagement, [[ISSUE-6-F021]] daily Week 1 engagement → 80% higher 6-month retention, [[ISSUE-6-R004]] autoregulated deload detection |
| **Related** | [Today View Design](./today-design.md) — training day interactions |

---

## Purpose

Rest days and post-workout completion share one question: **"What now?"**

Both are moments where the user has no sets to execute. The difference is emotional:
- **Post-workout:** accomplishment — "I just did something"
- **Rest day:** anticipation — "I'm preparing for what's next"

Neither should feel empty. Research shows daily engagement matters for retention ([[ISSUE-6-F020]]), and rest days that feel like dead air are a dropout risk. But rest days shouldn't feel busy either — they should be calm, purposeful, and brief.

---

## The Two States

### Post-Workout Completion (training day, all sets done)

The user just finished their workout. This is a transition from execution to reflection.

**Information hierarchy:**
1. **Completion acknowledgment** — "Workout Complete" with set/exercise count (existing black card)
2. **Contextual stat highlight** — when relevant, surface a meaningful data point:
   - "Heaviest bench press this month"
   - "New PR: Squat 225 × 4"
   - "First time completing all sets on Pull day"
   - Only shown when there's something genuine — no forced celebrations
3. **Tomorrow's workout preview** — what's coming next
4. **Week progress** — training days completed this week
5. **Dimmed exercise tiles** — remain visible for undo capability

**State transition:**
```
All sets completed
→ Completion card appears (slides in above tiles)
→ Tiles dim to 0.6 opacity
→ Tomorrow preview + week progress appear below tiles
→ User can still undo sets (tiles are interactive)
```

### Rest Day (no prescribed workout)

The user opens the app on a rest day. The page should feel intentionally calm — not broken or missing content.

**Information hierarchy:**
1. **Header** — date + "Rest Day" (same position as training day header, same styling)
2. **Recovery context** — what muscles are recovering based on recent training days. Informational, not actionable. Example: "Recovering: chest, shoulders, triceps" (derived from the previous training day's body parts).
3. **Tomorrow's workout preview** — next training day's workout
4. **Week progress** — training days completed this week

**No exercises, no sets, no progress bar.** The absence of these elements IS the design — it communicates "today is different."

---

## Shared Components

### Tomorrow's Workout Preview

Shows the next training day (skipping rest/review days):
- Day name + label (e.g., "Friday — Push")
- Body parts as chips (e.g., "chest · shoulders · triceps")
- Exercise count + set count (e.g., "3 exercises · 9 sets")

**Edge cases:**
- Last training day of the week → show "Next week starts Monday" or similar
- Review day tomorrow → still show the next training day after review
- All remaining days are rest/review → show next week's first training day

This component appears in both rest day and post-workout completion states, in the same position and with the same design. Consistent pattern = less to learn.

### Week Progress

Shows how many training days the user has completed this week:
- Simple text: "3 of 5 training days this week"
- Optional: dot indicators for each day (filled = completed, empty = upcoming, no dot = rest)
- Not gamified — informational, like a calendar view compressed into one line

This component also appears in both states.

---

## Recovery Context (Rest Day Only)

Derived from the most recent training day's exercises:
- Look at yesterday's (or most recent) completed training day
- Extract unique body parts from that day's exercises
- Display as: "Recovering: chest, shoulders, triceps"

This is purely informational — it doesn't prescribe stretching, mobility, or active recovery (that would need its own design). It answers "why am I resting?" with "because you trained these muscles."

**Future extension:** If wellness check-ins are added later, fatigue data could enhance this section (e.g., "Recovering: chest, shoulders · Feeling: good"). But the check-in interaction needs its own design — not part of this scope.

---

## Wellness Check-In (Future — Design Only)

A lightweight, optional, non-blocking prompt on rest days:
- "How are you feeling?" with a 1-5 scale (tap one)
- If ignored, nothing breaks — no nag, no reminder
- If used, data feeds into AI autoregulation over time ([[ISSUE-6-R004]])
- Never blocks content — always below the main rest day content

**Not building now.** Noted here because the rest day layout should leave room for it. The check-in is a bonus data collection opportunity, not a core interaction.

---

## Post-Workout Stat Highlights (Moderate Celebration)

When the user completes a workout, contextual stats appear when meaningful:

**Types of highlights:**
- **PR (personal record)** — user exceeded their previous best weight or reps for an exercise
- **Milestone** — first time completing a specific workout type, or first full week
- **Trend** — "3rd Push day in a row with all sets completed"

**Rules:**
- Only show when genuinely earned — never fabricate encouragement
- Maximum one highlight per workout — pick the most significant
- Tone is understated, not celebratory: a stat, not confetti
- Implementation deferred — needs historical comparison logic that doesn't exist yet in the mock data layer

---

## Data Requirements

### Tomorrow preview needs:
- Access to the full week's `PlannedDay[]` to find the next training day
- That day's exercises (count + body parts)
- That day's planned sets (count)

### Week progress needs:
- All training days for the week (non-rest, non-review)
- Completion state for each (all sets completed = done)

### Recovery context needs:
- The most recent completed training day's exercises
- Their body parts

All of this is derivable from existing mock data — no new types needed.

---

## Open Questions

1. **Multiple rest days in a row:** If the user has back-to-back rest days, does recovery context change? (Day 1: "Recovering: chest" → Day 2: still "Recovering: chest" or just "Rest Day"?)
2. **Week progress scope:** Does it count partially completed training days? (User did 7/9 sets — is that day "completed"?)
3. **Tomorrow preview tap target:** Should tapping the preview card navigate to that day's plan view? Or is it informational only?

---

## Accessibility

Same standards as training day (from [today-design.md](./today-design.md#accessibility-research-backed)):
- Font sizes ≥ 16pt for primary content
- Contrast ratio ≥ 4.5:1 (WCAG AA)
- Rest day should be comfortable to read in any lighting (not gym-specific)
