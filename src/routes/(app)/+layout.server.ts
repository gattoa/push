import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	if (!session) redirect(303, '/login');

	if (!user?.user_metadata?.onboarding_complete) redirect(303, '/onboarding');

	// Verify settings data actually exists — if onboarding_complete is true
	// but no settings row, the user needs to re-onboard
	const { data: settings } = await supabase
		.from('user_settings')
		.select('user_id')
		.eq('user_id', user.id)
		.maybeSingle();

	if (!settings) {
		// Reset the flag so onboarding flow works properly
		await supabase.auth.updateUser({ data: { onboarding_complete: false } });
		redirect(303, '/onboarding');
	}

	return { session, user };
};
