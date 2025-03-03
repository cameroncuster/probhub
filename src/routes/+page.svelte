<script>
  import { onMount } from 'svelte';
  import { fetchProblems } from '$lib/services/codeforces';

  // Sample problems data as fallback
  let problems = [
    {
      id: '1A',
      name: 'Theatre Square',
      tags: ['math'],
      difficulty: 1000,
      url: 'https://codeforces.com/problemset/problem/1/A',
      solved: 187000,
      category: 'easy'
    },
    {
      id: '4A',
      name: 'Watermelon',
      tags: ['brute force', 'math'],
      difficulty: 800,
      url: 'https://codeforces.com/problemset/problem/4/A',
      solved: 250000,
      category: 'easy'
    },
    {
      id: '71A',
      name: 'Way Too Long Words',
      tags: ['strings'],
      difficulty: 800,
      url: 'https://codeforces.com/problemset/problem/71/A',
      solved: 230000,
      category: 'easy'
    },
    {
      id: '158A',
      name: 'Next Round',
      tags: ['implementation'],
      difficulty: 800,
      url: 'https://codeforces.com/problemset/problem/158/A',
      solved: 210000,
      category: 'easy'
    },
    {
      id: '231A',
      name: 'Team',
      tags: ['brute force', 'greedy'],
      difficulty: 800,
      url: 'https://codeforces.com/problemset/problem/231/A',
      solved: 200000,
      category: 'easy'
    }
  ];

  let loading = false;
  let error = null;

  // Function to load problems with localStorage caching
  async function loadProblems() {
    loading = true;
    error = null;

    try {
      // Check if we have cached problems in localStorage
      const cachedProblems = localStorage.getItem('probhub_problems');
      const cacheTimestamp = localStorage.getItem('probhub_cache_timestamp');

      // Use cache if it exists and is less than 24 hours old
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
      const cacheValid = cacheAge < 24 * 60 * 60 * 1000; // 24 hours

      if (cachedProblems && cacheValid) {
        problems = JSON.parse(cachedProblems).slice(100, 200); // Only use 100
        loading = false;
        return;
      }

      // If no valid cache, fetch from API
      const apiProblems = await fetchProblems();

      if (apiProblems && apiProblems.length > 0) {
        // Store all problems in localStorage
        localStorage.setItem('probhub_problems', JSON.stringify(apiProblems));
        localStorage.setItem('probhub_cache_timestamp', Date.now().toString());

        // Only display first 100
        problems = apiProblems.slice(100, 200);
      }

      loading = false;
    } catch (err) {
      console.error('Error loading problems:', err);
      error = 'Failed to load problems from API. Using sample data instead.';
      loading = false;
    }
  }

  onMount(() => {
    loadProblems();
  });
</script>

<svelte:head>
  <title>Probhub</title>
</svelte:head>

<div class="container">
  <h1>Programming Problems</h1>

  {#if loading}
    <div class="loading">Loading problems...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Difficulty</th>
            <th>Tags</th>
            <th>Solved By</th>
          </tr>
        </thead>
        <tbody>
          {#each problems as problem}
            <tr>
              <td>{problem.id}</td>
              <td>
                <a href={problem.url} target="_blank" rel="noopener noreferrer">
                  {problem.name}
                </a>
              </td>
              <td>
                <span class={`badge badge-${problem.category}`}>
                  {problem.difficulty || 'N/A'}
                </span>
              </td>
              <td>
                <div class="problem-tags">
                  {#each problem.tags as tag}
                    <span class="problem-tag">{tag}</span>
                  {/each}
                </div>
              </td>
              <td>{problem.solved ? problem.solved.toLocaleString() : 'N/A'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    overflow-x: auto; /* Allow horizontal scrolling for the table */
  }

  h1 {
    margin-bottom: 2rem;
    font-size: 2rem;
    word-break: break-word;
  }

  .loading,
  .error {
    text-align: center;
    padding: 2rem;
  }

  .error {
    color: #f44336;
  }

  .problem-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .problem-tag {
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
    background-color: var(--tertiary-color);
    border-radius: 3px;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 1.75rem;
    }

    .card {
      padding: 0.5rem;
      overflow-x: auto;
    }

    .table {
      min-width: 600px; /* Ensure table has minimum width */
    }
  }
</style>
