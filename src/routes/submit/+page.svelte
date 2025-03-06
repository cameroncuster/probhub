<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/services/auth';
  import { isAdmin } from '$lib/services/auth';
  import { supabase } from '$lib/services/database';
  import type { Unsubscriber } from 'svelte/store';

  // Form data
  let problemUrls = '';
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
  }[] = [];

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

  // Function to extract contest ID and problem index from URL
  function extractProblemInfo(problemUrl: string) {
    const urlPattern = /contest\/(\d+)\/problem\/([A-Z\d]+)/;
    const match = problemUrl.match(urlPattern);

    if (!match) {
      return null;
    }

    return {
      contestId: match[1],
      index: match[2],
      problemId: `${match[1]}${match[2]}`,
      url: problemUrl.trim()
    };
  }

  // Function to extract all valid URLs from the input text
  function extractUrls(text: string): string[] {
    // Match URLs that contain "codeforces.com/contest" and "/problem/"
    const urlRegex = /https?:\/\/(?:www\.)?codeforces\.com\/contest\/\d+\/problem\/[A-Z\d]+/g;
    return (text.match(urlRegex) || []).map((url) => url.trim());
  }

  // Function to fetch problem data from Codeforces API
  async function fetchProblemData(problemInfo: {
    contestId: string;
    index: string;
    problemId: string;
    url: string;
  }) {
    try {
      // Check if problem already exists in our database
      const { data: existingProblem } = await supabase
        .from('problems')
        .select('id')
        .eq('id', problemInfo.problemId)
        .single();

      if (existingProblem) {
        return {
          success: false,
          message: 'Problem already exists in database',
          problemInfo
        };
      }

      // Fetch problem data from Codeforces API
      const response = await fetch(
        `https://codeforces.com/api/contest.standings?contestId=${problemInfo.contestId}&from=1&count=1`
      );
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error('Failed to fetch problem data from Codeforces API');
      }

      // Find the problem in the response
      const problem = data.result.problems.find((p: any) => p.index === problemInfo.index);

      if (!problem) {
        throw new Error('Problem not found in Codeforces API response');
      }

      return {
        success: true,
        problem: {
          id: problemInfo.problemId,
          name: problem.name,
          tags: problem.tags || [],
          difficulty: problem.rating || 1500,
          url: problemInfo.url,
          solved: 0,
          date_added: new Date().toISOString(),
          added_by: $user?.email?.split('@')[0] || 'anonymous',
          added_by_url: `https://github.com/${$user?.email?.split('@')[0] || 'anonymous'}`,
          likes: 0,
          dislikes: 0
        }
      };
    } catch (err) {
      console.error('Error fetching problem data:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
        problemInfo
      };
    }
  }

  // Function to process all problem URLs
  async function processProblems() {
    if (!$user) {
      error = 'You must be logged in to submit problems.';
      return;
    }

    if (!isAdminUser) {
      error = 'You do not have permission to submit problems. Only admins can submit problems.';
      return;
    }

    const urls = extractUrls(problemUrls);

    if (urls.length === 0) {
      error = 'No valid Codeforces problem URLs found. Please enter at least one valid URL.';
      return;
    }

    loading = true;
    error = null;
    success = false;

    // Initialize processing results
    processingResults = urls.map((url) => ({
      url,
      status: 'pending'
    }));

    try {
      // Process each URL
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const problemInfo = extractProblemInfo(url);

        if (!problemInfo) {
          processingResults[i] = {
            url,
            status: 'error',
            message: 'Invalid URL format'
          };
          continue;
        }

        // Update status to show we're processing this URL
        processingResults[i] = {
          ...processingResults[i],
          message: 'Fetching data...'
        };

        // Force UI update
        processingResults = [...processingResults];

        // Fetch problem data
        const result = await fetchProblemData(problemInfo);

        if (!result.success) {
          processingResults[i] = {
            url,
            status: 'error',
            message: result.message
          };
          continue;
        }

        // Try to insert the problem
        try {
          const { error: insertError } = await supabase.from('problems').insert(result.problem);

          if (insertError) {
            processingResults[i] = {
              url,
              status: 'error',
              message: `Database error: ${insertError.message}`
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

        // Force UI update
        processingResults = [...processingResults];
      }

      // Check if any problems were successfully added
      const successCount = processingResults.filter((r) => r.status === 'success').length;
      if (successCount > 0) {
        success = true;
      }
    } catch (err) {
      console.error('Error processing problems:', err);
      error = 'An unexpected error occurred while processing problems.';
    } finally {
      loading = false;
    }
  }

  // Clear the form
  function clearForm() {
    problemUrls = '';
    processingResults = [];
    error = null;
    success = false;
  }
</script>

<svelte:head>
  <title>Submit Problems - Probhub</title>
</svelte:head>

<div class="container">
  <div class="submit-form">
    <h1>Submit Problems</h1>
    <p class="description">
      Share interesting programming problems with the community. Paste one or more Codeforces
      problem URLs below, and we'll automatically fetch and add them to the database.
    </p>

    {#if checkingAdmin}
      <div class="loading-message">Checking your permissions...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if success}
      <div class="success-message">Problems processed successfully! See results below.</div>
    {/if}

    {#if isAdminUser && !checkingAdmin}
      <form on:submit|preventDefault={processProblems}>
        <div class="form-group">
          <label for="problemUrls">Problem URLs <span class="required">*</span></label>
          <textarea
            id="problemUrls"
            bind:value={problemUrls}
            placeholder="Paste one or more Codeforces problem URLs here, one per line or separated by spaces:&#10;&#10;https://codeforces.com/contest/1234/problem/A&#10;https://codeforces.com/contest/1235/problem/B"
            required
            disabled={loading}
            rows="8"
          ></textarea>
          <small>
            Format: https://codeforces.com/contest/1234/problem/A
            <br />
            You can paste multiple URLs - one per line, or separated by spaces.
          </small>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button" disabled={loading}>
            {loading ? 'Processing...' : 'Process Problems'}
          </button>
          {#if processingResults.length > 0}
            <button type="button" class="clear-button" on:click={clearForm} disabled={loading}>
              Clear
            </button>
          {/if}
        </div>
      </form>

      {#if processingResults.length > 0}
        <div class="results-container">
          <h2>Processing Results</h2>
          <div class="results-list">
            {#each processingResults as result}
              <div
                class="result-item"
                class:success={result.status === 'success'}
                class:error={result.status === 'error'}
              >
                <div class="result-url">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.url.replace(
                      /^https?:\/\/(?:www\.)?codeforces\.com\/contest\/(\d+)\/problem\/([A-Z\d]+).*$/,
                      'CF $1$2'
                    )}
                    {#if result.name}
                      - {result.name}
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
          <div class="results-summary">
            <p>
              Total: {processingResults.length} | Success: {processingResults.filter(
                (r) => r.status === 'success'
              ).length} | Failed: {processingResults.filter((r) => r.status === 'error').length} | Pending:
              {processingResults.filter((r) => r.status === 'pending').length}
            </p>
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
    box-sizing: border-box;
    width: 100%;
  }

  .submit-form {
    background-color: var(--secondary-color);
    border-radius: 8px;
    padding: 2.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    box-sizing: border-box;
  }

  h1 {
    margin-top: 0;
    color: var(--heading-color);
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  h2 {
    color: var(--heading-color);
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
  }

  .description {
    margin-bottom: 2.5rem;
    color: var(--text-color);
    font-size: 1.1rem;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 2rem;
    width: 100%;
  }

  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: var(--heading-color);
    font-size: 1.1rem;
  }

  .required {
    color: #f44336;
  }

  textarea {
    width: 100%;
    padding: 0.9rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 1.05rem;
    box-sizing: border-box;
    -webkit-appearance: none;
    font-family: inherit;
    resize: vertical;
    min-height: 150px;
  }

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
    line-height: 1.4;
  }

  .form-actions {
    margin-top: 2rem;
    width: 100%;
    display: flex;
    gap: 1rem;
  }

  .submit-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    flex: 1;
    width: 100%;
    max-width: none;
  }

  .clear-button {
    background-color: var(--tertiary-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 120px;
  }

  .submit-button:hover {
    background-color: var(--primary-color-dark);
  }

  .clear-button:hover {
    background-color: var(--border-color);
  }

  .submit-button:disabled,
  .clear-button:disabled {
    opacity: 0.6;
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

  .results-container {
    margin-top: 2rem;
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    background-color: var(--background-color);
    border-left: 4px solid var(--border-color);
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
  }

  .result-url a {
    color: var(--text-color);
    text-decoration: none;
  }

  .result-url a:hover {
    text-decoration: underline;
    color: var(--primary-color);
  }

  .result-status {
    white-space: nowrap;
    margin-left: 1rem;
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

  .results-summary {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.75rem;
    }

    .submit-form {
      padding: 1.5rem;
      border-radius: 6px;
    }

    h1 {
      font-size: 1.75rem;
    }

    textarea {
      padding: 0.8rem;
      font-size: 16px;
    }

    .form-actions {
      flex-direction: column;
    }

    .submit-button,
    .clear-button {
      width: 100%;
      max-width: none;
      padding: 0.9rem 1.5rem;
    }

    .result-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .result-status {
      margin-left: 0;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0.75rem;
    }

    .submit-form {
      padding: 1rem;
    }
  }
</style>
