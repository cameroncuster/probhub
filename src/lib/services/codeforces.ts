/**
 * Service for providing programming problems data
 */

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
  dateAdded: string;
  addedBy: string;
  addedByUrl: string;
  likes: number;
  dislikes: number;
};

/**
 * Returns a hard-coded list of programming problems
 * @returns Array of problems
 */
export async function fetchProblems(): Promise<Problem[]> {
  // Return the hard-coded problems
  return PROBLEMS;
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
  return PROBLEMS.find((p) => p.id === `${contestId}${index}`);
}

/**
 * Helper function to determine difficulty category based on rating
 * @param rating - Problem rating
 * @returns Difficulty category
 */
function getDifficultyCategory(rating: number): 'easy' | 'medium' | 'hard' {
  if (rating >= 1800) {
    return 'hard';
  } else if (rating >= 1200) {
    return 'medium';
  }
  return 'easy';
}

/**
 * Hard-coded list of 20 programming problems
 */
const PROBLEMS: Problem[] = [
  {
    id: '1672H',
    name: 'Maximum Crossings',
    tags: ['data structures', 'divide and conquer', 'sortings'],
    difficulty: 2100,
    url: 'https://codeforces.com/problemset/problem/1672/H',
    solved: 1243,
    category: getDifficultyCategory(2100),
    dateAdded: '2024-01-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 187,
    dislikes: 12
  },
  {
    id: '1442B',
    name: 'Identify the Operations',
    tags: ['combinatorics', 'data structures', 'dsu', 'greedy', 'implementation'],
    difficulty: 1900,
    url: 'https://codeforces.com/problemset/problem/1442/B',
    solved: 2356,
    category: getDifficultyCategory(1900),
    dateAdded: '2024-01-25',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 156,
    dislikes: 8
  },
  {
    id: '1516E',
    name: 'Baby Ehab Plays with Permutations',
    tags: ['combinatorics', 'dp', 'math'],
    difficulty: 2500,
    url: 'https://codeforces.com/problemset/problem/1516/E',
    solved: 876,
    category: getDifficultyCategory(2500),
    dateAdded: '2024-01-30',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 213,
    dislikes: 5
  },
  {
    id: '1349C',
    name: 'Orac and Game of Life',
    tags: ['bfs', 'constructive algorithms', 'graphs', 'shortest paths'],
    difficulty: 2000,
    url: 'https://codeforces.com/problemset/problem/1349/C',
    solved: 1987,
    category: getDifficultyCategory(2000),
    dateAdded: '2024-02-05',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 178,
    dislikes: 14
  },
  {
    id: '1628D1',
    name: 'Game on Sum (Easy Version)',
    tags: ['combinatorics', 'dp', 'games', 'math'],
    difficulty: 2100,
    url: 'https://codeforces.com/problemset/problem/1628/D1',
    solved: 1432,
    category: getDifficultyCategory(2100),
    dateAdded: '2024-02-10',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 192,
    dislikes: 7
  },
  {
    id: '1404C',
    name: 'Fixed Point Removal',
    tags: ['binary search', 'data structures', 'sortings', 'two pointers'],
    difficulty: 2300,
    url: 'https://codeforces.com/problemset/problem/1404/C',
    solved: 1056,
    category: getDifficultyCategory(2300),
    dateAdded: '2024-02-15',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 203,
    dislikes: 9
  },
  {
    id: '1336C',
    name: 'Kaavi and Magic Spell',
    tags: ['dp', 'strings'],
    difficulty: 2200,
    url: 'https://codeforces.com/problemset/problem/1336/C',
    solved: 1187,
    category: getDifficultyCategory(2200),
    dateAdded: '2024-02-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 167,
    dislikes: 12
  },
  {
    id: '1479B2',
    name: 'Painting the Array II',
    tags: ['constructive algorithms', 'data structures', 'dp', 'greedy', 'implementation'],
    difficulty: 2100,
    url: 'https://codeforces.com/problemset/problem/1479/B2',
    solved: 1322,
    category: getDifficultyCategory(2100),
    dateAdded: '2024-02-25',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 185,
    dislikes: 8
  },
  {
    id: '1416C',
    name: 'XOR Inverse',
    tags: [
      'bitmasks',
      'data structures',
      'divide and conquer',
      'dp',
      'greedy',
      'math',
      'sortings',
      'strings',
      'trees'
    ],
    difficulty: 2000,
    url: 'https://codeforces.com/problemset/problem/1416/C',
    solved: 1578,
    category: getDifficultyCategory(2000),
    dateAdded: '2024-03-01',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 176,
    dislikes: 11
  },
  {
    id: '1344D',
    name: 'Quantifier Question',
    tags: ['binary search', 'greedy', 'math', 'sortings'],
    difficulty: 2600,
    url: 'https://codeforces.com/problemset/problem/1344/D',
    solved: 743,
    category: getDifficultyCategory(2600),
    dateAdded: '2024-03-05',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 221,
    dislikes: 6
  },
  {
    id: '1442C',
    name: 'Graph Transpositions',
    tags: ['dfs and similar', 'graphs', 'greedy', 'shortest paths'],
    difficulty: 2400,
    url: 'https://codeforces.com/problemset/problem/1442/C',
    solved: 982,
    category: getDifficultyCategory(2400),
    dateAdded: '2024-03-10',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 198,
    dislikes: 10
  },
  {
    id: '1361D',
    name: 'Johnny and Contribution',
    tags: ['data structures', 'graphs', 'greedy', 'sortings'],
    difficulty: 2000,
    url: 'https://codeforces.com/problemset/problem/1361/D',
    solved: 1623,
    category: getDifficultyCategory(2000),
    dateAdded: '2024-03-15',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 169,
    dislikes: 13
  },
  {
    id: '1325F',
    name: "Ehab's Last Theorem",
    tags: ['constructive algorithms', 'dfs and similar', 'graphs'],
    difficulty: 2500,
    url: 'https://codeforces.com/problemset/problem/1325/F',
    solved: 897,
    category: getDifficultyCategory(2500),
    dateAdded: '2024-03-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 215,
    dislikes: 7
  },
  {
    id: '1394C',
    name: 'Boboniu and String',
    tags: ['binary search', 'geometry', 'ternary search'],
    difficulty: 2300,
    url: 'https://codeforces.com/problemset/problem/1394/C',
    solved: 1089,
    category: getDifficultyCategory(2300),
    dateAdded: '2024-03-25',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 187,
    dislikes: 9
  }
];
