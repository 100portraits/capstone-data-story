<script lang="ts">
	import '../app.css';
	import DevModeToggle from '$lib/components/ui/DevModeToggle.svelte';
	
	let { children } = $props();
</script>

<DevModeToggle />
{@render children()}
