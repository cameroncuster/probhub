<script lang="ts">
  // About page for AlgoHub
</script>

<svelte:head>
  <title>AlgoHub | About</title>
  <meta name="description" content="About this app" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 py-8">
  <section class="mb-10">
    <h2 class="text-2xl mb-4 text-accent">AlgoHub</h2>
    <p class="mb-4 leading-relaxed">
      AlgoHub is a collection of hand-picked problems. If you are new to competitive programming you
      can learn the fundamentals at some of these sites:
    </p>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a href="https://cses.fi/" target="_blank" rel="noopener noreferrer">CSES Problem Set</a>
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://cp-algorithms.com/" target="_blank" rel="noopener noreferrer"
          >CP Algorithms</a
        >
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://usaco.guide/" target="_blank" rel="noopener noreferrer">USACO Guide</a>
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://atcoder.jp/contests/dp" target="_blank" rel="noopener noreferrer"
          >AtCoder DP Contest</a
        >
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://codeforces.com/edu/courses" target="_blank" rel="noopener noreferrer"
          >Codeforces EDU</a
        >
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Beyond the Fundamentals</h3>
    <p class="mb-4 leading-relaxed">
      But what about once you've learned the fundamentals? How should you practice then? Experts
      like Umnik recommend working through an archive of problems (as described in this
      <a href="https://codeforces.com/blog/entry/98806" target="_blank" rel="noopener noreferrer">
        Codeforces blog post</a
      >).
    </p>

    <p class="mb-4 leading-relaxed">
      It's a great approach, but the quality of problems on any given archive can vary greatly. If
      only there were a way to extract the highest quality problems available on the internet. We
      think we can do this! AlgoHub is a social site that allows users to curate and maintain their
      own lists of recommendations.
    </p>

    <h3 class="text-xl mb-4 text-accent">Canon Problems</h3>
    <p class="mb-4 leading-relaxed">
      Inspired by "Canon Events" from <i>Across the Spiderverse</i>, Canon Problems are the problems
      that after solving, fundamentally changed the way you approach competitive programming
      problems.
    </p>
    <p class="mb-4 leading-relaxed">
      AlgoHub aims to collect these Canon Problems to enable you to maximize the effectiveness of
      your practice by leveraging the collective knowledge of the competitive programming community.
    </p>
  </section>

  <section class="mb-10">
    <h2 class="text-2xl mb-4 text-accent">On Practicing</h2>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a href="https://codeforces.com/blog/entry/98806" target="_blank" rel="noopener noreferrer">
          How to practice Competitive Programming [Um_nik version]
        </a>
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://codeforces.com/blog/entry/98621" target="_blank" rel="noopener noreferrer">
          Self-deception: maybe why you're still grey after practicing every day
        </a>
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://codeforces.com/blog/entry/91114" target="_blank" rel="noopener noreferrer">
          My opinion on how to practice competitive programming
        </a>
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://codeforces.com/blog/entry/118882"
          target="_blank"
          rel="noopener noreferrer"
        >
          A Highly Experimental Training Plan for Beginners
        </a>
      </li>
    </ul>
  </section>

  <section class="mb-10">
    <h2 class="text-2xl mb-4 text-accent">Algorithm Libraries</h2>

    <h3 class="text-xl mb-4 text-accent">AlgoHub's Library of Choice</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/programming-team-code"
          target="_blank"
          rel="noopener noreferrer"
        >
          Programming Team Code
        </a> - A collection of algorithms for competitive programming in C++ and Rust, focused on correctness,
        efficiency, and readability.
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Optimized for ICPC</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/kth-competitive-programming/kactl"
          target="_blank"
          rel="noopener noreferrer">KACTL</a
        > - KTH Algorithm Competition Template Library
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/ucf-programming-team/hackpack-cpp"
          target="_blank"
          rel="noopener noreferrer">UCF Hackpack</a
        > - University of Central Florida's team reference document
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/foreverbell/acm-icpc-cheat-sheet"
          target="_blank"
          rel="noopener noreferrer">ACM-ICPC Cheat Sheet</a
        > - Comprehensive reference
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/UCF-Apocalypse-Attack/hackpack"
          target="_blank"
          rel="noopener noreferrer">UCF Apocalypse Attack Hackpack</a
        > - Another UCF team's reference
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Optimized for Online Contests</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/yosupo06/library-checker-problems"
          target="_blank"
          rel="noopener noreferrer">Library Checker Solutions</a
        > - Solutions to the Library Checker problems
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Extensive Libraries</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/koosaga/olympiad/tree/master/Library/codes"
          target="_blank"
          rel="noopener noreferrer">Koosaga's Library</a
        > - Comprehensive collection
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/ShahjalalShohag/code-library"
          target="_blank"
          rel="noopener noreferrer">Shahjalal Shohag's Code Library</a
        > - Extensive algorithm collection
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/dacin21/dacin21_codebook"
          target="_blank"
          rel="noopener noreferrer">dacin21's Codebook</a
        > - Comprehensive reference
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Clean Implementations</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/demidenko/olymp-cpp-lib"
          target="_blank"
          rel="noopener noreferrer">Olymp C++ Lib</a
        > - Clean and readable implementations
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/brunomaletta/Biblioteca"
          target="_blank"
          rel="noopener noreferrer">Biblioteca</a
        > - Well-organized algorithm library
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Top Competitive Programmers' Libraries</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a href="https://github.com/ecnerwala/cp-book" target="_blank" rel="noopener noreferrer"
          >ecnerwala's CP Book</a
        > - High-quality implementations
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://github.com/the-tourist/algo" target="_blank" rel="noopener noreferrer"
          >tourist's Algorithms</a
        > - Library by one of the world's top competitive programmers
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/nealwu/competitive-programming"
          target="_blank"
          rel="noopener noreferrer">Neal Wu's Competitive Programming</a
        > - Comprehensive collection
      </li>
      <li class="mb-2 leading-relaxed">
        <a href="https://github.com/bqi343/cp-notebook" target="_blank" rel="noopener noreferrer"
          >bqi343's CP Notebook</a
        > - Extensive reference
      </li>
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/suisen-cp/cp-library-cpp"
          target="_blank"
          rel="noopener noreferrer">suisen's CP Library</a
        > - Modern C++ implementations
      </li>
    </ul>

    <h3 class="text-xl mb-4 text-accent">Python</h3>
    <ul class="ml-6 mb-4">
      <li class="mb-2 leading-relaxed">
        <a
          href="https://github.com/cheran-senthil/PyRival"
          target="_blank"
          rel="noopener noreferrer">PyRival</a
        > - Python library for competitive programming
      </li>
    </ul>
  </section>

  <section class="mb-10">
    <h2 class="text-2xl mb-4 text-accent">Contribute</h2>
    <p class="mb-4 leading-relaxed">
      AlgoHub is an open-source project, and we welcome contributions from the community. If you'd
      like to help improve AlgoHub, please check out our <a
        href="https://github.com/cameroncuster/AlgoHub"
        target="_blank"
        rel="noopener noreferrer">GitHub repository</a
      >.
    </p>
  </section>
</div>
