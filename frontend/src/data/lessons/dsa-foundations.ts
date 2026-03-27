import type { Lesson } from '../../types/curriculum';

export const dsaFoundationsLessons: Lesson[] = [
  {
    id: 'arrays-strings',
    title: 'Arrays & Strings',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      'Arrays are the most fundamental data structure — a contiguous block of memory where every element sits at a fixed offset from the start. This is why access is O(1): the address of element `i` is simply `base + i * elementSize`. Every other data structure you will learn is either built on top of arrays or exists to solve a specific weakness of arrays. Mastering array manipulation is non-negotiable.',
      '**Strings are arrays of characters** with extra semantics. In JavaScript/TypeScript strings are immutable — every operation that appears to "modify" a string actually creates a new one. This means naive string concatenation inside a loop is O(n²) because each `+` allocates a fresh string. The fix is to collect parts in an array and join once at the end. This single insight eliminates an entire class of performance bugs.',
      'Two core techniques appear in roughly 40% of array/string interview problems: **Two Pointers** (a left and right cursor that move toward each other — used for reversal, palindrome checks, pair sums) and **Sliding Window** (a subarray of variable or fixed size that slides right — used for max sum subarray, longest substring without repeats). Recognising which technique applies is more important than memorising code.'
    ],
    instructions: 'Implement a function that reverses an array in-place using the Two Pointers technique. Then, implement a sliding window to find the maximum sum of k consecutive elements.',
    notes: [
      'Memory: O(1) extra space for in-place reversal.',
      'Time: O(n) for both reversal and sliding window.',
      'Immutability: Remember that strings in JS are immutable!'
    ],
    code: `// ── Technique 1: Two Pointers — reverse in place ──
function reverseArray<T>(arr: T[]): T[] {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]]; // ES6 destructure swap
    left++;
    right--;
  }
  return arr;
}
// Time: O(n)  Space: O(1) — no extra memory, mutates in place

// ── Two Pointers — check if string is palindrome ──
function isPalindrome(s: string): boolean {
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++; r--;
  }
  return true;
}

// ── Technique 2: Sliding Window — max sum subarray of size k ──
function maxSumSubarray(arr: number[], k: number): number {
  // Build the first window
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;

  // Slide: add next element, remove first element of previous window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // O(1) per step — no inner loop!
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
// Time: O(n)  Space: O(1)
// Naive approach (nested loops) would be O(n*k) — sliding window is the upgrade

// ── String: efficient concatenation ──
// ❌ O(n²) — each + creates a new string
function badJoin(words: string[]): string {
  let result = '';
  for (const w of words) result += w + ', '; // allocates fresh string each iteration
  return result;
}

// ✅ O(n) — one allocation at the end
function goodJoin(words: string[]): string {
  return words.join(', ');
}

// ── Frequency map: count character occurrences ──
function charFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}
// Used in: anagram detection, permutation checks, most frequent character`
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      'A Linked List is a sequence of nodes where each node holds a value and a pointer to the next node. Unlike arrays there is no contiguous memory — nodes are scattered across the heap and connected by references. This one difference explains all the tradeoffs: access is O(n) because you must walk from the head, but insertion and deletion at a known pointer are O(1) because you only relink two pointers, not shift an entire array.',
      'The **Two Pointer (Fast & Slow)** technique — also called Floyd\'s Cycle Detection — is the single most important linked list pattern. A slow pointer moves one step at a time, a fast pointer moves two. If there is a cycle they will eventually meet. If there is no cycle the fast pointer hits null. The same pattern detects the middle node (when fast reaches the end, slow is at the middle) and finds the nth node from the end.',
      'The most common linked list bugs all come from the same root cause: **losing your reference before relinking**. When reversing a list or removing a node, always store the next pointer in a temporary variable before you overwrite it. Null pointer exceptions in linked list code are almost always caused by skipping this step. Draw the pointers on paper before coding — it prevents 80% of mistakes.'
    ],
    instructions: 'Implement a function to reverse a singly linked list. Then, use the Fast & Slow pointers pattern to detect if a cycle exists in a given list.',
    notes: [
      'Edge Cases: Empty list (head is null) and single node (head.next is null).',
      'Sentinels: Use a dummy node to simplify deletions at the head.',
      'Memory: Always check for null before accessing .next!'
    ],
    code: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

// ── Reverse a linked list iteratively ──
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // ✅ save next BEFORE overwriting
    curr.next = prev;       // relink to previous node
    prev = curr;            // advance prev
    curr = next;            // advance curr
  }
  return prev; // prev is the new head
}
// Time: O(n)  Space: O(1)

