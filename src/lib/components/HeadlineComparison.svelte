<script lang="ts">
    export let headline1: string;
    export let headline2: string;
    export let source1: string;
    export let source2: string;
    export let description: string = "These two headlines are for the same crash.";
</script>

<div class="headline-comparison">
    <p class="text-center text-xl italic mb-6">{description}</p>
    
    <div class="flex flex-col md:flex-row gap-8 justify-center">
        <div class="headline-card-3d">
            <div class="headline-card-shadow"></div>
            <div class="headline-card w-full md:w-80">
                <p class="headline-red text-xl font-bold mb-3">"{headline1}"</p>
                <p class="text-sm">Source: {source1}</p>
            </div>
        </div>
        
        <div class="headline-card-3d">
            <div class="headline-card-shadow"></div>
            <div class="headline-card w-full md:w-80">
                <p class="headline-red text-xl font-bold mb-3">"{headline2}"</p>
                <p class="text-sm">Source: {source2}</p>
            </div>
        </div>
    </div>
</div>

<style>
    .headline-comparison {
        max-width: 90%;
        margin: 0 auto;
    }
    
    /* 3D effect for headline cards */
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