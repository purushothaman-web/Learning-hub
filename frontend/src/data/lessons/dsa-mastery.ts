import type { Lesson } from '../../types/curriculum';

export const dsaMasteryLessons: Lesson[] = [
  {
    id: 'trees-binary-trees',
    title: 'Trees & Binary Trees',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      'A tree is a hierarchical data structure where each node has zero or more children and exactly one parent (except the root which has none). A **Binary Tree** restricts each node to at most two children: left and right. Trees model almost everything hierarchical — file systems, DOM structure, organisation charts, decision trees. The key property that makes trees tractable is their recursive structure: every subtree is itself a valid tree, so recursive solutions are natural.',
      'There are four fundamental tree traversals, each visiting nodes in a different order. **Pre-order (Root → Left → Right)** is used for copying a tree or serialising it. **In-order (Left → Root → Right)** on a BST produces elements in sorted order — this is crucial. **Post-order (Left → Right → Root)** is used for deleting a tree or evaluating expression trees. **Level-order (BFS)** visits nodes layer by layer using a queue — used for shortest path in unweighted trees and finding tree height.',
      'The most important tree property to compute is **height** (longest path from root to any leaf). Height determines time complexity: a balanced tree of n nodes has height O(log n), making operations fast. An unbalanced tree degenerates to height O(n) — essentially a linked list — making operations slow. When you see a recursive tree problem, almost always start by thinking: "what does this function return for a single node?" and "how do I combine left and right results?" That two-step thinking solves 80% of tree problems.'
    ],
    instructions: 'Implement the three Depth-First Search (DFS) traversals: Pre-order, In-order, and Post-order. Then, write a function to calculate the maximum height of a binary tree.',
    notes: [
      'Recursion: Tree problems are almost always recursive.',
      'Balanced vs Unbalanced: Performance depends on the tree height.',
      'Traversals: In-order is the most common for BST verification.'
    ],
    code: `class TreeNode {
  constructor(
    public val: number,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null
  ) {}
}

// ── Four traversals ──
function preOrder(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  result.push(node.val);           // Root first
  preOrder(node.left, result);
  preOrder(node.right, result);
  return result;
}

function inOrder(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  inOrder(node.left, result);
  result.push(node.val);           // Root in middle → sorted for BST
  inOrder(node.right, result);
  return result;
}

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const level: number[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

// ── Height of a tree ──
function height(node: TreeNode | null): number {
  if (!node) return 0;                              // base case: empty tree
  return 1 + Math.max(height(node.left), height(node.right));
}

// ── Check if tree is balanced (heights differ by at most 1) ──
function isBalanced(node: TreeNode | null): boolean {
  function checkHeight(node: TreeNode | null): number {
    if (!node) return 0;
    const left  = checkHeight(node.left);
    if (left === -1) return -1;                     // already unbalanced below
    const right = checkHeight(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;      // this node is unbalanced
    return 1 + Math.max(left, right);
  }
  return checkHeight(node) !== -1;
}

// ── Lowest Common Ancestor ──
function lowestCommonAncestor(root: TreeNode | null, p: number, q: number): TreeNode | null {
  if (!root || root.val === p || root.val === q) return root;
  const left  = lowestCommonAncestor(root.left,  p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;  // p and q are on different sides — root is LCA
  return left ?? right;            // both on same side
}`
  },
  {
    id: 'binary-search-trees',
    title: 'Binary Search Trees',
    badge: 'Core DS',
    badgeClass: 'badge-code',
    content: [
      'A **Binary Search Tree (BST)** adds one critical invariant to a binary tree: for every node, all values in the left subtree are smaller, and all values in the right subtree are larger. This invariant makes search, insertion, and deletion O(log n) on a balanced tree — you eliminate half the candidates at each step, exactly like binary search on a sorted array. In fact, a BST is essentially a binary search structure made binary search structure made dynamic (you can insert and delete without shifting elements).',
      'The BST invariant makes in-order traversal produce sorted output automatically — a fact that gets used constantly in interview problems. "Find the kth smallest element in a BST" is simply "run in-order and return the kth element". "Validate a BST" cannot be solved by just comparing a node to its children — you must track the valid range \`(min, max)\` for each node as you recurse. A classic mistake is checking \`node.val > node.left.val\` — that passes invalid trees where a node in the left subtree violates the ancestor constraint.',
      'BST operations degrade to O(n) if the tree becomes unbalanced — inserting [1, 2, 3, 4, 5] in order produces a right-skewed tree that is just a linked list. **Self-balancing BSTs** (AVL trees, Red-Black trees) automatically rebalance on insert/delete to maintain O(log n) guarantees. You do not need to implement these from scratch, but you must know they exist and that JavaScript\'s built-in \`Map\` and \`Set\` are typically implemented as hash tables, not BSTs — they give O(1) average but no ordering guarantees.'
    ],
    instructions: 'Implement a function to search for a value in a BST. Then, implement the core BST validation algorithm using the min/max range-tracking approach.',
    notes: [
      'In-Order: Visiting a BST in-order always yields sorted values.',
      'Complexity: Balanced O(log n), Unbalanced O(n).',
      'Validation: A node must be greater than ALL left children and smaller than ALL right children.'
    ],
    code: `class BSTNode {
  constructor(
    public val: number,
    public left: BSTNode | null = null,
    public right: BSTNode | null = null
  ) {}
}

// ── BST Search ──
function search(root: BSTNode | null, target: number): BSTNode | null {
  if (!root || root.val === target) return root;
  if (target < root.val) return search(root.left, target);
  return search(root.right, target);
}
// Time: O(log n) balanced, O(n) worst case (skewed tree)

// ── BST Insert ──
function insert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return new BSTNode(val);  // base case: found the right spot
  if (val < root.val) root.left  = insert(root.left,  val);
  else                root.right = insert(root.right, val);
  return root;
}

// ── Validate a BST (the correct way — track min/max bounds) ──
function isValidBST(
  node: BSTNode | null,
  min = -Infinity,
  max = Infinity
): boolean {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false; // violates ancestor constraint
  return isValidBST(node.left,  min, node.val) &&  // left must be < current val
         isValidBST(node.right, node.val, max);    // right must be > current val
}

// ── Kth smallest in BST (in-order = sorted) ──
function kthSmallest(root: BSTNode | null, k: number): number {
  const stack: BSTNode[] = [];
  let node = root;
  let count = 0;

  while (node || stack.length) {
    while (node) { stack.push(node); node = node.left; }  // go left as far as possible
    node = stack.pop()!;
    count++;
    if (count === k) return node.val;
    node = node.right;
  }
  return -1;
}

// ── BST to sorted array (in-order traversal) ──
function bstToSorted(root: BSTNode | null): number[] {
  const result: number[] = [];
  function inOrder(node: BSTNode | null) {
    if (!node) return;
    inOrder(node.left);
    result.push(node.val);  // visits in sorted order automatically
    inOrder(node.right);
  }
  inOrder(root);
  return result;
}`
  },
  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      'A **Heap** is a complete binary tree (all levels filled left to right) with the heap property: in a **Max Heap** every parent is greater than or equal to its children, so the maximum is always at the root. In a **Min Heap** every parent is smaller, so the minimum is at the root. This gives O(1) access to the min/max, O(log n) insertion, and O(log n) extraction. Heaps are almost always implemented as arrays — the parent of index \`i\` is at \`Math.floor((i-1)/2)\`, left child at \`2i+1\`, right child at \`2i+2\`.',
      'A **Priority Queue** is the abstract data type — "always give me the highest priority element next" — and a heap is the most common implementation. JavaScript does not have a built-in priority queue, so in interviews you either implement a min heap or simulate one with a sorted array (acceptable for small inputs). Recognise the priority queue pattern: whenever a problem asks for the "k largest", "k smallest", "kth element", "merge k sorted lists", or involves scheduling — a heap is almost certainly the right tool.',
      'The two heap techniques to master: **K-largest elements** (use a min heap of size k — maintain only the k largest seen so far, the root is the kth largest) and **merge k sorted arrays** (push the first element of each array into a min heap, repeatedly extract the minimum and push the next element from that same array). Both run in O(n log k) which is dramatically better than the O(n log n) sort-everything approach when k is small.'
    ],
    instructions: 'Implement a basic Min-Heap class. Then, use it to solve the "K-th Largest Element" problem with O(n log k) complexity.',
    notes: [
      'Max vs Min: A Max-Heap keeps the largest element at the root.',
      'Array Logic: Parent = floor((i-1)/2), Left = 2i+1, Right = 2i+2.',
      'Streaming: Heaps are perfect for processing data that arrives in a stream.'
    ],
    code: `// ── Min Heap implementation (JavaScript has no built-in) ──
class MinHeap {
  private heap: number[] = [];

  private parent = (i: number) => Math.floor((i - 1) / 2);
  private left   = (i: number) => 2 * i + 1;
  private right  = (i: number) => 2 * i + 2;

  size() { return this.heap.length; }
  peek() { return this.heap[0]; }         // O(1) — min is always at root

  push(val: number) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1); // restore heap property upward
  }

  pop(): number {
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);                  // restore heap property downward
    }
    return min;
  }

  private _bubbleUp(i: number) {
    while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
      const p = this.parent(i);
      [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
      i = p;
    }
  }

  private _siftDown(i: number) {
    let smallest = i;
    const l = this.left(i), r = this.right(i), n = this.heap.length;
    if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
    if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
    if (smallest !== i) {
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      this._siftDown(smallest);
    }
  }
}

// ── K largest elements (min heap of size k) ──
function kLargest(nums: number[], k: number): number[] {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop();  // evict smallest — keep only k largest
  }
  const result: number[] = [];
  while (heap.size()) result.push(heap.pop());
  return result.reverse(); // largest first
}
// Time: O(n log k)  Space: O(k) — much better than O(n log n) sort

// ── Kth largest element ──
function findKthLargest(nums: number[], k: number): number {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size() > k) heap.pop();
  }
  return heap.peek(); // root of min heap = kth largest
}

// ── Merge k sorted arrays ──
function mergeKSorted(arrays: number[][]): number[] {
  const heap = new MinHeap(); // stores [value, arrayIndex, elementIndex]
  const result: number[] = [];
  // Conceptual — real impl stores tuples; shown here for clarity
  // Push first element of each array, track which array it came from
  // Extract min, push next from same array — O(n log k)
  return result;
}`
  },
  {
    id: 'graphs-bfs-dfs',
    title: 'Graphs: BFS & DFS',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      'A **Graph** is a collection of nodes (vertices) connected by edges. Trees are a special case of graphs — a connected, acyclic graph. Graphs can be **directed** (edges have direction, like Twitter follows) or **undirected** (edges are bidirectional, like Facebook friends). They can be **weighted** (edges have costs, like road distances) or **unweighted**. Graphs are the most general and powerful data structure — they model social networks, maps, dependency systems, web pages, and anything with relationships.',
      '**BFS (Breadth-First Search)** explores layer by layer using a queue. It finds the **shortest path** in an unweighted graph because it always explores nearer nodes before farther ones. Use BFS for: shortest path, minimum steps, "spreading" problems (disease spread, fire spread, word ladder). **DFS (Depth-First Search)** explores as deep as possible before backtracking, using either recursion (implicit stack) or an explicit stack. Use DFS for: detecting cycles, topological sort, finding connected components, path existence problems, and any problem involving exploring all possibilities.',
      'The single most important thing in graph algorithms: **track visited nodes** to avoid infinite loops in cyclic graphs. A \`visited\` Set or boolean array prevents re-processing nodes. Without it, BFS and DFS on a cyclic graph run forever. The second most important thing: represent the graph correctly. An **adjacency list** (Map from node to list of neighbours) is almost always better than an adjacency matrix for sparse graphs (most real graphs). Matrix is only better when edges are very dense or you need O(1) edge existence checks.'
    ],
    instructions: 'Build an adjacency list from a set of edges. Then, implement both BFS and DFS to explore the graph and find connected components.',
    notes: [
      'Cycle: Cycles lead to infinite loops if nodes aren\'t tracked.',
      'Queue for BFS: FIFO order explores layer-by-layer.',
      'Stack for DFS: LIFO order explores depth-first.'
    ],
    code: `// ── Graph as adjacency list ──
type Graph = Map<number, number[]>;

function buildGraph(edges: [number, number][], directed = false): Graph {
  const graph: Graph = new Map();
  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, []);
    if (!graph.has(v)) graph.set(v, []);
    graph.get(u)!.push(v);
    if (!directed) graph.get(v)!.push(u); // undirected: add both directions
  }
  return graph;
}

// ── BFS: shortest path (unweighted) ──
function shortestPath(graph: Graph, start: number, end: number): number {
  const visited = new Set<number>([start]);
  const queue: [number, number][] = [[start, 0]]; // [node, distance]

  while (queue.length) {
    const [node, dist] = queue.shift()!;
    if (node === end) return dist;

    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push([neighbour, dist + 1]);
      }
    }
  }
  return -1; // no path exists
}

// ── DFS: detect cycle in directed graph ──
function hasCycle(graph: Graph): boolean {
  const visited  = new Set<number>();
  const inStack  = new Set<number>(); // nodes in current DFS path

  function dfs(node: number): boolean {
    visited.add(node);
    inStack.add(node);

    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour) && dfs(neighbour)) return true;
      if (inStack.has(neighbour)) return true; // back edge = cycle
    }

    inStack.delete(node); // leaving this path
    return false;
  }

  for (const node of graph.keys()) {
    if (!visited.has(node) && dfs(node)) return true;
  }
  return false;
}

// ── DFS on grid: number of islands ──
// Grids are graphs where each cell connects to 4 neighbours
function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // mark visited by sinking the island
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c); // sink entire island
      }
    }
  }
  return count;
}

// ── Topological Sort (DFS post-order) ──
// Order tasks such that all dependencies come first
function topoSort(graph: Graph): number[] {
  const visited = new Set<number>();
  const order:   number[] = [];

  function dfs(node: number) {
    visited.add(node);
    for (const n of graph.get(node) ?? []) {
      if (!visited.has(n)) dfs(n);
    }
    order.push(node); // add AFTER all dependencies are processed
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) dfs(node);
  }
  return order.reverse(); // reverse post-order = topological order
}`
  },
  {
    id: 'dynamic-programming-intro',
    title: 'Dynamic Programming Intro',
    badge: 'Core Algorithm',
    badgeClass: 'badge-concept',
    content: [
      '**Dynamic Programming (DP)** is an optimisation technique for problems with two properties: **Optimal Substructure** (the optimal solution to the problem contains optimal solutions to its subproblems) and **Overlapping Subproblems** (the same subproblems are solved multiple times). When both properties exist, caching subproblem results eliminates redundant work and transforms exponential solutions into polynomial ones. The fibonacci memoization you learned in recursion was already DP — this lesson formalises the pattern.',
      'There are two equivalent DP approaches. **Top-down (Memoization):** start with the original problem, recurse into subproblems, cache results in a Map. Natural to write, stays close to the recursive thinking. **Bottom-up (Tabulation):** start with the smallest subproblems, fill a table iteratively, build up to the original problem. No recursion overhead, slightly harder to derive but often more space-efficient. Both produce the same answer — choose whichever is clearer for the specific problem.',
      'The hardest part of DP is **defining the state**. The state is the minimum information needed to describe a subproblem uniquely. For a 1D DP, the state is often just an index \`i\` meaning "answer for the first i elements". For a 2D DP, the state is often \`(i, j)\` meaning "answer considering items 1..i with capacity j". Once you define the state clearly, the recurrence (how to compute \`dp[i]\` from smaller states) usually follows. Write the recurrence before writing any code.'
    ],
    instructions: 'Implement the "Climbing Stairs" problem using both Top-Down memoization and Bottom-Up tabulation. Then, optimize the Bottom-Up solution for O(1) space.',
    notes: [
      'State: dp[i] represents the answer for a specific subproblem.',
      'Recurrence: The mathematical relationship between subproblems.',
      'Time complexity is usually (Number of states) * (Complexity to calculate one state).'
    ],
    code: `// ── Classic 1D DP: climbing stairs ──
// n stairs, can climb 1 or 2 at a time. How many ways to reach top?
// State: dp[i] = number of ways to reach stair i
// Recurrence: dp[i] = dp[i-1] + dp[i-2]  (came from i-1 or i-2)

// Top-down (memoization)
function climbStairsMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 2) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Bottom-up (tabulation) — same answer, no recursion
function climbStairsDP(n: number): number {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1; dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // build from smaller answers
  }
  return dp[n];
}

// Space-optimised: only need last 2 values
function climbStairsOptimal(n: number): number {
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev2 + prev1];
  }
  return n === 1 ? prev2 : prev1;
}
// Time: O(n)  Space: O(1)

// ── Classic 1D DP: house robber ──
// Can't rob two adjacent houses. Max amount you can rob.
// State: dp[i] = max money robbing from houses 0..i
// Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
function rob(nums: number[]): number {
  if (nums.length === 1) return nums[0];
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n); // skip this house OR rob it
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

// ── Classic 2D DP: unique paths on grid ──
// Robot moves only right or down on m×n grid. Count paths from top-left to bottom-right.
// State: dp[r][c] = number of ways to reach cell (r,c)
// Recurrence: dp[r][c] = dp[r-1][c] + dp[r][c-1]
function uniquePaths(m: number, n: number): number {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  // First row and column are all 1 (only one way to reach them)
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r-1][c] + dp[r][c-1]; // from above + from left
    }
  }
  return dp[m-1][n-1];
}
// Time: O(m*n)  Space: O(m*n), reducible to O(n) with 1D rolling array`
  },
  {
    id: 'sorting-algorithms',
    title: 'Sorting Algorithms',
    badge: 'Core Algorithm',
    badgeClass: 'badge-code',
    content: [
      'Sorting is one of the most studied problems in computer science. You will never implement a sorting algorithm from scratch in production — \`Array.prototype.sort\` handles it — but you must understand the algorithms to reason about performance, choose the right tool, and solve sorting-adjacent interview problems. The landscape: **O(n²) simple sorts** (Bubble, Selection, Insertion) are only used for tiny arrays or nearly-sorted data where their simplicity matters. **O(n log n) comparison sorts** (Merge Sort, Quick Sort, Heap Sort) are the production workhorses.',
      '**Merge Sort** is the canonical stable, guaranteed O(n log n) sort. It divides the array in half, recursively sorts each half, then merges the two sorted halves. The merge step is O(n) and there are O(log n) levels, giving O(n log n) total. It requires O(n) extra space for the merge buffer. **Quick Sort** is O(n log n) average but O(n²) worst case (already-sorted array with bad pivot). It is in-place (O(log n) stack space) and has better cache performance than Merge Sort in practice, making it faster on average despite the same big-O.',
      'The most useful sorting insight for interviews: **custom comparators**. JavaScript\'s \`sort\` accepts a comparator function \`(a, b) => ...\` that returns negative (a before b), zero (equal), or positive (b before a). This lets you sort objects by any property, sort numbers correctly (default sort is lexicographic — \`[10, 9, 2].sort()\` gives \`[10, 2, 9]\`!), and implement custom orderings like "sort intervals by start time". The interval sorting pattern appears constantly in greedy and scheduling problems.'
    ],
    instructions: 'Implement Merge Sort and verify it is a stable sort. Then, implement Quick Sort and observe its speed on random versus sorted arrays.',
    notes: [
      'Merge Sort: Guaranteed O(n log n), but O(n) space.',
      'Quick Sort: Faster average, but O(n²) worst-case.',
      'In-place vs External: Quick sort stays in array; Merge sort uses extra space.'
    ],
    code: `// ── Merge Sort: stable, guaranteed O(n log n) ──
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;                    // base case

  const mid   = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));         // sort left half
  const right = mergeSort(arr.slice(mid));            // sort right half
  return merge(left, right);                          // merge sorted halves
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let l = 0, r = 0;

  while (l < left.length && r < right.length) {
    if (left[l] <= right[r]) result.push(left[l++]);  // take from left
    else                     result.push(right[r++]); // take from right
  }
  return result.concat(left.slice(l), right.slice(r)); // append remaining
}
// Time: O(n log n)  Space: O(n)

// ── Quick Sort: in-place, O(n log n) average ──
function quickSort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;
  const pivot = partition(arr, low, high);
  quickSort(arr, low, pivot - 1);
  quickSort(arr, pivot + 1, high);
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high]; // choose last element as pivot
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

// ── Custom comparators — critical in practice ──
// ❌ Default sort is lexicographic — WRONG for numbers
[10, 9, 2, 1, 100].sort();              // [1, 10, 100, 2, 9] ← wrong!

// ✅ Numeric sort
[10, 9, 2, 1, 100].sort((a, b) => a - b);   // [1, 2, 9, 10, 100] ascending
[10, 9, 2, 1, 100].sort((a, b) => b - a);   // [100, 10, 9, 2, 1] descending

// ✅ Sort objects by property
const users = [{ name: 'Charlie', age: 30 }, { name: 'Alice', age: 25 }];
users.sort((a, b) => a.age - b.age);         // sort by age ascending

// ✅ Sort intervals by start time (greedy/scheduling pattern)
const intervals = [[3,6],[1,4],[2,5]];
intervals.sort((a, b) => a[0] - b[0]);       // [[1,4],[2,5],[3,6]]

// ── Counting Sort: O(n) for small integer range ──
function countingSort(arr: number[], maxVal: number): number[] {
  const count = new Array(maxVal + 1).fill(0);
  for (const n of arr) count[n]++;            // count occurrences
  const result: number[] = [];
  for (let i = 0; i <= maxVal; i++) {
    while (count[i]-- > 0) result.push(i);   // output in order
  }
  return result;
}
// Time: O(n + k) where k = range  Space: O(k)
// Use when range k is small — e.g. sort array of ages, grades, characters`
  }
];