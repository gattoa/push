# Product Brief: Push

## Metadata

| Field         | Value                                                        |
|---------------|--------------------------------------------------------------|
| **Date**      | March 12, 2026                                               |
| **Status**    | Draft                                                        |

---

## Overview

Push is a mobile-first PWA that gives users the experience of having a personal trainer — personalized weekly workout plans, in-gym progress tracking with minimal friction, and adapted programming each week based on actual performance. Built with Svelte, Supabase, and Claude Opus 4.6 via API.

## Vision

People want to feel like they have a personal trainer in their pocket — one who knows their history, monitors their progress, and adjusts their programming accordingly. Push makes that experience accessible to anyone, at any fitness level, without the cost or dependency of hiring a human trainer.

## Problem Statement

People want an approachable, lightweight way to track their gym sessions and meet their fitness goals. They want to feel like they're getting the same attention and relationship they would with a personal trainer — one who monitors their progress and provides actionable tweaks, modifications, and feedback to their splits based on performance. Today, that experience is locked behind hiring a trainer, which is expensive, availability-dependent, and doesn't scale. The alternative — generic workout apps — gives you a program but doesn't know you, doesn't watch your progress, and doesn't adapt.

## Origin

Push was born from a real personal training relationship. My trainer would text me daily workouts — exercise, sets, reps, grips/modifications, and drop sets. I tracked my progress in a separate app and sent him the results. He'd review my performance and adjust my programming weekly. That feedback loop produced real results, but the manual workflow burned him out across multiple clients. Push rebuilds that experience with AI as the trainer — one that can analyze progress, generate personalized programming, and never burn out.

## Goals

### Business Goals

This is a personal project — not a commercial product. The goal is to build a well-designed application that demonstrates strong product thinking and could serve users beyond the creator. KPIs to be defined after discovery and benchmarking.

### Customer Goals

- **User Problem:** No affordable, adaptive way to get personalized workout programming that responds to actual performance.
- **User Value:** A workout experience that feels attentive and personal — the user gets a plan, tracks their progress, and the plan gets smarter over time.

## Target Personas

- **Beginners** — Don't know what to do in the gym. Need approachable guidance without feeling overwhelmed. Represent the largest portion of potential users.
- **Intermediate** — Work out regularly but lack the knowledge to program effectively on their own (e.g., muscle group splits, progressive overload). Benefit most from the AI's programming intelligence.
- **Advanced** — Know what they're doing but value the convenience of having programming handled for them. Most likely recurring users. Need a fast, non-patronizing logging experience.
- **Senior Citizens** — Different goals (mobility, functional strength). The AI handles programming appropriateness — the UI does not change.

## How It Works

| | |
|---|---|
| **Onboarding** | AI intake session: goals, weight, height, body shape, injuries, training schedule. This is enough context for the AI to build a long-term and short-term program. It gets smarter each week as real performance data comes in. |
| **Week 1** | AI prescribes exercises, sets, and reps — but not weights. The user inputs weight data naturally by logging their workouts. The AI acquires baseline data without onboarding becoming a barrier. |
| **Weekly Cycle** | AI generates a full weekly plan. User sees all training days and rest days upfront for planning. Can shuffle days within the week if schedule changes. |
| **Daily Workout** | Each exercise includes: name, sets, reps, grips/modifications, drop sets. Exercises link to YouTube videos (pulled via YouTube API) for form guidance. |
| **In-Gym Logging** | Must be super light and simple. Quick path: mark exercise as done in minimal taps. Detailed path: expand to log per-set weight, reps, incomplete sets. Both paths available — user chooses their depth. |
| **Historical Data** | When a recurring exercise is assigned, a subtle indicator shows last performance so the user can aim to surpass it. PRs are denoted with an icon. |
| **Equipment Swaps** | If equipment isn't available, swipe on the exercise tile to swap for an alternative. One-time action, no persistent gym memory, no location tracking. |
| **Review Day** | Sunday by default (configurable in settings). Summary of the week's progress, celebration of achievements, then transition to the new weekly plan. Persists until the user engages with it, even if they don't open the app until Monday. |
| **Missed Days** | No mid-week adjustment. The missed day stays uncompleted. The AI accounts for the missed volume when generating next week's plan. |
| **Adaptation** | AI uses all logged progress data to generate the next week's plan. Primary signal is quantitative (sets, reps, weight). The more context, the better the feedback loop. |
| **AI Rationale** | A one-liner caption explaining programming decisions (e.g., "Increased volume based on last week's completion"). Informative, not a focal point. Should never distract from the main user flows. |

