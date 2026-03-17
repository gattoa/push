import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session) redirect(303, '/login');

	if (!user?.user_metadata?.onboarding_complete) redirect(303, '/onboarding');

	return { session, user };
};
