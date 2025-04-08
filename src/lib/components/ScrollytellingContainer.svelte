<script lang="ts">
    import { onMount } from 'svelte';
    import PackedCircleChart from './PackedCircleChart.svelte';
    import type { Dot } from '$lib/types/data';
    import { loadData, DataSource } from '$lib/utils/dataLoader';
    import { devMode } from '$lib/stores/devMode';
    
    export let showViz: boolean = true;
    export let initViz: boolean = true;
    export let dataCount: number = 500;
    export let sections: { id: string; label: string }[] = [];
    
    let dots: Dot[] = [];
    let windowWidth: number;
    let windowHeight: number;
    let visibleSectionIndex = 0;
    let currentSectionId: string = '';
    
    // Visualization state that will be passed to PackedCircleChart
    let highlightFatalities: boolean | null = null;
    let highlightNumberRange: {min: number, max: number} | null = null;
    let allCriteriaTrue: boolean | null = null;
    let onePoint: boolean | null = null;
    let activeSectionId: string = '';
    let explorationMode: boolean = false;
    
    // Calculate the ID of the last section
    $: lastSectionId = sections.length > 0 ? sections[sections.length - 1].id : '';
    // Determine if the current section is the last section
    $: isLastSection = currentSectionId === lastSectionId;

    onMount(() => {
        if (initViz) {
            let source = DataSource.CSV;
            // Load data for visualization using the data utility
            loadData({
                source: source,
                filePath: '/data.csv',
                count: dataCount
            }).then(result => {
                dots = result;
                console.log(`Loaded ${dots.length} dots for visualization using the ${source} data source`);
                
            });
        }
        
        // Collect section elements using the passed IDs
        const sectionElements = sections.map(s => document.getElementById(s.id)).filter(el => el !== null) as HTMLElement[];
        
        // Handle section visibility detection
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    currentSectionId = sectionId;
                    
                    // Only apply new filters if section actually changed
                    if (activeSectionId !== sectionId) {
                        // Reset filters first
                        resetFilters();
                        
                        // Update active section
                        activeSectionId = sectionId;
                        console.log(`Section ${sectionId} is now visible`);
                        
                        // Apply filters specific to the active section
                        if (sectionId === "viz-three-criteria") {
                            highlightDots({ 
                                fatalities: null, 
                                numberRange: null,
                                allCriteriaTrue: true,
                                onePoint: null
                            });
                        } else if (sectionId === "viz-three-criteria-p2") {
                            highlightDots({ 
                                fatalities: null,
                                numberRange: null,
                                allCriteriaTrue: true,
                                onePoint: null
                            });
                        } else if (sectionId === "viz-example-headline") {
                            highlightDots({ 
                                fatalities: null,
                                numberRange: null,
                                allCriteriaTrue: null,
                                onePoint: true
                            });
                        } else if (sectionId === "viz-rewritten-example-headline") {
                            highlightDots({ 
                                fatalities: null,
                                numberRange: null,
                                allCriteriaTrue: null,
                                onePoint: true
                            });
                        }
                    }
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all collected section elements
        sectionElements.forEach(section => {
            if (section) observer.observe(section);
        });
        
        return () => {
            observer.disconnect();
        };
    });
    
    function resetFilters() {
        // Reset all filters
        highlightFatalities = null;
        highlightNumberRange = null;
        allCriteriaTrue = null;
        console.log('Filters reset');
    }
    
    export function highlightDots(params: {
        fatalities?: boolean | null;
        numberRange?: {min: number, max: number} | null;
        allCriteriaTrue?: boolean | null;
        onePoint?: boolean | null;
    }) {
        // Update visualization state
        if (params.fatalities !== undefined) {
            highlightFatalities = params.fatalities;
        }
        
        if (params.numberRange !== undefined) {
            highlightNumberRange = params.numberRange;
        }
        
        if (params.allCriteriaTrue !== undefined) {
            allCriteriaTrue = params.allCriteriaTrue;
        }

        if (params.onePoint !== undefined) {
            onePoint = params.onePoint;
        }
        
        console.log('Highlighting dots with:', params);
    }
    
    export function enterExplorationMode() {
        explorationMode = true;
        // Reset all filters when entering exploration mode
        resetFilters();
        console.log('Entered exploration mode');
        
        // Trigger zoom-out animation
        setTimeout(() => {
            const vizElement = document.querySelector('.fullscreen-viz svg');
            if (vizElement) {
                // Trigger a zoom-out in the PackedCircleChart
                const zoomOutEvent = new CustomEvent('zoom-out');
                vizElement.dispatchEvent(zoomOutEvent);
            }
        }, 100);
    }
    
    export function exitExplorationMode() {
        explorationMode = false;
        // Reset all filters when exiting exploration mode
        resetFilters();
        console.log('Exited exploration mode');
        
        // Return to the original zoom level
        setTimeout(() => {
            const vizElement = document.querySelector('.fullscreen-viz svg');
            if (vizElement) {
                // Trigger a zoom reset in the PackedCircleChart
                const resetEvent = new CustomEvent('reset-zoom');
                vizElement.dispatchEvent(resetEvent);
            }
        }, 100);
    }
    
    export function scrollToSection(sectionId: string) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    function scrollToNextSection() {
        if (!currentSectionId || explorationMode) return;
        
        // Find current section index using the sections prop array
        const currentIndex = sections.findIndex(section => section.id === currentSectionId);
        
        // If found and not the last section, scroll to the next one
        if (currentIndex !== -1 && currentIndex < sections.length - 1) {
            const nextSectionId = sections[currentIndex + 1].id;
            scrollToSection(nextSectionId);
        }
    }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div class="scrollytelling-container">
    {#if showViz && dots.length > 0}
        <div class="fullscreen-viz">
            <PackedCircleChart 
                {dots} 
                width={windowWidth || 800}
                height={windowHeight || 600}
                className=""
                {highlightFatalities}
                {highlightNumberRange}
                {allCriteriaTrue}
                {onePoint}
                {activeSectionId}
                interactive={explorationMode}
            />
        </div>
    {/if}
    
    <!-- DEV mode skip button -->
    {#if $devMode && !explorationMode}
    <div class="dev-mode-controls">
        <button 
            class="dev-mode-btn"
            on:click={enterExplorationMode}
        >
            Skip to explore (dev mode)
        </button>
    </div>
    {/if}
    
    <div class="sections-container" class:hidden={explorationMode}>
        <slot></slot>
    </div>
    
    {#if explorationMode}
    <div class="exploration-controls">
        <button 
            class="exit-exploration-btn"
            on:click={exitExplorationMode}
        >
            Back to Story
        </button>
    </div>
    {/if}
    
    <!-- Down arrow navigation button - hide if in explore mode OR if it's the last section -->
    {#if !explorationMode && !isLastSection}
    <button 
        class="down-arrow-btn"
        on:click={scrollToNextSection}
        aria-label="Scroll to next section"
    >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </button>
    {/if}
</div>

<style>
    .scrollytelling-container {
        position: relative;
    }
    
    .sections-container {
        position: relative;
        z-index: 10;
        transition: opacity 0.3s ease;
    }
    
    .hidden {
        opacity: 0;
        pointer-events: none;
    }
    
    .exploration-controls {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
    }
    
    .exit-exploration-btn {
        background-color: #333;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
    }
    
    .exit-exploration-btn:hover {
        background-color: #555;
    }
    
    @media (max-width: 768px) {
        .exploration-controls {
            bottom: 2rem; 
        }
        
        .exit-exploration-btn {
            padding: 0.5rem 1.25rem;
            font-size: 0.9rem;
        }
    }
    
    .down-arrow-btn {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
        background-color: white;
        color: #333;
        border: 2px solid #333;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
    }
    
    .down-arrow-btn:hover {
        background-color: #333;
        color: white;
        transform: translateX(-50%) translateY(-4px);
    }
    
    .down-arrow-btn:active {
        transform: translateX(-50%) translateY(0);
    }
    
    .dev-mode-controls {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 30;
    }
    
    .dev-mode-btn {
        background-color: #ff3e00;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
    }
    
    .dev-mode-btn:hover {
        background-color: #ff5722;
    }
</style> 