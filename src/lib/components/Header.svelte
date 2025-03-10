<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/services/auth';
  import { signInWithGithub, signOut } from '$lib/services/auth';
  import { onMount } from 'svelte';

  // Add a loading state to prevent button flash
  let authLoading = true;

  // Use a flag to ensure we've fully mounted before showing anything
  let isMounted = false;

  onMount(() => {
    // Mark component as mounted
    isMounted = true;

    // Set up a subscription to the user store
    const unsubscribe = user.subscribe((value) => {
      // Only set authLoading to false if we're mounted
      if (isMounted) {
        // Small delay to ensure DOM is ready
        authLoading = false;
      }
    });

    // Clean up subscription on component unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  });

  async function handleLogin() {
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<header class="sticky top-0 z-50 bg-[var(--color-secondary)] shadow-sm py-3">
  <div class="max-w-7xl mx-auto px-6 md:px-4 sm:px-3 flex justify-between items-center">
    <div class="flex items-center">
      <a
        href="/"
        aria-label="Home"
        class="flex items-center gap-2 text-[var(--color-heading)] font-bold text-xl no-underline"
      >
        <img src="/favicon.png" alt="AlgoHub Logo" class="w-6 h-6 object-contain" />
        <span>AlgoHub</span>
      </a>
    </div>

    <nav class="flex items-center gap-6 md:gap-4 sm:gap-3">
      <ul class="flex list-none m-0 p-0 gap-6 md:gap-4 sm:gap-3">
        <li
          class="relative {$page.url.pathname === '/'
            ? "after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-accent)] after:rounded-sm"
            : ''}"
        >
          <a
            href="/"
            class="text-[var(--color-heading)] font-semibold no-underline transition-colors duration-200 hover:text-[var(--color-accent)] text-base py-2 block"
            >Problems</a
          >
        </li>
        <li
          class="relative {$page.url.pathname === '/about'
            ? "after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[var(--color-accent)] after:rounded-sm"
            : ''}"
        >
          <a
            href="/about"
            class="text-[var(--color-heading)] font-semibold no-underline transition-colors duration-200 hover:text-[var(--color-accent)] text-base py-2 block"
            >About</a
          >
        </li>
      </ul>
      <div
        class="flex items-center min-w-[70px] justify-end opacity-100 transition-opacity duration-200 {authLoading
          ? 'opacity-0 invisible'
          : ''}"
      >
        {#if $user}
          <button
            class="border border-[var(--color-border)] bg-transparent text-[var(--color-text)] rounded px-3 py-1.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[color-mix(in_oklab,black_5%,transparent)]"
            on:click={handleLogout}
          >
            Logout
          </button>
        {:else}
          <button
            class="bg-[#4285f4] text-white border border-[#4285f4] rounded px-3 py-1.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[#3367d6] hover:border-[#3367d6] shadow-sm hover:shadow"
            on:click={handleLogin}
            title="Login with GitHub"
          >
            <span>Sign in</span>
          </button>
        {/if}
      </div>
    </nav>
  </div>
</header>
