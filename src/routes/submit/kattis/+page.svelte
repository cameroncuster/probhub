<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/services/auth';
  import { isAdmin } from '$lib/services/auth';
  import { supabase } from '$lib/services/database';
  import { extractKattisProblemInfo, fetchKattisProblemData } from '$lib/services/kattis';
  import { insertProblem } from '$lib/services/problem';
  import type { Unsubscriber } from 'svelte/store';

  // Form data
  let problemUrls = '';
  let kattisHandle = '';
  let loading = false;
  let error: string | null = null;
  let success = false;
  let isAdminUser = false;
  let checkingAdmin = true;
  let userUnsubscribe: Unsubscriber | null = null;

  // Processing status
  let processingResults: {
    url: string;
    status: 'pending' | 'success' | 'error';
    message?: string;
    name?: string;
    details?: string;
  }[] = [];

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

  // Function to extract all valid URLs from the input text
  function extractUrls(text: string): string[] {
    // Split by newlines or spaces to handle both formats
    const lines = text.split(/[\n\s]+/).filter((line) => line.trim());

    const validUrls: string[] = [];

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Try to extract problem info for each line
      const info = extractKattisProblemInfo(line.trim());
      if (info) {
        validUrls.push(info.url);
      }
    }

    return validUrls;
  }

  // Function to process all problem URLs
  async function processProblems() {
    if (!$user) {
      error = 'You must be logged in to submit problems.';
      return;
    }

    if (!isAdminUser) {
      error = 'Only admins can submit problems.';
      return;
    }

    if (kattisHandle && !kattisHandle.match(/^[a-zA-Z0-9._-]{2,}$/)) {
      error = 'Invalid Kattis handle format.';
      return;
    }

    const urls = extractUrls(problemUrls);

    if (urls.length === 0) {
      error = 'No valid Kattis problem URLs found.';
      return;
    }

    loading = true;
    error = null;
    success = false;
    processingResults = urls.map((url) => ({ url, status: 'pending' }));

    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const problemInfo = extractKattisProblemInfo(url);

        if (!problemInfo) {
          processingResults[i] = { url, status: 'error', message: 'Invalid URL format' };
          continue;
        }

        processingResults[i] = { ...processingResults[i], message: 'Fetching data...' };
        processingResults = [...processingResults];

        // Use the service function instead of the local one
        const result = await fetchKattisProblemData(problemInfo, kattisHandle);

        if (!result.success || !result.problem) {
          processingResults[i] = {
            url,
            status: 'error',
            message: result.message || 'Failed to fetch problem data'
          };
          continue;
        }

        try {
          // Use the insertProblem function from problemDatabase service
          const insertResult = await insertProblem(result.problem);

          if (!insertResult.success) {
            processingResults[i] = {
              url,
              status: 'error',
              message: insertResult.message
            };
          } else {
            processingResults[i] = {
              url,
              status: 'success',
              name: result.problem.name,
              message: 'Added successfully'
            };
          }
        } catch (err) {
          processingResults[i] = {
            url,
            status: 'error',
            message: err instanceof Error ? err.message : 'Failed to insert problem'
          };
        }

        processingResults = [...processingResults];
      }

      success = processingResults.some((r) => r.status === 'success');
    } catch (err) {
      error = 'An unexpected error occurred.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Submit Kattis Problems - Probhub</title>
</svelte:head>

<div class="container">
  <div class="submit-form">
    <h1>Submit Kattis Problems</h1>

    {#if checkingAdmin}
      <div class="loading-message">Checking permissions...</div>
    {:else if error && !processingResults.length}
      <div class="error-message">{error}</div>
    {/if}

    {#if isAdminUser && !checkingAdmin}
      <form on:submit|preventDefault={processProblems}>
        <div class="form-group">
          <label for="kattisHandle">Kattis Handle</label>
          <input
            type="text"
            id="kattisHandle"
            bind:value={kattisHandle}
            placeholder="Enter your Kattis handle (optional)"
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="problemUrls">Problem URLs <span class="required">*</span></label>
          <textarea
            id="problemUrls"
            bind:value={problemUrls}
            placeholder="kattis.com/problems/hello&#10;open.kattis.com/problems/twostones&#10;customscontrols"
            required
            disabled={loading}
            rows="8"
          ></textarea>
          <small>Enter Kattis problem URLs or problem IDs</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Problems'}
          </button>
        </div>
      </form>

      {#if processingResults.length > 0}
        <div class="results">
          <h2>Results</h2>
          <div class="results-list">
            {#each processingResults as result}
              <div
                class="result-item"
                class:success={result.status === 'success'}
                class:error={result.status === 'error'}
              >
                <div class="result-url">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {#if result.name}
                      {result.name}
                    {:else}
                      {result.url.replace(
                        /^https?:\/\/(?:www\.)?open\.kattis\.com\/problems\/([a-z0-9]+).*$/,
                        '$1'
                      )}
                    {/if}
                  </a>
                </div>
                <div class="result-status">
                  {#if result.status === 'pending'}
                    <span class="pending">Pending</span>
                  {:else if result.status === 'success'}
                    <span class="success-text">✓ {result.message}</span>
                  {:else}
                    <span class="error-text">✗ {result.message}</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  .submit-form {
    background-color: var(--secondary-color);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0;
    color: var(--heading-color);
    font-size: 2rem;
  }

  h2 {
    margin: 2rem 0 1rem;
    color: var(--heading-color);
    font-size: 1.5rem;
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

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 1rem;
    box-sizing: border-box;
    font-family: inherit;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }

  input:disabled,
  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  textarea {
    resize: vertical;
    min-height: 150px;
  }

  input:focus,
  textarea:focus {
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

  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit-button:hover {
    background-color: var(--primary-color-dark);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-message,
  .error-message {
    text-align: center;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .loading-message {
    color: #2196f3;
  }
  .error-message {
    color: #f44336;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--background-color);
    border-radius: 4px;
    border-left: 4px solid var(--border-color);
    margin-bottom: 0.5rem;
  }

  .result-item.success {
    border-left-color: #4caf50;
  }
  .result-item.error {
    border-left-color: #f44336;
  }

  .result-url {
    font-weight: 500;
    word-break: break-all;
    flex: 1;
  }

  .result-url a {
    color: var(--text-color);
    text-decoration: none;
    display: inline-block;
  }

  .result-url a:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }

  .result-status {
    white-space: nowrap;
    margin-left: 1rem;
    font-weight: 500;
  }

  .pending {
    color: #2196f3;
  }
  .success-text {
    color: #4caf50;
  }
  .error-text {
    color: #f44336;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.75rem;
    }
    .submit-form {
      padding: 1.5rem;
    }
    h1 {
      font-size: 1.75rem;
    }

    .result-item {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }

    .result-status {
      margin-left: 0.5rem;
    }
  }
</style>
