/**
 * Service for providing programming problems data
 */
import { supabase } from './database';

/**
 * Database record type from Supabase
 */
type ProblemRecord = {
	id: string;
	name: string;
	tags: string[];
	difficulty: number;
	url: string;
	solved: number | null;
	date_added: string;
	added_by: string;
	added_by_url: string;
	likes: number;
	dislikes: number;
};

/**
 * Problem interface from our app's perspective
 */
export type Problem = {
	id: string;
	name: string;
	tags: string[];
	difficulty: number;
	url: string;
	solved: number;
	dateAdded: string;
	addedBy: string;
	addedByUrl: string;
	likes: number;
	dislikes: number;
	userFeedback?: 'like' | 'dislike' | null; // Track user's feedback
};

/**
 * User feedback type for storing in local storage
 */
type UserFeedback = {
	[problemId: string]: 'like' | 'dislike';
};

/**
 * Mock data for development when Supabase is not available
 */
const mockProblems: Problem[] = [
	{
		id: '1A',
		name: 'Theatre Square',
		tags: ['math', 'implementation'],
		difficulty: 1000,
		url: 'https://codeforces.com/problemset/problem/1/A',
		solved: 250000,
		dateAdded: '2023-01-15',
		addedBy: 'admin',
		addedByUrl: 'https://github.com/cameroncuster',
		likes: 120,
		dislikes: 5
	},
	{
		id: '4C',
		name: 'Registration System',
		tags: ['data structures', 'hashing', 'implementation'],
		difficulty: 1300,
		url: 'https://codeforces.com/problemset/problem/4/C',
		solved: 120000,
		dateAdded: '2023-01-20',
		addedBy: 'admin',
		addedByUrl: 'https://github.com/cameroncuster',
		likes: 85,
		dislikes: 3
	},
	{
		id: '158B',
		name: 'Taxi',
		tags: ['greedy', 'implementation'],
		difficulty: 1500,
		url: 'https://codeforces.com/problemset/problem/158/B',
		solved: 95000,
		dateAdded: '2023-02-05',
		addedBy: 'admin',
		addedByUrl: 'https://github.com/cameroncuster',
		likes: 65,
		dislikes: 8
	},
	{
		id: '489C',
		name: 'Given Length and Sum of Digits',
		tags: ['dp', 'greedy', 'implementation', 'math'],
		difficulty: 1800,
		url: 'https://codeforces.com/problemset/problem/489/C',
		solved: 75000,
		dateAdded: '2023-02-15',
		addedBy: 'admin',
		addedByUrl: 'https://github.com/cameroncuster',
		likes: 110,
		dislikes: 12
	},
	{
		id: '455A',
		name: 'Boredom',
		tags: ['dp'],
		difficulty: 2100,
		url: 'https://codeforces.com/problemset/problem/455/A',
		solved: 45000,
		dateAdded: '2023-03-01',
		addedBy: 'admin',
		addedByUrl: 'https://github.com/cameroncuster',
		likes: 95,
		dislikes: 7
	}
];

/**
 * Fetches problems from the database
 * @returns Array of problems
 */
export async function fetchProblems(): Promise<Problem[]> {
	try {
		// Try to fetch from Supabase
		const { data, error } = await supabase
			.from('problems')
			.select('*')
			.order('likes', { ascending: false })
			.order('dislikes', { ascending: true });

		// If there's an error or no data, use mock data
		if (error || !data || data.length === 0) {
			console.warn('Using mock data due to Supabase error or no data:', error);
			return mockProblems;
		}

		// Get user feedback from local storage
		const userFeedback = getUserFeedback();

		// Transform database records to Problem type
		return (data as ProblemRecord[]).map((record) => ({
			id: record.id,
			name: record.name,
			tags: record.tags,
			difficulty: record.difficulty,
			url: record.url,
			solved: record.solved || 0,
			dateAdded: record.date_added,
			addedBy: record.added_by,
			addedByUrl: record.added_by_url,
			likes: record.likes,
			dislikes: record.dislikes,
			userFeedback: userFeedback[record.id] || null
		}));
	} catch (err) {
		console.error('Failed to fetch problems:', err);
		return mockProblems;
	}
}

/**
 * Fetches a specific problem by ID
 * @param contestId - Contest ID
 * @param index - Problem index
 * @returns Promise with problem details
 */
