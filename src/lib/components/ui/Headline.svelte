<script lang="ts">
    export let headline: string;
    export let source: string = "";
    export let className: string = "";
</script>

<div class="headline-container {className}">
    <div class="headline-card">
        <p class="headline-text">"{headline}"</p>
        {#if source}
            <p class="source-text">Source: {source}</p>
        {/if}
    </div>
</div>

<style>
    .headline-container {
        margin: 1.5rem 0;
        display: flex;
        justify-content: center;
    }
    
    .headline-card {
        position: relative;
        padding: 1.5rem;
        border: 1px solid black;
        background-color: white;
        width: max-content;
        max-width: 400px;
    }
    
    /* Create the shadow card using ::before pseudo-element */
    .headline-card::before {
        content: "";
        position: absolute;
        top: -10px;
        left: -10px;
        width: 100%;
        height: 100%;
        background-color: white;
        border: 1px solid black;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        z-index: -1;
    }
    
    .headline-text {
        font-size: 1.25rem;
        font-weight: bold;
        margin-bottom: 0.75rem;
        line-height: 1.4;
        white-space: normal;
    }
    
    .source-text {
        font-size: 0.875rem;
        color: #666;
    }
</style> 