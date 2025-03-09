/**
 * Service for providing programming problems data
 */
import type { Problem } from './problem';
import { checkProblemExists } from './problem';

// Type for Codeforces API problem response
interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  tags: string[];
  rating?: number;
}

/**
 * Extract problem information from a Codeforces URL
 * @param problemUrl - Codeforces problem URL or shorthand format
 * @returns Problem info or null if invalid URL
 */
export function extractCodeforcesProblemInfo(problemUrl: string): {
  contestId: string;
  index: string;
  problemId: string;
  url: string;
} | null {
  // First normalize the URL to remove http/https/www and ensure it starts with a domain
  const normalizedUrl = problemUrl.trim();

  // Handle shorthand "CF" format (e.g., "CF 1794E")
  const cfShortPattern = /^CF\s*(\d+)([A-Z\d]+)$/i;
  const cfShortMatch = normalizedUrl.match(cfShortPattern);
  if (cfShortMatch) {
    const normalizedFinalUrl = `https://codeforces.com/contest/${cfShortMatch[1]}/problem/${cfShortMatch[2]}`;
    return {
      contestId: cfShortMatch[1],
      index: cfShortMatch[2],
      problemId: `${cfShortMatch[1]}${cfShortMatch[2]}`,
      url: normalizedFinalUrl
    };
  }

  // Handle shorthand "GYM" format (e.g., "GYM 102253C")
  const gymShortPattern = /^GYM\s*(\d+)([A-Z\d]+)$/i;
  const gymShortMatch = normalizedUrl.match(gymShortPattern);
  if (gymShortMatch) {
    const normalizedFinalUrl = `https://codeforces.com/gym/${gymShortMatch[1]}/problem/${gymShortMatch[2]}`;
    return {
      contestId: gymShortMatch[1],
      index: gymShortMatch[2],
      problemId: `G${gymShortMatch[1]}${gymShortMatch[2]}`, // Prefix with 'G' to indicate gym problem
      url: normalizedFinalUrl
    };
  }

  // Remove http/https/www if present
  const cleanUrl = normalizedUrl.replace(/^(https?:\/\/)?(www\.)?/, '');

  // Support both codeforces.com and mirror.codeforces.com
  const contestPattern = /(?:mirror\.)?codeforces\.com\/contest\/(\d+)\/problem\/([A-Z\d]+)/;
  const problemsetPattern = /(?:mirror\.)?codeforces\.com\/problemset\/problem\/(\d+)\/([A-Z\d]+)/;
  // Add support for gym problems
  const gymPattern = /(?:mirror\.)?codeforces\.com\/gym\/(\d+)\/problem\/([A-Z\d]+)/;

  const contestMatch = cleanUrl.match(contestPattern);
  const problemsetMatch = cleanUrl.match(problemsetPattern);
  const gymMatch = cleanUrl.match(gymPattern);

  // Use whichever pattern matched
  const match = contestMatch || problemsetMatch || gymMatch;

  if (!match) {
    return null;
  }

  // Determine if this is a gym problem
  const isGym = !!gymMatch;

  // Always normalize to the appropriate codeforces.com URL for consistency
  const normalizedFinalUrl = isGym
    ? `https://codeforces.com/gym/${match[1]}/problem/${match[2]}`
    : `https://codeforces.com/contest/${match[1]}/problem/${match[2]}`;

  return {
    contestId: match[1],
    index: match[2],
    problemId: `${isGym ? 'G' : ''}${match[1]}${match[2]}`, // Prefix gym problems with 'G' to distinguish them
    url: normalizedFinalUrl
  };
}

/**
 * Fetch problem data from Codeforces API
 * @param problemInfo - Problem information
 * @param submitterHandle - Handle of the person submitting the problem
 * @returns Problem data
 */
export async function fetchCodeforcesProblemData(
  problemInfo: {
    contestId: string;
    index: string;
    problemId: string;
    url: string;
  },
  submitterHandle: string = 'tourist'
): Promise<{
  success: boolean;
  message?: string;
  problem?: Omit<Problem, 'source'>;
}> {
  try {
    // Check if problem already exists in our database by URL
    const { exists, error } = await checkProblemExists(problemInfo.url);

    if (error) {
      return {
        success: false,
        message: error
      };
    }

    if (exists) {
      return {
        success: false,
        message: 'Problem already exists in database'
      };
    }

    // Determine if this is a gym problem
    const isGym = problemInfo.url.includes('/gym/');

    // Also check the problemset URL variant (only for regular contests, not gym)
    if (!isGym) {
      const problemsetUrl = `https://codeforces.com/problemset/problem/${problemInfo.contestId}/${problemInfo.index}`;
      if (problemInfo.url !== problemsetUrl) {
        const { exists: existsAlt } = await checkProblemExists(problemsetUrl);
        if (existsAlt) {
          return {
            success: false,
            message: 'Problem already exists in database (with alternate URL)'
          };
        }
      }
    }

    // Fetch problem data from Codeforces API
    // Use different API endpoint for gym problems
    const apiUrl = isGym
      ? `https://codeforces.com/api/contest.standings?contestId=${problemInfo.contestId}&from=1&count=1&gym=true`
      : `https://codeforces.com/api/contest.standings?contestId=${problemInfo.contestId}&from=1&count=1`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error('Failed to fetch problem data from Codeforces API');
    }

    // Find the problem in the response
    const problem = data.result.problems.find(
      (p: CodeforcesProblem) => p.index === problemInfo.index
    );

    if (!problem) {
      // For gym problems, we might need to handle the case where the API doesn't return problem details
      if (isGym) {
        // Create a minimal problem object with default values
        return {
          success: true,
          problem: {
            name: `Problem ${problemInfo.index} from Gym Contest ${problemInfo.contestId}`,
            tags: ['gym'],
            // No difficulty for gym problems
            url: problemInfo.url,
            solved: 0,
            dateAdded: new Date().toISOString(),
            addedBy: submitterHandle || 'tourist',
            addedByUrl: submitterHandle
              ? `https://codeforces.com/profile/${submitterHandle}`
              : 'https://codeforces.com/profile/tourist',
            likes: 0,
            dislikes: 0
          }
        };
      }
      throw new Error('Problem not found in Codeforces API response');
    }

    return {
      success: true,
      problem: {
        name: problem.name,
        tags: problem.tags || [],
        difficulty: problem.rating, // Keep as undefined if no rating
        url: problemInfo.url,
        solved: 0,
        dateAdded: new Date().toISOString(),
        addedBy: submitterHandle || 'tourist',
        addedByUrl: submitterHandle
          ? `https://codeforces.com/profile/${submitterHandle}`
          : 'https://codeforces.com/profile/tourist',
        likes: 0,
        dislikes: 0
      }
    };
  } catch (err) {
    console.error('Error fetching problem data:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}
