<script lang="ts">
	import '../app.css';
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/footer/Footer.svelte';
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="flex-grow">
		<slot />
	</main>
	<Footer />
</div>
