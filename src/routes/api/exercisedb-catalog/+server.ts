import { json } from '@sveltejs/kit';
import { getExercisesByEquipment } from '$lib/api/exercisedb';
import type { Equipment } from '$lib/types';

/** Map user equipment selections to ExerciseDB equipment names */
const EQUIPMENT_MAP: Record<Equipment, string[]> = {
	bodyweight: ['body weight'],
	dumbbells: ['dumbbell'],
	barbell: ['barbell'],
	cable_machine: ['cable'],
	full_gym: ['body weight', 'dumbbell', 'barbell', 'cable']
};

export interface CatalogExercise {
	exerciseId: string;
	name: string;
	bodyParts: string[];
	targetMuscles: string[];
	secondaryMuscles: string[];
	equipments: string[];
}

export async function POST({ request }) {
	try {
		const { equipment }: { equipment: Equipment[] } = await request.json();

		// Build unique set of ExerciseDB equipment names (bodyweight always included)
		const edbEquipment = new Set<string>(['body weight']);
		for (const eq of equipment) {
			for (const mapped of EQUIPMENT_MAP[eq] ?? []) {
				edbEquipment.add(mapped);
			}
		}

		// Fetch exercises for each equipment type in parallel
		const fetchPromises = [...edbEquipment].map(async (eq) => {
			try {
				return await getExercisesByEquipment(eq);
			} catch (err) {
				console.error(`Failed to fetch exercises for equipment "${eq}":`, err);
				return [];
			}
		});

		const results = await Promise.all(fetchPromises);

		// Deduplicate by exerciseId and project to minimal fields
		const seen = new Set<string>();
		const catalog: CatalogExercise[] = [];

		for (const exercises of results) {
			if (!Array.isArray(exercises)) continue;
			for (const raw of exercises) {
				const ex = raw as { exerciseId?: string; name?: string; bodyParts?: string[]; targetMuscles?: string[]; secondaryMuscles?: string[]; equipments?: string[] };
				if (!ex.exerciseId || seen.has(ex.exerciseId)) continue;
				seen.add(ex.exerciseId);
				catalog.push({
					exerciseId: ex.exerciseId,
					name: ex.name ?? '',
					bodyParts: ex.bodyParts ?? [],
					targetMuscles: ex.targetMuscles ?? [],
					secondaryMuscles: ex.secondaryMuscles ?? [],
					equipments: ex.equipments ?? []
				});
			}
		}

		return json({ success: true, catalog });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		console.error('Catalog fetch error:', message);
		return json({ success: false, error: message }, { status: 500 });
	}
}
