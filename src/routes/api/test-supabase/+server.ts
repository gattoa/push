import { json } from '@sveltejs/kit';
import { supabase } from '$lib/api/supabase';

export async function GET() {
	try {
		const { data, error } = await supabase.auth.getSession();
		if (error) return json({ success: false, error: error.message });
		return json({ success: true, message: 'Supabase connected' });
	} catch (error: any) {
		return json({ success: false, error: error.message });
	}
}
