# Push Workout Tracker — Technical Specification

Complete reference for rebuilding or continuing development. Captures every constraint, API behavior, and architectural decision discovered through development.

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | SvelteKit | 2.55+ |
| UI | Svelte 5 (runes) | 5.0+ |
| Styling | Inline CSS (no Tailwind) | — |
| Backend/Auth | Supabase (Auth + Postgres) | — |
| AI | Anthropic Claude API | Sonnet 4 |
| Exercise Data | ExerciseDB via RapidAPI | v1 |
| Hosting | Vercel | Free tier |
| PWA | @vite-pwa/sveltekit | — |
| Package Manager | pnpm | 10.28+ |

---

## 2. ExerciseDB API (Critical Constraints)

### Subscription
- **Provider:** AscendAPI via RapidAPI
- **Listing:** "EDB with GIFs and Images by AscendAPI"
- **Host:** `edb-with-gifs-and-images-by-ascendapi.p.rapidapi.com`
- **Base URL:** `https://{host}/api/v1`
- **Free tier:** 100 requests/day
- **Auth:** RapidAPI headers (`x-rapidapi-key`, `x-rapidapi-host`, `Content-Type: application/json`)

### Terms of Service (Section 3 — Storage Prohibition)
- **Cannot store** any API data beyond 1-hour temporary cache
- **Cannot store** text, metadata, images, GIFs, videos, descriptions, instructions
- **Real-time fetching only** — data must be freshly requested for every use
- **Accepted tradeoff:** Exercise metadata (body_parts, target_muscles, equipments) stored as part of AI-generated plans. This is plan content, not a raw API dump.

### Endpoint Reference (Tested & Confirmed)

**List exercises by equipment (used for plan generation catalog):**
```
GET /api/v1/exercises?equipment={name}&limit=25
```
- Equipment names are **lowercase**: `body weight`, `dumbbell`, `barbell`, `cable`
- Max page size: 25
- Pagination: cursor-based (`meta.nextCursor`, `meta.hasNextPage`)
- **Do NOT paginate** — single page of 25 is sufficient and conserves quota
- Response: `{ success: true, meta: { total, hasNextPage, nextCursor }, data: [...] }`

**Get exercise by ID (used for exercise detail page):**
```
GET /api/v1/exercises/{exerciseId}
```
- Returns full exercise with GIFs, instructions, tips, related exercises
- Response: `{ success: true, data: { exerciseId, name, imageUrls, gifUrls, bodyParts, targetMuscles, secondaryMuscles, equipments, difficulty, exerciseTypes, overview, instructions, relatedExerciseIds } }`

**Search exercises:**
```
GET /api/v1/exercises/search?search={query}&limit=25
```

**List all equipment names:**
```
GET /api/v1/equipments
```
- Returns: `{ success: true, data: [{ name: "body weight" }, { name: "dumbbell" }, ...] }`
- All names lowercase

**List all body parts / muscles:**
```
GET /api/v1/exercises/bodyparts
GET /api/v1/exercises/muscles
```

### Key Differences from Old API ("EDB with Videos and Images")
| Feature | Old API | New API (Current) |
|---------|---------|-------------------|
| Equipment filter | `/exercises/equipment/{NAME}` (path) | `/exercises?equipment={name}` (query param) |
| Equipment casing | UPPERCASE (`BODY WEIGHT`) | lowercase (`body weight`) |
| Exercise IDs | `exr_` prefix | `edb_` prefix |
| Pagination | `limit=0` returns all | Max 25/page, cursor-based |
| Response wrapper | `{ data: [...] }` | `{ success, meta, data }` |
| GIFs | Separate field or none | `gifUrls` object with resolution variants |

### Equipment Name Mapping (User Selection → API Name)
```
bodyweight    → body weight
dumbbells     → dumbbell
barbell       → barbell
cable_machine → cable
full_gym      → body weight, dumbbell, barbell, cable
```
Bodyweight is **always** included regardless of selection.

### API Call Budget
- Plan generation: 1-4 calls (1 per equipment type)
- Exercise detail view: 1 call per exercise
- Target: <10 calls per user session
- Never paginate — 25 exercises per equipment type is sufficient

---

## 3. Vercel Deployment

### Configuration
- Adapter: `@sveltejs/adapter-vercel` with `{ runtime: 'nodejs22.x' }`
- **Function timeouts must be explicitly set** via `export const config = { maxDuration: N }` in each `+server.ts`
  - Plan generation: `maxDuration: 60` (Claude can take 15-30s)
  - Catalog fetch: `maxDuration: 30`
