<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
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

<div class="flex flex-col min-h-screen">
  <Header />

  <main class="flex-1 flex flex-col w-full mx-auto box-border overflow-x-hidden">
    <slot />
  </main>

  <Footer />
</div>

<style>
  /* Global styles that can't be handled with Tailwind directly */
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
