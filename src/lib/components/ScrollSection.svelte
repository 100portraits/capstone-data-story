<script lang="ts">
    import { onMount } from 'svelte';

    export let id: string;
    export let background: string = "white";
    export let textColor: string = "black";
    export let fullHeight: boolean = true;
    export let center: boolean = true;
    export let padding: string = "2rem";
    export let className: string = "";
    export let scrollToMe: boolean = false;
    
    // This can be used for scroll-based animations or triggering events
    let sectionElement: HTMLElement | undefined = undefined;
    let isInView: boolean = false;
    
    // Make them properly optional
    export { sectionElement, isInView };
    
    onMount(() => {
        if (scrollToMe && sectionElement) {
            // Smoothly scroll to this section when mounted
            setTimeout(() => {
                if (sectionElement) {
                    sectionElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
        }
        
        // Set up intersection observer to detect when section is in view
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            isInView = entry.isIntersecting;
        }, {
            threshold: 0.3,
            rootMargin: '-10% 0px' // Trigger a bit before the section enters the viewport
        });
        
        if (sectionElement) {
            observer.observe(sectionElement);
        }
        
        return () => {
            if (sectionElement) {
                observer.unobserve(sectionElement);
            }
        };
    });
</script>

<section
    {id}
    bind:this={sectionElement}
    class="section {className}"
    style="background-color: {background}; color: {textColor}; padding: {padding}; 
           min-height: {fullHeight ? '100vh' : 'auto'}; 
           justify-content: {center ? 'center' : 'flex-start'};"
>
    <div class="section-content">
        <slot></slot>
    </div>
</section>

<style>
    .section {
        scroll-snap-align: start;
        scroll-margin-top: 0px;
    }
</style> 