<script>
  // Footer component
</script>

<footer>
  <div class="container">
    <div class="footer-content">
      <div class="copyright">
        © {new Date().getFullYear()} ProbHub
      </div>
      <div class="links">
        <a
          href="https://github.com/cameroncuster/probhub"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            ></path>
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  footer {
    background-color: var(--secondary-color);
    padding: 1.5rem 0;
    margin-top: auto;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .copyright {
    color: var(--text-color);
    font-size: 0.9rem;
  }

  .links {
    display: flex;
    gap: 1.5rem;
  }

  .links a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s ease;
  }

  .links a:hover {
    color: var(--accent-color);
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .footer-content {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    footer {
      padding: 1.25rem 0;
    }

    .container {
      padding: 0 0.75rem;
    }

    .copyright,
    .links a {
      font-size: 0.8rem;
    }

    .links a svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
