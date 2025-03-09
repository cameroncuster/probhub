/**
 * Service for database operations related to programming problems
 */
import { supabase } from './database';

/**
 * Problem interface from our app's perspective
 */
export type Problem = {
  id?: string;
  name: string;
  tags: string[];
  difficulty?: number;
  url: string;
  solved: number;
  dateAdded: string;
  addedBy: string;
  addedByUrl: string;
  likes: number;
  dislikes: number;
  source: 'codeforces' | 'kattis';
  type?: string;
};

/**
 * Database record type from Supabase
 */
export type ProblemRecord = Omit<Problem, 'dateAdded' | 'addedBy' | 'addedByUrl' | 'source'> & {
  date_added: string;
  added_by: string;
  added_by_url: string;
};

/**
 * Determine the problem source based on URL
 */
export function getProblemSource(url: string): 'codeforces' | 'kattis' {
  return url.includes('kattis.com') ? 'kattis' : 'codeforces';
}

/**
 * Check if a problem already exists in the database
 * @param url - Problem URL
 * @returns Object with success flag and optional message
 */
export async function checkProblemExists(url: string): Promise<{
  exists: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.from('problems').select('id').eq('url', url);

    if (error) {
      return {
        exists: false,
        error: `Database query error: ${error.message}`
      };
    }

    return {
      exists: data && data.length > 0
    };
  } catch (err) {
    console.error('Error checking if problem exists:', err);
    return {
      exists: false,
      error: err instanceof Error ? err.message : 'Unknown error checking problem existence'
    };
  }
}

/**
 * Insert a problem into the database
 * @param problem - Problem data to insert
 * @returns Object with success flag and optional message
 */
export async function insertProblem(problem: Omit<Problem, 'source'>): Promise<{
  success: boolean;
  message?: string;
  id?: string;
}> {
  try {
    // Map camelCase field names to snake_case column names
    // Omit the id field to let the database generate a UUID
    const dbProblem: ProblemRecord = {
      name: problem.name,
      tags: problem.tags,
      url: problem.url,
      solved: problem.solved,
      date_added: problem.dateAdded,
      added_by: problem.addedBy,
      added_by_url: problem.addedByUrl,
      likes: problem.likes,
      dislikes: problem.dislikes,
      type: problem.type
    };

    // Add difficulty only if defined
    if (problem.difficulty !== undefined) {
      dbProblem.difficulty = problem.difficulty;
    }

    // First check if the problem already exists by URL
    const { exists, error: checkError } = await checkProblemExists(problem.url);

    if (checkError) {
      return {
        success: false,
        message: `Error checking if problem exists: ${checkError}`
      };
    }

    if (exists) {
      return {
        success: false,
        message: 'Problem already exists in database'
      };
    }

    // Insert the problem
    const { data, error } = await supabase.from('problems').insert(dbProblem).select('id').single();

    if (error) {
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }

    return {
      success: true,
      id: data?.id
    };
  } catch (err) {
    console.error('Error inserting problem:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error inserting problem'
    };
  }
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
      source: getProblemSource(record.url),
      type: record.type
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
      source: getProblemSource(record.url),
      type: record.type
    };
  } catch (err) {
    console.error(`Failed to update problem ${problemId}:`, err);
    return null;
  }
}

/**
 * Fetches a specific problem by ID
 * @param problemId - Problem ID
 * @returns Promise with problem details
 */
export async function fetchProblemById(problemId: string): Promise<Problem | undefined> {
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
      source: getProblemSource(record.url),
      type: record.type
    };
  } catch (err) {
    console.error(`Failed to fetch problem ${problemId}:`, err);
    return undefined;
  }
}
