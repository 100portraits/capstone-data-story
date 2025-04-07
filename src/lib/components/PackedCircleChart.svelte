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
    
    function handleDotClick(event: MouseEvent, dot: Dot) {
        event.stopPropagation();
        selectedDot = dot;
        humanizedData = null;
        isHumanized = false;
        error = null;
        onSelectDot?.(dot);

        // Find the clicked circle's data to get its position
        const circles = d3.select(container).selectAll('circle');
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

    function clearSelection() {
        selectedDot = null;
        humanizedData = null;
        isHumanized = false;
        error = null;
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
            }
        }, 0);
        
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            updateChart();
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });
    
    export function updateChart() {
        if (!svg) return;
        d3.select(svg).selectAll('*').remove();
        renderChart();
    }
    
    function renderChart() {
        if (!svg || !dots.length) return;

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
            .attr('stroke', (d: PackedDot) => d.data === selectedDot ? '#000000' : '#D9D9D9')
            .attr('stroke-width', (d: PackedDot) => d.data === selectedDot ? 1.5 : 0.5)
            .style('cursor', 'pointer')
            .on('click', (event: MouseEvent, d: PackedDot) => handleDotClick(event, d.data))
            .on('mouseenter', (event: MouseEvent, d: PackedDot) => handleMouseEnter(event, d.data))
            .on('mouseleave', handleMouseLeave);

        // Initialize zoom behavior if not already initialized
        if (!zoom) {
            zoom = d3.zoom()
                .scaleExtent([0.5, 5])
                .on('zoom', (event: any) => {
                    containerSelection.attr('transform', event.transform);
                    updateVisibleCounts();
                });
            
            svgSelection.call(zoom as any);
            
            // Center the view initially
            const initialTransform = d3.zoomIdentity
                .translate(width/2, height/2)
                .scale(0.6);
            svgSelection.call(zoom.transform as any, initialTransform);
        }

        updateVisibleCounts();
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
</script>

<div class="relative w-full h-full {className}">
    <!-- Tooltip -->
    {#if hoveredDot}
    <div 
        class="fixed z-50 bg-white/70 border border-black px-3 py-2 max-w-xs pointer-events-none"
        style="left: {hoveredDot.x}px; top: {Math.max(0, hoveredDot.y - 8)}px; transform: translate(-50%, -100%);"
    >
        <p class="text-sm text-black">{hoveredDot.dot.headline}</p>
    </div>
    {/if}

    <!-- Counter -->
    <div class="absolute top-4 right-4 bg-white border border-black rounded-md p-4 shadow-lg">
        <p class="text-sm">Currently visible:</p>
        <p class="font-medium">{visibleCasualties} casualties</p>
    </div>

    <svg 
        bind:this={svg} 
        {width} 
        {height} 
        viewBox="0 0 {width} {height}"
        class="bg-white w-full h-full"
    >
        <g bind:this={container}></g>
    </svg>

    <!-- Legend -->
    {#if !selectedDot}
    <div class="absolute top-4 left-4 bg-white border border-black rounded-md p-4 shadow-lg max-w-xs">
        

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

    <!-- Modal -->
    {#if selectedDot}
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