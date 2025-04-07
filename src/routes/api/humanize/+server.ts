import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const dot = await request.json();
        
        // For now, return mock data
        return json({
            id: dot.id,
            humanizedHeadline: "Humanized headline #" + dot.id,
            humanizedCriteria: {
                criteria1: {
                    value: true,
                    description: "Humanized criteria 1"
                },
                criteria2: {
                    value: true,
                    description: "Humanized criteria 2"
                },
                criteria3: {
                    value: true,
                    description: "Humanized criteria 3"
                },
                criteria4: {
                    value: true,
                    description: "Humanized criteria 4"
                },
                criteria5: {
                    value: true,
                    description: "Humanized criteria 5"
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}; 