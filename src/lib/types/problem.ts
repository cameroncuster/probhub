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
  source: 'codeforces' | 'kattis';
};

/**
 * Database record type from Supabase
 */
export type ProblemRecord = Omit<Problem, 'dateAdded' | 'addedBy' | 'addedByUrl' | 'source'> & {
  date_added: string;
  added_by: string;
  added_by_url: string;
};
