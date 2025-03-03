<script>
  // About page for Probhub
</script>

<svelte:head>
  <title>Probhub | About</title>
  <meta name="description" content="About this app" />
</svelte:head>

<div class="container">
  <div class="card">
    <h1>About Probhub</h1>

    <section>
      <h2>What is Probhub?</h2>
      <p>
        Probhub is a curated collection of programming problems designed to help you improve your
        coding skills, prepare for technical interviews, and master algorithmic thinking. Our
        platform aggregates problems from various competitive programming websites, starting with
        Codeforces, and organizes them in a way that makes it easy to find problems that match your
        skill level and learning goals.
      </p>
    </section>

    <section>
      <h2>Why Use Probhub?</h2>
      <ul>
        <li>
          <strong>Organized Learning Path:</strong> Problems are categorized by difficulty and topic,
          making it easy to follow a structured learning path.
        </li>
        <li>
          <strong>Comprehensive Filtering:</strong> Find problems that match your specific needs using
          our advanced filtering system.
        </li>
        <li>
          <strong>Track Your Progress:</strong> Keep track of which problems you've solved and which
          ones you still need to tackle.
        </li>
        <li>
          <strong>Community Insights:</strong> See how many other programmers have solved each problem
          and get a sense of its popularity and difficulty.
        </li>
      </ul>
    </section>

    <section>
      <h2>How to Use Probhub</h2>
      <p>Getting started with Probhub is simple:</p>
      <ol>
        <li>Browse our <a href="/">Problems</a> page to see all available problems.</li>
        <li>
          Use the filters to narrow down problems by difficulty, tags, or search for specific
          problem names.
        </li>
        <li>
          Click on a problem to be taken directly to its original source where you can read the full
          description and submit your solution.
        </li>
        <li>Come back regularly as we continue to add more problems and features!</li>
      </ol>
    </section>

    <section>
      <h2>Future Plans</h2>
      <p>
        We're constantly working to improve Probhub. Here are some features we plan to add in the
        future:
      </p>
      <ul>
        <li>
          Support for more competitive programming platforms (LeetCode, HackerRank, AtCoder, etc.)
        </li>
        <li>User accounts to track your solved problems</li>
        <li>Personalized problem recommendations based on your skill level</li>
        <li>Discussion forums for each problem</li>
        <li>Detailed statistics and analytics about your problem-solving journey</li>
      </ul>
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
