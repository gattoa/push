import type { AppPreferences } from '$lib/types';

const STORAGE_KEY = 'push_preferences';

const DEFAULTS: AppPreferences = {
	reviewDay: 6,
	units: 'lbs',
	restTimerDefault: 90
};

export function getPreferences(): AppPreferences {
	if (typeof localStorage === 'undefined') return DEFAULTS;

	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return DEFAULTS;

	try {
		return { ...DEFAULTS, ...JSON.parse(raw) };
	} catch {
		return DEFAULTS;
	}
}
