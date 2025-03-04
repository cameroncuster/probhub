<script lang="ts">
	// About page component
</script>

<svelte:head>
	<title>About - Probhub</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
	<div class="prose prose-blue max-w-none">
		<h1 class="mb-6 text-3xl font-bold text-gray-900">About Probhub</h1>

		<p class="mb-8 text-lg text-gray-700">
			Probhub is a curated collection of programming problems from various online judges and
			competitive programming platforms. Our goal is to help programmers find high-quality problems
			to practice their skills.
		</p>

		<h2 class="mt-8 mb-4 text-2xl font-semibold text-gray-900">How It Works</h2>

		<p class="mb-4 text-gray-700">
			Problems are added by community members who find them interesting, educational, or
			challenging. Each problem includes:
		</p>

		<ul class="mb-6 list-disc pl-6 text-gray-700">
			<li class="mb-2">A difficulty rating to help you find problems at your skill level</li>
			<li class="mb-2">Tags indicating the algorithms or data structures involved</li>
			<li class="mb-2">A link to the original problem on its platform</li>
			<li class="mb-2">Information about who added the problem</li>
		</ul>

		<p class="mb-4 text-gray-700">
			Users can provide feedback on problems by liking or disliking them, helping others find the
			most valuable practice resources.
		</p>

		<h2 class="mt-8 mb-4 text-2xl font-semibold text-gray-900">Contributing</h2>

		<p class="mb-4 text-gray-700">
			We welcome contributions from the community! If you'd like to add a problem to Probhub, please
			visit our
			<a
				href="https://github.com/cameroncuster/probhub"
				class="text-blue-600 hover:text-blue-800 hover:underline">GitHub repository</a
			>
			for more information on how to contribute.
		</p>

		<h2 class="mt-8 mb-4 text-2xl font-semibold text-gray-900">Contact</h2>

		<p class="text-gray-700">
			If you have any questions, suggestions, or feedback, please reach out through our
			<a
				href="https://github.com/cameroncuster/probhub/issues"
				class="text-blue-600 hover:text-blue-800 hover:underline">GitHub issues</a
			>.
		</p>
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
