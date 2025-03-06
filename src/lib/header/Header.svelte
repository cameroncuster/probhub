<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/services/auth';
  import { signInWithGithub, signOut } from '$lib/services/auth';

  async function handleLogin() {
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<header>
  <div class="container">
    <div class="logo">
      <a href="/" aria-label="Home">
        <span>Probhub</span>
      </a>
    </div>

    <nav>
      <ul>
        <li class:active={$page.url.pathname === '/'}>
          <a href="/">Problems</a>
        </li>
        <li class:active={$page.url.pathname === '/about'}>
          <a href="/about">About</a>
        </li>
      </ul>
      <div class="auth-buttons">
        {#if $user}
          <button class="logout-button" on:click={handleLogout}>Logout</button>
        {:else}
          <button class="login-button" on:click={handleLogin} title="Login with GitHub">
            <span class="login-text">Sign in</span>
          </button>
        {/if}
      </div>
    </nav>
  </div>
</header>

<style>
  header {
    background-color: var(--secondary-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0.75rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .logo a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--heading-color);
    font-weight: 700;
    font-size: 1.25rem;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1.5rem;
  }

  li {
    position: relative;
  }

  li.active::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--accent-color);
    border-radius: 1px;
  }

  nav a {
    color: var(--heading-color);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 1rem;
    padding: 0.5rem 0;
    display: block;
  }

  a:hover {
    color: var(--accent-color);
  }

  .auth-buttons {
    display: flex;
    align-items: center;
  }

  .login-button,
  .logout-button {
    border: none;
    border-radius: 4px;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .login-button {
    background-color: #4285f4;
    color: white;
    border: 1px solid #4285f4;
    border-radius: 4px;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .login-button:hover {
    background-color: #3367d6;
    border-color: #3367d6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .logout-button {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .logout-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--text-color);
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    nav {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }

    ul {
      gap: 1rem;
    }

    .login-button,
    .logout-button {
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0 0.75rem;
    }

    .logo span {
      font-size: 1.1rem;
    }

    nav {
      gap: 0.75rem;
    }

    ul {
      gap: 0.75rem;
    }

    nav a {
      font-size: 0.9rem;
    }
  }
</style>
