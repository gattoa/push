import type {
	PlannedDay, PlannedExercise, SetLog,
	WeekHistory, WeekStats, PersonalRecord, DayBreakdown, WeekSummary,
	LifetimeStats, SetResult, DayExerciseDetail, CalendarDay, CalendarWeek,
	ExerciseSession, ExerciseHistorySummary,
	BodyPartExerciseDetail, BodyPartScheduledDetail, WeekMomentum,
	LastSessionExercise, LastSessionData
} from '$lib/types';

// === Internal helpers ===

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
	return week.days.filter(d => !d.is_rest_day);
}

function isDayCompleted(day: PlannedDay, exercises: PlannedExercise[], setLogs: SetLog[]): boolean {
	const dayExercises = exercises.filter(e => e.planned_day_id === day.id);
	if (dayExercises.length === 0) return false;
	const daySets = setLogs.filter(s => dayExercises.some(e => e.id === s.planned_exercise_id));
	return daySets.length > 0 && daySets.some(s => s.completed);
}

function computeDayDate(weekStart: string, dayOfWeek: number): string {
	const d = new Date(weekStart + 'T00:00:00');
	d.setDate(d.getDate() + dayOfWeek);
	return d.toISOString().split('T')[0];
}

// === Exported computation functions ===

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
	const allDays: { completed: boolean }[] = [];

	for (const week of weeks) {
		const trainingDays = getTrainingDays(week).sort((a, b) => a.day_of_week - b.day_of_week);
		for (const day of trainingDays) {
			allDays.push({
				completed: isDayCompleted(day, week.exercises, week.setLogs)
			});
		}
	}

	let current = 0;
	for (let i = allDays.length - 1; i >= 0; i--) {
		if (allDays[i].completed) {
			current++;
		} else {
			break;
		}
	}

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

// === Motivation View Functions ===

