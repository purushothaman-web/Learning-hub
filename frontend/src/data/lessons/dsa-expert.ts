import type { Lesson } from '../../types/curriculum';

export const dsaExpertLessons: Lesson[] = [
  {
    id: 'advanced-dp',
    title: 'Advanced Dynamic Programming',
    badge: 'Expert Algorithm',
    badgeClass: 'badge-concept',
    content: [
      'At the mastery level you learned 1D and 2D DP with straightforward state definitions. Advanced DP involves three harder patterns. **Knapsack variants** — a family of problems where you have items with weights/values and a capacity constraint, and must choose items optimally. The 0/1 knapsack (each item used at most once), unbounded knapsack (items reusable), and subset sum are all the same template with minor variations. Recognising the knapsack shape — "choose items to maximise/minimise something subject to a budget" — is the skill.',
      '**Interval DP** operates on subproblems defined by ranges \`[i, j]\`. The recurrence splits the interval at every possible midpoint \`k\` and combines the results. Matrix chain multiplication, burst balloons, and palindrome partitioning all use interval DP. The iteration order matters: you must solve smaller intervals before larger ones, so the outer loop is interval length, not index. **DP on strings** (longest common subsequence, edit distance, longest palindromic subsequence) defines state as \`dp[i][j]\` meaning "answer considering s1[0..i] and s2[0..j]" and handles match/mismatch at each position.',
      '**DP with bitmask** handles problems where the state includes a subset of a small set (typically ≤ 20 elements). A bitmask represents which elements are "chosen" — bit \`i\` is 1 if element \`i\` is in the subset. This enables DP over all 2ⁿ subsets efficiently. The classic problem is **Travelling Salesman** — \`dp[mask][i]\` = minimum cost to visit exactly the cities in \`mask\` and end at city \`i\`. Bitmask DP is the bridge between exponential brute-force and polynomial DP when the constraint is a subset.'
    ],
    instructions: 'Implement the 0/1 Knapsack problem using a 2D DP table. Then, implement the Longest Common Subsequence (LCS) algorithm for two strings.',
    notes: [
      'Knapsack: Choosing items with a weight constraint.',
      'LCS: Finding the longest shared subsequence (not substring).',
      'Bitmask: Using bit manipulation to represent sets in DP states.'
    ],
    code: `// ── 0/1 Knapsack: maximise value within weight limit ──
// State: dp[i][w] = max value using items 0..i with capacity w
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i-1][w]; // skip item i
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1]); // take item i
      }
    }
  }
  return dp[n][capacity];
}
// Time: O(n * capacity)  Space: O(n * capacity), reducible to O(capacity) with 1D array

// ── Longest Common Subsequence (LCS) ──
// State: dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1]
function lcs(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;  // chars match
      else                      dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]); // skip one
    }
  }
  return dp[m][n];
}

// ── Edit Distance (Levenshtein) ──
// State: dp[i][j] = min edits to convert s1[0..i-1] to s2[0..j-1]
function editDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => 
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1]; // no edit needed
      else dp[i][j] = 1 + Math.min(
        dp[i-1][j],   // delete from s1
        dp[i][j-1],   // insert into s1
        dp[i-1][j-1]  // replace
      );
    }
  }
  return dp[m][n];
}

// ── Bitmask DP: minimum cost to visit all cities (TSP) ──
function tsp(dist: number[][]): number {
  const n = dist.length;
  const FULL = (1 << n) - 1; // all bits set = all cities visited
  // dp[mask][i] = min cost to visit cities in mask, ending at city i
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0; // start at city 0, only city 0 visited (bit 0 set)

  for (let mask = 1; mask <= FULL; mask++) {
    for (let u = 0; u < n; u++) {
      if (dp[mask][u] === Infinity) continue;
      if (!(mask & (1 << u))) continue; // u not in mask
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;  // v already visited
        const newMask = mask | (1 << v);
        dp[newMask][v] = Math.min(dp[newMask][v], dp[mask][u] + dist[u][v]);
      }
    }
  }
  // Return to start: min over all ending cities
  return Math.min(...dp[FULL].map((cost, i) => cost + dist[i][0]));
}
// Time: O(2^n * n^2)  — feasible for n ≤ 20`
  },
  {
    id: 'tries',
    title: 'Tries (Prefix Trees)',
    badge: 'Expert DS',
    badgeClass: 'badge-concept',
    content: [
      'A **Trie** (pronounced "try", from re**trie**val) is a tree where each node represents a character, and paths from root to a marked node spell out a word. Unlike a hash map that stores whole strings, a trie shares common prefixes — "apple", "app", "application" all share the same \`a → p → p\` path. This makes tries uniquely powerful for prefix operations: "does any stored word start with \'app\'?" is O(prefix length) regardless of how many words are stored.',
      'The canonical trie operations: **insert** (walk the path character by character, create nodes where missing, mark the final node as end-of-word), **search** (walk the path, return true only if you reach the end and it is marked), **startsWith** (walk the path, return true if you reach the end of the prefix regardless of end-of-word marker). All three are O(L) where L is the word/prefix length — completely independent of how many words are in the trie. Compare this to a hash set where lookup is O(L) too but prefix search requires iterating all keys.',
      'Beyond the classic word dictionary, tries solve a specific class of hard problems: **word search in a grid** (build a trie of target words, DFS on the grid pruning branches not in the trie), **autocomplete systems** (walk to the prefix node, collect all words in the subtree), and **XOR maximisation** (build a binary trie of numbers, for each number greedily take the opposite bit at each level to maximise XOR). The binary trie XOR pattern appears in competitive programming and occasionally in technical interviews at top companies.'
    ],
    instructions: 'Implement a Trie with insert, search, and startsWith operations. Then, use it to build a simple autocomplete engine.',
    notes: [
      'Prefix-Sharing: Tries save space by sharing common prefixes.',
      'Performance: O(L) operations, where L is word length.',
      'Grid Search: Tries are essential for tasks like Boggle or word crosswords.'
    ],
    code: `// ── Trie implementation ──
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
  // Optional: store count for autocomplete ranking
  count = 0;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
      node.count++;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    const node = this._walkTo(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    return this._walkTo(prefix) !== null;
  }

  private _walkTo(s: string): TrieNode | null {
    let node = this.root;
    for (const ch of s) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }

  // Return all words with given prefix (autocomplete)
  autocomplete(prefix: string): string[] {
    const prefixNode = this._walkTo(prefix);
    if (!prefixNode) return [];

    const results: string[] = [];
    function dfs(node: TrieNode, current: string) {
      if (node.isEndOfWord) results.push(current);
      for (const [ch, child] of node.children) {
        dfs(child, current + ch);
      }
    }
    dfs(prefixNode, prefix);
    return results;
  }
}

// ── Trie with wildcards: Word Dictionary ──
// Supports search with '.' matching any character
class WordDictionary {
  private root = new TrieNode();

  addWord(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    return this._dfs(word, 0, this.root);
  }

  private _dfs(word: string, i: number, node: TrieNode): boolean {
    if (i === word.length) return node.isEndOfWord;
    const ch = word[i];
    if (ch === '.') {
      // Wildcard: try all children
      for (const child of node.children.values()) {
        if (this._dfs(word, i + 1, child)) return true;
      }
      return false;
    }
    if (!node.children.has(ch)) return false;
    return this._dfs(word, i + 1, node.children.get(ch)!);
  }
}

// ── Binary Trie: maximum XOR of two numbers ──
function findMaximumXOR(nums: number[]): number {
  // Build binary trie of all numbers (32 bits, MSB first)
  const root = new TrieNode();
  for (const n of nums) {
    let node = root;
    for (let bit = 31; bit >= 0; bit--) {
      const b = String((n >> bit) & 1);
      if (!node.children.has(b)) node.children.set(b, new TrieNode());
      node = node.children.get(b)!;
    }
  }
  let maxXOR = 0;
  for (const n of nums) {
    let node = root, currXOR = 0;
    for (let bit = 31; bit >= 0; bit--) {
      const b = (n >> bit) & 1;
      const want = String(1 - b); // want opposite bit to maximise XOR
      const next = node.children.has(want) ? want : String(b);
      currXOR = (currXOR << 1) | (next !== String(b) ? 1 : 0);
      node = node.children.get(next)!;
    }
    maxXOR = Math.max(maxXOR, currXOR);
  }
  return maxXOR;
}`
  },
  {
    id: 'segment-trees',
    title: 'Segment Trees & Range Queries',
    badge: 'Expert DS',
    badgeClass: 'badge-code',
    content: [
      'A **Segment Tree** is a binary tree built on top of an array where each node stores the result of a query (sum, min, max) over a contiguous subarray. The root covers the full array, each internal node covers the union of its children\'s ranges, and leaves cover individual elements. This structure enables two operations in O(log n) that would otherwise be O(n): **range queries** ("what is the sum of elements from index l to r?") and **point updates** ("update element at index i to value v"). The naive approach — iterate from l to r for each query — is O(n) per query, making it O(n²) for n queries. A segment tree makes it O(n log n) total.',
      'Segment trees are typically implemented as **arrays** rather than explicit node objects. For a node at index \`i\`, its left child is at \`2i\` and right child at \`2i+1\` (1-indexed). A tree for an array of size n needs at most \`4n\` space. This is the same array-based indexing used in heaps. The **build** operation fills the tree bottom-up in O(n). Updates propagate changes up from a leaf in O(log n). Queries decompose the range into O(log n) pre-computed segments and combine them.',
      '**Lazy propagation** extends segment trees to handle **range updates** efficiently — "add 5 to every element from index l to r". Without lazy propagation, this requires updating O(n) leaves. With lazy propagation, you mark the update as "pending" on the highest nodes that fully cover the range and propagate it downward only when those nodes are accessed. This keeps both range updates and range queries at O(log n). Lazy propagation is the key technique that makes segment trees applicable to the full class of range update + range query problems.'
    ],
    instructions: 'Implement a Segment Tree to handle Range Sum Queries and Point Updates. Then, research and implement a Fenwick Tree for simpler prefix sums.',
    notes: [
      'Range Aggregation: Sum, Min, Max, GCD, etc.',
      'Space: O(4n) array is usually enough to store the tree.',
      'Efficiency: Range queries become O(log n) instead of O(n).'
    ],
    code: `// ── Segment Tree: range sum query + point update ──
class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this._build(arr, 0, 0, this.n - 1);
  }

  private _build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start];  // leaf: store element
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this._build(arr, 2*node+1, start, mid);    // build left child
    this._build(arr, 2*node+2, mid+1, end);    // build right child
    this.tree[node] = this.tree[2*node+1] + this.tree[2*node+2]; // internal: sum of children
  }

  // Point update: set arr[idx] = val
  update(idx: number, val: number): void {
    this._update(0, 0, this.n - 1, idx, val);
  }

  private _update(node: number, start: number, end: number, idx: number, val: number): void {
    if (start === end) {
      this.tree[node] = val;  // update leaf
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this._update(2*node+1, start, mid, idx, val);
    else            this._update(2*node+2, mid+1, end, idx, val);
    this.tree[node] = this.tree[2*node+1] + this.tree[2*node+2]; // recompute on way up
  }

  // Range sum query: sum of arr[l..r]
  query(l: number, r: number): number {
    return this._query(0, 0, this.n - 1, l, r);
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return 0;           // completely outside range
    if (l <= start && end <= r) return this.tree[node]; // completely inside range
    const mid = Math.floor((start + end) / 2);
    return this._query(2*node+1, start, mid, l, r) +
           this._query(2*node+2, mid+1, end, l, r);
  }
}

// Time: Build O(n), Query O(log n), Update O(log n)
// Space: O(n)

// Usage:
const st = new SegmentTree([1, 3, 5, 7, 9, 11]);
st.query(1, 3);   // sum of indices 1-3 = 3+5+7 = 15
st.update(1, 10); // set index 1 to 10
st.query(1, 3);   // now 10+5+7 = 22

// ── Fenwick Tree (Binary Indexed Tree): simpler range sum ──
// Simpler to code than segment tree for prefix sum queries only
class FenwickTree {
  private tree: number[];

  constructor(n: number) {
    this.tree = new Array(n + 1).fill(0);
  }

  // Add delta to index i (1-indexed)
  update(i: number, delta: number): void {
    for (; i < this.tree.length; i += i & (-i)) // i & (-i) = lowest set bit
      this.tree[i] += delta;
  }

  // Prefix sum: sum of elements 1..i
  prefixSum(i: number): number {
    let sum = 0;
    for (; i > 0; i -= i & (-i))
      sum += this.tree[i];
    return sum;
  }

  // Range sum: sum of elements l..r
  rangeSum(l: number, r: number): number {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }
}
// Time: O(log n) per operation  Space: O(n)
// Use Fenwick when you only need point updates + prefix/range sum queries
// Use Segment Tree when you need range updates or non-sum aggregations (min/max)`
  },
  {
    id: 'shortest-path-algorithms',
    title: 'Shortest Path: Dijkstra & Bellman-Ford',
    badge: 'Expert Algorithm',
    badgeClass: 'badge-concept',
    content: [
      '**Dijkstra\'s algorithm** finds the shortest path from a source node to all other nodes in a weighted graph with **non-negative edge weights**. The core idea: always expand the unvisited node with the smallest known distance. Use a min-heap (priority queue) to efficiently get the next node — this gives O((V + E) log V) time. Dijkstra fails on negative weights because it assumes that once a node is settled (popped from the heap), its distance is final. A negative edge could later provide a shorter path, violating this assumption.',
      '**Bellman-Ford** handles negative edge weights by relaxing all edges V-1 times. Each pass guarantees that shortest paths of length up to k edges are found after k passes. V-1 passes cover all possible shortest paths (any simple path has at most V-1 edges). On the Vth pass, if any edge can still be relaxed, a **negative cycle** exists (a cycle whose total weight is negative — you could loop forever to get an arbitrarily short path). Bellman-Ford detects this. Time complexity is O(V * E) — slower than Dijkstra but handles the full problem.',
      '**Floyd-Warshall** solves the **all-pairs shortest path** problem — shortest path between every pair of nodes — in O(V³). The key insight: \`dp[i][j][k]\` = shortest path from i to j using only nodes 1..k as intermediaries. By iterating k from 1 to V, you progressively allow more intermediate nodes. This is DP on graph structure. Use Floyd-Warshall when you need all-pairs distances on a small dense graph (V ≤ 500). For sparse graphs, run Dijkstra from every source instead.'
    ],
    instructions: 'Implement Dijkstra\'s algorithm using a Min-Priority Queue. Then, implement Bellman-Ford and add a check for negative weight cycles.',
    notes: [
      'Dijkstra: Greedy approach for shortest paths with positive weights.',
      'Bellman-Ford: Handles negative weights but is slower O(V*E).',
      'All-Pairs: Floyd-Warshall is best for finding all paths in O(V³).'
    ],
    code: `// ── Dijkstra: single-source shortest path (non-negative weights) ──
type WeightedGraph = Map<number, [number, number][]>; // node → [[neighbour, weight]]

function dijkstra(graph: WeightedGraph, source: number, V: number): number[] {
  const dist = new Array(V).fill(Infinity);
  dist[source] = 0;

  // Min-heap: [distance, node]
  // JS has no built-in — simulate with sorted array for small graphs
  // In interviews, note you'd use a proper min-heap for O((V+E) log V)
  const heap: [number, number][] = [[0, source]];

  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]);          // O(V log V) — use real heap in prod
    const [d, u] = heap.shift()!;

    if (d > dist[u]) continue;                  // outdated entry — skip

    for (const [v, weight] of graph.get(u) ?? []) {
      const newDist = dist[u] + weight;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        heap.push([newDist, v]);
      }
    }
  }
  return dist;
}

// ── Bellman-Ford: handles negative weights, detects negative cycles ──
type Edge = [number, number, number]; // [from, to, weight]

function bellmanFord(V: number, edges: Edge[], source: number): number[] | null {
  const dist = new Array(V).fill(Infinity);
  dist[source] = 0;

  // Relax all edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    let updated = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        updated = true;
      }
    }
    if (!updated) break; // early termination if no updates
  }

  // Vth pass: if any edge still relaxes → negative cycle exists
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      return null; // negative cycle detected
    }
  }
  return dist;
}
// Time: O(V * E)

// ── Floyd-Warshall: all-pairs shortest paths ──
function floydWarshall(graph: number[][]): number[][] {
  const V = graph.length;
  // dp[i][j] = shortest distance from i to j
  const dp = graph.map(row => [...row]); // deep copy

  for (let k = 0; k < V; k++) {         // try each node as intermediate
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dp[i][k] + dp[k][j] < dp[i][j]) {
          dp[i][j] = dp[i][k] + dp[k][j]; // route through k is shorter
        }
      }
    }
  }
  return dp;
}
// Time: O(V³)  Space: O(V²)
// Input: adjacency matrix where graph[i][j] = weight (Infinity if no edge)

// ── When to use which ──
// Dijkstra:      single source, non-negative weights,  sparse graph  → O((V+E) log V)
// Bellman-Ford:  single source, negative weights ok,   detects cycles → O(V*E)
// Floyd-Warshall: all pairs,   negative weights ok,    dense/small   → O(V³)`
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    badge: 'Expert Algorithm',
    badgeClass: 'badge-concept',
    content: [
      '**Backtracking** is a systematic way to try all possible solutions by building a solution incrementally and abandoning ("backtracking") a partial solution the moment it is determined that it cannot lead to a valid complete solution. It is DFS on an implicit decision tree where each level of the tree represents a choice. The power of backtracking is **pruning** — cutting branches of the tree before fully exploring them. Without pruning, backtracking degenerates to brute-force enumeration.',
      'The backtracking template is always the same: (1) **base case** — if the current partial solution is complete, record it and return; (2) **loop over choices** — for each valid choice at the current step; (3) **make the choice** — add it to the current solution; (4) **recurse** — solve the remaining subproblem; (5) **undo the choice** (backtrack) — remove it from the current solution before the next iteration. The undo step is what distinguishes backtracking from plain DFS — you must restore state so the next branch starts clean.',
      'The three classic backtracking problem families: **Subsets/Combinations** (generate all subsets of size k, combinations that sum to target), **Permutations** (generate all arrangements of elements), and **Constraint satisfaction** (N-Queens, Sudoku solver, word search in grid). The key optimisation in each: prune early. In combinations summing to target, stop recursing once the running sum exceeds the target. In N-Queens, maintain sets of occupied columns, diagonals, and anti-diagonals and skip invalid placements instantly.'
    ],
    instructions: 'Implement the core backtracking template to generate all permutations of an array. Then, solve the N-Queens problem using efficient diagonal constraint tracking.',
    notes: [
      'Pruning: Abandoning paths that cannot possibly lead to a solution.',
      'State Restore: Always "undo" the choice after recursing.',
      'Recursion Depth: Backtracking can be slow (O(2ⁿ) or O(n!)) without aggressive pruning.'
    ],
    code: `// ── Template: backtracking skeleton ──
function backtrack(
  choices: number[],
  current: number[],
  results: number[][]
): void {
  // 1. Base case: solution is complete
  if (isSolution(current)) {
    results.push([...current]); // ✅ copy — don't push reference
    return;
  }
  // 2. Try each choice
  for (const choice of choices) {
    if (!isValid(choice, current)) continue; // prune ✅
    current.push(choice);                    // 3. make choice
    backtrack(choices, current, results);    // 4. recurse
    current.pop();                           // 5. undo choice (backtrack) ✅
  }
}

// ── Subsets: generate all subsets of an array ──
function subsets(nums: number[]): number[][] {
  const results: number[][] = [];

  function bt(start: number, current: number[]) {
    results.push([...current]); // every partial path is a valid subset
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      bt(i + 1, current);  // i+1 ensures no duplicates (use each element once)
      current.pop();
    }
  }
  bt(0, []);
  return results;
}
// [1,2,3] → [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]

// ── Combinations summing to target ──
function combinationSum(candidates: number[], target: number): number[][] {
  const results: number[][] = [];
  candidates.sort((a, b) => a - b); // sort enables early pruning

  function bt(start: number, current: number[], remaining: number) {
    if (remaining === 0) { results.push([...current]); return; }

    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // pruning ✅ — sorted so all further are larger
      current.push(candidates[i]);
      bt(i, current, remaining - candidates[i]); // i not i+1: can reuse same element
      current.pop();
    }
  }
  bt(0, [], target);
  return results;
}

// ── Permutations ──
function permutations(nums: number[]): number[][] {
  const results: number[][] = [];
  const used = new Array(nums.length).fill(false);

  function bt(current: number[]) {
    if (current.length === nums.length) { results.push([...current]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      bt(current);
      current.pop();
      used[i] = false; // ✅ undo
    }
  }
  bt([]);
  return results;
}

// ── N-Queens: place N queens on N×N board, none attacking ──
function solveNQueens(n: number): string[][] {
  const results: string[][] = [];
  const cols = new Set<number>();
  const diag1 = new Set<number>(); // row - col is constant on a diagonal
  const diag2 = new Set<number>(); // row + col is constant on an anti-diagonal
  const board = Array.from({ length: n }, () => Array(n).fill('.'));

  function bt(row: number) {
    if (row === n) { results.push(board.map(r => r.join(''))); return; }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row-col) || diag2.has(row+col)) continue; // pruning ✅
      cols.add(col); diag1.add(row-col); diag2.add(row+col);
      board[row][col] = 'Q';
      bt(row + 1);
      board[row][col] = '.';
      cols.delete(col); diag1.delete(row-col); diag2.delete(row+col);
    }
  }
  bt(0);
  return results;
}`
  },
  {
    id: 'complexity-analysis',
    title: 'Complexity Analysis & Problem Patterns',
    badge: 'Expert Mindset',
    badgeClass: 'badge-practice',
    content: [
      'Deep complexity analysis goes beyond labelling an algorithm O(n log n). It means **reasoning about which algorithm is optimal for a given problem** — and proving it. The key tool is a **lower bound argument**: if the problem requires examining every element at least once, it is Ω(n) no matter what algorithm you use. Comparison-based sorting is Ω(n log n) by an information-theoretic argument (there are n! possible orderings and each comparison halves the possibilities, so you need at least log₂(n!) ≈ n log n comparisons). Knowing lower bounds tells you when you have found an optimal algorithm and when a faster one might exist.',
      '**Amortised analysis** explains why an operation that is occasionally expensive is cheap on average. A dynamic array (like JavaScript\'s Array) doubles capacity when full. A single push can trigger an O(n) copy. But over n pushes, the total copy work is n/2 + n/4 + ... = n, so each push is O(1) amortised. A plain worst-case analysis would incorrectly conclude push is O(n). Similarly, the union-find `find` operation with path compression is nearly O(1) amortised (O(α(n)) where α is the inverse Ackermann function — effectively constant for all practical inputs).',
      'The most valuable skill at the expert level is **pattern recognition** — seeing a new problem and immediately knowing which algorithm family applies. The decision tree: does the problem ask for all possibilities → backtracking. Shortest/minimum/maximum of something → DP or greedy. Graph connectivity → union-find or DFS. Shortest path with weights → Dijkstra. Prefix/range queries with updates → segment tree or Fenwick. Sorted data + search → binary search. Repeated string/prefix operations → trie. Top-k elements → heap. This mapping, built through deliberate practice, is what separates expert-level performance from memorising solutions.'
    ],
    code: `// ── Union-Find (Disjoint Set Union): O(α(n)) ≈ O(1) amortised ──
// Best structure for: connected components, cycle detection, Kruskal's MST
class UnionFind {
  private parent: number[];
  private rank:   number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i); // each node is its own parent
    this.rank   = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression ✅
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false; // already in same set → adding edge creates cycle
    // Union by rank: attach smaller tree under larger ✅
    if      (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }
}

// ── Kruskal's Minimum Spanning Tree using Union-Find ──
function kruskalMST(V: number, edges: [number, number, number][]): number {
  edges.sort((a, b) => a[2] - b[2]); // sort by weight ascending
  const uf = new UnionFind(V);
  let totalWeight = 0;

  for (const [u, v, w] of edges) {
    if (uf.union(u, v)) { // only add edge if it doesn't create a cycle
      totalWeight += w;
    }
  }
  return totalWeight;
}
// Time: O(E log E) for sorting  Space: O(V)

// ── Complexity quick-reference cheat sheet ──
// O(1)        — hash map lookup, array access, stack push/pop
// O(log n)    — binary search, BST operation (balanced), heap push/pop
// O(n)        — linear scan, BFS/DFS, two-pointer, sliding window
// O(n log n)  — merge sort, heap sort, Dijkstra O((V+E)logV)
// O(n²)       — nested loops, bubble sort, naive string matching
// O(n³)       — Floyd-Warshall, naive matrix multiplication
// O(2^n)      — backtracking (subsets), brute-force TSP
// O(n!)       — generating all permutations

// ── Pattern → Algorithm mapping ──
const PATTERN_MAP = {
  'find all combinations/subsets':      'Backtracking',
  'shortest path, unweighted':          'BFS',
  'shortest path, weighted ≥ 0':        'Dijkstra',
  'shortest path, negative weights':    'Bellman-Ford',
  'all-pairs shortest path':            'Floyd-Warshall',
  'prefix/range sum with updates':      'Segment Tree / Fenwick',
  'word prefix / autocomplete':         'Trie',
  'connected components / cycle check': 'Union-Find',
  'top-k / k-th largest':              'Min-Heap of size k',
  'sorted input + search':             'Binary Search',
  'optimise over choices':             'DP (if overlapping) or Greedy',
  'minimum spanning tree':             'Kruskal (Union-Find) or Prim',
} as const;

// ── Space-time tradeoff: the universal principle ──
// Almost every optimisation is trading space for time:
// - Memoisation:  O(n) extra space → eliminates O(2^n) recomputation
// - Hash map:     O(n) extra space → O(1) lookup instead of O(n) scan
// - Prefix sum:   O(n) extra space → O(1) range sum instead of O(n)
// - Segment tree: O(n) extra space → O(log n) range query instead of O(n)
// When asked "can you do better?", first ask "can I precompute something?"`
  }
];