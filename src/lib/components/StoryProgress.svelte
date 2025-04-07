<script lang="ts">
    export let sections: { id: string; label: string }[] = [];
    export let activeSection: string = "";
    export let showLabels: boolean = false;
    export let orientation: "vertical" | "horizontal" = "vertical";
    export let position: "left" | "right" | "top" | "bottom" = "right";
    export let onSectionClick: ((sectionId: string) => void) | undefined = undefined;
    export let className: string = "";
    
    function handleSectionClick(sectionId: string) {
        if (onSectionClick) {
            onSectionClick(sectionId);
        } else {
            // Default behavior if no custom handler is provided
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }
</script>

<div class="story-progress {position} {orientation} {className}">
    <nav class="progress-nav">
        <ul>
            {#each sections as section}
                <li 
                    class="progress-item {activeSection === section.id ? 'active' : ''}"
                    on:click={() => handleSectionClick(section.id)}
                >
                    <div class="progress-dot"></div>
                    {#if showLabels}
                        <span class="progress-label">{section.label}</span>
                    {/if}
                </li>
            {/each}
        </ul>
    </nav>
</div>

<style>
    .story-progress {
        position: fixed;
        z-index: 100;
    }
    
    .progress-nav {
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 20px;
        padding: 12px 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .right {
        right: 2rem;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .left {
        left: 2rem;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .top {
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 500px;
    }
    
    .bottom {
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
    }
    
    .vertical ul {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .horizontal ul {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 1rem;
        width: 100%;
    }
    
    .horizontal .progress-nav {
        width: 100%;
        padding: 8px 4px;
    }
    
    .progress-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 4px;
    }
    
    .horizontal .progress-item {
        flex-direction: column;
    }
    
    .progress-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #b0b0b0;
        transition: all 0.2s ease;
    }
    
    .progress-item.active .progress-dot {
        background-color: #000000;
        transform: scale(1.2);
    }
    
    .progress-label {
        margin-left: 0.5rem;
        opacity: 0.7;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }
    
    .progress-item.active .progress-label {
        opacity: 1;
        font-weight: bold;
    }
    
    .horizontal .progress-label {
        margin-left: 0;
        margin-top: 0.5rem;
        text-align: center;
        font-size: 0.65rem;
    }
    
    .horizontal.top .progress-nav {
        border-radius: 16px;
        background-color: rgba(255, 255, 255, 0.85);
    }
    
    .horizontal.top .progress-dot {
        width: 10px;
        height: 10px;
    }
    
    @media (max-width: 640px) {
        .top {
            top: 0.5rem;
        }
        
        .horizontal ul {
            gap: 0.5rem;
        }
        
        .horizontal .progress-nav {
            padding: 6px 3px;
        }
    }
</style> 