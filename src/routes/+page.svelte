<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProblems, updateProblemFeedback } from '$lib/services/codeforces';
  import type { Problem } from '$lib/types/problem';

  import codeforcesLogo from '../assets/codeforces.png';
  import kattisLogo from '../assets/kattis.png';

  let problems: Problem[] = [];
  let loading: boolean = false;
  let error: string | null = null;
  let userFeedback: Record<string, 'like' | 'dislike' | null> = {};

  // Filtering options
  let selectedSource: 'all' | 'codeforces' | 'kattis' = 'all';
  let filteredProblems: Problem[] = [];

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

    // Shuffle problems within each score group
    Object.values(problemsByScore).forEach((group) => {
      // Fisher-Yates shuffle algorithm
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [group[i], group[j]] = [group[j], group[i]];
      }
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

        // Update filtered problems
        updateFilteredProblems();

        // Save feedback to localStorage
        localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

        // Sort problems after updating
        problems = sortProblemsByScore(problems);

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

        // Update filtered problems
        updateFilteredProblems();

        // Save feedback to localStorage
        localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

        // Sort problems after updating
        problems = sortProblemsByScore(problems);

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

      // Update filtered problems
      updateFilteredProblems();

      // Save feedback to localStorage
      localStorage.setItem('userFeedback', JSON.stringify(userFeedback));

      // Sort problems after updating
      problems = sortProblemsByScore(problems);

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
      // Sort by score
      problems = sortProblemsByScore(fetchedProblems);
      // Update filtered problems
      updateFilteredProblems();
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

  // Function to select source
  function selectSource(source: 'all' | 'codeforces' | 'kattis') {
    selectedSource = source;
    updateFilteredProblems();
  }

  // Function to update filtered problems
  function updateFilteredProblems() {
    // First filter the problems
    const filtered = filterProblems(problems);
    // Then sort by score
    filteredProblems = sortProblemsByScore(filtered);
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
  <title>Probhub</title>
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
    <div class="filter-bar">
      <div class="source-buttons">
        <button
          class="source-button {selectedSource === 'all' ? 'active' : ''}"
          on:click={() => selectSource('all')}
          title="All Problems"
        >
          All Problems
        </button>
        <button
          class="source-button {selectedSource === 'codeforces' ? 'active' : ''}"
          on:click={() => selectSource('codeforces')}
          title="Codeforces"
        >
          <img src={codeforcesLogo} alt="Codeforces" class="source-icon" />
          Codeforces
        </button>
        <button
          class="source-button {selectedSource === 'kattis' ? 'active' : ''}"
          on:click={() => selectSource('kattis')}
          title="Kattis"
        >
          <img src={kattisLogo} alt="Kattis" class="source-icon" />
          Kattis
        </button>
      </div>
    </div>

    <table class="table">
      <tbody>
        {#each filteredProblems as problem}
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
                class="rating-badge"
                style="background-color: var(--{getRatingColor(problem.difficulty)}-color)"
                title="{getRatingTierName(problem.difficulty)} (Rating: {problem.difficulty})"
              >
                {problem.difficulty}
              </span>
            </td>
            <td class="col-tags">
              <div class="problem-tags">
                {#each problem.tags as tag}
                  <span class="problem-tag">{tag}</span>
                {/each}
              </div>
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

    .filter-bar {
      padding: 0.8rem;
      gap: 1rem;
      flex-direction: column;
      align-items: stretch;
    }

    .source-buttons {
      flex-wrap: wrap;
      justify-content: center;
    }

    .source-button {
      flex: 1;
      min-width: 100px;
      justify-content: center;
    }

    .table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
    }

    td {
      padding: 0.6rem;
    }

    .problem-tags {
      max-width: 200px;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .problem-tags::-webkit-scrollbar {
      display: none;
    }

    .feedback-buttons {
      white-space: nowrap;
    }
  }

  @media (max-width: 480px) {
    .source-button {
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
    margin-top: 1rem;
    background-color: var(--secondary-color);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  td {
    padding: 0.8rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
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
    width: 30%;
    min-width: 200px;
  }

  .col-difficulty {
    width: 80px;
    min-width: 80px;
    text-align: center;
  }

  .col-tags {
    width: 40%;
    min-width: 250px;
  }

  .col-author {
    width: 120px;
    min-width: 120px;
  }

  .col-feedback {
    width: 120px;
    min-width: 120px;
    text-align: right;
  }

  /* Update table styles to handle fixed widths */
  .table {
    table-layout: fixed;
    width: 100%;
    min-width: 800px; /* Minimum total width to prevent squishing */
  }
</style>
