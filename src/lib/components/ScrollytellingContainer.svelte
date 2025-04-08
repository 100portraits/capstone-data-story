<script lang="ts">
    import { onMount } from 'svelte';
    import PackedCircleChart from './PackedCircleChart.svelte';
    import { generateDots, type Dot } from '$lib/types/data';
    
    export let showViz: boolean = true;
    export let initViz: boolean = true;
    
    let dots: Dot[] = [];
    let windowWidth: number;
    let windowHeight: number;
    let visibleSectionIndex = 0;
    let currentSectionId: string = '';
    let sections: HTMLElement[] = [];
    
    // Visualization state that will be passed to PackedCircleChart
    let highlightFatalities: boolean | null = null;
    let highlightNumberRange: {min: number, max: number} | null = null;
    let activeSectionId: string = '';
    let explorationMode: boolean = false;
    
    onMount(() => {
        if (initViz) {
            // Generate dots for visualization
            dots = generateDots(500);
            console.log(`Generated ${dots.length} dots for visualization`);
        }
        
        // Collect all sections for navigation
        sections = Array.from(document.querySelectorAll('.section'));
        
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
                        if (sectionId === "viz-injuries") {
                            highlightDots({ fatalities: false, numberRange: null });
                        } else if (sectionId === "viz-deaths") {
                            highlightDots({ fatalities: true, numberRange: null });
                        } else if (sectionId === "viz-small") {
                            highlightDots({ 
                                numberRange: { min: 1, max: 1 },
                                fatalities: null
                            });
                        } else if (sectionId === "viz-medium") {
                            highlightDots({ 
                                numberRange: { min: 2, max: 5 },
                                fatalities: null
                            });
                        } else if (sectionId === "viz-large") {
                            highlightDots({ 
                                numberRange: { min: 6, max: 100 },
                                fatalities: null
                            });
                        }
                    }
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
        
        return () => {
            observer.disconnect();
        };
    });
    
    function resetFilters() {
        // Reset all filters
        highlightFatalities = null;
        highlightNumberRange = null;
        console.log('Filters reset');
    }
    
    export function highlightDots(params: {
        fatalities?: boolean | null;
        numberRange?: {min: number, max: number} | null;
    }) {
        // Update visualization state
        if (params.fatalities !== undefined) {
            highlightFatalities = params.fatalities;
        }
        
        if (params.numberRange !== undefined) {
            highlightNumberRange = params.numberRange;
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
        
        // Find current section index
        const currentIndex = sections.findIndex(section => section.id === currentSectionId);
        
        // If found and not the last section, scroll to the next one
        if (currentIndex !== -1 && currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            scrollToSection(nextSection.id);
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
                {activeSectionId}
                interactive={explorationMode}
            />
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
    
    <!-- Down arrow navigation button -->
    {#if !explorationMode}
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
</style> 