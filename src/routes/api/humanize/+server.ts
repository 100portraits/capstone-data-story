import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const dot = await request.json();

        console.log(dot);
        // Implement the real logic here - pull from the Dot object
        return json({
            id: dot.id,
            humanizedHeadline: dot.humanized_headline,
            humanizedCriteria: {
                criteria1: {
                    value: dot.rewritten.rewritten_criteria.criteria1fixed,
                    description: dot.rewritten.rewritten_criteria.criteria1fixedexplanation
                },
                criteria2: {
                    value: dot.rewritten.rewritten_criteria.criteria2fixed,
                    description: dot.rewritten.rewritten_criteria.criteria2fixedexplanation
                },
                criteria3: {
                    value: dot.rewritten.rewritten_criteria.criteria3fixed,
                    description: dot.rewritten.rewritten_criteria.criteria3fixedexplanation
                }
            }
            
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