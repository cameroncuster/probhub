<script lang="ts">
import { page } from '$app/stores';
import { user } from '$lib/services/auth';
import { signInWithGithub, signOut, isAdmin } from '$lib/services/auth';
import { onMount } from 'svelte';

// Add a loading state to prevent button flash
let authLoading = true;

// Use a flag to ensure we've fully mounted before showing anything
let isMounted = false;

// Mobile menu state
let mobileMenuOpen = false;

// Track admin status
let isUserAdmin = false;

onMount(() => {
  // Mark component as mounted
  isMounted = true;

  // Set up a subscription to the user store
  const unsubscribe = user.subscribe(async (value) => {
    // Only set authLoading to false if we're mounted
    if (isMounted) {
      // Small delay to ensure DOM is ready
      authLoading = false;

      // Check if the user is an admin
      if (value) {
        isUserAdmin = await isAdmin(value.id);
      } else {
        isUserAdmin = false;
      }
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
    mobileMenuOpen = false;
  } catch (error) {
    console.error('Login error:', error);
  }
}

async function handleLogout() {
  try {
    await signOut();
    mobileMenuOpen = false;
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
}

// Close mobile menu when navigating to a new page
$: if ($page) {
  mobileMenuOpen = false;
}
</script>

<header class="sticky top-0 z-50 w-full bg-[var(--color-secondary)] py-3 shadow-sm">
  <div class="mx-auto flex max-w-[1200px] items-center justify-between px-3 sm:px-4 md:px-6">
    <div class="flex items-center">
      <a
        href="/"
        aria-label="Home"
        class="flex items-center gap-2 text-xl font-bold text-[var(--color-heading)] no-underline"
      >
        <img src="/favicon.png" alt="AlgoHub Logo" class="h-6 w-6 object-contain" />
        <span>AlgoHub</span>
      </a>
    </div>

    <!-- Mobile menu button -->
    <button
      class="flex items-center rounded-md border border-[var(--color-border)] px-2 py-1 text-[var(--color-text)] md:hidden"
      aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      on:click={toggleMobileMenu}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {#if mobileMenuOpen}
          <path d="M18 6L6 18M6 6l12 12"></path>
        {:else}
          <path d="M3 12h18M3 6h18M3 18h18"></path>
        {/if}
      </svg>
    </button>

    <!-- Desktop navigation -->
    <nav class="hidden items-center gap-6 md:flex md:gap-4">
      <ul class="m-0 flex list-none gap-6 p-0 md:gap-4">
        <li
          class="relative {$page.url.pathname === '/'
            ? "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-sm after:bg-[var(--color-accent)] after:content-['']"
            : ''}"
        >
          <a
            href="/"
            class="block py-2 text-base font-semibold text-[var(--color-heading)] no-underline transition-colors duration-200 hover:text-[var(--color-accent)]"
            >Problems</a
          >
        </li>
        <li
          class="relative {$page.url.pathname === '/about'
            ? "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-sm after:bg-[var(--color-accent)] after:content-['']"
            : ''}"
        >
          <a
            href="/about"
            class="block py-2 text-base font-semibold text-[var(--color-heading)] no-underline transition-colors duration-200 hover:text-[var(--color-accent)]"
            >About</a
          >
        </li>
        {#if $user && isUserAdmin}
          <li
            class="relative {$page.url.pathname === '/submit'
              ? "after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-sm after:bg-[var(--color-accent)] after:content-['']"
              : ''}"
          >
            <a
              href="/submit"
              class="block py-2 text-base font-semibold text-[var(--color-heading)] no-underline transition-colors duration-200 hover:text-[var(--color-accent)]"
              >Submit</a
            >
          </li>
        {/if}
      </ul>
      <div
        class="flex min-w-[70px] items-center justify-end opacity-100 transition-opacity duration-200 {authLoading
          ? 'invisible opacity-0'
          : ''}"
      >
        {#if $user}
          <button
            class="cursor-pointer rounded border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 hover:bg-[color-mix(in_oklab,black_5%,transparent)]"
            on:click={handleLogout}
          >
            Logout
          </button>
        {:else}
          <button
            class="cursor-pointer rounded border border-[#4285f4] bg-[#4285f4] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#3367d6] hover:bg-[#3367d6] hover:shadow"
            on:click={handleLogin}
            title="Login with GitHub"
          >
            <span>Sign in</span>
          </button>
        {/if}
      </div>
    </nav>
  </div>

  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <div
      class="mt-3 border-t border-[var(--color-border)] bg-[var(--color-secondary)] px-3 py-4 shadow-md md:hidden"
    >
      <nav class="flex flex-col gap-4">
        <ul class="m-0 flex list-none flex-col gap-4 p-0">
          <li>
            <a
              href="/"
              class="block py-2 text-base font-semibold text-[var(--color-heading)] no-underline transition-colors duration-200 hover:text-[var(--color-accent)] {$page.url.pathname === '/' ? 'text-[var(--color-accent)]' : ''}"
              >Problems</a
            >
          </li>
          <li>
            <a
              href="/about"
              class="block py-2 text-base font-semibold text-[var(--color-heading)] no-underline transition-colors duration-200 hover:text-[var(--color-accent)] {$page.url.pathname === '/about' ? 'text-[var(--color-accent)]' : ''}"
              >About</a
            >
          </li>
          {#if $user && isUserAdmin}
            <li>
              <a
                href="/submit"
                class="block py-2 text-base font-semibold text-[var(--color-heading)] no-underline transition-colors duration-200 hover:text-[var(--color-accent)] {$page.url.pathname === '/submit' ? 'text-[var(--color-accent)]' : ''}"
                >Submit</a
              >
            </li>
          {/if}
        </ul>
        <div
          class="mt-2 flex items-center justify-start {authLoading ? 'invisible opacity-0' : ''}"
        >
          {#if $user}
            <button
              class="cursor-pointer rounded border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 hover:bg-[color-mix(in_oklab,black_5%,transparent)]"
              on:click={handleLogout}
            >
              Logout
            </button>
          {:else}
            <button
              class="cursor-pointer rounded border border-[#4285f4] bg-[#4285f4] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#3367d6] hover:bg-[#3367d6] hover:shadow"
              on:click={handleLogin}
              title="Login with GitHub"
            >
              <span>Sign in</span>
            </button>
          {/if}
        </div>
      </nav>
    </div>
  {/if}
</header>

<style>
/* Add smooth transitions for mobile menu */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div.md\:hidden {
  animation: slideDown 0.2s ease-out;
}

/* Ensure header is at the top */
header {
  left: 0;
  right: 0;
}
</style>
