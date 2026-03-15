/**
 * Centralized copy content for the app.
 * All user-facing strings that carry tone or messaging intent live here.
 * Component labels (button text, field labels) stay in their components.
 */

export const today = {
	/** Progress bar text when all sets are done */
	workoutComplete: 'Complete',

	/** Rest day with more training days ahead this week */
	restDay: {
		nextSessionLabel: (dayName: string, label: string) => `${dayName} · ${label}`
	},

	/** Rest day at end of week — no more training days ahead */
	weekComplete: "You're done for the week.",

	/** Check-in card */
	checkIn: {
		title: 'Progress photos',
		subtitle: 'Optional snapshot for your trainer'
	}
};
