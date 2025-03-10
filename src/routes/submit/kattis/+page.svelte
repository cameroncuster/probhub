<script lang="ts">
  import ProblemSubmitForm from '$lib/components/ProblemSubmitForm.svelte';
  import {
    extractKattisProblemInfo,
    fetchKattisProblemData,
    formatKattisUrl,
    extractKattisUrls
  } from '$lib/services/kattis';
</script>

<svelte:head>
  <title>Submit Kattis Problems - AlgoHub</title>
</svelte:head>

<ProblemSubmitForm
  title="Submit Kattis Problems"
  platformName="Kattis"
  platformIcon="/images/kattis.png"
  handlePlaceholder="Enter your Kattis handle (optional)"
  urlsPlaceholder="kattis.com/problems/hello&#10;open.kattis.com/problems/twostones&#10;customscontrols"
  urlsDescription="Enter Kattis problem URLs or problem IDs"
  extractUrls={extractKattisUrls}
  fetchProblemData={fetchKattisProblemData}
  extractProblemInfo={extractKattisProblemInfo}
  formatResultUrl={formatKattisUrl}
/>
