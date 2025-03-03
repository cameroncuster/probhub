/**
 * Service for interacting with the Codeforces API
 */

// Base URL for Codeforces API
const API_BASE_URL = 'https://codeforces.com/api';

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
  category: 'easy' | 'medium' | 'hard';
};

/**
 * Codeforces API Problem interface
 */
interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  tags: string[];
  rating?: number;
}

/**
 * Codeforces API Problem Statistics interface
 */
interface CFProblemStatistics {
  contestId: number;
  index: string;
  solvedCount: number;
}

/**
 * Codeforces API Response interface
 */
interface CFResponse<T> {
  status: string;
  result: T;
  comment?: string;
}

/**
 * Codeforces API Problemset Response
 */
interface CFProblemsetResponse {
  problems: CFProblem[];
  problemStatistics: CFProblemStatistics[];
}

/**
 * Fetches problems from Codeforces API
 * @returns Promise with array of problems
 */
export async function fetchProblems(): Promise<Problem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/problemset.problems`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: CFResponse<CFProblemsetResponse> = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`API returned error: ${data.comment}`);
    }

    // Transform the data to our format
    return transformProblems(data.result.problems, data.result.problemStatistics);
  } catch (error) {
    console.error('Error fetching problems from Codeforces:', error);
    throw error;
  }
}

/**
 * Transforms Codeforces problems data to our app format
 * @param problems - Raw problems data from Codeforces
 * @param statistics - Problem statistics from Codeforces
 * @returns Transformed problems
 */
function transformProblems(problems: CFProblem[], statistics: CFProblemStatistics[]): Problem[] {
  return problems.map((problem) => {
    // Find matching statistics
    const stats = statistics.find(
      (s) => s.contestId === problem.contestId && s.index === problem.index
    ) || { solvedCount: 0 };

    // Determine difficulty category
    let category: 'easy' | 'medium' | 'hard' = 'easy';
    if (problem.rating) {
      if (problem.rating >= 1800) {
        category = 'hard';
      } else if (problem.rating >= 1200) {
        category = 'medium';
      }
    }

    return {
      id: `${problem.contestId}${problem.index}`,
      name: problem.name,
      tags: problem.tags || [],
      difficulty: problem.rating || 0,
      url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
      solved: stats.solvedCount,
      category
    };
  });
}

/**
 * Fetches a specific problem from Codeforces
 * @param contestId - Contest ID
 * @param index - Problem index
 * @returns Promise with problem details
 */
export async function fetchProblem(
  contestId: string | number,
  index: string
): Promise<Problem | undefined> {
  try {
    const allProblems = await fetchProblems();
    return allProblems.find((p) => p.id === `${contestId}${index}`);
  } catch (error) {
    console.error(`Error fetching problem ${contestId}${index}:`, error);
    throw error;
  }
}

/**
 * Fetches recent contests from Codeforces
 * @returns Promise with array of contests
 */
export async function fetchContests(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/contest.list`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: CFResponse<any[]> = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`API returned error: ${data.comment}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching contests from Codeforces:', error);
    throw error;
  }
}
