<script lang="ts">
    import { devMode } from '$lib/stores/devMode';
    
    function toggleDevMode() {
        devMode.update(current => !current);
    }
</script>

<div class="dev-mode-toggle">
    <button on:click={toggleDevMode} class="toggle-btn">
        {#if $devMode}
            DEV Mode: ON
        {:else}
            DEV Mode: OFF
        {/if}
    </button>
</div>

<style>
    .dev-mode-toggle {
        position: fixed;
        top: 0.5rem;
        left: 0.5rem;
        z-index: 30;
    }
    
    .toggle-btn {
        background-color: #333;
        color: white;
        border: none;
        padding: 0.3rem 0.6rem;
        border-radius: 3px;
        font-size: 0.7rem;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        transition: all 0.2s;
        opacity: 0.5;
    }
    
    .toggle-btn:hover {
        opacity: 1;
    }
</style> 