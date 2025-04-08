<script lang="ts">
    export let headline: string = "";
    export let source: string = "";
    
    // Define highlighted terms and their explanations
    export let highlightedTerms: {
        term: string;
        explanation: string;
    }[] = [];
    
    let activeTooltip: string | null = null;
    let tooltipX: number = 0;
    let tooltipY: number = 0;
    
    function showTooltip(term: string, event: MouseEvent) {
        const target = event.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        
        // Position tooltip above the word
        tooltipX = rect.left + (rect.width / 2);
        tooltipY = rect.top;
        
        activeTooltip = term;
    }
    
    function hideTooltip() {
        activeTooltip = null;
    }
    
    // Function to create the HTML with spans for highlighted words
    function createHighlightedHeadline() {
        let result = headline;
        
        // Sort by length descending to prevent replacement issues
        const sortedTerms = [...highlightedTerms].sort((a, b) => 
            b.term.length - a.term.length
        );
        
        for (const item of sortedTerms) {
            const termRegex = new RegExp(`\\b${item.term}\\b`, 'g');
            const replacement = `<span class="highlighted-term" data-term="${item.term}">${item.term}</span>`;
            result = result.replace(termRegex, replacement);
        }
        
        return result;
    }
    
    function handleMouseOver(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('highlighted-term')) {
            const term = target.getAttribute('data-term');
            if (term) showTooltip(term, event);
        }
    }
    
    function handleMouseOut() {
        hideTooltip();
    }
</script>

<div class="headline-container" on:mouseover={handleMouseOver} on:mouseout={handleMouseOut}>
    <div class="headline-card">
        <p class="headline-text">
            {@html createHighlightedHeadline()}
        </p>
        <p class="source-text">{source}</p>
    </div>
    
    {#if activeTooltip}
        {#each highlightedTerms as item}
            {#if item.term === activeTooltip}
                <div class="tooltip" style="left: {tooltipX}px; top: {tooltipY}px;">
                    <div class="tooltip-content">
                        <p>{item.explanation}</p>
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
</div>

<style>
    .headline-container {
        position: relative;
        width: 100%;
        margin: 2rem 0;
    }
    
    .headline-card {
        padding: 1.5rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        background-color: white;
    }
    
    .headline-text {
        font-size: 1.25rem;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .source-text {
        font-size: 0.9rem;
        color: #666;
    }
    
    :global(.highlighted-term) {
        color: #D32F2F;
        text-decoration: underline;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    :global(.highlighted-term:hover) {
        background-color: rgba(211, 47, 47, 0.1);
    }
    
    .tooltip {
        position: fixed;
        transform: translate(-50%, -100%);
        z-index: 10;
        max-width: 300px;
        margin-top: -10px;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.15));
    }
    
    .tooltip-content {
        background-color: white;
        border: 1px solid #ddd;
        color: #333;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        position: relative;
    }
    
    .tooltip-content:after {
        content: "";
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 8px 8px 0;
        border-style: solid;
        border-color: white transparent transparent;
    }
    
    .tooltip p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }
</style> 