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
        top: 1rem;
        left: 1rem;
        z-index: 30;
    }
    
    .toggle-btn {
        background-color: #333;
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s;
        opacity: 0.7;
    }
    
    .toggle-btn:hover {
        opacity: 1;
    }
</style> 