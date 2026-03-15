# Rest Day & Post-Workout Completion — Interaction Design

## Metadata

| Field | Value |
|-------|-------|
| **Page** | Today (`/`) — rest day state + post-workout completion state |
| **Status** | Design |
| **Traces to** | [Product Brief](./product-brief.md) — Weekly Cycle, Daily Workout |
| **Related** | [Today View Design](./today-design.md) — training day interactions |

---

## Purpose

Push is a workout tracker. It's not an engagement platform. The app exists to help users execute their workouts — not to give them reasons to open the app when there's nothing to do.

---

## The Two States

### Post-Workout Completion (training day, all sets done)

The user just finished. The tiles with checkmarks on every set ARE the completion evidence.

**What changes:**
- Progress bar text changes to "Complete"
- Tiles stay at full opacity — checkmarks tell the story
- User can still undo sets (tiles remain interactive; undoing reverts progress bar)

**What doesn't appear:**
- No separate completion card — redundant with the tiles and progress bar
- No tile dimming — the checkmarks communicate completion; dimming de-emphasizes the user's work
- No "tomorrow preview" — the user can check the plan page if they want to see their schedule
- No week progress summary — not solving a real problem

**Design rationale:** The trainer-text benchmark has no celebration moment. You cross off the last exercise and you're done. Three redundant "done" signals (card + dimmed tiles + full progress bar) is worse than one clear one.

### Rest Day (no prescribed workout)

The header shows the date + "Rest." Below it:

**Mid-week rest day** (training days still ahead): Shows the next training session's exercises — exercise names with body parts. Concrete and scannable. Lets the user know what equipment they'll need and mentally prepare.

**End-of-week rest day** (all training days complete): Shows "You're done for the week." If the check-in window is open (all training days completed, new week hasn't started), the check-in card appears above this message. See [today-design.md](./today-design.md) for check-in details.

**What doesn't appear:**
- No recovery context cards — the user knows what they trained
- No wellness check-in — this is a workout tracker, not a wellness app
- No engagement hooks — there's no reason to spend time in the app on a rest day, and that's fine

---

## Post-Workout Stat Highlights (Future — Deferred)

When historical comparison logic exists, contextual stats could appear in the progress bar area when genuinely earned:
- "New PR: Squat 225 × 4"
- "Heaviest bench press this month"

**Rules:**
- Only show when genuinely earned — never fabricate encouragement
- Maximum one highlight per workout
- Tone is understated: a stat, not confetti
- Implementation deferred — needs historical comparison infrastructure

---

## Open Questions

1. **PR indicator on Today:** When the user logs a weight/rep combo that exceeds their previous best, should a PR badge appear immediately on the set column? (Also tracked in [today-design.md](./today-design.md) open question #4)
