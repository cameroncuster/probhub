<script lang="ts">
  import ProblemSubmitForm from '$lib/components/ProblemSubmitForm.svelte';
  import {
    extractCodeforcesProblemInfo,
    fetchCodeforcesProblemData,
    formatCodeforcesUrl,
    extractCodeforcesUrls
  } from '$lib/services/codeforces';
  // Use static image path instead of import
  const codeforcesIcon = '/images/codeforces.png';
</script>

<svelte:head>
  <title>Submit Codeforces Problems - AlgoHub</title>
</svelte:head>

<ProblemSubmitForm
  title="Submit Codeforces Problems"
  platformName="Codeforces"
  platformIcon={codeforcesIcon}
  handlePlaceholder="Enter your Codeforces handle (optional)"
  urlsPlaceholder="https://codeforces.com/contest/1234/problem/A&#10;https://codeforces.com/problemset/problem/1234/A&#10;https://codeforces.com/gym/102253/problem/C"
  urlsDescription="Enter Codeforces problem URLs (contest, problemset, or gym)"
  extractUrls={extractCodeforcesUrls}
  fetchProblemData={fetchCodeforcesProblemData}
  extractProblemInfo={extractCodeforcesProblemInfo}
  formatResultUrl={formatCodeforcesUrl}
/>
