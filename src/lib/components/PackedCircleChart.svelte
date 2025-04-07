<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import type { Dot } from '$lib/data';
    
    interface PackedDot extends Dot {
        value: number;
        r: number;
        x: number;
        y: number;
        data: Dot;
    }
    
    export let dots: Dot[] = [];
    export let width = window.innerWidth;
    export let height = window.innerHeight;
    export let className = "";
    export let onSelectDot: ((dot: Dot) => void) | undefined = undefined;
    export let onHumanized: ((result: any) => void) | undefined = undefined;
    
    // New highlighting props
    export let highlightFatalities: boolean | null = null;
    export let highlightNumberRange: {min: number, max: number} | null = null;
    export let activeSectionId: string = "";
    export let interactive: boolean = false;
    
    let svg: SVGSVGElement;
    let container: SVGGElement;
    let selectedDot: Dot | null = null;
    let humanizedData: { humanizedHeadline: string; humanizedCriteria: Record<string, { value: boolean; description: string }> } | null = null;
    let isHumanized = false;
    let isLoading = false;
    let error: string | null = null;
    let zoom: any;
    let visibleCasualties = 0;
    let hoverTimeout: number | null = null;
    let hoveredDot: { dot: Dot, x: number, y: number } | null = null;
    let centerOffsetX = 0;
    let centerOffsetY = 0;
    
    // Statistics for contextual information
    // Using the more conservative estimate of 20 million injuries per year globally
    const ANNUAL_GLOBAL_INJURIES = 20000000;
    const INJURIES_PER_DAY = ANNUAL_GLOBAL_INJURIES / 365;
    const INJURIES_PER_HOUR = INJURIES_PER_DAY / 24;
    const INJURIES_PER_MINUTE = INJURIES_PER_HOUR / 60;
    const INJURIES_PER_SECOND = INJURIES_PER_MINUTE / 60;
    
    // Calculate time interval for the visible casualties
    function getTimeForCasualties(casualties: number): string {
        if (casualties <= 0) return "0 seconds";
        
        const totalSeconds = casualties / INJURIES_PER_SECOND;
        
        if (totalSeconds < 60) {
            return `${Math.round(totalSeconds)} seconds`;
        } else if (totalSeconds < 3600) {
            return `${Math.round(totalSeconds / 60)} minutes`;
        } else if (totalSeconds < 86400) {
            return `${Math.round(totalSeconds / 3600 * 10) / 10} hours`;
        } else {
            return `${Math.round(totalSeconds / 86400 * 10) / 10} days`;
        }
    }
    
    // Watch for interactive mode changes
    $: if (interactive !== undefined && svg) {
        console.log('Interactive mode:', interactive);
        updateInteractiveMode();
    }
    
    function updateInteractiveMode() {
        const svgSelection = d3.select(svg);
        
        if (interactive) {
            // Enable all interactive features
            // Re-enable zoom
            if (zoom) {
                svgSelection.call(zoom as any);
            }
            
            // Make dots clickable and update their appearance for exploration mode
            d3.select(container).selectAll('circle')
                .style('cursor', 'pointer')
                .on('click', (event: MouseEvent, d: PackedDot) => handleDotClick(event, d.data))
                .on('mouseenter', (event: MouseEvent, d: PackedDot) => handleMouseEnter(event, d.data))
                .on('mouseleave', handleMouseLeave)
                .attr('stroke', '#a8a8a8') // Consistent stroke color in exploration mode
                .attr('stroke-width', 0.5);
                
            // Show the counter in interactive mode
            d3.select('.counter-container').style('display', 'block');
            
            // Reset view button is now controlled by the toggleResetViewButton function
            toggleResetViewButton();
            
            // Reset to a centered, zoomed-out view
            resetView();
        } else {
            // Disable interactions in story mode
            // Remove zoom behavior
            if (zoom) {
                svgSelection.on('.zoom', null);
            }
            
            // Make dots non-clickable in story mode
            d3.select(container).selectAll('circle')
                .style('cursor', 'default')
                .on('click', null)
                .on('mouseenter', null)
                .on('mouseleave', null);
                
            // Hide the counter and reset view button in story mode
            d3.select('.counter-container').style('display', 'none');
            d3.select('.reset-view-btn').style('display', 'none');
            
            // Clear any selected dot
            selectedDot = null;
        }
    }
    
    // Watch for changes to selectedDot to update UI and highlighting
    $: if (interactive && selectedDot !== undefined) {
        toggleResetViewButton();
        updateDotSelection();
    }
    
    function toggleResetViewButton() {
        // Only show reset view button when in interactive mode AND no dot is selected
        const resetBtn = d3.select('.reset-view-btn');
        resetBtn.style('display', interactive && !selectedDot ? 'block' : 'none');
    }
    
    function updateDotSelection() {
        if (!svg || !container) return;
        
        // Update all circles based on selection state
        d3.select(container).selectAll('circle')
            .attr('stroke', (d: PackedDot) => {
                // If this is the selected dot, give it a dark gray outline
                if (d.data === selectedDot) {
                    return '#333333'; // Dark gray outline for selected dot
                } 
                else {
                    return '#a8a8a8';
                }
            })
            .attr('stroke-width', (d: PackedDot) => d.data === selectedDot ? 2.5 : 0.5);
    }
    
    // Helper function to check if a dot matches the current filters
    function matches(d: PackedDot): boolean {
        let result = true;
        
        if (highlightFatalities !== null) {
            result = result && (d.data.fatalities === highlightFatalities);
        }
        
        if (highlightNumberRange !== null) {
            result = result && (
                d.data.numberInvolved >= highlightNumberRange.min && 
                d.data.numberInvolved <= highlightNumberRange.max
            );
        }
        
        return result;
    }
    
    function clearSelection() {
        selectedDot = null;
        humanizedData = null;
        isHumanized = false;
        error = null;
        
        // Show reset view button now that no dot is selected
        toggleResetViewButton();
    }

    function handleDotClick(event: MouseEvent, dot: Dot) {
        event.stopPropagation();
        selectedDot = dot;
        humanizedData = null;
        isHumanized = false;
        error = null;
        onSelectDot?.(dot);

        // Directly update just the clicked dot's style immediately
        // This ensures only this dot gets the special treatment
        const circles = d3.select(container).selectAll('circle');
        circles.filter((d: PackedDot) => d.data === dot)
            .attr('stroke', '#333333')
            .attr('stroke-width', 2.5);

        // Find the clicked circle's data to get its position
        const clickedCircle = circles.filter((d: PackedDot) => d.data === dot);
        const circleData = clickedCircle.datum() as PackedDot;

        // Calculate zoom scale based on dot size
        let scale = 1;
        if (dot.numberInvolved === 1) {
            scale = 2.5; // Zoom in more for smallest dots
        } else if (dot.numberInvolved >= 2 && dot.numberInvolved <= 5) {
            scale = 1.8; // Medium zoom for medium dots
        } else {
            scale = 1.2; // Less zoom for large dots
        }

        // Create a transform that centers on the clicked dot, accounting for the centerOffset
        const transform = d3.zoomIdentity
            .translate(width/2 - (circleData.x + centerOffsetX) * scale, 
                      height/2 - (circleData.y + centerOffsetY) * scale)
            .scale(scale);

        // Smoothly transition to the new transform
        d3.select(svg)
            .transition()
            .duration(750)
            .call(zoom.transform as any, transform);
    }

    function toggleView() {
        if (!humanizedData) {
            handleHumanize();
        } else {
            isHumanized = !isHumanized;
        }
    }

    async function handleHumanize() {
        if (!selectedDot) return;
        
        isLoading = true;
        error = null;
        
        try {
            const response = await fetch('/api/humanize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedDot)
            });
            
            if (!response.ok) throw new Error('Failed to humanize');
            
            const result = await response.json();
            humanizedData = result;
            isHumanized = true;
            onHumanized?.(result);
        } catch (error) {
            console.error('Failed to humanize:', error);
            error = 'Failed to generate humanized description. Please try again.';
        } finally {
            isLoading = false;
        }
    }

    function handleMouseEnter(event: MouseEvent, dot: Dot) {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        
        hoverTimeout = window.setTimeout(() => {
            const transform = d3.zoomTransform(svg);
            const circle = event.target as SVGCircleElement;
            const rect = circle.getBoundingClientRect();
            
            hoveredDot = {
                dot,
                x: rect.left + rect.width/2,
                y: rect.top
            };
        }, 0);
    }

    function handleMouseLeave() {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
        hoveredDot = null;
    }

    onMount(() => {
        setTimeout(() => {
            if (svg) {
                renderChart();
                
                // Add event listener for reset-zoom
                svg.addEventListener('reset-zoom', () => {
                    resetView();
                });
                
                // Add event listener for zoom-out when entering exploration mode
                svg.addEventListener('zoom-out', () => {
                    zoomOutView();
                });
            }
        }, 0);
        
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            updateChart();
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (svg) {
                svg.removeEventListener('reset-zoom', resetView);
                svg.removeEventListener('zoom-out', zoomOutView);
            }
        };
    });
    
    export function updateChart() {
        if (!svg) return;
        
        // Store current selection and transform if possible
        let currentSelection = selectedDot;
        let currentTransform = null;
        if (svg) {
            currentTransform = d3.zoomTransform(svg);
        }
        
        // Clean up
        d3.select(svg).selectAll('*').remove();
        
        // Render with new dimensions
        renderChart();
        
        // Restore selection and transform if applicable
        selectedDot = currentSelection;
        
        if (currentTransform && zoom) {
            d3.select(svg)
                .call(zoom.transform as any, currentTransform);
        }
        
        // Update visuals based on current state
        if (highlightFatalities !== null || highlightNumberRange !== null) {
            updateHighlighting();
        }
        
        if (selectedDot) {
            updateDotSelection();
        }
    }
    
    function renderChart() {
        if (!svg || !dots || !dots.length) return;

        const svgSelection = d3.select(svg);
        const containerSelection = d3.select(container);
        
        // Clear previous content
        containerSelection.selectAll('*').remove();
        
        // Create hierarchical data structure for pack layout
        const hierarchyData = {
            children: dots.map(d => ({
                ...d,
                value: 1
            }))
        };

        // Create pack layout with viewport size
        const pack = d3.pack()
            .size([width, height])
            .padding(5)
            .radius((d: any) => {
                if (d.data.numberInvolved === 1) return 6;
                if (d.data.numberInvolved >= 2 && d.data.numberInvolved <= 5) return 12;
                return 24;
            });

        const root = d3.hierarchy(hierarchyData)
            .sum((d: any) => d.value);

        const packedData = pack(root);

        // Calculate bounds
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        packedData.leaves().forEach((d: any) => {
            minX = Math.min(minX, d.x - d.r);
            maxX = Math.max(maxX, d.x + d.r);
            minY = Math.min(minY, d.y - d.r);
            maxY = Math.max(maxY, d.y + d.r);
        });

        // Calculate center offset
        centerOffsetX = -(minX + maxX) / 2;
        centerOffsetY = -(minY + maxY) / 2;

        // Create circles with centered coordinates
        containerSelection.selectAll('circle')
            .data(packedData.leaves())
            .enter()
            .append('circle')
            .attr('r', (d: PackedDot) => d.r)
            .attr('cx', (d: PackedDot) => d.x + centerOffsetX)
            .attr('cy', (d: PackedDot) => d.y + centerOffsetY)
            .attr('fill', (d: PackedDot) => d.data.fatalities ? '#FFFFFF' : '#D9D9D9')
            .attr('stroke', (d: PackedDot) => {
                if (interactive) {
                    return d.data === selectedDot ? '#333333' : '#a8a8a8';
                } else {
                    return d.data === selectedDot ? '#000000' : '#D9D9D9';
                }
            })
            .attr('stroke-width', (d: PackedDot) => d.data === selectedDot ? 1.5 : 0.5)
            .style('cursor', interactive ? 'pointer' : 'default');
        
        // Add interactivity if in interactive mode
        if (interactive) {
            containerSelection.selectAll('circle')
                .on('click', (event: MouseEvent, d: PackedDot) => handleDotClick(event, d.data))
                .on('mouseenter', (event: MouseEvent, d: PackedDot) => handleMouseEnter(event, d.data))
                .on('mouseleave', handleMouseLeave);
        }

        // Initialize zoom behavior if not already initialized
        if (!zoom) {
            zoom = d3.zoom()
                .scaleExtent([0.1, 8])
                .on('zoom', (event: any) => {
                    containerSelection.attr('transform', event.transform);
                    updateVisibleCounts();
                });
            
            // Only apply zoom in interactive mode
            if (interactive) {
                svgSelection.call(zoom as any);
            }
            
            // Set initial transform
            const initialTransform = d3.zoomIdentity
                .translate(width/2, height/2)
                .scale(interactive ? 0.6 : 1.5);
            svgSelection.call(zoom.transform as any, initialTransform);
        } else {
            // Re-bind zoom if it already exists
            if (interactive) {
                svgSelection.call(zoom as any);
            }
        }

        updateVisibleCounts();

        // Apply any active highlighting
        if (highlightFatalities !== null || highlightNumberRange !== null) {
            updateHighlighting();
        }
    }

    function updateVisibleCounts() {
        if (!svg) return;
        
        const transform = d3.zoomTransform(svg);
        const circles = d3.select(container).selectAll('circle');
        
        let casualties = 0;

        // Get viewport bounds in data coordinates
        const viewportBounds = {
            x0: (-transform.x) / transform.k,
            y0: (-transform.y) / transform.k,
            x1: (width - transform.x) / transform.k,
            y1: (height - transform.y) / transform.k
        };

        circles.each(function(d: PackedDot) {
            // Check if circle's center plus its radius overlaps with viewport
            const r = d.r;
            const cx = d.x + centerOffsetX;
            const cy = d.y + centerOffsetY;

            if (cx + r > viewportBounds.x0 && 
                cx - r < viewportBounds.x1 && 
                cy + r > viewportBounds.y0 && 
                cy - r < viewportBounds.y1) {
                casualties += d.data.numberInvolved;
            }
        });

        visibleCasualties = casualties;
    }

    $: if (svg && container && (highlightFatalities !== undefined || highlightNumberRange !== undefined)) {
        updateHighlighting();
    }
    
    $: if (activeSectionId && svg && container) {
        console.log(`Active section changed to: ${activeSectionId}`);
        // Reset filters based on which section is active
        if (activeSectionId === "viz-injuries") {
            // Highlight only injuries
            updateHighlighting();
        } else if (activeSectionId === "viz-deaths") {
            // Highlight only deaths
            updateHighlighting();
        } else if (activeSectionId === "viz-small" || activeSectionId === "viz-medium" || activeSectionId === "viz-large") {
            // Highlight by number
            updateHighlighting();
        } else {
            // Reset all highlights for other sections
            resetHighlighting();
        }
    }
    
    function resetHighlighting() {
        if (!svg || !container) return;
        
        const circles = d3.select(container).selectAll('circle');
        
        // Reset all circles to default appearance
        circles
            .transition()
            .duration(750)
            .attr('fill', (d: PackedDot) => d.data.fatalities ? '#FFFFFF' : '#D9D9D9')
            .attr('stroke', (d: PackedDot) => d.data === selectedDot ? '#000000' : '#D9D9D9')
            .attr('stroke-width', (d: PackedDot) => d.data === selectedDot ? 1.5 : 0.5)
            .attr('opacity', 1.0);
    }
    
    function updateHighlighting() {
        if (!svg || !container) return;
        
        const circles = d3.select(container).selectAll('circle');
        
        // Reset all circles to default appearance first
        circles
            .transition()
            .duration(750)
            .attr('fill', (d: PackedDot) => {
                // Check if dot matches current filter conditions
                let matches = true;
                
                // Filter by fatalities if specified
                if (highlightFatalities !== null) {
                    matches = matches && (d.data.fatalities === highlightFatalities);
                }
                
                // Filter by number range if specified
                if (highlightNumberRange !== null) {
                    matches = matches && (
                        d.data.numberInvolved >= highlightNumberRange.min && 
                        d.data.numberInvolved <= highlightNumberRange.max
                    );
                }
                
                // Highlighted dots are colored based on type:
                // - Deaths (fatalities) = red
                // - Other highlights = dark gray
                // - Non-highlighted = very light
                if (matches) {
                    return highlightFatalities === true ? '#D32F2F' : '#555555';
                } else {
                    return '#F2F2F2';
                }
            })
            .attr('stroke', (d: PackedDot) => {
                // Determine stroke color
                if (interactive) {
                    // In exploration mode, use consistent stroke colors
                    return d.data === selectedDot ? '#333333' : '#a8a8a8';
                }
                
                // Otherwise, use highlighting-based stroke colors
                let matches = true;
                
                if (highlightFatalities !== null) {
                    matches = matches && (d.data.fatalities === highlightFatalities);
                }
                
                if (highlightNumberRange !== null) {
                    matches = matches && (
                        d.data.numberInvolved >= highlightNumberRange.min && 
                        d.data.numberInvolved <= highlightNumberRange.max
                    );
                }
                
                // Selected dot = black
                // Deaths = darker red
                // Other highlights = dark gray
                // Non-highlighted = very light
                if (d.data === selectedDot) {
                    return '#000000';
                } else if (matches) {
                    return highlightFatalities === true ? '#B71C1C' : '#333333';
                } else {
                    return '#EBEBEB';
                }
            })
            .attr('stroke-width', (d: PackedDot) => {
                if (interactive) {
                    // In exploration mode, use consistent stroke widths
                    return d.data === selectedDot ? 2.5 : 0.5;
                }
                
                // If dot matches current filter, give it a stronger stroke
                let matches = true;
                
                if (highlightFatalities !== null) {
                    matches = matches && (d.data.fatalities === highlightFatalities);
                }
                
                if (highlightNumberRange !== null) {
                    matches = matches && (
                        d.data.numberInvolved >= highlightNumberRange.min && 
                        d.data.numberInvolved <= highlightNumberRange.max
                    );
                }
                
                return d.data === selectedDot ? 1.5 : (matches ? 1.0 : 0.5);
            })
            .attr('opacity', (d: PackedDot) => {
                // Check if dot matches current filter conditions
                let matches = true;
                
                // Filter by fatalities if specified
                if (highlightFatalities !== null) {
                    matches = matches && (d.data.fatalities === highlightFatalities);
                }
                
                // Filter by number range if specified
                if (highlightNumberRange !== null) {
                    matches = matches && (
                        d.data.numberInvolved >= highlightNumberRange.min && 
                        d.data.numberInvolved <= highlightNumberRange.max
                    );
                }
                
                // Highlighted dots full opacity, others faded
                return matches ? 1.0 : 0.3;
            });
    }

    function resetView() {
        if (!svg || !zoom) return;
        
        // Create a transform that centers the view and sets a consistent zoom level
        const initialTransform = d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(2);
            
        // Apply transform with animation
        d3.select(svg)
            .transition()
            .duration(750)
            .call(zoom.transform as any, initialTransform);
            
        // Clear any selection
        selectedDot = null;
    }
    
    function zoomOutView() {
        if (!svg || !zoom) return;
        
        // Create a transform that zooms out to get a broader view
        const zoomOutTransform = d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(0.6);
            
        // Apply transform with animation
        d3.select(svg)
            .transition()
            .duration(1000) // Slightly longer for the exploration entry animation
            .call(zoom.transform as any, zoomOutTransform);
    }
