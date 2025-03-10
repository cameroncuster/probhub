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

<div class="container">
  <div class="submit-options">
    <h1>Submit Problems</h1>

    {#if checkingAdmin}
      <div class="loading-message">Checking permissions...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if isAdminUser}
      <div class="platform-buttons">
        <a href="/submit/codeforces" class="platform-button">
          <img src={codeforcesLogo} alt="Codeforces" class="platform-icon" />
          <div class="platform-info">
            <h2>Codeforces</h2>
          </div>
        </a>
        <a href="/submit/kattis" class="platform-button">
          <img src={kattisLogo} alt="Kattis" class="platform-icon" />
          <div class="platform-info">
            <h2>Kattis</h2>
          </div>
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    box-sizing: border-box;
    width: 100%;
  }

  .submit-options {
    background-color: var(--color-secondary);
    border-radius: 8px;
    padding: 2.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    box-sizing: border-box;
  }

  h1 {
    margin-top: 0;
    color: var(--color-heading);
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .platform-buttons {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .platform-button {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    text-decoration: none;
    color: var(--color-text);
    transition: all 0.2s;
  }

  .platform-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
  }

  .platform-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  .platform-info h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-heading);
  }

  .loading-message {
    text-align: center;
    color: #2196f3;
    padding: 1rem;
  }

  .error-message {
    text-align: center;
    color: #f44336;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.75rem;
    }

    .submit-options {
      padding: 1.5rem;
    }

    .platform-buttons {
      grid-template-columns: 1fr;
    }

    .platform-button {
      padding: 1rem;
    }

    .platform-icon {
      width: 36px;
      height: 36px;
    }
  }
</style>
