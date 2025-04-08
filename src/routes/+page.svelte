<script lang="ts">
    import { onMount } from 'svelte';
    import ScrollytellingContainer from '$lib/components/ScrollytellingContainer.svelte';
    import ScrollSection from '$lib/components/sections/StorySection.svelte';
    import Headline from '$lib/components/ui/Headline.svelte';
    import VisualizationSection from '$lib/components/sections/VisualizationSection.svelte';
    import StoryProgress from '$lib/components/ui/ProgressDots.svelte';
    import InteractiveHeadline from '$lib/components/ui/InteractiveHeadline.svelte';
    
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
        { id: "viz-three-criteria", label: "Criteria 1" },
        { id: "viz-three-criteria-p2", label: "Criteria 2" },
        { id: "viz-example-headline", label: "Example Headline" },
        { id: "viz-rewritten-example-headline", label: "Rewritten Example Headline" },
        { id: "explore", label: "Explore" }
    ];
    
    // Define the terms with explanations for the interactive headline
    const highlightedTerms = [
        {
            term: "dies",
            explanation: "Dies underplays the brutality and preventability of crashes and muddles responsibility."
        },
        {
            term: "being",
            explanation: "After being struck - passive voice sentences can imply blame on the victim's end."
        },
        {
            term: "car",
            explanation: "Perpetrator is dehumanised, referred to as 'car', as if crashes were some natural occurrence. There was a human in that car!"
        }
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
    <!-- Story progress navigation - desktop version -->
    <StoryProgress 
        {sections} 
        {activeSection} 
        showLabels={false}
        position="top"
        orientation="horizontal"
        className="hidden sm:block" 
        onSectionClick={handleSectionNav}
    />
    
    <!-- Mobile version - same position and style -->
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
        <div class="quote-block text-center">
            <p class="text-4xl">
                "Accident happens somewhere, nobody cares"
            </p>
        </div>
        
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
        
        <Headline 
            headline="Woman and 2 children killed after car crashes into them at Brooklyn crosswalk"
            source="abcnews.go.com"
        />
        
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
        <Headline 
            headline="Slaughter of the Innocents: Recidivist Speeder Kills Three"
            source="nyc.streetsblog.org"
        />
        
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
        <p class="text-center text-xl italic mb-6">These two headlines are for the same crash.</p>
        
        <div class="flex flex-col md:flex-row gap-8 items-start justify-center">
            <div class="md:flex-1 flex justify-center">
                <Headline 
                    headline="Woman and 2 children killed after car crashes into them at Brooklyn crosswalk"
                    source="abcnews.go.com"
                />
            </div>
            
            <div class="md:flex-1 flex justify-center">
                <Headline 
                    headline="Slaughter of the Innocents: Recidivist Speeder Kills Three"
                    source="nyc.streetsblog.org"
                />
            </div>
        </div>
        
        <div class="">
            <h3 class="text-2xl font-bold mb-4">Which of these two headlines is "better"? Which is more humane? Which shows the real problem behind traffic crashes?</h3>
            <p class="text-xl mt-6">We believe reporting doesn't reflect the reality of crashes. We analysed <strike>1000</strike> 500 collision articles to investigate how they are reported on.</p>
        </div>
    </ScrollSection>

    <!-- Analysis section -->
    <VisualizationSection 
        id="analysis" 
        heading="We analyzed and plotted <strike>10,000</strike> 500 collisions to investigate how crashes are reported"
        backgroundColor="transparent"
        boxPosition="center"
        scrollToMe={sectionToScrollTo === "analysis"}
    >
        
    </VisualizationSection>
    
    <!-- Detail visualization 1: three criteria -->
    <VisualizationSection
        id="viz-three-criteria"
        heading="Our analysis found that <strong>only 5% of traffic crash reports</strong> use humanized language that acknowledges the people involved."
        backgroundColor="transparent"
        boxPosition="center"
        scrollToMe={sectionToScrollTo === "viz-three-criteria"}
    />
    
    <!-- Detail visualization 2: Three criteria explanation -->
    <VisualizationSection
        id="viz-three-criteria-p2"
        heading="We evaluated reports against three key criteria:
        <ol class='criteria-list'>
            <li class='criteria-item'><span class='criteria-number'>1.</span><span class='criteria-title'>Mentions all parties:</span><br>Does the headline mention all parties involved in the crash?</li>
            <li class='criteria-item'><span class='criteria-number'>2.</span><span class='criteria-title'>Uses human terms:</span><br>Are the parties referred to as humans, not objects or transportation modes?</li>
            <li class='criteria-item'><span class='criteria-number'>3.</span><span class='criteria-title'>Active Voice:</span><br>Does the headline describe the crash using active voice?</li>
        </ol>"
        backgroundColor="transparent"
        boxPosition="center"
        scrollToMe={sectionToScrollTo === "viz-three-criteria-p2"}
    />
    
    <!-- Example headline with interactive elements -->
    <VisualizationSection
        id="viz-example-headline"
        heading="Consider this headline for example:"
        text="The words highlighted in red are examples of dehumanising wording in article headlines. Click on them and explore why they are problematic."
        backgroundColor="transparent"
        boxPosition="center"
        scrollToMe={sectionToScrollTo === "viz-example-headline"}
    >
        <InteractiveHeadline 
            headline="Pedestrian dies after being struck by a car in Peterhead" 
            source="bbc.com"
            highlightedTerms={[
                {
                    term: "dies",
                    explanation: "Dies underplays the brutality and preventability of crashes and muddles responsibility."
                },
                {
                    term: "being",
                    explanation: "After being struck - passive voice sentences can imply blame on the victim's end."
                },
                {
                    term: "car",
                    explanation: "Perpetrator is dehumanised, referred to as 'car', as if crashes were some natural occurrence. There was a human in that car!"
                }
            ]}
        />
    </VisualizationSection>

    <!-- Rewritten example headline -->
    <VisualizationSection
        id="viz-rewritten-example-headline"
        heading="Let's try to make the headline more humane, using the contents of the articles."
        backgroundColor="transparent"
        boxPosition="center"
        scrollToMe={sectionToScrollTo === "viz-rewritten-example-headline"}
    >
        <Headline 
            headline="Driver kills man, 61, in Peterhead" 
            source="Rewritten from bbc.com"
        />
    </VisualizationSection>
    
    
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
