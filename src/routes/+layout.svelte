<script lang="ts">
  import Header from '$lib/header/Header.svelte';
  import Footer from '$lib/footer/Footer.svelte';
  import '../app.css';
  import { onMount } from 'svelte';
  import { initAuth } from '$lib/services/auth';

  let authSubscription: { subscription: { unsubscribe: () => void } } | null = null;

  onMount(() => {
    // Initialize authentication
    const initializeAuth = async () => {
      authSubscription = await initAuth();
    };

    initializeAuth();

    // Clean up on component unmount
    return () => {
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  });
</script>

<div class="app">
  <Header />

  <main>
    <slot />
  </main>

  <Footer />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

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
    margin: 0;
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