</script>

<div class="relative w-full h-full {className}">
    <!-- Tooltip -->
    {#if hoveredDot && interactive}
    <div 
        class="fixed z-50 bg-white/70 border border-black px-3 py-2 max-w-xs pointer-events-none"
        style="left: {hoveredDot.x}px; top: {Math.max(0, hoveredDot.y - 8)}px; transform: translate(-50%, -100%);"
    >
        <p class="text-sm text-black">{hoveredDot.dot.headline}</p>
    </div>
    {/if}

    <!-- Counter -->
    <div class="counter-container fixed md:absolute md:top-4 md:right-4 bottom-16 right-0 left-0 mx-auto md:mx-0 md:w-auto w-full max-w-xs bg-white border border-black rounded-md shadow-lg" style="display: none;">
        <div class="counter-content md:p-4 p-2">
            <p class="md:text-sm text-xs mb-1">Currently visible:</p>
            <p class="md:font-medium font-bold md:text-lg text-base mb-1">{visibleCasualties} casualties</p>
            <div class="border-t border-gray-300 pt-1 mt-1">
                <p class="md:text-xs text-2xs text-gray-600">That's how many people will be injured in global road traffic in the next</p>
                <p class="md:font-medium font-medium md:text-sm text-xs text-gray-800">{getTimeForCasualties(visibleCasualties)}</p>
            </div>
        </div>
    </div>
    
    <!-- Reset view button -->
    <button 
        class="reset-view-btn absolute top-4 left-4 bg-white border border-black rounded-md px-4 py-2 shadow-lg z-50"
        style="display: none;"
        on:click={resetView}
    >
        Reset View
    </button>

    <svg 
        bind:this={svg} 
        {width} 
        {height} 
        viewBox="0 0 {width} {height}"
        class="bg-white w-full h-full"
    >
        <g bind:this={container}></g>
    </svg>

    <!-- Legend in interactive mode -->
    {#if interactive && !selectedDot}
    <div class="absolute top-20 left-4 bg-white border border-black rounded-md p-4 shadow-lg max-w-xs">
        <h3 class="font-medium mb-2">Legend</h3>
        <p class="text-sm mb-4">Injuries or deaths reported</p>
        
        <!-- Size indicators -->
        <div class="flex items-center gap-6 mb-6">
            {#each [{label: '1', size: '10px'}, {label: '2-5', size: '20px'}, {label: '5+', size: '40px'}] as {label, size}}
            <div class="flex flex-col items-center">
                <div class="border border-black rounded-full mb-1" style="width: {size}; height: {size}"></div>
                <span class="text-sm">{label}</span>
            </div>
            {/each}
        </div>

        <p class="text-sm mb-2">Crash victims</p>
        <div class="space-y-2">
            {#each [{label: 'Injuries reported', bg: 'bg-white'}, {label: 'Deaths reported', bg: 'bg-[#D9D9D9]'}] as {label, bg}}
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 border border-black rounded-full {bg}"></div>
                <span class="text-sm">{label}</span>
            </div>
            {/each}
        </div>
    </div>
    {/if}

    <!-- Modal for clicked dot in interactive mode -->
    {#if selectedDot && interactive}
    <div class="absolute top-4 left-4 bg-white border border-black rounded-md px-8 py-6 shadow-lg max-w-xs">
        <button 
            on:click={clearSelection}
            class="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-sm"
            aria-label="Close"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
            </svg>
        </button>
        
        <h3 class="text-2xl mb-4">
            {#if isHumanized && humanizedData}
                {humanizedData.humanizedHeadline}
            {:else}
                {selectedDot.headline}
            {/if}
        </h3>
        <p class="text-sm mb-4">
            Casualties: {selectedDot.numberInvolved}
        </p>
        <hr class="border-black mb-4">
        <h4 class="text-lg mb-2">Criteria</h4>
        <div class="space-y-3 mb-4">
            {#if isHumanized && humanizedData}
                {#each Object.entries(humanizedData.humanizedCriteria) as [key, { value, description }]}
                <div class="flex items-center gap-4">
                    <div class="w-8 h-6 {value ? 'bg-red-500' : 'bg-gray-300'}"></div>
                    <span class="text-sm">{description}</span>
                </div>
                {/each}
            {:else}
                {#each Object.entries(selectedDot.criteria) as [key, value]}
                <div class="flex items-center gap-4">
                    <div class="w-8 h-6 {value ? 'bg-red-500' : 'bg-gray-300'}"></div>
                    <span class="text-sm {value ? 'text-black' : 'text-gray-500'}">Condition {key.slice(-1)}</span>
                </div>
                {/each}
            {/if}
        </div>

        {#if error}
            <div class="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                <p class="text-sm">{error}</p>
            </div>
        {/if}

        <button 
            on:click={toggleView}
            class="px-4 py-2 border border-black rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
        >
            {#if isLoading}
                Loading...
            {:else}
                {humanizedData ? (isHumanized ? 'See Original' : 'See Humanized') : 'Humanize'}
            {/if}
        </button>
    </div>
    {/if}
</div> 