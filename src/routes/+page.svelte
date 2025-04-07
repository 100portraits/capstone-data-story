<script lang="ts">
    import { onMount } from 'svelte';
    import PackedCircleChart from '$lib/components/PackedCircleChart.svelte';
    import { generateDots, type Dot } from '$lib/data';
    
    let dots: Dot[] = [];
    let selectedDot: Dot | null = null;
    let isModalOpen = false;
    let windowWidth: number;
    let windowHeight: number;
    
    onMount(() => {
        // Get window dimensions
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        
        // Generate 100 random dots
        dots = generateDots(5000);
        console.log('Generated dots:', dots);
        
        // Update dimensions on resize
        const handleResize = () =>{
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    function handleSelectDot(dot: Dot) {
        selectedDot = dot;
        isModalOpen = true;
    }
    
    function handleCloseModal() {
        isModalOpen = false;
    }

    function handleHumanized(result: any) {
        console.log('Humanized:', result);
    }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div class="fixed inset-0 overflow-hidden">
    <PackedCircleChart 
        {dots} 
        width={windowWidth || 800}
        height={windowHeight || 600}
        onSelectDot={handleSelectDot}
        onHumanized={handleHumanized}
        className="fixed inset-0"
    />
</div>