// ── Fast & Slow: find middle node ──
function findMiddle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;       // 1 step
    fast = fast.next.next;   // 2 steps
  }
  return slow; // when fast hits end, slow is at middle
}

// ── Fast & Slow: detect cycle (Floyd's algorithm) ──
function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true; // pointers met — cycle exists
  }
  return false;
}

// ── Remove nth node from end ──
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head); // sentinel node simplifies edge cases
  let fast: ListNode | null = dummy;
  let slow: ListNode | null = dummy;

  // Advance fast n+1 steps so gap between fast and slow is n
  for (let i = 0; i <= n; i++) fast = fast!.next;

  // Move both until fast hits end
  while (fast !== null) {
    slow = slow!.next;
    fast = fast.next;
  }

  // slow is now just before the node to remove
  slow!.next = slow!.next!.next;
  return dummy.next;
}`
  },
  {
    id: 'stacks-queues',
    title: 'Stacks & Queues',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      '**Stack (LIFO — Last In First Out):** think of a stack of plates. You can only add or remove from the top. Push and pop are both O(1). Stacks appear everywhere in computing: the call stack in every programming language is literally a stack, browser history is a stack, undo/redo is a stack, and expression parsing (matching brackets, evaluating postfix notation) all use stacks. Any problem involving "the most recent" or "the nearest previous" element is a stack problem.',
      '**Queue (FIFO — First In First Out):** think of a queue at a counter. First person in is first person served. Enqueue at the back, dequeue from the front. Queues are the backbone of Breadth-First Search (BFS) — you will use a queue every single time you implement BFS on trees or graphs. Task schedulers, print spoolers, and message brokers are all queues at their core.',
      'A critical performance note: using a plain JavaScript array as a queue with `shift()` is O(n) because every element is re-indexed. For interview-scale inputs this is fine, but for production code use a proper deque or a linked list-based queue. Also know the **Monotonic Stack** pattern — a stack that maintains a strictly increasing or decreasing order by popping elements that violate the order before pushing. It solves "next greater element" problems in O(n) instead of O(n²).'
    ],
    instructions: 'Implement a bracket matcher using a stack. Then, implement the "next greater element" algorithm using a monotonic stack.',
    notes: [
      'Stack: Use .push() and .pop() on arrays.',
      'Queue Efficiency: array.shift() is O(n). In real apps, use a proper queue.',
      'Monotonicity: Elements in a monotonic stack are always sorted.'
    ],
    code: `// ── Stack: matching brackets ──
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if ('([{'.includes(ch)) {
      stack.push(ch);           // opening bracket — push
    } else {
      if (stack.pop() !== pairs[ch]) return false; // mismatch
    }
  }
  return stack.length === 0;   // stack must be empty at end
}
// Time: O(n)  Space: O(n)

// ── Stack: evaluate postfix expression ("2 3 + 4 *" = 20) ──
function evalPostfix(tokens: string[]): number {
  const stack: number[] = [];
  for (const t of tokens) {
    if (!isNaN(Number(t))) {
      stack.push(Number(t));
    } else {
      const b = stack.pop()!;
      const a = stack.pop()!;
      if (t === '+') stack.push(a + b);
      if (t === '-') stack.push(a - b);
      if (t === '*') stack.push(a * b);
      if (t === '/') stack.push(Math.trunc(a / b));
    }
  }
  return stack[0];
}

// ── Monotonic Stack: next greater element ──
function nextGreaterElement(nums: number[]): number[] {
  const result = new Array(nums.length).fill(-1);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < nums.length; i++) {
    // Pop everything smaller than current element
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop()!;
      result[idx] = nums[i]; // nums[i] is the next greater for idx
    }
    stack.push(i);
  }
  return result;
}
// [2,1,2,4,3] → [4,2,4,-1,-1]
// Time: O(n) — each element pushed and popped at most once

