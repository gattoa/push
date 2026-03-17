import { supabase } from '$lib/api/supabase';
import { getDeviceId } from '$lib/utils/device';

/** Get the authenticated user's ID, falling back to device ID during transition. */
export async function getUserId(): Promise<string> {
	try {
		const { data: { session } } = await supabase.auth.getSession();
		if (session?.user?.id) return session.user.id;
	} catch { /* fall through */ }
	return getDeviceId();
}
