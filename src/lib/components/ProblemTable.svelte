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
</script>

<div class="mt-4 overflow-x-auto rounded-lg bg-[var(--color-secondary)] shadow-sm">
  <table
    class="w-full min-w-[900px] table-fixed border-collapse overflow-hidden bg-[var(--color-secondary)]"
  >
    <thead>
      <tr>
        <th class="sticky top-0 z-10 w-[5%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
        ></th>
        <th class="sticky top-0 z-10 w-[30%] bg-[var(--color-tertiary)] p-3 text-left font-bold"
          >Problem</th
        >
        <th class="sticky top-0 z-10 w-[10%] bg-[var(--color-tertiary)] p-3 text-center font-bold"
          >Difficulty</th
        >
        <th class="sticky top-0 z-10 w-[10%] bg-[var(--color-tertiary)] p-3 text-left font-bold"
          >Topic</th
        >
        <th class="sticky top-0 z-10 w-[20%] bg-[var(--color-tertiary)] p-3 text-left font-bold"
          >Added By</th
        >
        <th class="sticky top-0 z-10 w-[20%] bg-[var(--color-tertiary)] p-3 text-right font-bold"
        ></th>
      </tr>
    </thead>
    <tbody>
      {#each problems as problem}
        <tr class="border-b border-[var(--color-border)] last:border-b-0 hover:bg-black/5">
          <td class="p-3 text-center">
            <span class="flex items-center justify-center">
              <img
                src={problem.source === 'codeforces' ? codeforcesLogo : kattisLogo}
                alt={problem.source}
                class="h-6 w-6 object-contain"
              />
            </span>
          </td>
          <td class="truncate p-3">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
              title={problem.name}
            >
              {problem.name}
            </a>
          </td>
          <td class="p-3 text-center">
            <span
              class="group relative inline-block rounded px-2 py-1 font-bold
                text-white
                 {problem.source === 'codeforces' ? 'cursor-default' : 'cursor-help'}"
              style="background-color: var(--color-{getRatingColor(problem.difficulty)})"
            >
              {problem.difficulty}
              <span
                class="invisible absolute bottom-full left-1/2 z-50 -translate-x-1/2 transform rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] text-left text-xs leading-relaxed font-normal whitespace-pre-line text-[var(--color-text)] opacity-0 shadow-md transition-opacity duration-300 group-hover:visible group-hover:opacity-100 {problem.source === 'codeforces'
                  ? 'w-auto max-w-fit min-w-0 p-1.5 px-3 text-center whitespace-nowrap'
                  : 'w-[280px] p-2.5'} mb-1"
              >
                {getDifficultyTooltip(problem)}
              </span>
            </span>
          </td>
          <td class="p-3">
            {#if problem.type}
              <span
                class="inline-block rounded bg-[var(--color-tertiary)] px-2 py-1 text-sm text-[var(--color-text)]"
              >
                {problem.type}
              </span>
            {:else}
              <span class="text-[var(--color-text-muted)]">-</span>
            {/if}
          </td>
          <td class="truncate p-3">
            <a
              href={problem.addedByUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
              title={"@" + problem.addedBy}
            >
              @{problem.addedBy}
            </a>
          </td>
          <td class="p-3 text-right">
            <div class="flex justify-end gap-2">
              {#if problem.id}
                {@const hasLiked = userFeedback[problem.id] === 'like'}
                {@const hasDisliked = userFeedback[problem.id] === 'dislike'}

                <button
                  class={`flex cursor-pointer items-center gap-1 rounded border px-2 py-1 transition-all duration-200
                    ${hasLiked 
                      ? 'border-[color-mix(in_oklab,rgb(34_197_94)_50%,transparent)] bg-[color-mix(in_oklab,rgb(34_197_94)_10%,transparent)] text-[rgb(34_197_94)]' 
                      : 'border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:border-[color-mix(in_oklab,rgb(34_197_94)_50%,transparent)] hover:bg-[color-mix(in_oklab,rgb(34_197_94)_10%,transparent)] hover:text-[rgb(34_197_94)]'
                    }`}
                  on:click={() => onLike(problem.id!, true)}
                  title={hasLiked ? 'Undo like' : 'Like this problem'}
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
                  class={`flex cursor-pointer items-center gap-1 rounded border px-2 py-1 transition-all duration-200
                    ${hasDisliked 
                      ? 'border-[color-mix(in_oklab,rgb(239_68_68)_50%,transparent)] bg-[color-mix(in_oklab,rgb(239_68_68)_10%,transparent)] text-[rgb(239_68_68)]' 
                      : 'border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:border-[color-mix(in_oklab,rgb(239_68_68)_50%,transparent)] hover:bg-[color-mix(in_oklab,rgb(239_68_68)_10%,transparent)] hover:text-[rgb(239_68_68)]'
                    }`}
                  on:click={() => onLike(problem.id!, false)}
                  title={hasDisliked ? 'Undo dislike' : 'Dislike this problem'}
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
              {/if}
            </div>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="6" class="p-6 text-center text-[var(--color-text-muted)]">
            No problems found with the selected filter.
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
