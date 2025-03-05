<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProblems, updateProblemFeedback } from '$lib/services/codeforces';
  import type { Problem } from '$lib/services/codeforces';

  let problems: Problem[] = [];
  let loading: boolean = false;
  let error: string | null = null;
  let userFeedback: Record<string, 'like' | 'dislike' | null> = {};

  // Function to get the rating color based on difficulty
  function getRatingColor(rating: number): string {
    if (rating >= 3000) return 'legendary-grandmaster';
    if (rating >= 2600) return 'international-grandmaster';
    if (rating >= 2400) return 'grandmaster';
    if (rating >= 2300) return 'international-master';
    if (rating >= 2100) return 'master';
    if (rating >= 1900) return 'candidate-master';
    if (rating >= 1600) return 'expert';
    if (rating >= 1400) return 'specialist';
    if (rating >= 1200) return 'pupil';
    return 'newbie';
  }

  // Function to get the rating tier name
  function getRatingTierName(rating: number): string {
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
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Function to calculate problem score (likes - dislikes)
  function calculateScore(problem: Problem): number {
    return problem.likes - problem.dislikes;
  }

  // Function to sort problems by score (likes - dislikes)
  function sortProblemsByScore(problemsToSort: Problem[]): Problem[] {
    return [...problemsToSort].sort((a, b) => calculateScore(b) - calculateScore(a));
  }

  // Function to handle like/dislike actions
  async function handleLike(problemId: string, isLike: boolean): Promise<void> {
    try {
      // Check if user has already provided feedback for this problem
      const currentFeedback = userFeedback[problemId];

      // If user already gave the same feedback, treat as an "undo"
      if ((isLike && currentFeedback === 'like') || (!isLike && currentFeedback === 'dislike')) {
        // Update UI optimistically
        problems = problems.map((problem) => {
          if (problem.id === problemId) {
            if (isLike) {
              return { ...problem, likes: problem.likes - 1 };
            } else {
              return { ...problem, dislikes: problem.dislikes - 1 };
            }
          }
          return problem;
        });

        // Remove the user's feedback
        userFeedback[problemId] = null;

        // Sort problems after updating
        problems = sortProblemsByScore(problems);

        // Update the database
        await updateProblemFeedback(problemId, isLike, true);
        return;
      }

      // Handle new feedback or changing from like to dislike (or vice versa)
      // Update UI optimistically
      problems = problems.map((problem) => {
        if (problem.id === problemId) {
          let updatedProblem = { ...problem };

          // If switching from like to dislike or vice versa, undo the previous action
          if (currentFeedback === 'like' && !isLike) {
            updatedProblem.likes -= 1;
            updatedProblem.dislikes += 1;
          } else if (currentFeedback === 'dislike' && isLike) {
            updatedProblem.dislikes -= 1;
            updatedProblem.likes += 1;
          } else {
            // New feedback
            if (isLike) {
              updatedProblem.likes += 1;
            } else {
              updatedProblem.dislikes += 1;
            }
          }

          return updatedProblem;
        }
        return problem;
      });

      // Store the user's feedback
      userFeedback[problemId] = isLike ? 'like' : 'dislike';

      // Sort problems after updating
      problems = sortProblemsByScore(problems);

      // Update the database
      await updateProblemFeedback(problemId, isLike, false, currentFeedback);
    } catch (err) {
      console.error('Error handling like/dislike:', err);
      error = 'Failed to update problem feedback.';
      // Reload problems to get correct state
      await loadProblems();
    }
  }

  // Function to load problems
  async function loadProblems(): Promise<void> {
    loading = true;
    error = null;

    try {
      const fetchedProblems = await fetchProblems();

      if (fetchedProblems && fetchedProblems.length > 0) {
        // Sort problems by score (likes - dislikes)
        problems = sortProblemsByScore(fetchedProblems);
      }

      loading = false;
    } catch (err) {
      console.error('Error loading problems:', err);
      error = 'Failed to load problems.';
      loading = false;
    }
  }

  // Load user feedback from localStorage on mount
  onMount(() => {
    loadProblems();

    // Try to load previous feedback from localStorage
    const savedFeedback = localStorage.getItem('userFeedback');
    if (savedFeedback) {
      try {
        userFeedback = JSON.parse(savedFeedback);
      } catch (e) {
        console.error('Failed to parse saved feedback', e);
        userFeedback = {};
      }
    }
  });

  // Save user feedback to localStorage when it changes
  $: {
    if (Object.keys(userFeedback).length > 0) {
      localStorage.setItem('userFeedback', JSON.stringify(userFeedback));
    }
  }
</script>

<svelte:head>
  <title>Probhub</title>
</svelte:head>

<div class="container">
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
            <th>Credit</th>
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
                    class:active={userFeedback[problem.id] === 'like'}
                    on:click={() => handleLike(problem.id, true)}
                    title={userFeedback[problem.id] === 'like' ? 'Undo like' : 'Like this problem'}
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
                    class:active={userFeedback[problem.id] === 'dislike'}
                    on:click={() => handleLike(problem.id, false)}
                    title={userFeedback[problem.id] === 'dislike'
                      ? 'Undo dislike'
                      : 'Dislike this problem'}
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

  .like-button.active {
    background-color: rgba(0, 200, 0, 0.1);
    border-color: rgba(0, 200, 0, 0.5);
    color: #4caf50;
  }

  .dislike-button.active {
    background-color: rgba(200, 0, 0, 0.1);
    border-color: rgba(200, 0, 0, 0.5);
    color: #f44336;
  }

  .like-button.active .thumbs-up {
    stroke: #4caf50;
  }

  .dislike-button.active .thumbs-down {
    stroke: #f44336;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.5rem;
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
