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
};

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
      dislikes: record.dislikes
    }));
  } catch (err) {
    console.error('Failed to fetch problems:', err);
    return [];
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
      dislikes: record.dislikes
    };
  } catch (err) {
    console.error(`Failed to fetch problem ${problemId}:`, err);
    return undefined;
  }
}
