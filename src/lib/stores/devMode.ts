import { writable } from 'svelte/store';

// Dev mode store - set to false in production
// This allows for enabling/disabling development features
export const devMode = writable(false); 