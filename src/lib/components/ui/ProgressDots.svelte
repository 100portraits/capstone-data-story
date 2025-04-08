<script lang="ts">
    export let sections: { id: string; label: string }[] = [];
    export let activeSection: string = "";
    export let showLabels: boolean = false;
    export let orientation: "vertical" | "horizontal" = "horizontal";
    export let position: "left" | "right" | "top" | "bottom" = "top";
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
            {#each sections as section, i}
                <li class="progress-item {activeSection === section.id ? 'active' : ''}">
                    <button 
                        class="progress-button"
                        on:click={() => handleSectionClick(section.id)}
                        aria-label="Go to {section.label} section"
                    >
                        <div class="progress-bar {i === 0 ? 'first' : ''} {i === sections.length - 1 ? 'last' : ''}"></div>
                        {#if showLabels}
                            <span class="progress-label">{section.label}</span>
                        {/if}
                    </button>
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
        border-radius: 20px;
        padding: 12px 8px;
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
        justify-content: space-between;
        gap: 0.25rem;
        width: 100%;
    }
    
    .horizontal .progress-nav {
        width: 100%;
        padding: 8px 12px;
    }
    
    .progress-item {
        margin: 0;
        padding: 0;
        flex-grow: 1;
    }
    
    .progress-button {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        padding: 2px;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s ease;
    }
    
    .horizontal .progress-button {
        flex-direction: column;
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: #b0b0b0;
        transition: all 0.2s ease;
    }

    .progress-bar.first {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }

    .progress-bar.last {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    
    .progress-item.active .progress-bar {
        background-color: hsl(0, 100%, 70%);
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
        background-color: rgba(255, 255, 255, 0.85);
    }
    
    @media (max-width: 640px) {
        .top {
            top: 0.5rem;
        }
        
        .horizontal ul {
            gap: 0.25rem;
        }
        
        .horizontal .progress-nav {
            padding: 6px 8px;
        }
    }
</style> 