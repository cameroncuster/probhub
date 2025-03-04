<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchProblems, type Problem } from '$lib/services/codeforces';

	let problems: Problem[] = [];
	let loading: boolean = false;
	let error: string | null = null;

	// Function to get the rating color based on difficulty
	function getRatingColor(rating: number): string {
		if (rating >= 3000) return 'bg-legendary-grandmaster';
		if (rating >= 2600) return 'bg-international-grandmaster';
		if (rating >= 2400) return 'bg-grandmaster';
		if (rating >= 2300) return 'bg-international-master';
		if (rating >= 2100) return 'bg-master';
		if (rating >= 1900) return 'bg-candidate-master';
		if (rating >= 1600) return 'bg-expert';
		if (rating >= 1400) return 'bg-specialist';
		if (rating >= 1200) return 'bg-pupil';
		return 'bg-newbie';
	}

	// Function to get the rating tier name
	function getRatingTierName(rating: number): string {
		if (rating >= 3000) return 'Legendary Grandmaster';
		if (rating >= 2600) return 'International Grandmaster';
		if (rating >= 2400) return 'Grandmaster';
		if (rating >= 2300) return 'International Master';
		if (rating >= 2100) return 'Master';
		if (rating >= 1900) return 'Candidate Master';
		if (rating >= 1600) return 'Expert';
		if (rating >= 1400) return 'Specialist';
		if (rating >= 1200) return 'Pupil';
		return 'Newbie';
	}

	// Function to format date to a more readable format
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Function to handle like/dislike actions
	function handleLike(problemId: string, isLike: boolean): void {
		problems = problems.map((problem) => {
			if (problem.id === problemId) {
				if (isLike) {
					return { ...problem, likes: problem.likes + 1 };
				} else {
					return { ...problem, dislikes: problem.dislikes + 1 };
				}
			}
			return problem;
		});
	}

	// Function to load problems
	async function loadProblems(): Promise<void> {
		loading = true;
		error = null;

		try {
			const fetchedProblems = await fetchProblems();

			if (fetchedProblems && fetchedProblems.length > 0) {
				problems = fetchedProblems;
			}

			loading = false;
		} catch (err) {
			console.error('Error loading problems:', err);
			error = 'Failed to load problems.';
			loading = false;
		}
	}

	onMount(() => {
		loadProblems();
	});
</script>

<svelte:head>
	<title>Probhub</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8">
	{#if loading}
		<div class="py-8 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"
			></div>
			<p class="mt-2 text-gray-600">Loading problems...</p>
		</div>
	{:else if error}
		<div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
			{error}
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Name
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Difficulty
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Tags
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Date Added
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Credit
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>
								Feedback
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each problems as problem}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href={problem.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:text-blue-800 hover:underline"
									>
										{problem.name}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class={`rating-badge ${getRatingColor(problem.difficulty)}`}
										title="{getRatingTierName(problem.difficulty)} (Rating: {problem.difficulty})"
									>
										{problem.difficulty}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex flex-wrap gap-1">
										{#each problem.tags as tag}
											<span class="problem-tag">{tag}</span>
										{/each}
									</div>
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{formatDate(problem.dateAdded)}
								</td>
								<td class="px-6 py-4 text-sm whitespace-nowrap">
									<a
										href={problem.addedByUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:text-blue-800 hover:underline"
									>
										@{problem.addedBy}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex space-x-3">
										<button
											class="flex items-center space-x-1 text-gray-600 transition-colors hover:text-green-600"
											on:click={() => handleLike(problem.id, true)}
											title="Like this problem"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<path
													d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
												></path>
											</svg>
											<span>{problem.likes}</span>
										</button>
										<button
											class="flex items-center space-x-1 text-gray-600 transition-colors hover:text-red-600"
											on:click={() => handleLike(problem.id, false)}
											title="Dislike this problem"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<path
													d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"
												></path>
											</svg>
											<span>{problem.dislikes}</span>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
