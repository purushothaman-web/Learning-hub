import type { DSAProblem } from '../types/curriculum';

export const dsaProblems: DSAProblem[] = [

  // ─── Foundations — Easy ───────────────────────────────────────────────────

  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['dsa-foundations'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`. You may assume exactly one solution exists, and you may not use the same element twice.`,
    exampleCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1, 2]' }
    ],
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  // Your code here
};`
  },

  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    tags: ['dsa-foundations'],
    description: `Write a function that reverses a string **in-place**. The input string is given as an array of characters \`s\`. You must do this by modifying the input array directly with O(1) extra memory.`,
    exampleCases: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    starterCode: `function reverseString(s: string[]): void {
  // Modify s in-place, do not return anything
};`
  },

  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    tags: ['dsa-foundations'],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.`,
    exampleCases: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    starterCode: `function isAnagram(s: string, t: string): boolean {
  // Your code here
};`
  },

  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    tags: ['dsa-foundations'],
    description: `Given the \`head\` of a linked list, determine if the linked list has a cycle in it.`,
    exampleCases: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'pos is the index of node pointing back.' },
      { input: 'head = [1,2], pos = 0', output: 'true' },
      { input: 'head = [1], pos = -1', output: 'false' }
    ],
    starterCode: `/**
 * class ListNode {
 *   val: number
 *   next: ListNode | null
 *   constructor(val?: number, next?: ListNode | null) {
 *     this.val = val ?? 0
 *     this.next = next ?? null
 *   }
 * }
 */

function hasCycle(head: ListNode | null): boolean {
  // Your code here
};`
  },

  // ─── Mastery — Medium ────────────────────────────────────────────────────

  {
    id: 'binary-tree-level-order',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['dsa-mastery'],
    description: `Given the \`root\` of a binary tree, return the **level order traversal** of its node values — left to right, level by level.`,
    exampleCases: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' }
    ],
    starterCode: `/**
 * class TreeNode {
 *   val: number
 *   left: TreeNode | null
 *   right: TreeNode | null
 *   constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *     this.val = val ?? 0
 *     this.left = left ?? null
 *     this.right = right ?? null
 *   }
 * }
 */

function levelOrder(root: TreeNode | null): number[][] {
  // Your code here
};`
  },

  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    tags: ['dsa-mastery'],
    description: `You are given an integer array \`coins\` representing coin denominations and an integer \`amount\`. Return the **fewest number of coins** needed to make up that amount.`,
    exampleCases: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' }
    ],
    starterCode: `function coinChange(coins: number[], amount: number): number {
  // Your code here
};`
  },

  {
    id: 'kth-largest-element',
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    tags: ['dsa-mastery'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the **kth largest element** in the array.`,
    exampleCases: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }
    ],
    starterCode: `function findKthLargest(nums: number[], k: number): number {
  // Your code here
};`
  },

  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    tags: ['dsa-mastery'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements.`,
    exampleCases: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1, 2]' },
      { input: 'nums = [1], k = 1', output: '[1]' }
    ],
    starterCode: `function topKFrequent(nums: number[], k: number): number[] {
  // Your code here
};`
  },

  // ─── Expert — Hard ───────────────────────────────────────────────────────

  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['dsa-expert'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    exampleCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' }
    ],
    starterCode: `function trap(height: number[]): number {
  // Your code here
};`
  },

  {
    id: 'merge-k-sorted-lists',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    tags: ['dsa-expert'],
    description: `You are given an array of \`k\` linked lists, each sorted in ascending order. Merge all linked lists into one sorted linked list and return it.`,
    exampleCases: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' },
      { input: 'lists = [[]]', output: '[]' }
    ],
    starterCode: `/**
 * class ListNode {
 *   val: number
 *   next: ListNode | null
 *   constructor(val?: number, next?: ListNode | null) {
 *     this.val = val ?? 0
 *     this.next = next ?? null
 *   }
 * }
 */

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  // Your code here
};`
  },

  {
    id: 'word-ladder',
    title: 'Word Ladder',
    difficulty: 'Hard',
    tags: ['dsa-expert'],
    description: `Given two words \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the **length of the shortest transformation sequence** from \`beginWord\` to \`endWord\`.`,
    exampleCases: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0' }
    ],
    starterCode: `function ladderLength(
  beginWord: string,
  endWord: string,
  wordList: string[]
): number {
  // Your code here
};`
  },

  {
    id: 'n-queens',
    title: 'N-Queens',
    difficulty: 'Hard',
    tags: ['dsa-expert'],
    description: `Place \`n\` queens on an \`n × n\` chessboard such that no two queens attack each other.`,
    exampleCases: [
      { input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
      { input: 'n = 1', output: '[["Q"]]' }
    ],
    starterCode: `function solveNQueens(n: number): string[][] {
  // Your code here
};`
  }

];