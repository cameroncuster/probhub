<script lang="ts">
import { browser } from '$app/environment';
import { onMount } from 'svelte';

// Props
export let topics: string[] = [];
export let selectedTopic: string | null = null;
export let onSelectTopic: (topic: string | null) => void;
export let isMobile: boolean = false;
export let isOpen: boolean = false;
export let onToggle: () => void;

let touchStartX = 0;
let touchEndX = 0;

// Format topic name for display
function formatTopicName(topic: string): string {
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

// Handle touch start
function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
}

// Handle touch end
function handleTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0].clientX;
  handleSwipe();
}

// Handle swipe
function handleSwipe() {
  if (!isMobile) return;

  const swipeThreshold = 70; // Minimum distance required for a swipe

  // Left to right swipe (open sidebar)
  if (touchEndX - touchStartX > swipeThreshold && !isOpen) {
    onToggle();
  }

  // Right to left swipe (close sidebar)
  if (touchStartX - touchEndX > swipeThreshold && isOpen) {
    onToggle();
  }
}

// Add touch event listeners
onMount(() => {
  if (browser) {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }
});
</script>

<!-- Mobile sidebar toggle -->
<button
  class="sidebar-toggle fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
  on:click={onToggle}
  aria-label="Toggle filters"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
</button>

<!-- Overlay for mobile -->
{#if isOpen && isMobile}
  <div
    class="bg-opacity-50 fixed inset-0 z-30 bg-black backdrop-blur-sm transition-opacity md:hidden"
    on:click={onToggle}
    on:keydown={(e) => e.key === 'Escape' && onToggle()}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Desktop sidebar (always visible) -->
<div class="hidden md:block md:w-64 md:flex-shrink-0">
  <div class="h-full border-r border-[var(--color-border)] pr-6">
    <div class="sticky top-4 py-4">
      <div class="space-y-1">
        <button
          class={`w-full rounded-md px-3 py-2 text-left transition-colors ${
            selectedTopic === null
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text)] hover:bg-[var(--color-tertiary)]'
          }`}
          on:click={() => onSelectTopic(null)}
        >
          All Topics
        </button>

        {#each topics as topic}
          <button
            class={`w-full rounded-md px-3 py-2 text-left transition-colors ${
              selectedTopic === topic
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text)] hover:bg-[var(--color-tertiary)]'
            }`}
            on:click={() => onSelectTopic(topic)}
          >
            {formatTopicName(topic)}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<!-- Mobile sidebar (slide in from left) -->
<div
  class="sidebar fixed inset-y-0 left-0 z-40 w-[80%] max-w-[300px] transform overflow-hidden bg-[var(--color-secondary)] shadow-lg transition-transform duration-300 ease-in-out md:hidden"
  style={`transform: translateX(${isOpen ? '0' : '-100%'});`}
>
  <div class="h-full overflow-y-auto p-4 pt-16">
    <div class="space-y-1">
      <button
        class={`w-full rounded-md px-3 py-2 text-left transition-colors ${
          selectedTopic === null
            ? 'bg-[var(--color-primary)] text-white'
            : 'text-[var(--color-text)] hover:bg-[var(--color-tertiary)]'
        }`}
        on:click={() => onSelectTopic(null)}
      >
        All Topics
      </button>

      {#each topics as topic}
        <button
          class={`w-full rounded-md px-3 py-2 text-left transition-colors ${
            selectedTopic === topic
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text)] hover:bg-[var(--color-tertiary)]'
          }`}
          on:click={() => onSelectTopic(topic)}
        >
          {formatTopicName(topic)}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
/* Add any component-specific styles here */
</style>
