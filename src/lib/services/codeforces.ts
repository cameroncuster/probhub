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
    id: '1A',
    name: 'Theatre Square',
    tags: ['math', 'implementation'],
    difficulty: 1000,
    url: 'https://codeforces.com/problemset/problem/1/A',
    solved: 187000,
    category: getDifficultyCategory(1000),
    dateAdded: '2023-12-15',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 342,
    dislikes: 21
  },
  {
    id: '4A',
    name: 'Watermelon',
    tags: ['brute force', 'math'],
    difficulty: 800,
    url: 'https://codeforces.com/problemset/problem/4/A',
    solved: 250000,
    category: getDifficultyCategory(800),
    dateAdded: '2023-12-10',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 521,
    dislikes: 15
  },
  {
    id: '71A',
    name: 'Way Too Long Words',
    tags: ['strings', 'implementation'],
    difficulty: 800,
    url: 'https://codeforces.com/problemset/problem/71/A',
    solved: 230000,
    category: getDifficultyCategory(800),
    dateAdded: '2023-12-12',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 412,
    dislikes: 18
  },
  {
    id: '1328C',
    name: 'Ternary XOR',
    tags: ['greedy', 'implementation', 'math'],
    difficulty: 1200,
    url: 'https://codeforces.com/problemset/problem/1328/C',
    solved: 15000,
    category: getDifficultyCategory(1200),
    dateAdded: '2023-12-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 287,
    dislikes: 24
  },
  {
    id: '1352G',
    name: 'Special Permutation',
    tags: ['constructive algorithms'],
    difficulty: 1600,
    url: 'https://codeforces.com/problemset/problem/1352/G',
    solved: 8500,
    category: getDifficultyCategory(1600),
    dateAdded: '2024-01-05',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 356,
    dislikes: 12
  },
  {
    id: '1354D',
    name: 'Multiset',
    tags: ['binary search', 'data structures'],
    difficulty: 1900,
    url: 'https://codeforces.com/problemset/problem/1354/D',
    solved: 7200,
    category: getDifficultyCategory(1900),
    dateAdded: '2024-01-10',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 245,
    dislikes: 8
  },
  {
    id: '1336A',
    name: 'Linova and Kingdom',
    tags: ['dfs and similar', 'dp', 'greedy', 'sortings', 'trees'],
    difficulty: 1600,
    url: 'https://codeforces.com/problemset/problem/1336/A',
    solved: 6800,
    category: getDifficultyCategory(1600),
    dateAdded: '2024-01-15',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 198,
    dislikes: 14
  },
  {
    id: '1363C',
    name: 'Game On Leaves',
    tags: ['games', 'trees'],
    difficulty: 1600,
    url: 'https://codeforces.com/problemset/problem/1363/C',
    solved: 5500,
    category: getDifficultyCategory(1600),
    dateAdded: '2024-01-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 176,
    dislikes: 9
  },
  {
    id: '339A',
    name: 'Helpful Maths',
    tags: ['greedy', 'implementation', 'sortings', 'strings'],
    difficulty: 900,
    url: 'https://codeforces.com/problemset/problem/339/A',
    solved: 165000,
    category: getDifficultyCategory(900),
    dateAdded: '2024-01-25',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 234,
    dislikes: 11
  },
  {
    id: '1365D',
    name: 'Solve The Maze',
    tags: [
      'constructive algorithms',
      'dfs and similar',
      'dsu',
      'graphs',
      'greedy',
      'shortest paths'
    ],
    difficulty: 1700,
    url: 'https://codeforces.com/problemset/problem/1365/D',
    solved: 5200,
    category: getDifficultyCategory(1700),
    dateAdded: '2024-01-30',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 187,
    dislikes: 15
  },
  {
    id: '1370C',
    name: 'Number Game',
    tags: ['games', 'math', 'number theory'],
    difficulty: 1400,
    url: 'https://codeforces.com/problemset/problem/1370/C',
    solved: 6100,
    category: getDifficultyCategory(1400),
    dateAdded: '2024-02-05',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 165,
    dislikes: 7
  },
  {
    id: '1372C',
    name: 'Omkar and Baseball',
    tags: ['constructive algorithms', 'math'],
    difficulty: 1500,
    url: 'https://codeforces.com/problemset/problem/1372/C',
    solved: 5800,
    category: getDifficultyCategory(1500),
    dateAdded: '2024-02-10',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 210,
    dislikes: 13
  },
  {
    id: '1389C',
    name: 'Good String',
    tags: ['brute force', 'data structures', 'dp', 'greedy', 'two pointers'],
    difficulty: 1500,
    url: 'https://codeforces.com/problemset/problem/1389/C',
    solved: 5500,
    category: getDifficultyCategory(1500),
    dateAdded: '2024-02-15',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 178,
    dislikes: 6
  },
  {
    id: '1391C',
    name: 'Cyclic Permutations',
    tags: ['combinatorics', 'dp', 'graphs', 'math'],
    difficulty: 1500,
    url: 'https://codeforces.com/problemset/problem/1391/C',
    solved: 5200,
    category: getDifficultyCategory(1500),
    dateAdded: '2024-02-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 156,
    dislikes: 8
  },
  {
    id: '1398C',
    name: 'Good Subarrays',
    tags: ['data structures', 'dp', 'math'],
    difficulty: 1600,
    url: 'https://codeforces.com/problemset/problem/1398/C',
    solved: 4800,
    category: getDifficultyCategory(1600),
    dateAdded: '2024-02-25',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 143,
    dislikes: 5
  },
  {
    id: '1399D',
    name: 'Binary String To Subsequences',
    tags: ['constructive algorithms', 'data structures', 'greedy', 'implementation'],
    difficulty: 1500,
    url: 'https://codeforces.com/problemset/problem/1399/D',
    solved: 4500,
    category: getDifficultyCategory(1500),
    dateAdded: '2024-03-01',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 132,
    dislikes: 4
  },
  {
    id: '1406C',
    name: 'Link Cut Centroids',
    tags: ['constructive algorithms', 'dfs and similar', 'graphs', 'trees'],
    difficulty: 1700,
    url: 'https://codeforces.com/problemset/problem/1406/C',
    solved: 4200,
    category: getDifficultyCategory(1700),
    dateAdded: '2024-03-05',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 121,
    dislikes: 9
  },
  {
    id: '1517C',
    name: 'Fillomino 2',
    tags: ['constructive algorithms', 'dfs and similar', 'greedy', 'implementation'],
    difficulty: 1400,
    url: 'https://codeforces.com/problemset/problem/1517/C',
    solved: 5800,
    category: getDifficultyCategory(1400),
    dateAdded: '2024-03-10',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 167,
    dislikes: 12
  },
  {
    id: '1472G',
    name: 'Moving to the Capital',
    tags: ['dfs and similar', 'dp', 'graphs', 'shortest paths'],
    difficulty: 2100,
    url: 'https://codeforces.com/problemset/problem/1472/G',
    solved: 3200,
    category: getDifficultyCategory(2100),
    dateAdded: '2024-03-15',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 98,
    dislikes: 7
  },
  {
    id: '1349C',
    name: 'Orac and Game of Life',
    tags: ['bfs', 'constructive algorithms', 'dp', 'graphs', 'implementation', 'shortest paths'],
    difficulty: 2500,
    url: 'https://codeforces.com/problemset/problem/1349/C',
    solved: 1800,
    category: getDifficultyCategory(2500),
    dateAdded: '2024-03-20',
    addedBy: 'camc',
    addedByUrl: 'https://codeforces.com/profile/camc',
    likes: 87,
    dislikes: 3
  }
];
