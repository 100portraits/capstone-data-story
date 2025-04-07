<script lang="ts">
    export let text: string;
    export let source: string = "";
    export let centered: boolean = true;
    export let size: "small" | "medium" | "large" = "large";
</script>

<div class="quote-block {centered ? 'text-center' : 'text-left'}">
    <p class="quote {size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-4xl'}">
        "{text}"
    </p>
    
    {#if source}
        <p class="quote-source text-right">
            {source}
        </p>
    {/if}
</div> 