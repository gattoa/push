/**
 * Seed script: fetches real exercise data from ExerciseDB API
 * and writes it to src/lib/data/exercises.json
 *
 * Usage: npx tsx scripts/seed-exercises.ts
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) continue;
	const eqIdx = trimmed.indexOf('=');
	if (eqIdx === -1) continue;
	env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const API_KEY = env.EXERCISEDB_API_KEY;
const API_HOST = env.EXERCISEDB_API_HOST;
const BASE_URL = `https://${API_HOST}/api/v1`;

if (!API_KEY || !API_HOST) {
	console.error('Missing EXERCISEDB_API_KEY or EXERCISEDB_API_HOST in .env.local');
	process.exit(1);
}

const headers = {
	'Content-Type': 'application/json',
	'x-rapidapi-key': API_KEY,
	'x-rapidapi-host': API_HOST
};

async function getExerciseById(id: string): Promise<any> {
	const url = `${BASE_URL}/exercises/${encodeURIComponent(id)}`;
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`Get failed for ${id}: ${res.status}`);
	const json = await res.json();
	return json.data;
}

// Matches ExerciseDBExercise from $lib/types
interface SeedExercise {
	exerciseId: string;
	name: string;
	imageUrl: string;
	imageUrls: Record<string, string>;
	equipments: string[];
	bodyParts: string[];
	exerciseType: string;
	targetMuscles: string[];
	secondaryMuscles: string[];
	videoUrl: string;
	keywords: string[];
	overview: string;
	instructions: string[];
	exerciseTips: string[];
	variations: string[];
	relatedExerciseIds: string[];
}

// 25 curated exercise IDs found via ExerciseDB search
// Organized by training split for reference
const EXERCISE_IDS: { id: string; expectedName: string }[] = [
	// === PUSH (8) ===
	{ id: 'exr_41n2hxnFMotsXTj3', expectedName: 'Bench Press' },
	{ id: 'exr_41n2hs6camM22yBG', expectedName: 'Seated Shoulder Press' },
	{ id: 'exr_41n2hadQgEEX8wDN', expectedName: 'Triceps Dip' },
	{ id: 'exr_41n2hsVHu7B1MTdr', expectedName: 'Palms In Incline Bench Press' },
	{ id: 'exr_41n2hjuGpcex14w7', expectedName: 'Lateral Raise' },
	{ id: 'exr_41n2hkK8hGAcSnW7', expectedName: 'Chest Dip' },
	{ id: 'exr_41n2hMRXm49mM62z', expectedName: 'Arnold Press' },
	{ id: 'exr_41n2hPgRbN1KtJuD', expectedName: 'Close-grip Push-up' },

	// === PULL (8) ===
	{ id: 'exr_41n2hHdjQpnyNdie', expectedName: 'One Arm Bent-over Row' },
	{ id: 'exr_41n2hU4y6EaYXFhr', expectedName: 'Pull up' },
	{ id: 'exr_41n2hGioS8HumEF7', expectedName: 'Hammer Curl' },
	{ id: 'exr_41n2hadPLLFRGvFk', expectedName: 'Sliding Floor Pulldown on Towel' },
	{ id: 'exr_41n2hcFJpBvAkXCP', expectedName: 'Seated Row with Towel' },
	{ id: 'exr_41n2hgCHNgtVLHna', expectedName: 'Cross Body Hammer Curl' },
	{ id: 'exr_41n2hVCJfpAvJcdU', expectedName: 'Commando Pull-up' },
	{ id: 'exr_41n2hdkBpqwoDmVq', expectedName: 'Suspended Row' },

	// === LEGS (6) ===
	{ id: 'exr_41n2hmGR8WuVfe1U', expectedName: 'Squat' },
	{ id: 'exr_41n2hn8rpbYihzEW', expectedName: 'Romanian Deadlift' },
	{ id: 'exr_41n2hQDiSwTZXM4F', expectedName: 'Goblet Squat' },
	{ id: 'exr_41n2hTs4q3ihihZs', expectedName: 'Seated Calf Raise' },
	{ id: 'exr_41n2hpLLs1uU5atr', expectedName: 'Bulgarian Split Squat' },
	{ id: 'exr_41n2hwoc6PkW1UJJ', expectedName: 'Barbell Standing Calf Raise' },

	// === CORE (3) ===
	{ id: 'exr_41n2hMZCmZBvQApL', expectedName: 'Hanging Straight Leg Raise' },
	{ id: 'exr_41n2hXQw5yAbbXL8', expectedName: 'Front Plank' },
	{ id: 'exr_41n2hskeb9dXgBoC', expectedName: 'Crunch Floor' },
];

async function main() {
	const exercises: SeedExercise[] = [];

	for (const { id, expectedName } of EXERCISE_IDS) {
		console.log(`Fetching: ${expectedName} (${id})...`);
		try {
			const full = await getExerciseById(id);
			exercises.push({
				exerciseId: full.exerciseId,
				name: full.name,
				imageUrl: full.imageUrl ?? '',
				imageUrls: full.imageUrls ?? {},
				equipments: full.equipments ?? [],
				bodyParts: full.bodyParts ?? [],
				exerciseType: full.exerciseType ?? '',
				targetMuscles: full.targetMuscles ?? [],
				secondaryMuscles: full.secondaryMuscles ?? [],
				videoUrl: full.videoUrl ?? '',
				keywords: full.keywords ?? [],
				overview: full.overview ?? '',
				instructions: full.instructions ?? [],
				exerciseTips: full.exerciseTips ?? [],
				variations: full.variations ?? [],
				relatedExerciseIds: full.relatedExerciseIds ?? []
			});
			console.log(`  ✓ ${full.name} — bodyParts: [${(full.bodyParts ?? []).join(', ')}]`);
		} catch (err) {
			console.error(`  ✗ Failed: ${err}`);
		}
		await new Promise(r => setTimeout(r, 150));
	}

	const outPath = resolve(__dirname, '..', 'src', 'lib', 'data', 'exercises.json');
	writeFileSync(outPath, JSON.stringify(exercises, null, '\t'));
	console.log(`\nWritten ${exercises.length} exercises to: ${outPath}`);

	const bodyParts = new Set<string>();
	for (const ex of exercises) {
		for (const bp of ex.bodyParts) bodyParts.add(bp);
	}
	console.log(`Body parts covered: ${[...bodyParts].sort().join(', ')}`);
}

main().catch(err => {
	console.error('Fatal error:', err);
	process.exit(1);
});