export function computeVolumeDelta(weeks: WeekHistory[]): number | null {
	if (weeks.length < 2) return null;
	const current = computeWeekStats(weeks[weeks.length - 1]).volume;
	const previous = computeWeekStats(weeks[weeks.length - 2]).volume;
	if (previous === 0) return null;
	return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function computeRecentPRs(weeks: WeekHistory[]): PersonalRecord[] {
	if (weeks.length === 0) return [];

	const lastIdx = weeks.length - 1;
	const currentPRs = computeWeekPRs(lastIdx, weeks);

	if (weeks.length < 2) return currentPRs;

	const prevIdx = weeks.length - 2;
	const previousPRs = computeWeekPRs(prevIdx, weeks);

	const byExercise = new Map<string, PersonalRecord>();
	for (const pr of [...previousPRs, ...currentPRs]) {
		const existing = byExercise.get(pr.exerciseName);
		if (!existing || pr.estimated1RM > existing.estimated1RM) {
			byExercise.set(pr.exerciseName, pr);
		}
	}

	return Array.from(byExercise.values()).sort((a, b) => b.estimated1RM - a.estimated1RM);
}

// === Calendar Computation ===

export function computeCalendarWeeks(weeks: WeekHistory[]): CalendarWeek[] {
	return weeks.map((week, weekIndex) => {
		const stats = computeWeekStats(week);
		const prs = computeWeekPRs(weekIndex, weeks);

		const daysByDow = new Map(week.days.map(d => [d.day_of_week, d]));

		const days: CalendarDay[] = [];
		for (let dow = 0; dow < 7; dow++) {
			const day = daysByDow.get(dow);
			if (!day) {
				days.push({
					dayOfWeek: dow,
					date: computeDayDate(week.weekStart, dow),
					label: '',
					isRestDay: true,
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

			const isCompleted = day.is_rest_day
				? false
				: isDayCompleted(day, week.exercises, week.setLogs);

			days.push({
				dayOfWeek: dow,
				date: computeDayDate(week.weekStart, dow),
				label: day.label,
				isRestDay: day.is_rest_day,
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

// === PR Count ===

export function computeTotalPRCount(weeks: WeekHistory[]): number {
	return computePersonalRecords(weeks).length;
}

// === Body Part Regions ===

export const BODY_REGIONS: Record<string, string[]> = {
	'Upper Body': ['CHEST', 'BACK', 'SHOULDERS', 'UPPER ARMS', 'FOREARMS', 'TRICEPS', 'BICEPS', 'NECK'],
	'Lower Body': ['QUADRICEPS', 'THIGHS', 'HIPS', 'CALVES'],
	'Core': ['WAIST']
};

export function getBodyRegion(bodyPart: string): string {
	for (const [region, parts] of Object.entries(BODY_REGIONS)) {
		if (parts.includes(bodyPart)) return region;
	}
	return 'Other';
}

// === Weekly Momentum ===

export function computeWeekMomentum(weeks: WeekHistory[], todayIndex?: number): WeekMomentum {
	const currentWeek = weeks[weeks.length - 1];
	const stats = computeWeekStats(currentWeek);
	const streak = computeStreak(weeks);
	const weekIdx = weeks.length - 1;
	const weekPRs = computeWeekPRs(weekIdx, weeks);

	const bodyPartsHit = new Map<string, number>();
	const bodyPartExercises = new Map<string, BodyPartExerciseDetail[]>();
	const bodyPartsScheduled = new Map<string, BodyPartScheduledDetail[]>();
	const unmappedSet = new Set<string>();
	const allBodyParts = new Set<string>();

	const dayCompletions = currentWeek.days
		.sort((a, b) => a.day_of_week - b.day_of_week)
		.map(day => {
			const dayExercises = currentWeek.exercises.filter(e => e.planned_day_id === day.id);
			const isCompleted = !day.is_rest_day &&
				isDayCompleted(day, currentWeek.exercises, currentWeek.setLogs);

			const dayBodyParts: Set<string> = new Set();
			let volume = 0;

			for (const ex of dayExercises) {
				for (const bp of ex.body_parts) allBodyParts.add(bp);
				if (ex.body_parts.length === 0 && !day.is_rest_day) {
					unmappedSet.add(ex.exercise_name);
				}
			}

			if (isCompleted) {
				for (const ex of dayExercises) {
					const exSetLogs = currentWeek.setLogs.filter(
						s => s.planned_exercise_id === ex.id && s.completed
					);

					for (const s of exSetLogs) {
						if (s.actual_weight !== null && s.actual_reps !== null) {
							volume += s.actual_weight * s.actual_reps;
						}
					}

					for (const bp of ex.body_parts) {
						dayBodyParts.add(bp);
						bodyPartsHit.set(bp, (bodyPartsHit.get(bp) ?? 0) + exSetLogs.length);

						if (!bodyPartExercises.has(bp)) bodyPartExercises.set(bp, []);
						bodyPartExercises.get(bp)!.push({
							exerciseName: ex.exercise_name,
							sets: exSetLogs.length,
							exercisedbId: ex.exercisedb_id
						});
					}
				}
			} else if (!day.is_rest_day && todayIndex !== undefined && day.day_of_week > todayIndex) {
				for (const ex of dayExercises) {
					for (const bp of ex.body_parts) {
						if (!bodyPartsScheduled.has(bp)) bodyPartsScheduled.set(bp, []);
						bodyPartsScheduled.get(bp)!.push({
							exerciseName: ex.exercise_name,
							dayLabel: day.label,
							exercisedbId: ex.exercisedb_id
						});
					}
				}
			}

			return {
				dayOfWeek: day.day_of_week,
				label: day.label,
				completed: isCompleted,
				bodyParts: Array.from(dayBodyParts),
				volume,
				isRestDay: day.is_rest_day,
				exerciseNames: dayExercises.sort((a, b) => a.order - b.order).map(e => e.exercise_name)
			};
		});

	return {
		weekStart: currentWeek.weekStart,
		workoutsCompleted: stats.workoutsCompleted,
		workoutsTotal: stats.workoutsTotal,
		bodyPartsHit,
		totalBodyParts: allBodyParts.size,
		bodyPartsHitCount: bodyPartsHit.size,
		bodyPartExercises,
		bodyPartsScheduled,
		unmappedExercises: Array.from(unmappedSet),
		dayCompletions,
		streak: streak.current,
		weekPRs
	};
}

// === Last Completed Session ===

export function getLastCompletedSession(weeks: WeekHistory[]): LastSessionData | null {
	for (let wi = weeks.length - 1; wi >= 0; wi--) {
		const week = weeks[wi];
		const trainingDays = week.days
			.filter(d => !d.is_rest_day)
			.sort((a, b) => b.day_of_week - a.day_of_week);

		for (const day of trainingDays) {
			const dayExercises = week.exercises.filter(e => e.planned_day_id === day.id);
			if (dayExercises.length === 0) continue;

			const daySetLogs = week.setLogs.filter(s =>
				dayExercises.some(e => e.id === s.planned_exercise_id)
			);
			const hasCompleted = daySetLogs.some(s => s.completed);
			if (!hasCompleted) continue;

			const exercises: LastSessionExercise[] = dayExercises
				.sort((a, b) => a.order - b.order)
				.map(ex => {
					const exSetLogs = daySetLogs
						.filter(s => s.planned_exercise_id === ex.id && s.completed)
						.sort((a, b) => a.set_number - b.set_number);

					const currentSets: SetResult[] = exSetLogs.map(s => ({
						setNumber: s.set_number,
						weight: s.actual_weight,
						reps: s.actual_reps,
						completed: s.completed
					}));

					let currentBestSet: { weight: number; reps: number } | null = null;
					let currentBestE1RM = 0;
					for (const s of exSetLogs) {
						if (s.actual_weight !== null && s.actual_weight > 0 && s.actual_reps !== null) {
							const e1rm = epley1RM(s.actual_weight, s.actual_reps);
							if (e1rm > currentBestE1RM) {
								currentBestE1RM = e1rm;
								currentBestSet = { weight: s.actual_weight, reps: s.actual_reps };
							}
						}
					}

					const previousBestSet = getPreviousBestSet(ex.exercisedb_id, wi, day.day_of_week, weeks);

					const allTimePRs = computePersonalRecords(weeks);
					const exercisePR = allTimePRs.find(pr => pr.exerciseName === ex.exercise_name);
					const isPR = exercisePR !== null && currentBestE1RM > 0 &&
						Math.round(currentBestE1RM) >= (exercisePR?.estimated1RM ?? Infinity);

					return {
						exerciseName: ex.exercise_name,
						exercisedbId: ex.exercisedb_id,
						currentSets,
						previousBestSet,
						currentBestSet,
						isPR
					};
				});

			const date = computeDayDate(week.weekStart, day.day_of_week);
			return { date, dayLabel: day.label, exercises };
		}
	}

	return null;
}

function getPreviousBestSet(
	exercisedbId: string,
	currentWeekIdx: number,
	currentDayOfWeek: number,
	weeks: WeekHistory[]
): { weight: number; reps: number } | null {
	let bestE1RM = 0;
	let bestSet: { weight: number; reps: number } | null = null;

	for (let wi = 0; wi <= currentWeekIdx; wi++) {
		const week = weeks[wi];
		const matchingExercises = week.exercises.filter(e => e.exercisedb_id === exercisedbId);

		for (const ex of matchingExercises) {
			const day = week.days.find(d => d.id === ex.planned_day_id);
			if (!day) continue;

			if (wi === currentWeekIdx && day.day_of_week >= currentDayOfWeek) continue;

			const exSetLogs = week.setLogs.filter(
				s => s.planned_exercise_id === ex.id && s.completed
			);

			for (const s of exSetLogs) {
				if (s.actual_weight !== null && s.actual_weight > 0 && s.actual_reps !== null) {
					const e1rm = epley1RM(s.actual_weight, s.actual_reps);
					if (e1rm > bestE1RM) {
						bestE1RM = e1rm;
						bestSet = { weight: s.actual_weight, reps: s.actual_reps };
					}
				}
			}
		}
	}

	return bestSet;
}
