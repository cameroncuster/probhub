<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/services/auth';
  import { isAdmin } from '$lib/services/auth';
  import { supabase } from '$lib/services/database';
  import type { Unsubscriber } from 'svelte/store';

  // Use static image paths instead of imports
  const codeforcesLogo = '/images/codeforces.png';
  const kattisLogo = '/images/kattis.png';

  let isAdminUser = false;
  let checkingAdmin = true;
  let userUnsubscribe: Unsubscriber | null = null;
  let error: string | null = null;

  // Initialize auth state
  onMount(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;

      if (!currentUser) {
        goto('/');
        return;
      }

      checkingAdmin = true;
      try {
        isAdminUser = await isAdmin(currentUser.id);
        if (!isAdminUser) {
          error = 'Only admins can submit problems.';
        }
      } catch (err) {
        error = 'Failed to verify permissions.';
      } finally {
        checkingAdmin = false;
      }

      userUnsubscribe = user.subscribe((value) => {
        if (value === null && currentUser !== null) {
          goto('/');
        }
      });
    };

    initAuth();
    return () => userUnsubscribe?.();
  });
</script>

<svelte:head>
  <title>Submit Problems - AlgoHub</title>
</svelte:head>

<div class="p-4 sm:p-6 w-full flex items-center justify-center">
  <div class="w-full max-w-[500px]">
    <h1 class="text-2xl font-semibold text-center mb-6">Submit Problems</h1>

    {#if checkingAdmin}
      <div class="text-center text-blue-500 p-4">Checking permissions...</div>
    {:else if error}
      <div class="text-center text-red-500 p-4">{error}</div>
    {:else if isAdminUser}
      <div class="flex flex-col gap-6">
        <a
          href="/submit/codeforces"
          class="flex items-center gap-6 p-4 sm:p-6 bg-background border border-border rounded-lg no-underline text-text transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md hover:border-primary"
        >
          <img src={codeforcesLogo} alt="Codeforces" class="w-12 h-12 object-contain" />
          <div>
            <h2 class="m-0 text-xl text-heading">Codeforces</h2>
          </div>
        </a>
        <a
          href="/submit/kattis"
          class="flex items-center gap-6 p-4 sm:p-6 bg-background border border-border rounded-lg no-underline text-text transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md hover:border-primary"
        >
          <img src={kattisLogo} alt="Kattis" class="w-12 h-12 object-contain" />
          <div>
            <h2 class="m-0 text-xl text-heading">Kattis</h2>
          </div>
        </a>
      </div>
    {/if}
  </div>
</div>
