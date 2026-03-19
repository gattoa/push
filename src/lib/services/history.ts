import type { SetLog, WeekHistory } from '$lib/types';

const GENERATED_PLAN_KEY = 'push_generated_plan';

/** Build a WeekHistory from a generated plan, merging any saved set logs. */
function getGeneratedWeekHistory(): WeekHistory | null {
	if (typeof localStorage === 'undefined') return null;
	const raw = localStorage.getItem(GENERATED_PLAN_KEY);
	if (!raw) return null;

	try {
		const generated: import('$lib/types').GeneratedPlan = JSON.parse(raw);
		const now = new Date();
		const day = now.getDay();
		const diff = day === 0 ? 6 : day - 1;
		const monday = new Date(now);
		monday.setDate(now.getDate() - diff);
		const weekStart = monday.toISOString().split('T')[0];

		let setLogs: SetLog[] = generated.sets.map(ps => ({
			id: `log-${ps.id}`,
			workout_log_id: `wlog-${ps.planned_exercise_id}`,
			planned_exercise_id: ps.planned_exercise_id,
			planned_set_id: ps.id,
			set_number: ps.set_number,
			actual_reps: null,
			actual_weight: null,
			completed: false
		}));

		// Merge saved set logs so history reflects actual completions
		const savedRaw = localStorage.getItem('push_set_logs');
		if (savedRaw) {
			try {
				const saved: SetLog[] = JSON.parse(savedRaw);
				const savedById = new Map(saved.map(s => [s.id, s]));
				setLogs = setLogs.map(log => {
					const s = savedById.get(log.id);
					if (!s) return log;
					return { ...log, actual_reps: s.actual_reps, actual_weight: s.actual_weight, completed: s.completed, drop_logs: s.drop_logs };
				});
			} catch { /* ignore */ }
		}

		return {
			weekNumber: 1,
			weekStart,
			days: generated.days,
			exercises: generated.exercises,
			plannedSets: generated.sets,
			setLogs
		};
	} catch {
		return null;
	}
}

/** Fetch all week histories for the current user. Returns only real data (no mock). */
export function getWeekHistories(): WeekHistory[] {
	const generated = getGeneratedWeekHistory();
	return generated ? [generated] : [];
}
