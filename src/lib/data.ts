export interface Dot {
    id: number;
    numberInvolved: number;
    fatalities: boolean;
    headline: string;
    humanized_headline: string;
    x?: number;
    y?: number;
    criteria: {
        criteria1: boolean;
        criteria2: boolean;
        criteria3: boolean;
        criteria4: boolean;
        criteria5: boolean;
    }
}
export function generateDots(count: number): Dot[] {
    const dots: Dot[] = [];
    
    for (let i = 0; i < count; i++) {
        // Generate exponential distribution with lambda = 0.5
        // This will make lower numbers much more common
        const lambda = 0.5;
        const exponentialRandom = Math.floor(-Math.log(1 - Math.random()) / lambda);
        
        // Clamp between 1 and 50, with most values being 1-3
        const numberInvolved = Math.min(Math.max(exponentialRandom, 1), 12);
        
        dots.push({
            id: i,
            numberInvolved,
            fatalities: Math.random() > 0.5, // Random boolean
            headline: `Crash number ${i} headline`, // Generated headline with ID
            humanized_headline: `Crash number ${i} humanized headline`,
            criteria: {
                criteria1: Math.random() > 0.5,
                criteria2: Math.random() > 0.5,
                criteria3: Math.random() > 0.5,
                criteria4: Math.random() > 0.5,
                criteria5: Math.random() > 0.5,
            }
        });
    }
    
    return dots;
} 