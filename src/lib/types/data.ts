export interface Dot {
    id: number;
    numberInvolved: number;
    fatalities: boolean;
    headline: string;
    humanized_headline: string;
    source: string;
    x?: number;
    y?: number;
    criteria: {
        criteria1: boolean;
        criteria1explanation: string;
        criteria2: boolean;
        criteria2explanation: string;
        criteria3: boolean;
        criteria3explanation: string;
    }
    rewritten: {
        rewritten_headline: string;
        rewritten_criteria: {
            criteria1fixed: boolean;
            criteria1fixedexplanation: string;
            criteria2fixed: boolean;
            criteria2fixedexplanation: string;
            criteria3fixed: boolean;
            criteria3fixedexplanation: string;
        }
    }
} 