// ── Queue: BFS level-order traversal ──
class TreeNode { constructor(public val: number, public left: TreeNode | null = null, public right: TreeNode | null = null) {} }

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
}`
  },
  {
    id: 'hash-maps',
    title: 'Hash Maps & Sets',
    badge: 'Core DS',
    badgeClass: 'badge-concept',
    content: [
      'A Hash Map stores key-value pairs using a **hash function** to convert a key into an array index. The hash function maps arbitrary keys (strings, objects) to a fixed range of integers. Lookup, insertion, and deletion are O(1) average case — the word "average" matters because hash **collisions** (two keys mapping to the same index) degrade performance. Good hash functions minimise collisions; JavaScript\'s built-in `Map` handles this for you.',
      'The **frequency map pattern** is arguably the most used pattern across all DSA problems: count occurrences of each element, then reason about those counts. Anagram detection, finding duplicates, two-sum, character frequency — all frequency maps. The second most used pattern is the **seen set**: use a `Set` to track elements you have already processed. This converts naive O(n²) "have I seen this before?" loops into O(n) single passes.',
      '**Map vs Object in JavaScript** is a practical decision you need to make correctly. Use `Map` when keys are not strings (numbers, objects as keys), when you need to preserve insertion order, or when you need `.size` directly. Use a plain object when keys are known strings and you want JSON serialisation. Use `Set` instead of `Map` when you only care about existence, not values. Both `Map` and `Set` are O(1) for has/get/set/delete.'
    ],
    instructions: 'Implement the Two Sum algorithm using a Map for O(n) complexity. Then, write a function to find the longest substring without repeating characters using a sliding window and a Map.',
    notes: [
      'Map: key-value storage. O(1) average lookup.',
      'Set: existence storage. O(1) average check.',
      'Memory: Hash maps use O(n) space.'
    ],
    code: `// ── Frequency map: two sum ──
function twoSum(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return [-1, -1]; // no solution
}
// Time: O(n)  Space: O(n)
// Naive O(n²) nested loop is the wrong approach — always think Map first

// ── Frequency map: check if two strings are anagrams ──
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const freq = new Map<string, number>();

  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const count = freq.get(ch);
    if (!count) return false; // char not in s, or already exhausted
    freq.set(ch, count - 1);
  }
  return true;
}

// ── Seen set: find first duplicate ──
function firstDuplicate(nums: number[]): number {
  const seen = new Set<number>();
  for (const n of nums) {
    if (seen.has(n)) return n;
    seen.add(n);
  }
  return -1;
}
// Time: O(n)  Space: O(n)

// ── Group anagrams together ──
function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    const key = word.split('').sort().join(''); // sorted word = canonical form
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(word);
  }

  return Array.from(groups.values());
}
// ["eat","tea","tan","ate","nat","bat"] → [["eat","tea","ate"],["tan","nat"],["bat"]]

// ── Sliding window + hash map: longest substring without repeats ──
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>(); // char → last seen index
  let maxLen = 0;
  let windowStart = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (lastSeen.has(ch) && lastSeen.get(ch)! >= windowStart) {
      windowStart = lastSeen.get(ch)! + 1; // jump window start past the duplicate
    }
    lastSeen.set(ch, i);
    maxLen = Math.max(maxLen, i - windowStart + 1);
  }
  return maxLen;
}`
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    badge: 'Core Algorithm',
    badgeClass: 'badge-code',
    content: [
      'Binary Search is the canonical example of a divide-and-conquer algorithm. By exploiting the sorted order of an array, each comparison eliminates half the remaining candidates — giving O(log n) time instead of O(n) for linear search. On an array of 1 billion elements, linear search takes up to 1 billion comparisons; binary search takes at most 30. This is what logarithmic complexity means in practice.',
      'The classic off-by-one error is the most common bug in binary search implementations. The safe template: `while (low <= high)` with \`low = mid + 1\` and \`high = mid - 1\`. Using \`< \` instead of \`<=\` misses the case where the target is the only remaining element. Using \`mid\` instead of \`mid + 1\` or \`mid - 1\` causes an infinite loop when \`low === high\`. The template below is the one to memorise — it handles all edge cases correctly.',
      'Binary search is not just for searching arrays. The deeper pattern is: **binary search on the answer space**. If a problem asks "find the minimum X such that condition(X) is true" and condition is monotonic (once true, stays true), you can binary search on X directly. Classic examples: minimum capacity to ship packages in D days, find the smallest divisor, koko eating bananas. This generalisation turns dozens of hard problems into medium ones.'
    ],
    instructions: 'Implement the standard Binary Search template. Then, implement a variant to find the leftmost (first) occurrence of a target element.',
    notes: [
      'Sorted Order: Binary search REQUIRES a sorted input.',
      'Logarithmic Time: O(log n) is incredibly scalable.',
      'Overflow: (low + high) / 2 can overflow in some languages. Use low + (high-low)/2.'
    ],
    code: `// ── Classic binary search: find target index ──
function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {             // ✅ <= not < (handles single element)
    const mid = low + Math.floor((high - low) / 2); // avoids integer overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target)  low  = mid + 1;  // ✅ mid+1 not mid (avoids infinite loop)
    else                    high = mid - 1;  // ✅ mid-1 not mid
  }
  return -1;
}

