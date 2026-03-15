import type { CheckInState } from '$lib/types';

const STORAGE_KEY = 'push_checkin';

export function getCheckInState(weekPlanId: string): CheckInState | null {
	if (typeof window === 'undefined') return null;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	const state: CheckInState = JSON.parse(raw);
	return state.weekPlanId === weekPlanId ? state : null;
}

/** Returns true if the user hasn't completed a check-in for this week */
export function isCheckInPending(weekPlanId: string): boolean {
	if (typeof window === 'undefined') return false;
	const state = getCheckInState(weekPlanId);
	if (!state) return true; // no state = hasn't checked in
	return state.completedAt === null;
}

export function addCheckInPhoto(weekPlanId: string, photoId: string): void {
	const existing = getCheckInState(weekPlanId);
	const state: CheckInState = existing ?? {
		weekPlanId,
		photoIds: [],
		completedAt: null
	};
	state.photoIds.push(photoId);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function completeCheckIn(weekPlanId: string): void {
	const existing = getCheckInState(weekPlanId);
	const state: CheckInState = existing ?? {
		weekPlanId,
		photoIds: [],
		completedAt: null
	};
	state.completedAt = new Date().toISOString();
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
