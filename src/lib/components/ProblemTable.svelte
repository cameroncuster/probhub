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

<div class="overflow-x-auto rounded-lg shadow-sm mt-4 bg-[var(--color-secondary)]">
  <table class="w-full border-collapse bg-[var(--color-secondary)] overflow-hidden min-w-[900px]">
    <thead>
      <tr>
        <th
          class="p-3 text-left bg-[var(--color-tertiary)] sticky top-0 z-10 font-bold w-10 min-w-10"
        ></th>
        <th
          class="p-3 text-left bg-[var(--color-tertiary)] sticky top-0 z-10 font-bold w-[30%] min-w-[180px]"
          >Problem</th
        >
        <th
          class="p-3 text-center bg-[var(--color-tertiary)] sticky top-0 z-10 font-bold w-20 min-w-20"
          >Difficulty</th
        >
        <th
          class="p-3 text-left bg-[var(--color-tertiary)] sticky top-0 z-10 font-bold w-[15%] min-w-[120px]"
          >Topic</th
        >
        <th
          class="p-3 text-left bg-[var(--color-tertiary)] sticky top-0 z-10 font-bold w-[15%] min-w-[120px]"
          >Added By</th
        >
        <th
          class="p-3 text-center bg-[var(--color-tertiary)] sticky top-0 z-10 font-bold w-[15%] min-w-[150px]"
          >Feedback</th
        >
      </tr>
    </thead>
    <tbody>
      {#each problems as problem, index}
        <tr class="border-b border-[var(--color-border)] last:border-b-0 hover:bg-black/5">
          <td class="p-3">
            <span class="flex items-center justify-center">
              <img
                src={problem.source === 'codeforces' ? codeforcesLogo : kattisLogo}
                alt={problem.source}
                class="w-6 h-6 object-contain"
              />
            </span>
          </td>
          <td class="p-3">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
            >
              {problem.name}
            </a>
          </td>
          <td class="p-3 text-center">
            <span
              class="inline-block px-2 py-1 rounded text-white font-bold relative {isTopRow(index)
                ? 'group'
                : ''} {problem.source === 'codeforces' ? 'cursor-default' : 'cursor-help'}"
              style="background-color: var(--color-{getRatingColor(problem.difficulty)})"
            >
              {problem.difficulty}
              <span
                class="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[var(--color-secondary)] text-[var(--color-text)] text-left rounded-md p-2.5 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md border border-[var(--color-border)] font-normal text-xs whitespace-pre-line leading-relaxed w-[280px] {problem.source ===
                'codeforces'
                  ? 'w-auto min-w-0 max-w-fit p-1.5 px-2.5 text-center whitespace-nowrap'
                  : ''} {!isTopRow(index) ? 'bottom-auto top-full' : ''}"
              >
                {getDifficultyTooltip(problem)}
              </span>
            </span>
          </td>
          <td class="p-3">
            {#if problem.type}
              <span
                class="inline-block px-2 py-1 rounded text-[var(--color-text)] bg-[var(--color-tertiary)] text-sm"
              >
                {problem.type}
              </span>
            {/if}
          </td>
          <td class="p-3">
            <a
              href={problem.addedByUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
            >
              @{problem.addedBy}
            </a>
          </td>
          <td class="p-3 text-right">
            <div class="flex gap-2 justify-end">
              <button
                class="flex items-center gap-1 bg-transparent border border-[var(--color-border)] rounded px-2 py-1 cursor-pointer transition-all duration-200 text-[var(--color-text)] hover:bg-[color-mix(in_oklab,rgb(34_197_94)_10%,transparent)] hover:border-[color-mix(in_oklab,rgb(34_197_94)_50%,transparent)] hover:text-[rgb(34_197_94)] {problem.id &&
                userFeedback[problem.id] === 'like'
                  ? 'bg-[color-mix(in_oklab,rgb(34_197_94)_10%,transparent)] border-[color-mix(in_oklab,rgb(34_197_94)_50%,transparent)] text-[rgb(34_197_94)]'
                  : ''}"
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
                  class="stroke-2"
                >
                  <path
                    d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                  ></path>
                </svg>
                <span>{problem.likes}</span>
              </button>
              <button
                class="flex items-center gap-1 bg-transparent border border-[var(--color-border)] rounded px-2 py-1 cursor-pointer transition-all duration-200 text-[var(--color-text)] hover:bg-[color-mix(in_oklab,rgb(239_68_68)_10%,transparent)] hover:border-[color-mix(in_oklab,rgb(239_68_68)_50%,transparent)] hover:text-[rgb(239_68_68)] {problem.id &&
                userFeedback[problem.id] === 'dislike'
                  ? 'bg-[color-mix(in_oklab,rgb(239_68_68)_10%,transparent)] border-[color-mix(in_oklab,rgb(239_68_68)_50%,transparent)] text-[rgb(239_68_68)]'
                  : ''}"
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
                  class="stroke-2"
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
