<script lang="ts">
    import { onMount } from 'svelte';
    import ScrollytellingContainer from '$lib/components/ScrollytellingContainer.svelte';
    import ScrollSection from '$lib/components/sections/StorySection.svelte';
    import QuoteBlock from '$lib/components/ui/QuoteBlock.svelte';
    import HeadlineComparison from '$lib/components/ui/HeadlineComparison.svelte';
    import VisualizationSection from '$lib/components/sections/VisualizationSection.svelte';
    import StoryProgress from '$lib/components/ui/ProgressDots.svelte';
    
    let scrollContainer: ScrollytellingContainer;
    let activeSection = "intro";
    let sectionToScrollTo: string | null = null;
    
    // Define sections for the navigation
    const sections = [
        { id: "intro", label: "Introduction" },
        { id: "headline-woman", label: "Headline 1" },
        { id: "headline-speeder", label: "Headline 2" },
        { id: "headline-comparison", label: "Comparison" },
        { id: "analysis", label: "Analysis" },
        { id: "viz-three-criteria", label: "Three Criteria" },
        { id: "viz-three-criteria-p2", label: "Three Criteria (p2)" },
        { id: "viz-one-point", label: "One Point" },
        { id: "viz-one-point-p2", label: "One Point (p2)" },

        { id: "explore", label: "Explore" }
    ];
    
    // Update active section based on scroll
    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activeSection = entry.target.id;
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });
        
        return () => observer.disconnect();
    });
    
    function handleSectionNav(sectionId: string) {
        sectionToScrollTo = sectionId;
        
        // Use the ScrollytellingContainer's scroll method for more reliable scrolling
        if (scrollContainer) {
            scrollContainer.scrollToSection(sectionId);
        }
        
        setTimeout(() => {
            sectionToScrollTo = null;
        }, 100);
    }
</script>

