import type { OnboardingData, GeneratedPlan } from '$lib/types';

/** Generate a training plan from onboarding data via Claude API. Throws on failure. */
export async function generatePlan(data: OnboardingData): Promise<GeneratedPlan> {
	const response = await fetch('/api/generate-plan', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
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
