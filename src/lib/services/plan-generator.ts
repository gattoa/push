import type { OnboardingData, GeneratedPlan } from '$lib/types';

/** Fetch the live exercise catalog from ExerciseDB, filtered by user's equipment. */
async function fetchCatalog(equipment: OnboardingData['equipment']) {
	const response = await fetch('/api/exercisedb-catalog', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ equipment })
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({ error: 'Unknown error' }));
		throw new Error(`Failed to fetch exercise catalog: ${err.error ?? 'Unknown error'}`);
	}

	const result = await response.json();
	if (!result.success || !Array.isArray(result.catalog)) {
		throw new Error('Exercise catalog returned unexpected response');
	}

	return result.catalog;
}

/** Generate a training plan: fetches live catalog, then calls Claude. Throws on failure. */
export async function generatePlan(data: OnboardingData): Promise<GeneratedPlan> {
	// Step 1: Fetch live exercise catalog
	const catalog = await fetchCatalog(data.equipment ?? []);

	if (catalog.length === 0) {
		throw new Error('No exercises available for your equipment selection');
	}

	// Step 2: Generate plan with Claude using the live catalog
	const response = await fetch('/api/generate-plan', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ data, catalog })
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({ error: 'Unknown error' }));
		throw new Error(err.error ?? err.details ?? 'Plan generation failed');
	}

	const result = await response.json();
	if (result.success && result.plan) {
		return { ...result.plan, source: 'ai' as const } as GeneratedPlan;
	}

	throw new Error('Plan generation returned unexpected response');
}
