<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/services/auth';
  import { isAdmin } from '$lib/services/auth';
  import { supabase } from '$lib/services/database';
  import type { Unsubscriber } from 'svelte/store';

  // Form data
  let problemUrls = '';
  let cfHandle = '';
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
      // Get current auth state directly first
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;

      if (!currentUser) {
        console.log('No user found on initial check, redirecting to home');
        goto('/');
        return;
      }

      // If we have a user, check admin status
      checkingAdmin = true;

      try {
        isAdminUser = await isAdmin(currentUser.id);

        if (!isAdminUser) {
          error = 'You do not have permission to submit problems. Only admins can submit problems.';
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        error = 'Failed to verify your permissions. Please try again later.';
      } finally {
        checkingAdmin = false;
      }

      // Now set up the subscription for future changes
      userUnsubscribe = user.subscribe((value) => {
        if (value === null && currentUser !== null) {
          // User logged out after initial load
          console.log('User logged out, redirecting to home');
          goto('/');
        }
      });
    };

    initAuth();

    return () => {
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
  });

  // Function to extract contest ID and problem index from URL
  function extractProblemInfo(problemUrl: string) {
    // First normalize the URL to remove http/https/www and ensure it starts with a domain
    const normalizedUrl = problemUrl.trim();

    // Handle shorthand "CF" format (e.g., "CF 1794E")
    const cfShortPattern = /^CF\s*(\d+)([A-Z\d]+)$/i;
    const cfShortMatch = normalizedUrl.match(cfShortPattern);
    if (cfShortMatch) {
      const normalizedFinalUrl = `https://codeforces.com/contest/${cfShortMatch[1]}/problem/${cfShortMatch[2]}`;
      return {
        contestId: cfShortMatch[1],
        index: cfShortMatch[2],
        problemId: `${cfShortMatch[1]}${cfShortMatch[2]}`,
        url: normalizedFinalUrl
      };
    }

    // Remove http/https/www if present
    const cleanUrl = normalizedUrl.replace(/^(https?:\/\/)?(www\.)?/, '');

    // Support both codeforces.com and mirror.codeforces.com
    const contestPattern = /(?:mirror\.)?codeforces\.com\/contest\/(\d+)\/problem\/([A-Z\d]+)/;
    const problemsetPattern =
      /(?:mirror\.)?codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z\d]+)/;

    const contestMatch = cleanUrl.match(contestPattern);
    const problemsetMatch = cleanUrl.match(problemsetPattern);

    // Use whichever pattern matched
    const match = contestMatch || problemsetMatch;

    if (!match) {
      return null;
    }

    // Always normalize to the main codeforces.com URL for consistency
    const normalizedFinalUrl = `https://codeforces.com/contest/${match[1]}/problem/${match[2]}`;

    return {
      contestId: match[1],
      index: match[2],
      problemId: `${match[1]}${match[2]}`,
      url: normalizedFinalUrl
    };
  }

  // Function to extract all valid URLs from the input text
  function extractUrls(text: string): string[] {
    // Split by newlines or spaces to handle both formats
    const lines = text.split(/[\n\s]+/).filter((line) => line.trim());

    const validUrls: string[] = [];

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Try to extract problem info for each line
      const info = extractProblemInfo(line.trim());
      if (info) {
        validUrls.push(info.url);
      }
    }

    return validUrls;
  }

  // Function to fetch problem data from Codeforces API
  async function fetchProblemData(problemInfo: {
    contestId: string;
    index: string;
    problemId: string;
    url: string;
  }) {
    try {
      // Check if problem already exists in our database by URL
      const { data: existingProblems, error: queryError } = await supabase
        .from('problems')
        .select('id, url')
        .or(
          `url.eq.${problemInfo.url},url.eq.https://codeforces.com/problemset/problem/${problemInfo.contestId}/${problemInfo.index}`
        );

      if (queryError) {
        return {
          success: false,
          message: `Database query error: ${queryError.message}`,
          problemInfo
        };
      }

      if (existingProblems && existingProblems.length > 0) {
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
          name: problem.name,
          tags: problem.tags || [],
          difficulty: problem.rating,
          url: problemInfo.url,
          added_by: cfHandle || 'tourist',
          added_by_url: cfHandle
            ? `https://codeforces.com/profile/${cfHandle}`
            : 'https://codeforces.com/profile/tourist'
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

    // Validate CF handle if provided
    if (cfHandle && !cfHandle.match(/^[a-zA-Z0-9._-]{3,24}$/)) {
      error =
        'Invalid Codeforces handle format. Handles typically contain 3-24 letters, numbers, dots, underscores, or hyphens.';
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
          const { error: insertError } = await supabase.from('problems').upsert(result.problem, {
            onConflict: 'url',
            ignoreDuplicates: true
          });

          if (insertError) {
            console.error('Database insert error:', insertError);

            let errorMessage = insertError.message;

            // Simplify error messages for users
            if (errorMessage.includes('duplicate key value violates unique constraint')) {
              errorMessage = 'This problem already exists in the database';
            }

            processingResults[i] = {
              url,
              status: 'error',
              message: `Database error: ${errorMessage}`,
              details: insertError.details || ''
            };
          } else {
            processingResults[i] = {
              url,
              status: 'success',
              name: result.problem?.name,
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
    cfHandle = '';
    processingResults = [];
    error = null;
    success = false;
  }
</script>

<svelte:head>
  <title>Submit Codeforces Problems - Probhub</title>
</svelte:head>

<div class="container">
  <div class="submit-form">
    <h1>Submit Codeforces Problems</h1>

    {#if checkingAdmin}
      <div class="loading-message">Checking permissions...</div>
    {:else if error && !processingResults.length}
      <div class="error-message">{error}</div>
    {/if}

    {#if isAdminUser && !checkingAdmin}
      <form on:submit|preventDefault={processProblems}>
        <div class="form-group">
          <label for="cfHandle">Codeforces Handle</label>
          <input
            type="text"
            id="cfHandle"
            bind:value={cfHandle}
            placeholder="Enter your Codeforces handle (optional)"
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="problemUrls">Problem URLs <span class="required">*</span></label>
          <textarea
            id="problemUrls"
            bind:value={problemUrls}
            placeholder="https://codeforces.com/contest/1234/problem/A&#10;https://codeforces.com/problemset/problem/1234/A"
            required
            disabled={loading}
            rows="8"
          ></textarea>
          <small>Enter Codeforces problem URLs</small>
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
                    {result.url.replace(
                      /^https?:\/\/(?:www\.)?codeforces\.com\/(?:contest|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Z\d]+).*$/,
                      'CF $1$2'
                    )}
                    {#if result.name}
                      - {result.name}{/if}
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
    margin: 0 0 2rem;
    color: var(--heading-color);
    font-size: 2rem;
    text-align: center;
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
    color: var(--primary-color);
    text-decoration: underline;
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
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .result-status {
      margin-left: 0;
    }
  }
</style>
