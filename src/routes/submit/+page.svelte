<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/services/auth';
  import { isAdmin } from '$lib/services/auth';
  import { supabase } from '$lib/services/database';
  import type { Unsubscriber } from 'svelte/store';

  // Form data
  let name = '';
  let url = '';
  let difficulty = 1500;
  let tags: string[] = [];
  let tagInput = '';
  let loading = false;
  let error: string | null = null;
  let success = false;
  let isAdminUser = false;
  let checkingAdmin = true;
  let userUnsubscribe: Unsubscriber | null = null;

  // Redirect if not logged in and check admin status
  onMount(() => {
    userUnsubscribe = user.subscribe(async (value) => {
      if (value === null) {
        // User is not logged in, redirect to home
        goto('/');
      } else {
        // Check if user is admin
        checkingAdmin = true;
        try {
          isAdminUser = await isAdmin(value.id);
          if (!isAdminUser) {
            error =
              'You do not have permission to submit problems. Only admins can submit problems.';
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          error = 'Failed to verify your permissions. Please try again later.';
        } finally {
          checkingAdmin = false;
        }
      }
    });

    return () => {
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
  });

  // Handle tag input
  function handleTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      tags = [...tags, tag];
      tagInput = '';
    }
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }

  // Submit the problem
  async function handleSubmit() {
    if (!$user) {
      error = 'You must be logged in to submit a problem.';
      return;
    }

    if (!isAdminUser) {
      error = 'You do not have permission to submit problems. Only admins can submit problems.';
      return;
    }

    if (!name || !url || !difficulty) {
      error = 'Please fill in all required fields.';
      return;
    }

    loading = true;
    error = null;
    success = false;

    try {
      // Extract contest ID and index from URL
      // Example: https://codeforces.com/contest/1234/problem/A
      const urlPattern = /contest\/(\d+)\/problem\/([A-Z\d]+)/;
      const match = url.match(urlPattern);

      if (!match) {
        error =
          'Invalid Codeforces problem URL. Please use the format: https://codeforces.com/contest/1234/problem/A';
        loading = false;
        return;
      }

      const contestId = match[1];
      const index = match[2];
      const problemId = `${contestId}${index}`;

      // Check if problem already exists
      const { data: existingProblem } = await supabase
        .from('problems')
        .select('id')
        .eq('id', problemId)
        .single();

      if (existingProblem) {
        error = 'This problem has already been submitted.';
        loading = false;
        return;
      }

      // Submit the problem
      const { error: insertError } = await supabase.from('problems').insert({
        id: problemId,
        name,
        tags,
        difficulty,
        url,
        solved: 0,
        date_added: new Date().toISOString(),
        added_by: $user.email?.split('@')[0] || 'anonymous',
        added_by_url: `https://github.com/${$user.email?.split('@')[0] || 'anonymous'}`,
        likes: 0,
        dislikes: 0
      });

      if (insertError) {
        throw insertError;
      }

      // Reset form
      name = '';
      url = '';
      difficulty = 1500;
      tags = [];
      tagInput = '';
      success = true;
    } catch (err) {
      console.error('Error submitting problem:', err);
      error = 'Failed to submit problem. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Submit Problem - Probhub</title>
</svelte:head>

<div class="container">
  <div class="submit-form">
    <h1>Submit a Problem</h1>
    <p class="description">
      Share interesting programming problems with the community. Please ensure the problem is from
      Codeforces and provide accurate information.
    </p>

    {#if checkingAdmin}
      <div class="loading-message">Checking your permissions...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if success}
      <div class="success-message">
        Problem submitted successfully! Thank you for contributing to Probhub.
      </div>
    {/if}

    {#if isAdminUser && !checkingAdmin}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="name">Problem Name <span class="required">*</span></label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="e.g. Equalize Prices"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="url">Problem URL <span class="required">*</span></label>
          <input
            type="url"
            id="url"
            bind:value={url}
            placeholder="https://codeforces.com/contest/1234/problem/A"
            required
            disabled={loading}
          />
          <small>Please use the format: https://codeforces.com/contest/1234/problem/A</small>
        </div>

        <div class="form-group">
          <label for="difficulty">Difficulty Rating <span class="required">*</span></label>
          <input
            type="number"
            id="difficulty"
            bind:value={difficulty}
            min="800"
            max="3500"
            step="100"
            required
            disabled={loading}
          />
          <small>Codeforces rating from 800 to 3500</small>
        </div>

        <div class="form-group">
          <label for="tags">Tags</label>
          <div class="tag-input-container">
            <input
              type="text"
              id="tags"
              bind:value={tagInput}
              placeholder="Add tags (press Enter or comma to add)"
              on:keydown={handleTagKeydown}
              on:blur={addTag}
              disabled={loading}
            />
          </div>
          {#if tags.length > 0}
            <div class="tags-container">
              {#each tags as tag, index}
                <span class="tag">
                  {tag}
                  <button
                    type="button"
                    class="remove-tag"
                    on:click={() => removeTag(index)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              {/each}
            </div>
          {/if}
          <small>Common tags: dp, greedy, math, implementation, graphs</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Problem'}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .submit-form {
    background-color: var(--secondary-color);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin-top: 0;
    color: var(--heading-color);
  }

  .description {
    margin-bottom: 2rem;
    color: var(--text-color);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--heading-color);
  }

  .required {
    color: #f44336;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 1rem;
  }

  input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .tag-input-container {
    margin-bottom: 0.5rem;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    background-color: var(--tertiary-color);
    color: var(--text-color);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .remove-tag {
    background: none;
    border: none;
    color: var(--text-color);
    margin-left: 0.25rem;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0 0.25rem;
  }

  .form-actions {
    margin-top: 2rem;
  }

  .submit-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit-button:hover {
    background-color: var(--primary-color-dark);
  }

  .submit-button:disabled {
    background-color: var(--text-muted);
    cursor: not-allowed;
  }

  .error-message {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }

  .success-message {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }

  .loading-message {
    background-color: rgba(33, 150, 243, 0.1);
    color: #2196f3;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .submit-form {
      padding: 1.5rem;
    }
  }
</style>
