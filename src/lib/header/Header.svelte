<script lang="ts">
  import { page } from '$app/stores';
  import logo from '$lib/assets/favicon.png';
</script>

<header class="bg-gray-50 shadow-sm sticky top-0 z-50 py-3">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
    <div class="flex items-center">
      <a href="/" class="flex items-center text-gray-800 font-bold text-xl" aria-label="Home">
        <img src={logo} alt="Probhub" class="w-7 h-7 mr-2" />
        <span class="hidden sm:inline">Probhub</span>
      </a>
    </div>

    <nav class="flex items-center">
      <ul class="flex space-x-6">
        <li class="relative">
          <a
            href="/"
            class={`text-gray-800 font-semibold hover:text-blue-600 transition-colors py-2 block ${$page.url.pathname === '/' ? 'text-blue-600' : ''}`}
          >
            Problems
          </a>
          {#if $page.url.pathname === '/'}
            <div class="absolute bottom-[-0.5rem] left-0 w-full h-0.5 bg-blue-600 rounded"></div>
          {/if}
        </li>
        <li class="relative">
          <a
            href="/about"
            class={`text-gray-800 font-semibold hover:text-blue-600 transition-colors py-2 block ${$page.url.pathname === '/about' ? 'text-blue-600' : ''}`}
          >
            About
          </a>
          {#if $page.url.pathname === '/about'}
            <div class="absolute bottom-[-0.5rem] left-0 w-full h-0.5 bg-blue-600 rounded"></div>
          {/if}
        </li>
      </ul>
    </nav>
  </div>
</header>