export async function fetchProblem(
	contestId: string | number,
	index: string
): Promise<Problem | undefined> {
	const problemId = `${contestId}${index}`;

	try {
		const { data, error } = await supabase
			.from('problems')
			.select('*')
			.eq('id', problemId)
			.single();

		if (error || !data) {
			// Try to find in mock data
			const mockProblem = mockProblems.find(p => p.id === problemId);
			if (mockProblem) return mockProblem;
			return undefined;
		}

		// Get user feedback from local storage
		const userFeedback = getUserFeedback();

		const record = data as ProblemRecord;
		return {
			id: record.id,
			name: record.name,
			tags: record.tags,
			difficulty: record.difficulty,
			url: record.url,
			solved: record.solved || 0,
			dateAdded: record.date_added,
			addedBy: record.added_by,
			addedByUrl: record.added_by_url,
			likes: record.likes,
			dislikes: record.dislikes,
			userFeedback: userFeedback[record.id] || null
		};
	} catch (err) {
		console.error(`Failed to fetch problem ${problemId}:`, err);
		return undefined;
	}
}

/**
 * Updates a problem's likes or dislikes
 * @param problemId - Problem ID
 * @param feedback - 'like' or 'dislike'
 * @param previousFeedback - Previous feedback if any
 * @returns Promise with updated problem
 */
export async function updateProblemFeedback(
	problemId: string,
	feedback: 'like' | 'dislike' | null,
	previousFeedback: 'like' | 'dislike' | null
): Promise<boolean> {
	try {
		// For mock data, just update in memory
		const mockProblemIndex = mockProblems.findIndex(p => p.id === problemId);
		if (mockProblemIndex !== -1) {
			// Remove previous feedback if it exists
			if (previousFeedback === 'like') {
				mockProblems[mockProblemIndex].likes = Math.max(0, mockProblems[mockProblemIndex].likes - 1);
			} else if (previousFeedback === 'dislike') {
				mockProblems[mockProblemIndex].dislikes = Math.max(0, mockProblems[mockProblemIndex].dislikes - 1);
			}

			// Add new feedback if it exists
			if (feedback === 'like') {
				mockProblems[mockProblemIndex].likes += 1;
			} else if (feedback === 'dislike') {
				mockProblems[mockProblemIndex].dislikes += 1;
			}

			// Update local storage
			updateUserFeedback(problemId, feedback);
			return true;
		}

		// Try to update in Supabase
		// Get the current problem data
		const { data: currentData, error: fetchError } = await supabase
			.from('problems')
			.select('likes, dislikes')
			.eq('id', problemId)
			.single();

		if (fetchError) {
			console.error(`Error fetching problem ${problemId}:`, fetchError);
			return false;
		}

		let likes = currentData.likes;
		let dislikes = currentData.dislikes;

		// Remove previous feedback if it exists
		if (previousFeedback === 'like') {
			likes = Math.max(0, likes - 1);
		} else if (previousFeedback === 'dislike') {
			dislikes = Math.max(0, dislikes - 1);
		}

		// Add new feedback if it exists
		if (feedback === 'like') {
			likes += 1;
		} else if (feedback === 'dislike') {
			dislikes += 1;
		}

		// Update the problem in the database
		const { error: updateError } = await supabase
			.from('problems')
			.update({ likes, dislikes })
			.eq('id', problemId);

		if (updateError) {
			console.error(`Error updating problem ${problemId}:`, updateError);
			return false;
		}

		// Update local storage
		updateUserFeedback(problemId, feedback);

		return true;
	} catch (err) {
		console.error(`Failed to update problem ${problemId}:`, err);
		return false;
	}
}

/**
 * Gets user feedback from local storage
 * @returns Object with problem IDs as keys and feedback as values
 */
function getUserFeedback(): UserFeedback {
	if (typeof localStorage === 'undefined') return {};

	const storedFeedback = localStorage.getItem('userProblemFeedback');
	return storedFeedback ? JSON.parse(storedFeedback) : {};
}

/**
 * Updates user feedback in local storage
 * @param problemId - Problem ID
 * @param feedback - 'like', 'dislike', or null to remove
 */
function updateUserFeedback(problemId: string, feedback: 'like' | 'dislike' | null): void {
	if (typeof localStorage === 'undefined') return;

	const userFeedback = getUserFeedback();

	if (feedback === null) {
		delete userFeedback[problemId];
	} else {
		userFeedback[problemId] = feedback;
	}

	localStorage.setItem('userProblemFeedback', JSON.stringify(userFeedback));
}
