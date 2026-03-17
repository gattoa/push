import { supabase } from '$lib/api/supabase';
import type { OnboardingData, AppPreferences } from '$lib/types';

const ONBOARDING_KEY = 'push_onboarding_data';
const PREFERENCES_KEY = 'push_preferences';

export interface UserSettings {
	onboardingData: OnboardingData;
	preferences: AppPreferences;
}

const DEFAULT_PREFERENCES: AppPreferences = {
	reviewDay: 6,
	units: 'lbs',
	restTimerDefault: 90
};

const DEFAULT_ONBOARDING: OnboardingData = {
	dateOfBirth: null,
	gender: null,
	experienceLevel: null,
	trainingDays: null,
	sessionDuration: null,
	equipment: [],
	goals: [],
	injuries: []
};

/** Save settings to both localStorage and Supabase. */
export async function saveSettings(
	userId: string,
	onboardingData: OnboardingData,
	preferences: AppPreferences
): Promise<void> {
	// localStorage first (synchronous, immediate)
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboardingData));
		localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
	}

	// Supabase (async, best-effort)
	if (!userId) return;
	const { error } = await supabase
		.from('user_settings')
		.upsert({
			user_id: userId,
			onboarding_data: onboardingData,
			preferences,
			updated_at: new Date().toISOString()
		}, { onConflict: 'user_id' });

	if (error) throw new Error(`saveSettings: ${error.message}`);
}

/** Fetch settings. Tries Supabase first, falls back to localStorage. */
export async function fetchSettings(userId: string): Promise<UserSettings> {
	// 1. Try Supabase
	if (userId) {
		try {
			const { data, error } = await supabase
				.from('user_settings')
				.select('onboarding_data, preferences')
				.eq('user_id', userId)
				.maybeSingle();

			if (!error && data) {
				const onboardingData = (data.onboarding_data ?? DEFAULT_ONBOARDING) as OnboardingData;
				const preferences = { ...DEFAULT_PREFERENCES, ...(data.preferences as Partial<AppPreferences>) };

				// Cache to localStorage
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboardingData));
					localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
				}

				return { onboardingData, preferences };
			}
		} catch (e) {
			console.warn('[Push] Supabase settings fetch failed, falling back to localStorage:', e instanceof Error ? e.message : e);
		}
	}

	// 2. Fall back to localStorage
	let onboardingData = DEFAULT_ONBOARDING;
	let preferences = DEFAULT_PREFERENCES;

	if (typeof localStorage !== 'undefined') {
		const rawData = localStorage.getItem(ONBOARDING_KEY);
		if (rawData) {
			try { onboardingData = JSON.parse(rawData); } catch { /* ignore */ }
		}
		const rawPrefs = localStorage.getItem(PREFERENCES_KEY);
		if (rawPrefs) {
			try { preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(rawPrefs) }; } catch { /* ignore */ }
		}

		// Backfill: if we got data from localStorage but not Supabase, sync up
		if (userId && rawData) {
			saveSettings(userId, onboardingData, preferences).catch(e =>
				console.warn('[Push] Settings backfill failed:', e instanceof Error ? e.message : e)
			);
		}
	}

	return { onboardingData, preferences };
}

/** Fields that affect plan generation. Returns true if any changed. */
export function hasPlanAffectingChanges(
	prev: OnboardingData,
	next: OnboardingData
): boolean {
	if (prev.trainingDays !== next.trainingDays) return true;
	if (prev.sessionDuration !== next.sessionDuration) return true;
	if (prev.experienceLevel !== next.experienceLevel) return true;
	if (JSON.stringify(prev.equipment) !== JSON.stringify(next.equipment)) return true;
	if (JSON.stringify(prev.goals) !== JSON.stringify(next.goals)) return true;
	if (JSON.stringify(prev.injuries) !== JSON.stringify(next.injuries)) return true;
	return false;
}
