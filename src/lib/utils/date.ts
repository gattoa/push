const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getDayName(index: number): string {
	return DAY_NAMES[index] ?? '';
}

/** Returns 0=Mon ... 6=Sun based on current day */
export function getTodayIndex(): number {
	const jsDay = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
	return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon ... 6=Sun
}
