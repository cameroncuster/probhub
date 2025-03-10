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

<div class="flex min-h-screen flex-col">
  <Header />

  <main class="relative mx-auto box-border flex w-full flex-1 flex-col overflow-x-hidden pt-1">
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
  padding: 0;
}

:global(.container) {
  width: 100%;
  box-sizing: border-box;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Ensure content is centered properly */
main {
  position: relative;
  padding-left: 0;
  padding-right: 0;
}

@media (min-width: 768px) {
  main {
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  :global(.container) {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

/* Ensure consistent max-width across components */
:global(.max-w-\[1200px\]) {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0;
}

/* Ensure header and footer are at the ends */
:global(header),
:global(footer) {
  width: 100%;
}
</style>
