import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
import type { WeekHistory } from './profile-history';

export interface WeekStats {
	workoutsCompleted: number;
	workoutsTotal: number;
	setsCompleted: number;
	setsTotal: number;
	volume: number;
}

export interface PersonalRecord {
	exerciseName: string;
	estimated1RM: number;
	weight: number;
	reps: number;
	weekStart: string;
}

export interface DayBreakdown {
	dayOfWeek: number;
	label: string;
	isRestDay: boolean;
	isReviewDay: boolean;
	exercisesCompleted: number;
	exercisesTotal: number;
}

export interface WeekSummary {
	weekNumber: number;
	weekStart: string;
	dateRange: string;
	dayBreakdowns: DayBreakdown[];
	totalVolume: number;
	workoutsCompleted: number;
	workoutsTotal: number;
	prsHit: PersonalRecord[];
}

export interface LifetimeStats {
	totalWorkouts: number;
	totalVolume: number;
	longestStreak: number;
	weeksActive: number;
}

function epley1RM(weight: number, reps: number): number {
	if (reps === 1) return weight;
	return weight * (1 + reps / 30);
}

function formatDateRange(weekStart: string): string {
	const start = new Date(weekStart + 'T00:00:00');
	const end = new Date(start);
	end.setDate(end.getDate() + 6);

	const fmt = (d: Date) => {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[d.getMonth()]} ${d.getDate()}`;
	};

	return `${fmt(start)} – ${fmt(end)}`;
}

function getTrainingDays(week: WeekHistory): PlannedDay[] {
	return week.days.filter(d => !d.is_rest_day && !d.is_review_day);
}

function isDayCompleted(day: PlannedDay, exercises: PlannedExercise[], setLogs: SetLog[]): boolean {
	const dayExercises = exercises.filter(e => e.planned_day_id === day.id);
	if (dayExercises.length === 0) return false;
	const daySets = setLogs.filter(s => dayExercises.some(e => e.id === s.planned_exercise_id));
	return daySets.length > 0 && daySets.some(s => s.completed);
}

export function computeWeekStats(week: WeekHistory): WeekStats {
	const trainingDays = getTrainingDays(week);
	const workoutsTotal = trainingDays.length;

	let workoutsCompleted = 0;
	for (const day of trainingDays) {
		if (isDayCompleted(day, week.exercises, week.setLogs)) {
			workoutsCompleted++;
		}
	}

	const setsTotal = week.plannedSets.length;
	const completedSets = week.setLogs.filter(s => s.completed);
	const setsCompleted = completedSets.length;

	let volume = 0;
	for (const s of completedSets) {
		if (s.actual_weight !== null && s.actual_reps !== null) {
			volume += s.actual_weight * s.actual_reps;
		}
	}

	return { workoutsCompleted, workoutsTotal, setsCompleted, setsTotal, volume };
}

export function computeStreak(weeks: WeekHistory[]): { current: number; best: number } {
	// Build a flat ordered list of training days across all weeks (chronological)
	const allDays: { completed: boolean }[] = [];

	for (const week of weeks) {
		const trainingDays = getTrainingDays(week).sort((a, b) => a.day_of_week - b.day_of_week);
		for (const day of trainingDays) {
			allDays.push({
				completed: isDayCompleted(day, week.exercises, week.setLogs)
			});
		}
	}

	// Current streak: walk backward from end
	let current = 0;
	for (let i = allDays.length - 1; i >= 0; i--) {
		if (allDays[i].completed) {
			current++;
		} else {
			break;
		}
	}

	// Best streak: scan forward
	let best = 0;
	let run = 0;
	for (const day of allDays) {
		if (day.completed) {
			run++;
			if (run > best) best = run;
		} else {
			run = 0;
		}
	}

	return { current, best };
}

export function computePersonalRecords(weeks: WeekHistory[]): PersonalRecord[] {
	const bestByExercise = new Map<string, PersonalRecord>();

	for (const week of weeks) {
		for (const setLog of week.setLogs) {
			if (!setLog.completed || setLog.actual_weight === null || setLog.actual_reps === null) continue;
			if (setLog.actual_weight === 0) continue;

			const exercise = week.exercises.find(e => e.id === setLog.planned_exercise_id);
			if (!exercise) continue;

			const est1RM = epley1RM(setLog.actual_weight, setLog.actual_reps);
			const existing = bestByExercise.get(exercise.exercise_name);

			if (!existing || est1RM > existing.estimated1RM) {
				bestByExercise.set(exercise.exercise_name, {
					exerciseName: exercise.exercise_name,
					estimated1RM: Math.round(est1RM),
					weight: setLog.actual_weight,
					reps: setLog.actual_reps,
					weekStart: week.weekStart
				});
			}
		}
	}

	return Array.from(bestByExercise.values())
		.sort((a, b) => b.estimated1RM - a.estimated1RM)
		.slice(0, 5);
}

export function computeWeekPRs(weekIndex: number, weeks: WeekHistory[]): PersonalRecord[] {
	if (weekIndex === 0) {
		// First week: all completed lifts are PRs by definition — return top ones
		return computePersonalRecords([weeks[0]]).slice(0, 3);
	}

	const previousWeeks = weeks.slice(0, weekIndex);
	const currentWeek = weeks[weekIndex];
	const previousPRs = computePersonalRecords(previousWeeks);
	const previousBest = new Map(previousPRs.map(pr => [pr.exerciseName, pr.estimated1RM]));

	const newPRs: PersonalRecord[] = [];

	for (const setLog of currentWeek.setLogs) {
		if (!setLog.completed || setLog.actual_weight === null || setLog.actual_reps === null) continue;
		if (setLog.actual_weight === 0) continue;

		const exercise = currentWeek.exercises.find(e => e.id === setLog.planned_exercise_id);
		if (!exercise) continue;

		const est1RM = epley1RM(setLog.actual_weight, setLog.actual_reps);
		const prev = previousBest.get(exercise.exercise_name) ?? 0;

		if (est1RM > prev) {
			const existing = newPRs.find(pr => pr.exerciseName === exercise.exercise_name);
			if (!existing || est1RM > existing.estimated1RM) {
				const idx = newPRs.findIndex(pr => pr.exerciseName === exercise.exercise_name);
				const record: PersonalRecord = {
					exerciseName: exercise.exercise_name,
					estimated1RM: Math.round(est1RM),
					weight: setLog.actual_weight,
					reps: setLog.actual_reps,
					weekStart: currentWeek.weekStart
				};
				if (idx >= 0) {
					newPRs[idx] = record;
				} else {
					newPRs.push(record);
				}
			}
		}
	}

	return newPRs.sort((a, b) => b.estimated1RM - a.estimated1RM);
}

export function computeWeekSummary(weekIndex: number, weeks: WeekHistory[]): WeekSummary {
	const week = weeks[weekIndex];
	const stats = computeWeekStats(week);
	const prs = computeWeekPRs(weekIndex, weeks);

	const dayBreakdowns: DayBreakdown[] = week.days
		.sort((a, b) => a.day_of_week - b.day_of_week)
		.map(day => {
			const dayExercises = week.exercises.filter(e => e.planned_day_id === day.id);
			const exercisesTotal = dayExercises.length;
			let exercisesCompleted = 0;

			for (const ex of dayExercises) {
				const exSets = week.setLogs.filter(s => s.planned_exercise_id === ex.id);
				if (exSets.length > 0 && exSets.every(s => s.completed)) {
					exercisesCompleted++;
				}
			}

			return {
				dayOfWeek: day.day_of_week,
				label: day.label,
				isRestDay: day.is_rest_day,
				isReviewDay: day.is_review_day,
				exercisesCompleted,
				exercisesTotal
			};
		});

	return {
		weekNumber: week.weekNumber,
		weekStart: week.weekStart,
		dateRange: formatDateRange(week.weekStart),
		dayBreakdowns,
		totalVolume: stats.volume,
		workoutsCompleted: stats.workoutsCompleted,
		workoutsTotal: stats.workoutsTotal,
		prsHit: prs
	};
}

export function computeLifetimeStats(weeks: WeekHistory[]): LifetimeStats {
	let totalWorkouts = 0;
	let totalVolume = 0;

	for (const week of weeks) {
		const stats = computeWeekStats(week);
		totalWorkouts += stats.workoutsCompleted;
		totalVolume += stats.volume;
	}

	const { best: longestStreak } = computeStreak(weeks);

	return {
		totalWorkouts,
		totalVolume,
		longestStreak,
		weeksActive: weeks.length
	};
}

export function formatVolume(volume: number): string {
	if (volume >= 1000) {
		return `${(volume / 1000).toFixed(1).replace(/\.0$/, '')}k`;
	}
	return volume.toLocaleString();
}

export function convertWeight(lbs: number, units: 'lbs' | 'kg'): number {
	return units === 'kg' ? Math.round(lbs * 0.453592) : lbs;
}

// === Calendar View Types ===

export interface SetResult {
	setNumber: number;
	weight: number | null;
	reps: number | null;
	completed: boolean;
}

export interface DayExerciseDetail {
	exerciseName: string;
	exercisedbId: string;
	sets: SetResult[];
	allCompleted: boolean;
}

export interface CalendarDay {
	dayOfWeek: number;
	date: string;
	label: string;
	isRestDay: boolean;
	isReviewDay: boolean;
	isCompleted: boolean;
	exercises: DayExerciseDetail[];
}

export interface CalendarWeek {
	weekNumber: number;
	weekStart: string;
	isCurrent: boolean;
	days: CalendarDay[];
	totalVolume: number;
	prsHit: PersonalRecord[];
}

// === Exercise History Types ===

export interface ExerciseSession {
	date: string;
	weekNumber: number;
	dayLabel: string;
	sets: SetResult[];
	bestEstimated1RM: number | null;
	isPR: boolean;
}

export interface ExerciseHistorySummary {
	exerciseName: string;
	currentEstimated1RM: number | null;
	firstEstimated1RM: number | null;
	percentChange: number | null;
	sessions: ExerciseSession[];
}

// === Calendar Computation ===

function computeDayDate(weekStart: string, dayOfWeek: number): string {
	const d = new Date(weekStart + 'T00:00:00');
	d.setDate(d.getDate() + dayOfWeek);
	return d.toISOString().split('T')[0];
}

export function computeCalendarWeeks(weeks: WeekHistory[]): CalendarWeek[] {
	return weeks.map((week, weekIndex) => {
		const stats = computeWeekStats(week);
		const prs = computeWeekPRs(weekIndex, weeks);

		const daysByDow = new Map(week.days.map(d => [d.day_of_week, d]));

		const days: CalendarDay[] = [];
		for (let dow = 0; dow < 7; dow++) {
			const day = daysByDow.get(dow);
			if (!day) {
				// No planned day for this slot (shouldn't happen with 7-day plans, but handle gracefully)
				days.push({
					dayOfWeek: dow,
					date: computeDayDate(week.weekStart, dow),
					label: '',
					isRestDay: true,
					isReviewDay: false,
					isCompleted: false,
					exercises: []
				});
				continue;
			}

			const dayExercises = week.exercises
				.filter(e => e.planned_day_id === day.id)
				.sort((a, b) => a.order - b.order);

			const exercises: DayExerciseDetail[] = dayExercises.map(ex => {
				const exSetLogs = week.setLogs
					.filter(s => s.planned_exercise_id === ex.id)
					.sort((a, b) => a.set_number - b.set_number);

				const sets: SetResult[] = exSetLogs.map(s => ({
					setNumber: s.set_number,
					weight: s.actual_weight,
					reps: s.actual_reps,
					completed: s.completed
				}));

				const allCompleted = sets.length > 0 && sets.every(s => s.completed);

				return {
					exerciseName: ex.exercise_name,
					exercisedbId: ex.exercisedb_id,
					sets,
					allCompleted
				};
			});

			const isCompleted = day.is_rest_day || day.is_review_day
				? false
				: isDayCompleted(day, week.exercises, week.setLogs);

			days.push({
				dayOfWeek: dow,
				date: computeDayDate(week.weekStart, dow),
				label: day.label,
				isRestDay: day.is_rest_day,
				isReviewDay: day.is_review_day,
				isCompleted,
				exercises
			});
		}

		return {
			weekNumber: week.weekNumber,
			weekStart: week.weekStart,
			isCurrent: weekIndex === weeks.length - 1,
			days,
			totalVolume: stats.volume,
			prsHit: prs
		};
	});
}

// === Exercise History Computation ===

export function computeExerciseHistory(exercisedbId: string, weeks: WeekHistory[]): ExerciseHistorySummary | null {
	const sessions: ExerciseSession[] = [];
	let exerciseName = '';

	for (const week of weeks) {
		const matchingExercises = week.exercises.filter(e => e.exercisedb_id === exercisedbId);

		for (const ex of matchingExercises) {
			if (!exerciseName) exerciseName = ex.exercise_name;

			const day = week.days.find(d => d.id === ex.planned_day_id);
			if (!day) continue;

			const exSetLogs = week.setLogs
				.filter(s => s.planned_exercise_id === ex.id)
				.sort((a, b) => a.set_number - b.set_number);

			const hasCompletedSets = exSetLogs.some(s => s.completed);
			if (!hasCompletedSets) continue;

			const sets: SetResult[] = exSetLogs.map(s => ({
				setNumber: s.set_number,
				weight: s.actual_weight,
				reps: s.actual_reps,
				completed: s.completed
			}));

			// Best e1RM from this session's completed sets
			let bestE1RM: number | null = null;
			for (const s of exSetLogs) {
				if (s.completed && s.actual_weight !== null && s.actual_weight > 0 && s.actual_reps !== null) {
					const e1rm = epley1RM(s.actual_weight, s.actual_reps);
					if (bestE1RM === null || e1rm > bestE1RM) {
						bestE1RM = e1rm;
					}
				}
			}

			sessions.push({
				date: computeDayDate(week.weekStart, day.day_of_week),
				weekNumber: week.weekNumber,
				dayLabel: day.label,
				sets,
				bestEstimated1RM: bestE1RM !== null ? Math.round(bestE1RM) : null,
				isPR: false
			});
		}
	}

	if (sessions.length === 0) return null;

	// Mark the session with the best overall e1RM as PR
	let bestOverall = -1;
	let bestIdx = -1;
	for (let i = 0; i < sessions.length; i++) {
		const e1rm = sessions[i].bestEstimated1RM;
		if (e1rm !== null && e1rm > bestOverall) {
			bestOverall = e1rm;
			bestIdx = i;
		}
	}
	if (bestIdx >= 0) {
		sessions[bestIdx].isPR = true;
	}

	// Sort newest first
	sessions.sort((a, b) => b.date.localeCompare(a.date));

	const withE1RM = sessions.filter(s => s.bestEstimated1RM !== null);
	const currentEstimated1RM = withE1RM.length > 0 ? withE1RM[0].bestEstimated1RM : null;
	const firstEstimated1RM = withE1RM.length > 0 ? withE1RM[withE1RM.length - 1].bestEstimated1RM : null;

	let percentChange: number | null = null;
	if (currentEstimated1RM !== null && firstEstimated1RM !== null && firstEstimated1RM > 0) {
		percentChange = Math.round(((currentEstimated1RM - firstEstimated1RM) / firstEstimated1RM) * 1000) / 10;
	}

	return {
		exerciseName,
		currentEstimated1RM,
		firstEstimated1RM,
		percentChange,
		sessions
	};
}
