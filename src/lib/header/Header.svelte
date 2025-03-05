<script>
  import { page } from '$app/stores';
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

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .logo span {
      display: none;
    }
  }
</style>