- Default timeout on free tier is **10 seconds** — will cause 504 errors if not overridden

### Environment Variables (5 required)
```
PUBLIC_SUPABASE_URL=https://labxmkpmmqygookrnqgg.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<key>
ANTHROPIC_API_KEY=<key>
EXERCISEDB_API_KEY=<key>
EXERCISEDB_API_HOST=edb-with-gifs-and-images-by-ascendapi.p.rapidapi.com
```
**After adding/changing env vars, you must redeploy for them to take effect.**

### Debugging
- Server-side errors only visible in **Vercel Logs tab** (not browser console)
- Function logs: Project → Logs → filter by function path

---

## 4. Supabase Auth (Google OAuth)

### Configuration
- **Site URL:** `https://push-fit.vercel.app` (must include `https://`)
- **Redirect URLs:**
  - `https://push-fit.vercel.app/auth/callback`
  - `https://push-fit.vercel.app/**`
  - `http://localhost:5181/auth/callback` (dev)
  - `http://localhost:*/auth/callback` (dev)

### Google Cloud Console
- **Authorized JavaScript origins:** `https://push-fit.vercel.app`
- **Authorized redirect URIs:** `https://labxmkpmmqygookrnqgg.supabase.co/auth/v1/callback`

### Auth Flow
```
User clicks "Continue with Google"
→ supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })
→ Google OAuth consent screen
→ Google redirects to Supabase callback (supabase.co/auth/v1/callback)
→ Supabase exchanges code, redirects to Site URL + /auth/callback
→ App exchanges code for session
→ Checks user_metadata.onboarding_complete
→ Redirects to / (if onboarded) or /onboarding (if not)
```

### Common Errors
- `{"error":"requested path is invalid"}` → Site URL missing `https://` protocol
- Redirects to old domain → Site URL not updated in Supabase dashboard
- Auth works but app says "not logged in" → cookies not being set, check `hooks.server.ts`

---

## 5. Plan Generation Architecture

### Two-Step Flow (Client-Initiated)
```
Client                           Server
  │                                │
  ├─ POST /api/exercisedb-catalog ─→ Fetches exercises from ExerciseDB
  │  { equipment: ['dumbbells'] }  │  (1-4 API calls, parallel)
  ←─ { catalog: [...exercises] } ──┤
  │                                │
  ├─ POST /api/generate-plan ─────→ Sends catalog + user profile to Claude
  │  { data, catalog }             │  (1 Claude API call, 15-30s)
  ←─ { plan: {...} } ─────────────┤
  │                                │
  ├─ Save to localStorage ─────────┤
  ├─ Save to Supabase (async) ─────┤
  └─ Render plan ──────────────────┘
```

### Why Two Steps?
- Separates ExerciseDB latency from Claude latency
- If catalog fetch fails, no wasted Claude call
- Client can show two-phase loading state
- Each serverless function has appropriate timeout

### Exercise Classification (for Push/Pull/Legs split)
Exercises are classified by body parts and target muscles (uppercased for comparison):
- **Push:** chest, shoulders, triceps, upper arms, deltoid, pectoral
- **Pull:** back, forearms, latissimus, trapezius, brachioradialis, bicep
- **Legs:** quadriceps, thighs, hips, calves, gluteus, hamstring, gastrocnemius
- **Core:** everything else

### Injury Exclusions (Hard-Coded Safety)
```
shoulder → Seated Shoulder Press, Lateral Raise, Chest Dip, Arnold Press
back     → One Arm Bent-over Row, Romanian Deadlift, Squat, Suspended Row
knee     → Squat, Bulgarian Split Squat, Seated Calf Raise, Goblet Squat, Barbell Standing Calf Raise
```
These are NOT suggestions — they are hard filters applied before Claude sees the catalog.

### Split Patterns
```
3 days: Push, Pull, Legs, Rest, Rest, Rest, Rest
4 days: Push, Pull, Legs, Rest, Push, Rest, Rest
5 days: Push, Pull, Legs, Push, Pull, Rest, Rest
6 days: Push, Pull, Legs, Push, Pull, Legs, Rest
```

### Claude Configuration
- Model: `claude-sonnet-4-20250514`
- max_tokens: 8192
- Tool use: `generate_plan` tool with structured JSON schema
- tool_choice: `{ type: 'tool', name: 'generate_plan' }`

### Plan Validation
After Claude returns the plan:
1. Must have exactly 7 days
2. All exercise IDs must exist in the catalog
3. No excluded exercises (injury filter)
4. Rep ranges: 1-30
5. No negative weights
6. Every exercise must have at least one set

