<script>
  import Header from '$lib/header/Header.svelte';
  import { webVitals } from '$lib/vitals';
  import { browser } from '$app/env';
  import { page } from '$app/stores';
  import '../app.css';

  let analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;

  $: if (browser && analyticsId) {
    webVitals({
      path: $page.url.pathname,
      params: $page.params,
      analyticsId
    });
  }
</script>

<Header />

<main>
  <slot />
</main>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    overflow-x: hidden; /* Prevent horizontal scrolling */
  }

  :global(body) {
    overflow-x: hidden;
    max-width: 100vw;
  }

  :global(.container) {
    width: 100%;
    box-sizing: border-box;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (max-width: 768px) {
    :global(.container) {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
  }
</style>