<ScrollytellingContainer bind:this={scrollContainer}>
    <!-- Story progress navigation -->
    <StoryProgress 
        {sections} 
        {activeSection} 
        showLabels={false}
        position="right"
        orientation="vertical"
        className="hidden sm:block" 
        onSectionClick={handleSectionNav}
    />
    
    <!-- Mobile version: horizontal dots at top -->
    <StoryProgress 
        {sections} 
        {activeSection} 
        showLabels={false}
        position="top"
        orientation="horizontal"
        className="block sm:hidden"
        onSectionClick={handleSectionNav}
    />

    <!-- Introduction section -->
    <ScrollSection 
        id="intro" 
        background="white" 
        fullHeight={true}
        scrollToMe={sectionToScrollTo === "intro"}
    >
        <QuoteBlock 
            text="Accident happens somewhere, nobody cares" 
            size="large"
        />
        
        <div class="mt-16">
            <h2 class="text-4xl font-bold mb-6">Why we should talk more about traffic crash journalism.</h2>
            <p class="text-xl mb-8">And call them "crashes", not accidents.</p>
        </div>
    </ScrollSection>

    <!-- First headline section -->
    <ScrollSection 
        id="headline-woman" 
        background="white" 
        fullHeight={true}
        scrollToMe={sectionToScrollTo === "headline-woman"}
    >
        <div class="mb-12">
            <h2 class="text-3xl font-bold mb-6">Do traffic crash headlines tell the whole story?</h2>
        </div>
        
        <div class="headline-showcase">
            <div class="headline-card-3d">
                <div class="headline-card-shadow"></div>
                <div class="headline-card w-full md:w-96">
                    <p class="headline-red text-xl font-bold mb-3">"Woman and 2 children killed after car crashes into them at Brooklyn crosswalk"</p>
                    <p class="text-sm">Source: abcnews.go.com</p>
                </div>
            </div>
        </div>
        <div class="mt-12">
            <p class="text-xl mb-6">Let's look at another headline for the same collision...</p>
        </div>
    </ScrollSection>

    <!-- Second headline section -->
    <ScrollSection 
        id="headline-speeder" 
        background="white" 
        fullHeight={true}
        scrollToMe={sectionToScrollTo === "headline-speeder"}
    >
        <div class="headline-card-3d">
            <div class="headline-card-shadow"></div>
            <div class="headline-card w-full md:w-96 mb-8">
                <p class="headline-red text-xl font-bold mb-3">"Slaughter of the Innocents: Recidivist Speeder Kills Three"</p>
                <p class="text-sm">Source: nyc.streetsblog.org</p>
            </div>
        </div>
        
        <div class="text-xl max-w-md mx-auto mt-12">
            <p>A driver with 90 speed limit violations and a suspended license killed 3 pedestrians.</p>
        </div>
    </ScrollSection>
    
    <!-- Headline comparison section -->
    <ScrollSection 
        id="headline-comparison" 
        background="white" 
        fullHeight={true}
        scrollToMe={sectionToScrollTo === "headline-comparison"}
    >
        <HeadlineComparison
            headline1="Woman and 2 children killed after car crashes into them at Brooklyn crosswalk"
            source1="abcnews.go.com"
            headline2="Slaughter of the Innocents: Recidivist Speeder Kills Three"
            source2="nyc.streetsblog.org"
            description="These two headlines are for the same crash."
        />
        
        <div class="mt-12">
            <h3 class="text-2xl font-bold mb-4">Which of these two headlines is "better"? Which is more humane? Which shows the real problem behind traffic crashes?</h3>
            <p class="text-xl mt-6">We believe reporting doesn't reflect the reality of crashes. We analysed 3000 collision articles to investigate how they are reported on.</p>
        </div>
    </ScrollSection>

    <!-- Analysis section -->
    <ScrollSection 
        id="analysis" 
        background="white" 
        fullHeight={true}
        scrollToMe={sectionToScrollTo === "analysis"}
    >
        <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl font-bold mb-6">We analyzed and plotted 10,000 collisions to investigate how crashes are reported</h2>
        </div>
    </ScrollSection>
    
    <!-- Detail visualization 1: three criteria -->
    <VisualizationSection
        id="viz-three-criteria"
        heading="Here are traffic crashes reported with all three good journalism criteria"
        backgroundColor="transparent"
        boxPosition="center"
        boxOpacity={0.9}
        scrollToMe={sectionToScrollTo === "viz-three-criteria"}
    />
    
    <!-- Detail visualization 2: three criteria (p2)-->
    <VisualizationSection
        id="viz-three-criteria-p2"
        heading="Here are crashes reported with all three good journalism criteria (p2)"	
        backgroundColor="transparent"
        boxPosition="center"
        boxOpacity={0.9}
        scrollToMe={sectionToScrollTo === "viz-three-criteria-p2"}
    />
    
    <!-- Detail visualization 3: zooming in on one point)-->
    <VisualizationSection
        id="viz-one-point"
        heading="Zooming in on one point"	
        backgroundColor="transparent"
        boxPosition="center"
        boxOpacity={0.9}
        scrollToMe={sectionToScrollTo === "viz-one-point"}
    />

    <!-- Detail visualization 4: zooming in on one point (p2)-->
    <VisualizationSection
        id="viz-one-point-p2"
        heading="Zooming in on one point (p2)"	
        backgroundColor="transparent"
        boxPosition="center"
        boxOpacity={0.9}
        scrollToMe={sectionToScrollTo === "viz-one-point-p2"}
    />
    

    
    <!-- Exploration mode section -->
    <ScrollSection 
        id="explore" 
        background="white" 
        fullHeight={true}
        scrollToMe={sectionToScrollTo === "explore"}
    >
        <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">Explore the Data Yourself</h2>
            <p class="text-xl mb-10 max-w-2xl mx-auto">
                Now that you've seen how traffic crashes are reported, you can explore the full dataset of 5,000 crashes. 
                Zoom, pan, and click on individual dots to learn more about each incident.
            </p>
            <p class="text-xl italic mb-10 max-w-2xl mx-auto">
                Tip: Try clicking "Humanize" on a dot to see how we would report the crash.
            </p>
            <button 
                class="px-6 py-3 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition-colors"
                on:click={() => scrollContainer?.enterExplorationMode()}
            >
                Explore the Data
            </button>
        </div>
    </ScrollSection>
</ScrollytellingContainer>

<style>
    /* 3D effect for headline cards */
    .headline-showcase {
        position: relative;
        display: flex;
        justify-content: center;
        perspective: 1000px;
    }
    
    .headline-card-3d {
        position: relative;
        transform-style: preserve-3d;
        transform: rotateY(5deg) rotateX(3deg);
        transition: transform 0.5s ease;
    }
    
    .headline-card-3d:hover {
        transform: rotateY(0deg) rotateX(0deg);
    }
    
    .headline-card-shadow {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.1);
        transform: translateZ(-10px) translateX(10px) translateY(10px);
        border: 1px solid rgba(0, 0, 0, 0.2);
    }
</style>
