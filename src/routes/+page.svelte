<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProblems, updateProblemFeedback } from '$lib/services/problem';
  import type { Problem } from '$lib/services/problem';
  import ProblemTable from '$lib/components/ProblemTable.svelte';

  let problems: Problem[] = [];
  let loading: boolean = false;
  let error: string | null = null;
  let userFeedback: Record<string, 'like' | 'dislike' | null> = {};

  // Filtering options
  let selectedSource: 'all' | 'codeforces' | 'kattis' = 'all';
  let filteredProblems: Problem[] = [];

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

<div class="max-w-[1200px] mx-auto px-4 py-6 overflow-x-auto">
  {#if loading}
    <div class="text-center py-8">
      <div
        class="w-9 h-9 border-4 border-[rgba(0,0,0,0.1)] border-l-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4"
      ></div>
      <p>Loading problems...</p>
    </div>
  {:else if error}
    <div class="text-center py-8 text-red-500">
      <p>{error}</p>
      <button
        class="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-opacity-90 transition-colors"
        on:click={() => window.location.reload()}>Try Again</button
      >
    </div>
  {:else if problems.length === 0}
    <div class="text-center py-8 text-[var(--color-text-muted)]">
      <p>No problems found. Check back later or submit some problems!</p>
    </div>
  {:else}
    <ProblemTable problems={filteredProblems} {userFeedback} onLike={handleLike} />
  {/if}
</div>
