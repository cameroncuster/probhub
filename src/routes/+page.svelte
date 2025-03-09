<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProblems, updateProblemFeedback } from '$lib/services/problem';
  import type { Problem } from '$lib/services/problem';

  import codeforcesLogo from '../assets/codeforces.png';
  import kattisLogo from '../assets/kattis.png';

  let problems: Problem[] = [];
  let loading: boolean = false;
  let error: string | null = null;
  let userFeedback: Record<string, 'like' | 'dislike' | null> = {};

  // Filtering options
  let selectedSource: 'all' | 'codeforces' | 'kattis' = 'all';
  let filteredProblems: Problem[] = [];

  // Define common tiers
  const TIERS = [
    [3000, 'Legendary Grandmaster'],
    [2600, 'International Grandmaster'],
    [2400, 'Grandmaster'],
    [2300, 'International Master'],
    [2100, 'Master'],
    [1900, 'Candidate Master'],
    [1600, 'Expert'],
    [1400, 'Specialist'],
    [1200, 'Pupil']
  ] as const;

  // Get rating color class
  function getRatingColor(rating: number | undefined): string {
    if (!rating) return 'unrated';
    const tier = TIERS.find(([min]) => rating >= min)?.[1];
    if (!tier) return 'newbie';
    return tier.toLowerCase().replace(' ', '-');
  }

  // Get rating tier display name
  function getRatingTierName(rating: number | undefined): string {
    if (!rating) return 'Unrated';
    return TIERS.find(([min]) => rating >= min)?.[1] || 'Newbie';
  }

  // Function to get difficulty tooltip text
  function getDifficultyTooltip(problem: Problem): string {
    if (problem.source === 'kattis') {
      return `Kattis difficulty mapped from 1-10 scale to 800-3500 rating range`;
    } else {
      return `${getRatingTierName(problem.difficulty)}`;
    }
  }

  // Function to determine if a problem is in the first few rows
  function isTopRow(index: number): boolean {
    return index < 3; // Consider first 3 rows as "top rows"
  }

  // Function to calculate problem score (likes - dislikes)
  function calculateScore(problem: Problem): number {
    return problem.likes - problem.dislikes;
  }

  // Function to sort problems by score (likes - dislikes)
  function sortProblemsByScore(problemsToSort: Problem[]): Problem[] {
    // Group problems by score
    const problemsByScore: Record<number, Problem[]> = {};

    // Calculate score for each problem and group them
    problemsToSort.forEach((problem) => {
      const score = calculateScore(problem);
      if (!problemsByScore[score]) {
        problemsByScore[score] = [];
      }
      problemsByScore[score].push(problem);
    });

    Object.values(problemsByScore).forEach((group) => {
      group.sort((a, b) => {
        if (a.id && b.id) {
          return a.id.localeCompare(b.id);
        }
        return 0;
      });
    });

    // Get all scores and sort them in descending order
    const scores = Object.keys(problemsByScore)
      .map(Number)
      .sort((a, b) => b - a);

    // Flatten the groups in order of score
    return scores.flatMap((score) => problemsByScore[score]);
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

        // Update filtered problems without resorting
        filteredProblems = filterProblems(problems);

        // Save feedback to localStorage
        localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

        // Update the database
        await updateProblemFeedback(problemId, isLike, true);
        return;
      }

      // Handle switching feedback (like to dislike or vice versa)
      if (currentFeedback) {
        // Update UI optimistically
        problems = problems.map((problem) => {
          if (problem.id === problemId) {
            if (isLike) {
              // Switching from dislike to like
              return {
                ...problem,
                likes: problem.likes + 1,
                dislikes: problem.dislikes - 1
              };
            } else {
              // Switching from like to dislike
              return {
                ...problem,
                likes: problem.likes - 1,
                dislikes: problem.dislikes + 1
              };
            }
          }
          return problem;
        });

        // Update user feedback
        userFeedback[problemId] = isLike ? 'like' : 'dislike';

        // Update filtered problems without resorting
        filteredProblems = filterProblems(problems);

        // Save feedback to localStorage
        localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

        // Update the database
        await updateProblemFeedback(problemId, isLike, false, currentFeedback);
        return;
      }

      // Handle new feedback
      // Update UI optimistically
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

      // Update user feedback
      userFeedback[problemId] = isLike ? 'like' : 'dislike';

      // Update filtered problems without resorting
      filteredProblems = filterProblems(problems);

      // Save feedback to localStorage
      localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

      // Update the database
      await updateProblemFeedback(problemId, isLike);
    } catch (err) {
      console.error('Error updating feedback:', err);
      // If there's an error, reload problems to ensure UI is in sync with server
      loadProblems();
    }
  }

  // Function to load problems
  async function loadProblems() {
    loading = true;
    error = null;

    try {
      // Fetch problems
      const fetchedProblems = await fetchProblems();

      // Sort by score only on initial load
      problems = sortProblemsByScore(fetchedProblems);

      // Update filtered problems
      filteredProblems = filterProblems(problems);
    } catch (e) {
      console.error('Error loading problems:', e);
      error = 'Failed to load problems. Please try again later.';
    } finally {
      loading = false;
    }
  }

  // Function to filter problems based on selected source
  function filterProblems(problemsToFilter: Problem[]): Problem[] {
    if (selectedSource === 'all') return problemsToFilter;
    return problemsToFilter.filter((problem) => problem.source === selectedSource);
  }

  // Load problems on mount
  onMount(() => {
    loadProblems();

    // Load user feedback from localStorage
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
  <title>AlgoHub</title>
</svelte:head>

<div class="container">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading problems...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>Try Again</button>
    </div>
  {:else if problems.length === 0}
    <div class="empty-state">
      <p>No problems found. Check back later or submit some problems!</p>
    </div>
  {:else}
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="col-source"></th>
            <th class="col-name">Problem</th>
            <th class="col-difficulty">Difficulty</th>
            <th class="col-author">Added By</th>
            <th class="col-feedback"></th>
          </tr>
        </thead>
        <tbody>
          {#each filteredProblems as problem, index}
            <tr>
              <td class="col-source">
                <span class="problem-source {problem.source}">
                  <img
                    src={problem.source === 'codeforces' ? codeforcesLogo : kattisLogo}
                    alt={problem.source}
                    class="source-icon-small"
                  />
                </span>
              </td>
              <td class="col-name">
                <a href={problem.url} target="_blank" rel="noopener noreferrer">
                  {problem.name}
                </a>
              </td>
              <td class="col-difficulty">
                <span
                  class="rating-badge tooltip {isTopRow(index)
                    ? 'tooltip-bottom'
                    : ''} {problem.source === 'codeforces' ? 'tooltip-no-cursor' : ''}"
                  style="background-color: var(--{getRatingColor(problem.difficulty)}-color)"
                >
                  {problem.difficulty}
                  <span
                    class="tooltip-text {problem.source === 'codeforces' ? 'tooltip-compact' : ''}"
                    >{getDifficultyTooltip(problem)}</span
                  >
                </span>
              </td>
              <td class="col-author">
                <a href={problem.addedByUrl} target="_blank" rel="noopener noreferrer">
                  @{problem.addedBy}
                </a>
              </td>
              <td class="col-feedback">
                <div class="feedback-buttons">
                  <button
                    class="like-button"
                    class:active={problem.id && userFeedback[problem.id] === 'like'}
                    on:click={() => problem.id && handleLike(problem.id, true)}
                    title={problem.id && userFeedback[problem.id] === 'like'
                      ? 'Undo like'
                      : 'Like this problem'}
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
                    class:active={problem.id && userFeedback[problem.id] === 'dislike'}
                    on:click={() => problem.id && handleLike(problem.id, false)}
                    title={problem.id && userFeedback[problem.id] === 'dislike'
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
    padding: 1.5rem 1rem;
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
    justify-content: flex-end;
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

  /* View options */
  .view-options {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }

  .view-option-button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-option-button:hover {
    border-color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }

  .view-option-button.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .container {
      padding: 1rem 0.5rem;
    }

    .filter-bar {
      padding: 0.8rem;
      gap: 1rem;
      flex-direction: column;
      align-items: stretch;
    }

    .source-buttons,
    .view-options {
      flex-wrap: wrap;
      justify-content: center;
    }

    .source-button,
    .view-option-button {
      flex: 1;
      min-width: 100px;
      justify-content: center;
    }

    .table {
      min-width: 800px; /* Ensure table has minimum width on mobile */
    }

    th,
    td {
      padding: 0.6rem;
    }

    .feedback-buttons {
      white-space: nowrap;
      display: flex;
      justify-content: flex-end;
      gap: 0.3rem;
    }

    .like-button,
    .dislike-button {
      padding: 0.4rem;
      min-width: 40px;
      justify-content: center;
    }

    .like-button span,
    .dislike-button span {
      font-size: 0.8rem;
    }

    .thumbs-up,
    .thumbs-down {
      width: 14px;
      height: 14px;
    }

    /* Adjust column widths for mobile */
    .col-source {
      width: 30px;
      min-width: 30px;
    }

    .col-name {
      min-width: 150px;
    }

    .col-difficulty {
      width: 60px;
      min-width: 60px;
    }

    .col-author {
      width: 100px;
      min-width: 100px;
    }

    .col-feedback {
      width: 100px;
      min-width: 100px;
    }

    .tooltip .tooltip-text {
      width: 220px;
      font-size: 0.75rem;
      left: 0;
      transform: translateX(0);
    }

    .tooltip .tooltip-text::after {
      left: 10%;
    }

    /* Ensure tooltip doesn't get cut off on the right edge */
    tr:last-child .tooltip .tooltip-text,
    tr:nth-last-child(2) .tooltip .tooltip-text {
      left: auto;
      right: 0;
      transform: translateX(0);
    }

    tr:last-child .tooltip .tooltip-text::after,
    tr:nth-last-child(2) .tooltip .tooltip-text::after {
      left: auto;
      right: 10%;
    }
  }

  @media (max-width: 480px) {
    .source-button,
    .view-option-button {
      font-size: 0.8rem;
      padding: 0.4rem 0.6rem;
    }

    .source-icon {
      width: 14px;
      height: 14px;
    }

    .problem-tag {
      font-size: 0.65rem;
    }

    th {
      font-size: 0.8rem;
    }

    .feedback-buttons {
      gap: 0.2rem;
    }

    .like-button,
    .dislike-button {
      padding: 0.3rem;
      min-width: 36px;
    }
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: var(--secondary-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    align-items: center;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .problem-count {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .problem-source {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .source-icon-small {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .reset-filters-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.4rem 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-color);
    font-size: 0.9rem;
    margin-left: auto;
  }

  .reset-filters-btn:hover {
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .source-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .source-button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .source-button:hover {
    border-color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }

  .source-button.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .source-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--secondary-color);
    overflow: hidden;
  }

  th,
  td {
    padding: 0.8rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    font-weight: bold;
    background-color: var(--tertiary-color);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }

  .th-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .source-button-small {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .source-button-small:hover {
    border-color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }

  .source-button-small.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .source-icon-tiny {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  .author-select {
    padding: 0.2rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.8rem;
    max-width: 120px;
  }

  .author-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }

  .reset-filters-btn-small {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    width: 24px;
    height: 24px;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-color);
  }

  .reset-filters-btn-small:hover {
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem 1.2rem;
    background-color: var(--secondary-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .source-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .contributor-select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.9rem;
    min-width: 150px;
  }

  .contributor-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  }

  .reset-filters-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.5rem 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-color);
    font-size: 0.9rem;
    margin-left: auto;
  }

  .reset-filters-btn:hover {
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  /* Fixed column widths */
  .col-source {
    width: 40px;
    min-width: 40px;
  }

  .col-name {
    width: 40%;
    min-width: 200px;
  }

  .col-difficulty {
    width: 80px;
    min-width: 80px;
    text-align: center;
  }

  .col-author {
    width: 20%;
    min-width: 150px;
  }

  .col-feedback {
    width: 15%;
    min-width: 150px;
    text-align: right;
  }

  /* Update table styles to handle fixed widths */
  .table {
    table-layout: fixed;
    width: 100%;
    min-width: 800px; /* Minimum total width to prevent squishing */
  }

  .hidden {
    display: none;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
    background-color: var(--secondary-color);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--secondary-color);
    overflow: hidden;
  }

  .tooltip {
    position: relative;
    cursor: help;
  }

  .tooltip.tooltip-no-cursor {
    cursor: default;
  }

  .tooltip .tooltip-text {
    visibility: hidden;
    width: 280px;
    background-color: var(--secondary-color);
    color: var(--text-color);
    text-align: left;
    border-radius: 6px;
    padding: 10px;
    position: absolute;
    z-index: 1000;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border-color);
    font-weight: normal;
    font-size: 0.8rem;
    white-space: pre-line;
    line-height: 1.4;
  }

  .tooltip .tooltip-text.tooltip-compact {
    width: auto;
    min-width: 0;
    max-width: fit-content;
    padding: 6px 10px;
    text-align: center;
    white-space: nowrap;
  }

  .tooltip .tooltip-text::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--secondary-color) transparent transparent transparent;
  }

  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }

  /* Tooltip that appears below the element instead of above */
  .tooltip.tooltip-bottom .tooltip-text {
    bottom: auto;
    top: 125%;
  }

  .tooltip.tooltip-bottom .tooltip-text::after {
    top: auto;
    bottom: 100%;
    border-color: transparent transparent var(--secondary-color) transparent;
  }
</style>