## App Architecture

- **Home screen:** Workout page. Settings icon (upper left), profile/avatar (upper right). Exercise tiles for today's session.
- **Exercise detail:** Navigable from exercise tiles. Where logging happens. Shows form video, exercise history, and multiple logging methods.
- **Profile:** Progress data, workout history, personal records, photos. Serves both the user (their journey) and the AI (its programming inputs).
- **Settings:** Review day configuration, training schedule, preferences.
- **Navigation:** No bottom tab bar. No tabbed nav. Workout page is home — everything else is reachable from it.

## Assumptions

- Claude Opus 4.6 can generate quality workout programming given sufficient user context (fitness level, goals, injuries, performance history).
- Users will log their workouts consistently enough for the AI feedback loop to function.
- The YouTube API provides adequate form video coverage for common exercises.
- A PWA delivers a sufficient in-gym mobile experience (offline capability, responsiveness, tap targets).

## Constraints

- Mobile-first PWA — must function well in gym environments (poor connectivity, one-handed use, between sets).
- One interface for all fitness levels — the AI personalizes through content, not dynamic UI. No conditional UI per audience.
- No persistent gym equipment memory or location tracking — keeps the data model simple.

## Scope

### In Scope

- AI-powered onboarding intake session
- Weekly plan generation with long-term and short-term programming
- Daily workout view with exercise tiles
- Exercise detail page with logging, form video, and history
- Quick-complete and granular logging paths
- Historical performance indicators and PR icons
- Exercise swaps (swipe to replace)
- Configurable review day with weekly summary and plan transition
- Profile page with progress data and personal records
- Settings page

### Out of Scope

- Chat/feedback mechanism with the AI — not fully considered, potential post-MVP
- AI learning equipment swap patterns — complicates the app due to travel and gym variability
- Gym equipment inventory or location-based profiles — too complex to maintain
- Dynamic UI per fitness level — one interface for everyone

### P1 Features (Important, Not Gating)

- Baseline photos at onboarding — establishes a starting point for the AI
- Weekly photo uploads on review day — secondary signal for programming adjustments (tracked progress is always the primary data source)
- YouTube form video links on exercises — safety net for unfamiliar movements, not core functionality

## Open Questions

1. What is the minimum viable onboarding flow that doesn't feel like a barrier but gives the AI enough to generate a quality Week 1 program?
2. How should the review day summary be structured to feel celebratory without being corny or cluttered?
3. What does the exercise swap UI look like after the swipe gesture — a modal with alternatives, an inline replacement?

## Recommended Next Steps

### Research

- Audit existing workout apps to understand how they handle logging UX, exercise swaps, and weekly plan presentation.
- Validate that Claude Opus 4.6 can produce quality workout programming with the planned onboarding inputs — prototype prompt and test output quality.

### Design

- Wireframe the workout page, exercise detail page, and review day flow.
- Explore the dual logging UX — quick-complete vs. granular — and how they coexist on the exercise detail page.
- Define what the exercise tile communicates at a glance (title, sets, reps, completion state).

### Technical

- Spike on Svelte PWA offline caching for daily workouts in gym environments with poor connectivity.
- Design the Supabase data model: user profiles, weekly plans, daily workouts, exercise prescriptions, set-level logs.
- Prototype Claude API integration for weekly plan generation with structured output.