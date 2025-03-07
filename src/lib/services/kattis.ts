/**
 * Service for providing Kattis programming problems data
 */
import { supabase } from './database';
import type { Problem } from '../types/problem';

/**
 * Extract problem information from a Kattis URL
 * @param url - Kattis problem URL
 * @returns Problem info or null if invalid URL
 */
export function extractKattisProblemInfo(url: string): {
  problemId: string;
  url: string;
} | null {
  // Example Kattis URL: https://open.kattis.com/problems/problemname
  const kattisRegex = /https?:\/\/(?:open\.)?kattis\.com\/problems\/([a-zA-Z0-9_-]+)/;
  const match = url.match(kattisRegex);

  if (!match) return null;

  const problemId = match[1];

  return {
    problemId,
    url
  };
}

/**
 * Estimates difficulty for a Kattis problem
 * Kattis uses a different scale, so we map it to a Codeforces-like scale
 * @param difficulty - Kattis difficulty (1.0-10.0)
 * @returns Estimated Codeforces-like difficulty (800-3500)
 */
export function mapKattisDifficulty(difficulty: number): number {
  // Map Kattis 1.0-10.0 scale to Codeforces 800-3500 scale
  // This is an approximation and can be refined
  if (difficulty <= 1.5) return 800; // Newbie
  if (difficulty <= 2.5) return 1200; // Pupil
  if (difficulty <= 3.5) return 1400; // Specialist
  if (difficulty <= 4.5) return 1600; // Expert
  if (difficulty <= 5.5) return 1900; // Candidate Master
  if (difficulty <= 6.5) return 2100; // Master
  if (difficulty <= 7.5) return 2300; // International Master
  if (difficulty <= 8.5) return 2400; // Grandmaster
  if (difficulty <= 9.5) return 2600; // International Grandmaster
  return 3000; // Legendary Grandmaster
}

/**
 * Fetch problem data from Kattis
 * @param problemInfo - Problem information
 * @param submitterHandle - Handle of the person submitting the problem
 * @param estimatedDifficulty - User-provided difficulty estimate (1.0-10.0)
 * @param problemTags - User-provided tags
 * @returns Problem data
 */
export async function fetchKattisProblemData(
  problemInfo: { problemId: string; url: string },
  submitterHandle: string = 'anonymous',
  estimatedDifficulty: number = 5.0,
  problemTags: string[] = []
): Promise<{
  success: boolean;
  message?: string;
  problem?: Omit<Problem, 'source'>;
}> {
  try {
    // Check if problem already exists
    const { data: existingProblems, error: queryError } = await supabase
      .from('problems')
      .select('id')
      .eq('url', problemInfo.url);

    if (queryError) {
      return {
        success: false,
        message: `Database query error: ${queryError.message}`
      };
    }

    if (existingProblems && existingProblems.length > 0) {
      return {
        success: false,
        message: 'Problem already exists in database'
      };
    }

    // Map Kattis difficulty to Codeforces scale
    const mappedDifficulty = mapKattisDifficulty(estimatedDifficulty);

    // Format problem name from ID (replace hyphens with spaces and capitalize)
    const formattedName = problemInfo.problemId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const problem = {
      id: `kattis_${problemInfo.problemId}`,
      name: formattedName,
      tags: problemTags,
      difficulty: mappedDifficulty,
      url: problemInfo.url,
      solved: 0,
      dateAdded: new Date().toISOString(),
      addedBy: submitterHandle,
      addedByUrl: `https://open.kattis.com/users/${submitterHandle}`,
      likes: 0,
      dislikes: 0
    };

    return {
      success: true,
      problem
    };
  } catch (error) {
    console.error('Error processing Kattis problem:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process Kattis problem data'
    };
  }
}
