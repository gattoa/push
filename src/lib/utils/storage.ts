/**
 * Centralized localStorage key registry.
 * 'session' keys are cleared on logout; 'week' keys are cleared on week rollover.
 */
const STORAGE_KEYS = [
	{ key: 'push_device_id', scope: 'session' },
	{ key: 'push_generated_plan', scope: 'week' },
	{ key: 'push_set_logs', scope: 'week' },
	{ key: 'push_onboarding_data', scope: 'session' },
	{ key: 'push_preferences', scope: 'session' },
	{ key: 'push_checkin', scope: 'week' }
] as const;

/** Clear all user data from localStorage (logout). */
export function clearSessionData(): void {
	if (typeof localStorage === 'undefined') return;
	for (const { key } of STORAGE_KEYS) {
		localStorage.removeItem(key);
	}
}

/** Clear only week-scoped data from localStorage (week rollover). */
export function clearWeekData(): void {
	if (typeof localStorage === 'undefined') return;
	for (const { key, scope } of STORAGE_KEYS) {
		if (scope === 'week') {
			localStorage.removeItem(key);
		}
	}
}
