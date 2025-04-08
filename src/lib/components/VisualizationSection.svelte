<script lang="ts">
    import { onMount } from 'svelte';
    import type { Dot } from '$lib/data';
    
    export let id: string = "";
    export let heading: string = "";
    export let text: string = "";
    export let subtext: string = "";
    export let backgroundColor: string = "transparent";
    export let boxOpacity: number = 0.85;
    export let boxPosition: "center" | "left" | "right" = "center";
    export let scrollToMe: boolean = false;
    
    // This will be used for communicating with the visualization
    export let onSectionEnter: (() => void) | undefined = undefined;
    export let onSectionExit: (() => void) | undefined = undefined;
    
    let sectionElem: HTMLElement;
    
    onMount(() => {
        // For future scroll-based triggers
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                onSectionEnter?.();
            } else {
                onSectionExit?.();
            }
        }, {
            threshold: 0.5
        });
        
        observer.observe(sectionElem);
        
        // Handle scrollToMe
        if (scrollToMe && sectionElem) {
            setTimeout(() => {
                sectionElem.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
        
        return () => {
            observer.disconnect();
        };
    });
</script>

<section 
    {id}
    bind:this={sectionElem}
    class="section relative"
    style="background-color: {backgroundColor}"
>
    <div class="content-box {boxPosition}"
         style="background-color: rgba(255, 255, 255, {boxOpacity})">
        {#if heading}
            <h2 class="text-2xl font-bold mb-4">{heading}</h2>
        {/if}
        
        {#if text}
            <p class="text-lg mb-4">{text}</p>
        {/if}
        
        <slot></slot>
        
        {#if subtext}
            <p class="text-base mt-4 opacity-80">{subtext}</p>
        {/if}
    </div>
</section>

<style>
    .section {
        scroll-snap-align: start;
        scroll-margin-top: 0px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .content-box {
        max-width: 500px;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.1);
        margin: 0 auto;
    }
    
    .left {
        margin-right: auto;
        margin-left: 2rem;
    }
    
    .right {
        margin-left: auto;
        margin-right: 2rem;
    }
</style> 