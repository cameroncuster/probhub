<script>
  import { onMount } from 'svelte';
  import { fetchProblems } from '$lib/services/codeforces';

  let problems = [];
  let loading = false;
  let error = null;

  // Function to get the rating color based on difficulty
  function getRatingColor(rating) {
    if (rating >= 2900) return 'legendary-grandmaster';
    if (rating >= 2600) return 'international-grandmaster';
    if (rating >= 2400) return 'grandmaster';
    if (rating >= 2300) return 'international-master';
    if (rating >= 2200) return 'master';
    if (rating >= 1900) return 'candidate-master';
    if (rating >= 1600) return 'expert';
    if (rating >= 1400) return 'specialist';
    if (rating >= 1200) return 'pupil';
    return 'newbie';
  }

  // Function to get the rating tier name
  function getRatingTierName(rating) {
    if (rating >= 2900) return 'Legendary Grandmaster';
    if (rating >= 2600) return 'International Grandmaster';
    if (rating >= 2400) return 'Grandmaster';
    if (rating >= 2300) return 'International Master';
    if (rating >= 2200) return 'Master';
    if (rating >= 1900) return 'Candidate Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Specialist';
    if (rating >= 1200) return 'Pupil';
    return 'Newbie';
  }

  // Function to format date to a more readable format
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Function to handle like/dislike actions
  function handleLike(problemId, isLike) {
    problems = problems.map((problem) => {
      if (problem.id === problemId) {
        if (isLike) {
          return { ...problem, likes: problem.likes + 1 };
        } else {
          return { ...problem, dislikes: problem.dislikes + 1 };
        }
      }
      return problem;
    });
  }

  // Function to load problems
  async function loadProblems() {
    loading = true;
    error = null;

    try {
      const fetchedProblems = await fetchProblems();

      if (fetchedProblems && fetchedProblems.length > 0) {
        problems = fetchedProblems;
      }

      loading = false;
    } catch (err) {
      console.error('Error loading problems:', err);
      error = 'Failed to load problems.';
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
            <th>Name</th>
            <th>Difficulty</th>
            <th>Tags</th>
            <th>Date Added</th>
            <th>Added By</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {#each problems as problem}
            <tr>
              <td>
                <a href={problem.url} target="_blank" rel="noopener noreferrer">
                  {problem.name}
                </a>
              </td>
              <td>
                <span
                  class="rating-badge"
                  style="background-color: var(--{getRatingColor(problem.difficulty)}-color)"
                  title="{getRatingTierName(problem.difficulty)} (Rating: {problem.difficulty})"
                >
                  {problem.difficulty}
                </span>
              </td>
              <td>
                <div class="problem-tags">
                  {#each problem.tags as tag}
                    <span class="problem-tag">{tag}</span>
                  {/each}
                </div>
              </td>
              <td>{formatDate(problem.dateAdded)}</td>
              <td>
                <a href={problem.addedByUrl} target="_blank" rel="noopener noreferrer">
                  @{problem.addedBy}
                </a>
              </td>
              <td>
                <div class="feedback-buttons">
                  <button
                    class="like-button"
                    on:click={() => handleLike(problem.id, true)}
                    title="Like this problem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="thumbs-up"
                    >
                      <path
                        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                      ></path>
                    </svg>
                    <span>{problem.likes}</span>
                  </button>
                  <button
                    class="dislike-button"
                    on:click={() => handleLike(problem.id, false)}
                    title="Dislike this problem"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="thumbs-down"
                    >
                      <path
                        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
                      ></path>
                    </svg>
                    <span>{problem.dislikes}</span>
                  </button>
                </div>
              </td>
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

  .rating-badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    color: white;
    font-weight: bold;
  }

  .feedback-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .like-button,
  .dislike-button {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-color);
  }

  .like-button svg,
  .dislike-button svg {
    stroke: var(--text-color);
  }

  .like-button:hover {
    background-color: rgba(0, 200, 0, 0.1);
    border-color: rgba(0, 200, 0, 0.5);
    color: #4caf50;
  }

  .dislike-button:hover {
    background-color: rgba(200, 0, 0, 0.1);
    border-color: rgba(200, 0, 0, 0.5);
    color: #f44336;
  }

  .thumbs-up,
  .thumbs-down {
    stroke-width: 2;
  }

  .like-button:hover .thumbs-up {
    stroke: #4caf50;
  }

  .dislike-button:hover .thumbs-down {
    stroke: #f44336;
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
      min-width: 800px; /* Ensure table has minimum width */
    }
  }
</style>
