/**
 * Service for providing programming problems data
 */
import { supabase } from './database';
import type { Problem, ProblemRecord } from '../types/problem';

/**
 * Determine the problem source based on URL
 */
function getProblemSource(url: string): 'codeforces' | 'kattis' {
  return url.includes('kattis.com') ? 'kattis' : 'codeforces';
}

/**
 * Fetches problems from the database
 * @returns Array of problems
 */
export async function fetchProblems(): Promise<Problem[]> {
  try {
    const { data, error } = await supabase.from('problems').select('*');

    if (error) {
      console.error('Error fetching problems:', error);
      return [];
    }

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
      source: getProblemSource(record.url)
    }));
  } catch (err) {
    console.error('Failed to fetch problems:', err);
    return [];
  }
}

/**
 * Updates a problem's likes or dislikes in the database
 * @param problemId - Problem ID
 * @param isLike - Whether it's a like (true) or dislike (false)
 * @param isUndo - Whether this is an undo operation
 * @param previousFeedback - The user's previous feedback (if any)
 * @returns Promise with the updated problem
 */
export async function updateProblemFeedback(
  problemId: string,
  isLike: boolean,
  isUndo: boolean = false,
  previousFeedback: 'like' | 'dislike' | null = null
): Promise<Problem | null> {
  try {
    // First get the current problem to get current like/dislike counts
    const { data: currentProblem, error: fetchError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .single();

    if (fetchError || !currentProblem) {
      console.error(`Error fetching problem ${problemId}:`, fetchError);
      return null;
    }

    // Prepare the update data based on the action
    let updateData: { likes?: number; dislikes?: number } = {};

    if (isUndo) {
      // Undoing a previous action
      updateData = isLike
        ? { likes: Math.max(0, (currentProblem.likes || 0) - 1) }
        : { dislikes: Math.max(0, (currentProblem.dislikes || 0) - 1) };
    } else if (previousFeedback === 'like' && !isLike) {
      // Switching from like to dislike
      updateData = {
        likes: Math.max(0, (currentProblem.likes || 0) - 1),
        dislikes: (currentProblem.dislikes || 0) + 1
      };
    } else if (previousFeedback === 'dislike' && isLike) {
      // Switching from dislike to like
      updateData = {
        likes: (currentProblem.likes || 0) + 1,
        dislikes: Math.max(0, (currentProblem.dislikes || 0) - 1)
      };
    } else {
      // New feedback
      updateData = isLike
        ? { likes: (currentProblem.likes || 0) + 1 }
        : { dislikes: (currentProblem.dislikes || 0) + 1 };
    }

    // Update the problem
    const { data, error } = await supabase
      .from('problems')
      .update(updateData)
      .eq('id', problemId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating problem ${problemId}:`, error);
      return null;
    }

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
      source: getProblemSource(record.url)
    };
  } catch (err) {
    console.error(`Failed to update problem ${problemId}:`, err);
    return null;
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

    if (error) {
      console.error(`Error fetching problem ${problemId}:`, error);
      return undefined;
    }

    if (!data) return undefined;

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
      source: getProblemSource(record.url)
    };
  } catch (err) {
    console.error(`Failed to fetch problem ${problemId}:`, err);
    return undefined;
  }
}
