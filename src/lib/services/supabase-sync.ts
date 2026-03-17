import { supabase } from '$lib/api/supabase';
import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog, GeneratedPlan } from '$lib/types';
import type { CurrentWeekData } from './workout';

/** Upsert device row (fire-and-forget). */
export async function ensureDevice(deviceId: string): Promise<void> {
	if (!deviceId) return;
	const { error } = await supabase.from('devices').upsert({ id: deviceId });
	if (error) console.warn('[Push] ensureDevice failed:', error.message);
}

/** Save a full generated plan to Supabase. Deletes any existing plan for this device+week first. */
export async function savePlanToSupabase(
	deviceId: string,
	generated: GeneratedPlan,
	weekStart: string
): Promise<void> {
	if (!deviceId) return;

	// Delete existing plan for this week (CASCADE cleans children)
	await supabase
		.from('weekly_plans')
		.delete()
		.eq('user_id', deviceId)
		.eq('week_start', weekStart);

	// Insert plan
	const { error: planError } = await supabase.from('weekly_plans').insert({
		id: 'gen-plan-1',
		user_id: deviceId,
		week_start: weekStart,
		review_day: 6,
		source: generated.source
	});
	if (planError) throw new Error(`weekly_plans insert: ${planError.message}`);

	// Insert days
	if (generated.days.length > 0) {
		const { error: daysError } = await supabase.from('planned_days').insert(
			generated.days.map(d => ({
				id: d.id,
				plan_id: d.plan_id,
				day_of_week: d.day_of_week,
				label: d.label,
				is_rest_day: d.is_rest_day
			}))
		);
		if (daysError) throw new Error(`planned_days insert: ${daysError.message}`);
	}

	// Insert exercises
	if (generated.exercises.length > 0) {
		const { error: exError } = await supabase.from('planned_exercises').insert(
			generated.exercises.map(e => ({
				id: e.id,
				planned_day_id: e.planned_day_id,
				exercisedb_id: e.exercisedb_id,
				exercise_name: e.exercise_name,
				body_parts: e.body_parts,
				target_muscles: e.target_muscles,
				equipments: e.equipments,
				cue: e.cue ?? null,
				superset_group: e.superset_group ?? null,
				order: e.order
			}))
		);
		if (exError) throw new Error(`planned_exercises insert: ${exError.message}`);
	}

	// Insert sets
	if (generated.sets.length > 0) {
		const { error: setsError } = await supabase.from('planned_sets').insert(
			generated.sets.map(s => ({
				id: s.id,
				planned_exercise_id: s.planned_exercise_id,
				set_number: s.set_number,
				set_type: s.set_type ?? 'standard',
				target_reps: s.target_reps,
				target_weight: s.target_weight,
				drops: s.drops ?? null
			}))
		);
		if (setsError) throw new Error(`planned_sets insert: ${setsError.message}`);
	}

	// Insert empty set logs
	const emptyLogs = generated.sets.map(ps => ({
		id: `log-${ps.id}`,
		workout_log_id: `wlog-${ps.planned_exercise_id}`,
		planned_exercise_id: ps.planned_exercise_id,
		planned_set_id: ps.id,
		set_number: ps.set_number,
		actual_reps: null,
		actual_weight: null,
		completed: false,
		drop_logs: null
	}));

	if (emptyLogs.length > 0) {
		const { error: logsError } = await supabase.from('set_logs').insert(emptyLogs);
		if (logsError) throw new Error(`set_logs insert: ${logsError.message}`);
	}
}

/** Fetch the current week's plan from Supabase. Returns null if no plan found. */
export async function fetchCurrentPlan(
	deviceId: string,
	weekStart: string
): Promise<CurrentWeekData | null> {
	if (!deviceId) return null;

	// Fetch plan
	const { data: planRow, error: planError } = await supabase
		.from('weekly_plans')
		.select('*')
		.eq('user_id', deviceId)
		.eq('week_start', weekStart)
		.maybeSingle();

	if (planError) throw new Error(`fetchCurrentPlan: ${planError.message}`);
	if (!planRow) return null;

	const plan: WeeklyPlan = {
		id: planRow.id,
		user_id: planRow.user_id,
		week_start: planRow.week_start,
		review_day: planRow.review_day,
		source: planRow.source,
		created_at: planRow.created_at
	};

	// Fetch days
	const { data: dayRows } = await supabase
		.from('planned_days')
		.select('*')
		.eq('plan_id', plan.id)
		.order('day_of_week');

	const days: PlannedDay[] = (dayRows ?? []).map(d => ({
		id: d.id,
		plan_id: d.plan_id,
		day_of_week: d.day_of_week,
		label: d.label,
		is_rest_day: d.is_rest_day
	}));

	// Fetch exercises
	const dayIds = days.map(d => d.id);
	const { data: exRows } = await supabase
		.from('planned_exercises')
		.select('*')
		.in('planned_day_id', dayIds)
		.order('order');

	const exercises: PlannedExercise[] = (exRows ?? []).map(e => ({
		id: e.id,
		planned_day_id: e.planned_day_id,
		exercisedb_id: e.exercisedb_id,
		exercise_name: e.exercise_name,
		body_parts: e.body_parts as string[],
		target_muscles: e.target_muscles as string[],
		equipments: e.equipments as string[],
		cue: e.cue ?? undefined,
		superset_group: e.superset_group ?? undefined,
		order: e.order
	}));

	// Fetch sets
	const exIds = exercises.map(e => e.id);
	const { data: setRows } = await supabase
		.from('planned_sets')
		.select('*')
		.in('planned_exercise_id', exIds)
		.order('set_number');

	const plannedSets: PlannedSet[] = (setRows ?? []).map(s => ({
		id: s.id,
		planned_exercise_id: s.planned_exercise_id,
		set_number: s.set_number,
		set_type: s.set_type as PlannedSet['set_type'],
		target_reps: s.target_reps,
		target_weight: s.target_weight,
		drops: s.drops as PlannedSet['drops']
	}));

	// Fetch set logs
	const setIds = plannedSets.map(s => s.id);
	const { data: logRows } = await supabase
		.from('set_logs')
		.select('*')
		.in('planned_set_id', setIds)
		.order('set_number');

	const setLogs: SetLog[] = (logRows ?? []).map(l => ({
		id: l.id,
		workout_log_id: l.workout_log_id,
		planned_exercise_id: l.planned_exercise_id,
		planned_set_id: l.planned_set_id,
		set_number: l.set_number,
		actual_reps: l.actual_reps,
		actual_weight: l.actual_weight,
		completed: l.completed,
		drop_logs: l.drop_logs as SetLog['drop_logs']
	}));

	return { plan, days, exercises, plannedSets, setLogs };
}

/** Upsert set logs to Supabase. */
export async function upsertSetLogs(logs: SetLog[]): Promise<void> {
	if (logs.length === 0) return;

	const rows = logs.map(l => ({
		id: l.id,
		workout_log_id: l.workout_log_id,
		planned_exercise_id: l.planned_exercise_id,
		planned_set_id: l.planned_set_id,
		set_number: l.set_number,
		actual_reps: l.actual_reps,
		actual_weight: l.actual_weight,
		completed: l.completed,
		drop_logs: l.drop_logs ?? null,
		updated_at: new Date().toISOString()
	}));

	const { error } = await supabase
		.from('set_logs')
		.upsert(rows, { onConflict: 'id' });

	if (error) throw new Error(`upsertSetLogs: ${error.message}`);
}
