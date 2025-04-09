import type { Dot } from '$lib/types/data';
import { csv } from 'd3-fetch';

/**
 * Data source types supported by the application
 */
export enum DataSource {
    RANDOM = 'random',
    CSV = 'csv'
}

/**
 * Options for loading data
 */
export interface DataLoadOptions {
    source: DataSource;
    count?: number;       // Used for random data generation
    filePath?: string;    // Used for CSV loading
}

/**
 * Raw CSV data for examination
 */
export let rawCsvData: any[] = [];

/**
 * Load data based on specified options
 */
export async function loadData(options: DataLoadOptions): Promise<Dot[]> {
    switch (options.source) {
        case DataSource.RANDOM:
            return generateRandomDots(options.count || 500);
        case DataSource.CSV:
            // Just load the raw CSV for now
            const data = await loadRawCsvData(options.filePath || '/data.csv');
            console.log(data);
            return data;
        default:
            throw new Error(`Unsupported data source: ${options.source}`);
    }
}

/**
 * Load raw CSV data without parsing
 */
async function loadRawCsvData(filePath: string): Promise<any[]> {
    try {
        // Load the CSV data using d3-fetch
        rawCsvData = await csv(filePath);
        // loop through rows creating Dot objects
        const dots: Dot[] = [];
        for (let i = 0; i < rawCsvData.length; i++) {
            //debug for allcriteria
            if (rawCsvData[i].mentions_all_parties === '1.0' && rawCsvData[i].uses_human_terms === '1.0' && rawCsvData[i].active_voice === '1.0') {
                console.log(rawCsvData[i]);
            }   
            dots.push({
                id: i,
                numberInvolved: parseInt(rawCsvData[i].num_injured) + parseInt(rawCsvData[i].num_dead) + parseInt(rawCsvData[i].num_unknown) + parseInt(rawCsvData[i].num_unharmed),
                fatalities: parseInt(rawCsvData[i].num_dead) > 0,
                allCriteriaTrue: rawCsvData[i].mentions_all_parties === '1.0' && rawCsvData[i].uses_human_terms === '1.0' && rawCsvData[i].active_voice === '1.0',
                headline: rawCsvData[i].title,
                humanized_headline: rawCsvData[i].human_centered_headline,
                source: rawCsvData[i].url,
                criteria: {
                    criteria1: rawCsvData[i].mentions_all_parties === '1.0',
                    criteria1explanation: rawCsvData[i].mentions_all_parties_explanation,
                    criteria2: rawCsvData[i].uses_human_terms === '1.0',
                    criteria2explanation: rawCsvData[i].uses_human_terms_explanation,
                    criteria3: rawCsvData[i].active_voice === '1.0',
                    criteria3explanation: rawCsvData[i].active_voice_explanation,
                },
                rewritten: {
                    rewritten_headline: rawCsvData[i].human_centered_headline,
                    rewritten_criteria: {
                        criteria1fixed: true,
                        criteria1fixedexplanation: rawCsvData[i].re_mentions_all_parties,
                        criteria2fixed: true,
                        criteria2fixedexplanation: rawCsvData[i].re_uses_human_terms,
                        criteria3fixed: true,
                        criteria3fixedexplanation: rawCsvData[i].re_active_voice,
                    }
                }
            });
        }
        return dots;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
}

/**
 * Generate random dots for visualization
 */
function generateRandomDots(count: number): Dot[] {
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
            allCriteriaTrue: Math.random() > 0.5,
            source: 'https://www.google.com',
            criteria: {
                criteria1: Math.random() > 0.5,
                criteria1explanation: 'This is a test explanation',
                criteria2: Math.random() > 0.5,
                criteria2explanation: 'This is a test explanation',
                criteria3: Math.random() > 0.5,
                criteria3explanation: 'This is a test explanation',
            },
            rewritten: {
                rewritten_headline: `Crash number ${i} rewritten headline`,
                rewritten_criteria: {
                    criteria1fixed: true,
                    criteria1fixedexplanation: 'This is a test rewritten explanation',
                    criteria2fixed: true,
                    criteria2fixedexplanation: 'This is a test rewritten explanation',
                    criteria3fixed: true,
                    criteria3fixedexplanation: 'This is a test rewritten explanation',
                }
            }
        });
    }
    
    return dots;
} 