// ── Find leftmost (first) occurrence of target ──
function searchFirst(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1, result = -1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) {
      result = mid;    // record this, but keep searching LEFT
      high = mid - 1;
    } else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return result;
}

// ── Search in rotated sorted array ──
// [4,5,6,7,0,1,2] — array is sorted but rotated at some pivot
function searchRotated(nums: number[], target: number): number {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (nums[mid] === target) return mid;

    if (nums[low] <= nums[mid]) {         // left half is sorted
      if (nums[low] <= target && target < nums[mid]) high = mid - 1;
      else low = mid + 1;
    } else {                              // right half is sorted
      if (nums[mid] < target && target <= nums[high]) low = mid + 1;
      else high = mid - 1;
    }
  }
  return -1;
}

// ── Binary search on answer space ──
// "What's the minimum days needed to finish m tasks if you can do at most k per day?"
function minDays(tasks: number[], k: number): number {
  function canFinish(days: number): boolean {
    let used = 0;
    for (const t of tasks) used += Math.ceil(t / days);
    return used <= k;
  }

  let low = 1, high = Math.max(...tasks), result = high;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (canFinish(mid)) { result = mid; high = mid - 1; } // try fewer days
    else low = mid + 1;
  }
  return result;
}`
  },
  {
    id: 'recursion-basics',
    title: 'Recursion & The Call Stack',
    badge: 'Core Algorithm',
    badgeClass: 'badge-concept',
    content: [
      'Recursion is a function calling itself with a smaller version of the same problem. Every recursive solution has two mandatory parts: the **base case** (the smallest version you can solve directly — without it, the function calls itself forever and crashes with a stack overflow) and the **recursive case** (reduce the problem to a smaller version and trust that the recursive call handles it correctly). The mental model is: assume your function already works for n-1, and just write the step from n-1 to n.',
      'The **call stack** is the mechanism that makes recursion work. Each function call pushes a new frame onto the call stack containing its local variables and return address. When the base case is hit, frames pop off in reverse order — this is why recursive solutions naturally "unwind". A recursion tree visualises this: each node is a function call, each branch is a recursive call, leaves are base cases. Drawing the tree is the most reliable way to understand and debug recursive code.',
      '**Memoization** is the bridge between recursion and dynamic programming. Many recursive problems recompute the same subproblem repeatedly — `fibonacci(40)` makes billions of calls recomputing `fibonacci(2)` millions of times. Adding a cache (a Map from input to result) converts exponential O(2ⁿ) to linear O(n) by storing each result the first time it is computed. This pattern is called **top-down dynamic programming** and is the natural next step after understanding plain recursion.'
    ],
    instructions: 'Write a recursive function to compute the n-th Fibonacci number. Then, optimize it using memoization to handle large inputs.',
    notes: [
      'Base Case: Essential to prevent stack overflow.',
      'Stack Depth: Browsers have limits on recursive depth (~10k calls).',
      'Top-Down: Memoization is the top-down approach to DP.'
    ],
    code: `// ── Classic recursion: factorial ──
function factorial(n: number): number {
  if (n <= 1) return 1;           // base case
  return n * factorial(n - 1);   // recursive case: trust n-1 works
}
// factorial(4) → 4 * factorial(3) → 4 * 3 * factorial(2) → 4 * 3 * 2 * 1 = 24

// ── Fibonacci: naive O(2^n) — DO NOT use in production ──
function fibNaive(n: number): number {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2); // recomputes the same values exponentially
}

// ── Fibonacci: memoized O(n) ──
function fibMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!; // cache hit — skip recomputation ✅
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}
// fibMemo(40): ~40 calls  vs  fibNaive(40): 331,160,281 calls

// ── Recursion tree mental model: power(2, 4) ──
//           power(2,4)
//          /          \
//     power(2,2)    power(2,2)   ← same subproblem computed twice without memo!
//     /      \
// power(2,1) power(2,1)

// ── Recursive DFS: sum all nodes in a tree ──
class TreeNode {
  constructor(
    public val: number,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null
  ) {}
}

function treeSum(node: TreeNode | null): number {
  if (node === null) return 0;                         // base case: empty tree
  return node.val + treeSum(node.left) + treeSum(node.right); // trust left/right work
}

// ── Convert recursion → iteration with explicit stack (avoid stack overflow) ──
function treeSumIterative(root: TreeNode | null): number {
  if (!root) return 0;
  const stack = [root];
  let sum = 0;
  while (stack.length) {
    const node = stack.pop()!;
    sum += node.val;
    if (node.right) stack.push(node.right);
    if (node.left)  stack.push(node.left);
  }
  return sum;
}
// Use iterative version when input depth could be very large (avoid call stack limits)`
  }
];