<script lang="ts">
  import type { Problem } from '$lib/services/problem';
  // Use static image paths instead of imports
  const codeforcesLogo = '/images/codeforces.png';
  const kattisLogo = '/images/kattis.png';

  // Props
  export let problems: Problem[] = [];
  export let userFeedback: Record<string, 'like' | 'dislike' | null> = {};
  export let onLike: (problemId: string, isLike: boolean) => Promise<void>;

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
</script>

<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th class="col-source"></th>
        <th class="col-name">Problem</th>
        <th class="col-difficulty">Difficulty</th>
        <th class="col-topic">Topic</th>
        <th class="col-author">Added By</th>
        <th class="col-feedback"></th>
      </tr>
    </thead>
    <tbody>
      {#each problems as problem, index}
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
              style="background-color: var(--color-{getRatingColor(problem.difficulty)})"
            >
              {problem.difficulty}
              <span class="tooltip-text {problem.source === 'codeforces' ? 'tooltip-compact' : ''}"
                >{getDifficultyTooltip(problem)}</span
              >
            </span>
          </td>
          <td class="col-topic">
            {#if problem.type}
              <span class="topic-badge">{problem.type}</span>
            {/if}
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
                on:click={() => problem.id && onLike(problem.id, true)}
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
                on:click={() => problem.id && onLike(problem.id, false)}
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

<style>
  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
    background-color: var(--color-secondary);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-secondary);
    overflow: hidden;
  }

  th,
  td {
    padding: 0.8rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    font-weight: bold;
    background-color: var(--color-tertiary);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* Fixed column widths */
  .col-source {
    width: 40px;
    min-width: 40px;
  }

  .col-name {
    width: 30%;
    min-width: 180px;
  }

  .col-difficulty {
    width: 80px;
    min-width: 80px;
    text-align: center;
  }

  .col-topic {
    width: 15%;
    min-width: 120px;
  }

  .col-author {
    width: 15%;
    min-width: 120px;
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
    min-width: 900px; /* Increased minimum width to accommodate new column */
  }

  /* Topic badge styling */
  .topic-badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background-color: var(--color-tertiary);
    font-size: 0.85rem;
  }

  .topic-badge.empty {
    color: var(--color-text-muted);
    background-color: transparent;
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
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-text);
  }

  .like-button svg,
  .dislike-button svg {
    stroke: var(--color-text);
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
    background-color: var(--color-secondary);
    color: var(--color-text);
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
    border: 1px solid var(--color-border);
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
    border-color: var(--color-secondary) transparent transparent transparent;
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
    border-color: transparent transparent var(--color-secondary) transparent;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
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
      min-width: 140px;
    }

    .col-topic {
      width: 80px;
      min-width: 80px;
    }

    .col-difficulty {
      width: 60px;
      min-width: 60px;
    }

    .col-author {
      width: 90px;
      min-width: 90px;
    }

    .col-feedback {
      width: 90px;
      min-width: 90px;
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
</style>