### Normalization
After validation, exercise metadata (body_parts, target_muscles, equipments) is overwritten from the catalog to ensure accuracy (Claude may simplify or alter these).

---

## 6. Data Model

### PlannedExercise (stored in plan)
```typescript
{
  id: string;                    // "gen-ex-{dayIdx}-{order}"
  planned_day_id: string;        // "gen-day-{dayIdx}"
  exercisedb_id: string;         // "edb_xxxxx" (API reference)
  exercise_name: string;         // AI-prescribed name
  body_parts: string[];          // From API (lowercase)
  target_muscles: string[];      // From API (lowercase)
  equipments: string[];          // From API (lowercase)
  cue?: string;                  // AI coaching note
  superset_group?: string;       // Grouping key
  order: number;                 // Display order
}
```

### Body Part Casing
- API returns **lowercase** (`chest`, `upper arms`, `biceps`)
- Internal comparisons (workout-stats, MuscleCard) use **UPPERCASE** constants
- Normalize with `.toUpperCase()` at comparison points, not at storage

### Week-Based Timing
- Weeks start Monday (day 0) through Sunday (day 6)
- `getCurrentWeekStart()` returns Monday's ISO date
- Week rollover detected by comparing stored `week_start` with current Monday

---

## 7. Svelte 5 Runes Constraints

### SSR Hydration Bug
**Do NOT use `$derived` with heavy compute functions from `workout-stats.ts`.** These break SSR hydration silently.

**Instead:** Use `$state` variables and call compute functions in `onMount()`.

Affected functions:
- `computeWeekMomentum()`
- `computeCalendarWeeks()`
- `computePersonalRecords()`
- `computeExerciseHistory()`
- Any function that iterates over `WeekHistory[]`

---

## 8. Known Issues (Deferred)

### Weekly Loop Not Wired
- Check-in completion doesn't trigger plan generation
- No week-change detection while app is open
- No "Generate Next Week" UI
- Settings regeneration is the only explicit trigger

### Error Handling Gaps
- Supabase failures show "loading..." forever
- Plan generation doesn't distinguish catalog error vs. Claude error vs. validation error
- Store init failure doesn't surface to user
- Set log sync failures are silent
- Photo upload errors are swallowed

### History
- Only shows current week (mock data was removed)
- Past weeks need Supabase queries (not yet implemented)

---

## 9. File Structure (Key Files)

```
src/
├── lib/
│   ├── api/
│   │   ├── exercisedb.ts          # ExerciseDB API client
│   │   ├── anthropic.ts           # Claude API client
│   │   └── supabase.ts            # Supabase browser client
│   ├── types/index.ts             # All TypeScript definitions
│   ├── stores/
│   │   └── workout.svelte.ts      # Central workout state (runes)
│   ├── services/
│   │   ├── plan-generator.ts      # Two-step generation flow
│   │   ├── workout.ts             # Plan save/load, set persistence
│   │   ├── history.ts             # Week history queries
│   │   └── supabase-sync.ts       # Dual-write sync
│   └── utils/
│       └── workout-stats.ts       # Heavy compute (use in onMount!)
├── routes/
│   ├── api/
│   │   ├── exercisedb-catalog/    # Live catalog fetch endpoint
│   │   ├── generate-plan/         # Claude plan generation endpoint
│   │   └── exercisedb-search/     # Search proxy
│   ├── (app)/                     # Auth-protected routes
│   │   ├── +page.svelte           # Today page
│   │   ├── plan/                  # Weekly schedule
│   │   ├── profile/               # User profile + stats
│   │   ├── history/               # Training archive
│   │   ├── settings/              # Preferences
│   │   └── exercise/[id]/         # Exercise detail (live API fetch)
│   ├── (auth)/login/              # Google OAuth entry
│   ├── auth/callback/             # OAuth callback handler
│   └── (onboarding)/onboarding/   # 8-step form
└── hooks.server.ts                # Supabase server client init
```

---

## 10. Product Principles (From Memory)

1. **No filler** — every UI element must earn its place
2. **No mock data** — show empty states, never fake data
3. **No engagement farming** — stats not confetti, data not encouragement
4. **Profile has personality** — it's the athlete's personal space
5. **Benchmark:** text message from a good trainer (dense, specific, conversational)
6. **Onboarding prioritizes plan quality** over time-to-first-workout
7. **Two-surface logging model:** Today = execute (quick toggle), Exercise Detail = adjust (edit inputs)
