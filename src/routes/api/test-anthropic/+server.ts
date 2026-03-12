import { json } from '@sveltejs/kit';
import { anthropic } from '$lib/api/anthropic';

export async function POST({ request }: { request: Request }) {
	try {
		const { message } = await request.json();
		const response = await anthropic.messages.create({
			model: 'claude-sonnet-4-5-20250929',
			max_tokens: 100,
			messages: [{ role: 'user', content: message || 'Hello' }]
		});
		return json({ success: true, response: response.content });
	} catch (error: any) {
		return json({ success: false, error: error.message });
	}
}
