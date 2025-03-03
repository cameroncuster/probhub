<script>
  // About page for Probhub
</script>

<svelte:head>
  <title>Probhub | About</title>
  <meta name="description" content="About this app" />
</svelte:head>

<div class="container">
  <section>
    <h2>Probhub</h2>
    <p>
      Probhub is a collection of hand-picked problems. If you are new to competitive programming you
      can learn the fundamentals at some of these sites:
    </p>
    <ul>
      <li>
        <a href="https://cses.fi/" target="_blank" rel="noopener noreferrer">CSES Problem Set</a>
      </li>
      <li>
        <a href="https://cp-algorithms.com/" target="_blank" rel="noopener noreferrer"
          >CP Algorithms</a
        >
      </li>
      <li>
        <a href="https://usaco.guide/" target="_blank" rel="noopener noreferrer">USACO Guide</a>
      </li>
      <li>
        <a href="https://atcoder.jp/contests/dp" target="_blank" rel="noopener noreferrer"
          >AtCoder DP Contest</a
        >
      </li>
      <li>
        <a href="https://codeforces.com/edu/courses" target="_blank" rel="noopener noreferrer"
          >Codeforces EDU</a
        >
      </li>
    </ul>

    <h3>Beyond the Fundamentals</h3>
    <p>
      But what about once you've learned the fundamentals? How should you practice then? Experts
      like Umnik recommend working through an archive of problems (as described in this
      <a href="https://codeforces.com/blog/entry/98806" target="_blank" rel="noopener noreferrer">
        Codeforces blog post</a
      >).
    </p>

    <p>
      It's a great approach, but the quality of problems on any given archive can vary greatly. If
      only there were a way to extract the highest quality problems available on the internet. We
      think we can do this! Probhub is a social site that allows users to curate and maintain their
      own lists of recommendations.
    </p>

    <h3>Canon Problems</h3>
    <p>
      Inspired by "Canon Events" from <i>Across the Spiderverse</i>, Canon Problems are the problems
      that fundamentally changed the way you think about approaching competitive programming
      problems. These are the problems that:
    </p>
    <ul>
      <li>Introduce you to a new algorithm or data structure</li>
      <li>Show you a clever application of a technique you already know</li>
      <li>Challenge your problem-solving approach in a unique way</li>
    </ul>
    <p>
      Probhub aims to collect these Canon Problems to enable you to maximize the effectiveness of
      your practice. By leveraging the collective wisdom of the competitive programming community,
      we can identify and share the most impactful problems worth your time.
    </p>
  </section>

  <section>
    <h2>Contribute</h2>
    <p>
      Probhub is an open-source project, and we welcome contributions from the community. If you'd
      like to help improve Probhub, please check out our <a
        href="https://github.com/cameroncuster/probhub"
        target="_blank"
        rel="noopener noreferrer">GitHub repository</a
      >.
    </p>
  </section>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    margin-bottom: 2rem;
  }

  section {
    margin-bottom: 2.5rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--accent-color);
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  strong {
    color: var(--heading-color);
  }
</style>
