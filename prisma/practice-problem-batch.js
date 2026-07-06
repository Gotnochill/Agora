const practiceOrderSlugs = [
  "sum-two-numbers",
  "two-sum",
  "best-time-to-buy-and-sell-stock",
  "insert-interval",
  "three-sum",
  "product-of-array-except-self",
  "combination-sum",
  "merge-intervals",
  "majority-element",
  "sort-colors",
  "contains-duplicate",
  "container-with-most-water",
  "meeting-rooms",
  "gas-station",
  "longest-consecutive-sequence",
  "rotate-array",
  "contiguous-array",
  "subarray-sum-equals-k",
  "employee-free-time",
  "move-zeroes",
  "meeting-rooms-ii",
  "sliding-window-maximum",
  "squares-of-a-sorted-array",
  "three-sum-closest",
  "non-overlapping-intervals",
  "valid-palindrome",
  "valid-anagram",
  "longest-substring-without-repeating-characters",
  "longest-palindrome",
  "minimum-window-substring",
  "string-to-integer-atoi",
  "longest-palindromic-substring",
  "find-all-anagrams-in-a-string",
  "group-anagrams",
  "longest-repeating-character-replacement",
  "longest-common-prefix",
  "largest-number",
  "encode-and-decode-strings",
  "palindrome-pairs",
  "valid-parentheses",
  "min-stack",
  "evaluate-reverse-polish-notation",
  "daily-temperatures",
  "spiral-matrix",
  "valid-sudoku",
  "rotate-image",
  "set-matrix-zeroes",
  "sudoku-solver",
  "binary-search",
  "first-bad-version",
  "search-in-rotated-sorted-array",
  "time-based-key-value-store",
  "maximum-profit-in-job-scheduling",
  "median-of-two-sorted-arrays",
  "search-a-2d-matrix",
  "find-minimum-in-rotated-sorted-array",
  "koko-eating-bananas",
];

const additionalPracticeProblems = [
  {
    slug: "meeting-rooms",
    title: "Meeting Rooms",
    statement:
      "Given meeting time intervals, print whether one person can attend every meeting.\n\nInput format:\n- First line: n\n- Next n lines: start end\n\nIntervals are half-open: a meeting ending at time t does not overlap a meeting starting at time t. Print `true` if no meetings overlap, otherwise print `false`.",
    constraints: "0 <= n <= 10^5\n-10^9 <= start <= end <= 10^9",
    tags: ["Array", "Intervals", "Sorting", "Premium", "Meta", "Google"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "3\n0 30\n5 10\n15 20\n",
        expectedOutput: "false\n",
        isSample: true,
        order: 1,
      },
      { input: "2\n7 10\n2 4\n", expectedOutput: "true\n", isSample: true, order: 2 },
      {
        input: "3\n1 5\n5 8\n8 9\n",
        expectedOutput: "true\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "employee-free-time",
    title: "Employee Free Time",
    statement:
      "Each employee has a sorted list of busy intervals. Print finite intervals where every employee is free.\n\nInput format:\n- First line: m, the number of employees\n- For each employee: one line k, followed by k lines of start end busy intervals\n\nIntervals are half-open. Print common free intervals sorted by start, one per line as `start end`. Print `EMPTY` if there are no finite common free intervals.",
    constraints:
      "1 <= m <= 10^5\n0 <= total intervals <= 10^5\n-10^9 <= start <= end <= 10^9\nIntervals for each employee are sorted and non-overlapping.",
    tags: ["Array", "Intervals", "Sorting", "Premium", "Google", "Meta"],
    difficulty: "HARD",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      {
        input: "3\n2\n1 2\n5 6\n1\n1 3\n1\n4 10\n",
        expectedOutput: "3 4\n",
        isSample: true,
        order: 1,
      },
      {
        input: "2\n2\n1 3\n6 7\n2\n2 4\n7 8\n",
        expectedOutput: "4 6\n",
        isSample: true,
        order: 2,
      },
      {
        input: "2\n1\n1 5\n1\n2 3\n",
        expectedOutput: "EMPTY\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "meeting-rooms-ii",
    title: "Meeting Rooms II",
    statement:
      "Given meeting intervals, print the minimum number of rooms required to hold all meetings.\n\nInput format:\n- First line: n\n- Next n lines: start end\n\nIntervals are half-open: a meeting ending at time t frees the room for a meeting starting at time t.",
    constraints: "0 <= n <= 10^5\n-10^9 <= start <= end <= 10^9",
    tags: ["Array", "Intervals", "Heap", "Sorting", "Premium", "Google", "Meta"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "3\n0 30\n5 10\n15 20\n", expectedOutput: "2\n", isSample: true, order: 1 },
      { input: "3\n7 10\n2 4\n4 7\n", expectedOutput: "1\n", isSample: true, order: 2 },
      { input: "3\n1 5\n2 6\n3 7\n", expectedOutput: "3\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "three-sum-closest",
    title: "3Sum Closest",
    statement:
      "Given an integer array and target, choose three distinct indices whose values have the sum closest to the target. Print that sum.\n\nInput format:\n- First line: n target\n- Second line: n integers\n\nIf two sums are equally close to the target, print the smaller sum.",
    constraints: "3 <= n <= 3000\n-10^5 <= nums[i], target <= 10^5",
    tags: ["Array", "Two Pointers", "Sorting", "Amazon", "Meta"],
    difficulty: "MEDIUM",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      { input: "4 1\n-1 2 1 -4\n", expectedOutput: "2\n", isSample: true, order: 1 },
      { input: "3 1\n0 0 0\n", expectedOutput: "0\n", isSample: true, order: 2 },
      { input: "4 0\n-2 -1 1 2\n", expectedOutput: "-1\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "non-overlapping-intervals",
    title: "Non-overlapping Intervals",
    statement:
      "Given intervals, remove the minimum number of intervals so the remaining intervals do not overlap.\n\nInput format:\n- First line: n\n- Next n lines: start end\n\nIntervals are half-open, so an interval ending at time t does not overlap one starting at time t. Print the minimum number of removals.",
    constraints: "1 <= n <= 10^5\n-10^9 <= start <= end <= 10^9",
    tags: ["Array", "Intervals", "Greedy", "Sorting", "Google", "Amazon"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "4\n1 2\n2 3\n3 4\n1 3\n", expectedOutput: "1\n", isSample: true, order: 1 },
      { input: "3\n1 2\n1 2\n1 2\n", expectedOutput: "2\n", isSample: true, order: 2 },
      { input: "2\n1 2\n2 3\n", expectedOutput: "0\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    statement:
      "Given a string, print whether it is a palindrome after converting uppercase letters to lowercase and ignoring non-alphanumeric characters.\n\nInput format:\n- One line: s\n\nPrint `true` or `false`.",
    constraints: "0 <= s.length <= 2 * 10^5",
    tags: ["String", "Two Pointers", "Palindrome", "Meta", "Microsoft"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "A man, a plan, a canal: Panama\n",
        expectedOutput: "true\n",
        isSample: true,
        order: 1,
      },
      { input: "race a car\n", expectedOutput: "false\n", isSample: true, order: 2 },
      { input: "0P\n", expectedOutput: "false\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    statement:
      "Given two lowercase strings, print whether the second string is an anagram of the first.\n\nInput format:\n- First line: s\n- Second line: t\n\nPrint `true` or `false`.",
    constraints: "0 <= s.length, t.length <= 2 * 10^5\nStrings contain lowercase English letters.",
    tags: ["String", "Hash Table", "Sorting", "Amazon", "Google"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "anagram\nnagaram\n", expectedOutput: "true\n", isSample: true, order: 1 },
      { input: "rat\ncar\n", expectedOutput: "false\n", isSample: true, order: 2 },
      { input: "aacc\nccac\n", expectedOutput: "false\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    statement:
      "Given a string, print the length of the longest substring that contains no repeated characters.\n\nInput format:\n- One line: s",
    constraints: "0 <= s.length <= 2 * 10^5",
    tags: ["String", "Sliding Window", "Hash Table", "Amazon", "Meta"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "abcabcbb\n", expectedOutput: "3\n", isSample: true, order: 1 },
      { input: "bbbbb\n", expectedOutput: "1\n", isSample: true, order: 2 },
      { input: "pwwkew\n", expectedOutput: "3\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "longest-palindrome",
    title: "Longest Palindrome",
    statement:
      "Given a case-sensitive string, print the length of the longest palindrome that can be built using its characters.\n\nInput format:\n- One line: s",
    constraints: "1 <= s.length <= 2 * 10^5",
    tags: ["String", "Hash Table", "Greedy", "Palindrome", "Google", "Amazon"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "abccccdd\n", expectedOutput: "7\n", isSample: true, order: 1 },
      { input: "a\n", expectedOutput: "1\n", isSample: true, order: 2 },
      { input: "Aa\n", expectedOutput: "1\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "minimum-window-substring",
    title: "Minimum Window Substring",
    statement:
      "Given strings s and t, print the shortest substring of s that contains every character of t with multiplicity.\n\nInput format:\n- First line: s\n- Second line: t\n\nIf multiple windows have the same length, print the earliest one. Print `EMPTY` if no valid window exists.",
    constraints: "1 <= s.length, t.length <= 2 * 10^5",
    tags: ["String", "Sliding Window", "Hash Table", "Google", "Meta"],
    difficulty: "HARD",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      { input: "ADOBECODEBANC\nABC\n", expectedOutput: "BANC\n", isSample: true, order: 1 },
      { input: "a\naa\n", expectedOutput: "EMPTY\n", isSample: true, order: 2 },
      { input: "aa\naa\n", expectedOutput: "aa\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "string-to-integer-atoi",
    title: "String to Integer (atoi)",
    statement:
      "Parse a string as a 32-bit signed integer.\n\nInput format:\n- One line: s\n\nIgnore leading spaces, read an optional sign, then read consecutive digits. Stop at the first non-digit after parsing starts. Clamp values below -2147483648 or above 2147483647.",
    constraints: "0 <= s.length <= 2 * 10^5",
    tags: ["String", "Parsing", "Math", "Amazon", "Microsoft"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "42\n", expectedOutput: "42\n", isSample: true, order: 1 },
      { input: "   -042 with words\n", expectedOutput: "-42\n", isSample: true, order: 2 },
      { input: "91283472332\n", expectedOutput: "2147483647\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    statement:
      "Given a string, print its longest palindromic substring.\n\nInput format:\n- One line: s\n\nIf multiple longest palindromic substrings exist, print the earliest one.",
    constraints: "1 <= s.length <= 10^5",
    tags: ["String", "Palindrome", "Dynamic Programming", "Two Pointers", "Amazon", "Microsoft"],
    difficulty: "MEDIUM",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      { input: "babad\n", expectedOutput: "bab\n", isSample: true, order: 1 },
      { input: "cbbd\n", expectedOutput: "bb\n", isSample: true, order: 2 },
      { input: "aaaa\n", expectedOutput: "aaaa\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "find-all-anagrams-in-a-string",
    title: "Find All Anagrams in a String",
    statement:
      "Given strings s and p, print every start index where a substring of s is an anagram of p.\n\nInput format:\n- First line: s\n- Second line: p\n\nPrint indices in increasing order on one line separated by spaces. Print `EMPTY` if there are none.",
    constraints:
      "1 <= p.length <= s.length <= 2 * 10^5\nStrings contain lowercase English letters.",
    tags: ["String", "Sliding Window", "Hash Table", "Amazon", "Google"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "cbaebabacd\nabc\n", expectedOutput: "0 6\n", isSample: true, order: 1 },
      { input: "abab\nab\n", expectedOutput: "0 1 2\n", isSample: true, order: 2 },
      { input: "af\nbe\n", expectedOutput: "EMPTY\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "encode-and-decode-strings",
    title: "Encode and Decode Strings",
    statement:
      "Design a reversible string codec using the format `length#value` for each string.\n\nInput format:\n- First line: n\n- Next n lines: one raw string per line. Strings may contain spaces and `#`, but not newlines.\n\nEncode the list, decode the encoded payload, then print the encoded payload on the first line and the decoded strings on the following n lines.",
    constraints: "1 <= n <= 10^4\n0 <= string length <= 10^4\nTotal input characters <= 2 * 10^5",
    tags: ["String", "Design", "Premium", "Google", "Meta"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "3\nlint\ncode\nlove\n",
        expectedOutput: "4#lint4#code4#love\nlint\ncode\nlove\n",
        isSample: true,
        order: 1,
      },
      {
        input: "2\nhello world\nabc#123\n",
        expectedOutput: "11#hello world7#abc#123\nhello world\nabc#123\n",
        isSample: true,
        order: 2,
      },
      { input: "1\n\n", expectedOutput: "0#\n\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    statement:
      "Given a string containing only the characters `()[]{}`, print whether the brackets are valid. Brackets are valid when every opening bracket is closed by the same type in the correct order.\n\nInput format:\n- One line: s\n\nPrint `true` or `false`.",
    constraints: "1 <= s.length <= 10^5\ns consists only of the characters ()[]{}.",
    tags: ["String", "Stack", "Amazon", "Microsoft"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "()\n", expectedOutput: "true\n", isSample: true, order: 1 },
      { input: "(]\n", expectedOutput: "false\n", isSample: true, order: 2 },
      { input: "([{}])\n", expectedOutput: "true\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "min-stack",
    title: "Min Stack",
    statement:
      "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Process a sequence of operations and print the results of the query operations.\n\nInput format:\n- First line: q\n- Next q lines: one operation each, one of:\n  - `push x` — push integer x\n  - `pop` — remove the top element\n  - `top` — print the top element\n  - `getMin` — print the current minimum\n\n`pop`, `top`, and `getMin` are only issued when the stack is non-empty. Print one line per `top` or `getMin` operation, in order.",
    constraints: "1 <= q <= 10^5\n-10^9 <= x <= 10^9",
    tags: ["Stack", "Design", "Amazon", "Bloomberg"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "7\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin\n",
        expectedOutput: "-3\n0\n-2\n",
        isSample: true,
        order: 1,
      },
      { input: "3\npush 5\ntop\ngetMin\n", expectedOutput: "5\n5\n", isSample: true, order: 2 },
      {
        input: "5\npush 2\npush 2\ngetMin\npop\ngetMin\n",
        expectedOutput: "2\n2\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "evaluate-reverse-polish-notation",
    title: "Evaluate Reverse Polish Notation",
    statement:
      "Evaluate an arithmetic expression given in Reverse Polish Notation. Valid operators are `+`, `-`, `*`, and `/`. Each operand is an integer. Division truncates toward zero.\n\nInput format:\n- First line: n\n- Second line: n space-separated tokens\n\nPrint the integer result.",
    constraints:
      "1 <= n <= 10^5\nThe expression is valid.\nEvery intermediate value and the result fit in a signed 64-bit integer.\nDivision never uses a zero divisor.",
    tags: ["Stack", "Math", "Amazon", "LinkedIn"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "5\n2 1 + 3 *\n", expectedOutput: "9\n", isSample: true, order: 1 },
      { input: "5\n4 13 5 / +\n", expectedOutput: "6\n", isSample: true, order: 2 },
      {
        input: "13\n10 6 9 3 + -11 * / * 17 + 5 +\n",
        expectedOutput: "22\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "daily-temperatures",
    title: "Daily Temperatures",
    statement:
      "Given daily temperatures, for each day print the number of days you must wait until a warmer temperature. If there is no future day that is warmer, print 0 for that day.\n\nInput format:\n- First line: n\n- Second line: n integers\n\nPrint n integers on one line.",
    constraints: "1 <= n <= 10^5\n1 <= temperatures[i] <= 10^9",
    tags: ["Array", "Stack", "Monotonic Stack", "Amazon", "Google"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "8\n73 74 75 71 69 72 76 73\n",
        expectedOutput: "1 1 4 2 1 1 0 0\n",
        isSample: true,
        order: 1,
      },
      { input: "4\n30 40 50 60\n", expectedOutput: "1 1 1 0\n", isSample: true, order: 2 },
      { input: "3\n90 80 70\n", expectedOutput: "0 0 0\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    statement:
      "Given a sorted array of distinct integers in ascending order and a target, print the zero-based index of the target. Print -1 if the target is not present.\n\nInput format:\n- First line: n target\n- Second line: n integers in ascending order",
    constraints:
      "1 <= n <= 10^5\n-10^9 <= nums[i], target <= 10^9\nnums is sorted ascending with distinct values.",
    tags: ["Array", "Binary Search", "Microsoft", "Google"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "6 9\n-1 0 3 5 9 12\n", expectedOutput: "4\n", isSample: true, order: 1 },
      { input: "6 2\n-1 0 3 5 9 12\n", expectedOutput: "-1\n", isSample: true, order: 2 },
      { input: "1 5\n5\n", expectedOutput: "0\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "search-a-2d-matrix",
    title: "Search a 2D Matrix",
    statement:
      "You are given an m x n matrix where each row is sorted ascending and the first integer of each row is greater than the last integer of the previous row. Print whether the target value exists in the matrix.\n\nInput format:\n- First line: m n target\n- Next m lines: n integers each\n\nPrint `true` or `false`.",
    constraints:
      "1 <= m, n <= 1000\n-10^9 <= matrix[i][j], target <= 10^9\nThe matrix is sorted as described.",
    tags: ["Array", "Matrix", "Binary Search", "Amazon", "Microsoft"],
    difficulty: "MEDIUM",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      {
        input: "3 4 3\n1 3 5 7\n10 11 16 20\n23 30 34 60\n",
        expectedOutput: "true\n",
        isSample: true,
        order: 1,
      },
      {
        input: "3 4 13\n1 3 5 7\n10 11 16 20\n23 30 34 60\n",
        expectedOutput: "false\n",
        isSample: true,
        order: 2,
      },
      { input: "1 1 5\n5\n", expectedOutput: "true\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "koko-eating-bananas",
    title: "Koko Eating Bananas",
    statement:
      "Koko has n piles of bananas and h hours before the guards return. Each hour she picks one pile and eats up to k bananas from it; if the pile has fewer than k bananas she eats the whole pile and eats no more that hour. Print the minimum integer eating speed k that lets her finish every pile within h hours.\n\nInput format:\n- First line: n h\n- Second line: n integers, the pile sizes",
    constraints: "1 <= n <= 10^5\nn <= h <= 10^9\n1 <= piles[i] <= 10^9",
    tags: ["Array", "Binary Search", "Amazon", "Google"],
    difficulty: "MEDIUM",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      { input: "4 8\n3 6 7 11\n", expectedOutput: "4\n", isSample: true, order: 1 },
      { input: "5 5\n30 11 23 4 20\n", expectedOutput: "30\n", isSample: true, order: 2 },
      { input: "5 6\n30 11 23 4 20\n", expectedOutput: "23\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "search-in-rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    statement:
      "An ascending array of distinct integers was rotated at an unknown pivot. Given the rotated array and a target, print the zero-based index of the target, or -1 if it is not present.\n\nInput format:\n- First line: n target\n- Second line: n integers, the rotated array",
    constraints:
      "1 <= n <= 10^5\n-10^9 <= nums[i], target <= 10^9\nValues are distinct and form a rotation of an ascending array.",
    tags: ["Array", "Binary Search", "Amazon", "Meta"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "7 0\n4 5 6 7 0 1 2\n", expectedOutput: "4\n", isSample: true, order: 1 },
      { input: "7 3\n4 5 6 7 0 1 2\n", expectedOutput: "-1\n", isSample: true, order: 2 },
      { input: "1 0\n1\n", expectedOutput: "-1\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "find-minimum-in-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    statement:
      "An ascending array of distinct integers was rotated at an unknown pivot. Print the minimum value in the array.\n\nInput format:\n- First line: n\n- Second line: n integers, the rotated array",
    constraints:
      "1 <= n <= 10^5\n-10^9 <= nums[i] <= 10^9\nValues are distinct and form a rotation of an ascending array.",
    tags: ["Array", "Binary Search", "Amazon", "Microsoft"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "5\n3 4 5 1 2\n", expectedOutput: "1\n", isSample: true, order: 1 },
      { input: "7\n4 5 6 7 0 1 2\n", expectedOutput: "0\n", isSample: true, order: 2 },
      { input: "4\n11 13 15 17\n", expectedOutput: "11\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "spiral-matrix",
    title: "Spiral Matrix",
    statement:
      "Given an m x n matrix, print all of its elements in spiral order, starting at the top-left corner and moving clockwise.\n\nInput format:\n- First line: m n\n- Next m lines: n integers each\n\nPrint the elements on one line, separated by spaces.",
    constraints: "1 <= m, n <= 1000\n1 <= m * n <= 2 * 10^5\n-10^9 <= matrix[i][j] <= 10^9",
    tags: ["Array", "Matrix", "Simulation", "Amazon", "Microsoft"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "3 3\n1 2 3\n4 5 6\n7 8 9\n",
        expectedOutput: "1 2 3 6 9 8 7 4 5\n",
        isSample: true,
        order: 1,
      },
      {
        input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n",
        expectedOutput: "1 2 3 4 8 12 11 10 9 5 6 7\n",
        isSample: true,
        order: 2,
      },
      { input: "1 4\n1 2 3 4\n", expectedOutput: "1 2 3 4\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "valid-sudoku",
    title: "Valid Sudoku",
    statement:
      "Determine whether a 9 x 9 Sudoku board is valid. Only the filled cells must be checked: each row, each column, and each of the nine 3 x 3 sub-boxes must contain no repeated digit. The board may be incomplete.\n\nInput format:\n- 9 lines, each with 9 characters. A digit `1`-`9` is a filled cell and `.` is empty.\n\nPrint `true` or `false`.",
    constraints: "The board is always 9 x 9.\nEach cell is a digit 1-9 or the character `.`.",
    tags: ["Array", "Matrix", "Hash Table", "Amazon", "Uber"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input:
          "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n",
        expectedOutput: "true\n",
        isSample: true,
        order: 1,
      },
      {
        input:
          "83..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n",
        expectedOutput: "false\n",
        isSample: true,
        order: 2,
      },
      {
        input:
          ".........\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n.........\n",
        expectedOutput: "true\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "rotate-image",
    title: "Rotate Image",
    statement:
      "Given an n x n matrix representing an image, rotate it by 90 degrees clockwise and print the result.\n\nInput format:\n- First line: n\n- Next n lines: n integers each\n\nPrint the rotated matrix, one row per line.",
    constraints: "1 <= n <= 1000\n1 <= n * n <= 2 * 10^5\n-10^9 <= matrix[i][j] <= 10^9",
    tags: ["Array", "Matrix", "Amazon", "Apple"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "3\n1 2 3\n4 5 6\n7 8 9\n",
        expectedOutput: "7 4 1\n8 5 2\n9 6 3\n",
        isSample: true,
        order: 1,
      },
      { input: "2\n1 2\n3 4\n", expectedOutput: "3 1\n4 2\n", isSample: true, order: 2 },
      { input: "1\n5\n", expectedOutput: "5\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    statement:
      "Given an m x n matrix, if an element is 0 set its entire row and column to 0. Print the resulting matrix.\n\nInput format:\n- First line: m n\n- Next m lines: n integers each\n\nPrint the updated matrix, one row per line.",
    constraints: "1 <= m, n <= 1000\n1 <= m * n <= 2 * 10^5\n-10^9 <= matrix[i][j] <= 10^9",
    tags: ["Array", "Matrix", "Hash Table", "Amazon", "Microsoft"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "3 3\n1 1 1\n1 0 1\n1 1 1\n",
        expectedOutput: "1 0 1\n0 0 0\n1 0 1\n",
        isSample: true,
        order: 1,
      },
      {
        input: "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5\n",
        expectedOutput: "0 0 0 0\n0 4 5 0\n0 3 1 0\n",
        isSample: true,
        order: 2,
      },
      { input: "2 2\n1 2\n3 4\n", expectedOutput: "1 2\n3 4\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "sudoku-solver",
    title: "Sudoku Solver",
    statement:
      "Solve a 9 x 9 Sudoku puzzle by filling every empty cell. The solution must satisfy that each row, each column, and each of the nine 3 x 3 sub-boxes contains the digits 1-9 exactly once. Each puzzle has a unique solution.\n\nInput format:\n- 9 lines, each with 9 characters. A digit `1`-`9` is a filled cell and `.` is empty.\n\nPrint the solved board, 9 lines of 9 digits each.",
    constraints:
      "The board is always 9 x 9.\nEach cell is a digit 1-9 or the character `.`.\nExactly one solution exists.",
    tags: ["Array", "Matrix", "Backtracking", "Uber", "Amazon"],
    difficulty: "HARD",
    timeLimitMs: 5000,
    published: true,
    testCases: [
      {
        input:
          "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79\n",
        expectedOutput:
          "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179\n",
        isSample: true,
        order: 1,
      },
      {
        input:
          "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n.........\n",
        expectedOutput:
          "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179\n",
        isSample: true,
        order: 2,
      },
      {
        input:
          ".34678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179\n",
        expectedOutput:
          "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "first-bad-version",
    title: "First Bad Version",
    statement:
      "Versions are numbered 1 to n. Every version from some version b onward is bad, and all earlier versions are good, so the `is bad` property is monotonic. You are told n and b. Using the fewest checks (binary search over the monotonic boolean sequence), find and print the first bad version.\n\nInput format:\n- One line: n b",
    constraints: "1 <= b <= n <= 2 * 10^9",
    tags: ["Binary Search", "Amazon", "Meta"],
    difficulty: "EASY",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      { input: "5 4\n", expectedOutput: "4\n", isSample: true, order: 1 },
      { input: "1 1\n", expectedOutput: "1\n", isSample: true, order: 2 },
      { input: "10 1\n", expectedOutput: "1\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "time-based-key-value-store",
    title: "Time Based Key-Value Store",
    statement:
      "Design a store that keeps multiple values for a key at different timestamps and answers time-based queries. Process a sequence of operations.\n\nInput format:\n- First line: q\n- Next q lines: one operation each, one of:\n  - `set key value timestamp` — store value for key at the given timestamp\n  - `get key timestamp` — print the value whose timestamp is the largest value not exceeding the query timestamp; print `EMPTY` if no such value exists\n\nFor each key, `set` is called with strictly increasing timestamps. Keys and values are non-empty tokens of lowercase letters and digits. Print one line per `get` operation.",
    constraints: "1 <= q <= 10^5\n1 <= timestamp <= 10^7\n1 <= key.length, value.length <= 100",
    tags: ["Binary Search", "Hash Table", "Design", "Google", "Amazon"],
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    published: true,
    testCases: [
      {
        input: "6\nset foo bar 1\nget foo 1\nget foo 3\nset foo bar2 4\nget foo 4\nget foo 5\n",
        expectedOutput: "bar\nbar\nbar2\nbar2\n",
        isSample: true,
        order: 1,
      },
      { input: "1\nget a 1\n", expectedOutput: "EMPTY\n", isSample: true, order: 2 },
      {
        input: "3\nset a x 5\nget a 3\nget a 5\n",
        expectedOutput: "EMPTY\nx\n",
        isSample: false,
        order: 3,
      },
    ],
  },
  {
    slug: "maximum-profit-in-job-scheduling",
    title: "Maximum Profit in Job Scheduling",
    statement:
      "You are given n jobs, each with a start time, an end time, and a profit. Choose a subset of non-overlapping jobs to maximize total profit. A job that ends at time t does not overlap a job that starts at time t. Print the maximum profit.\n\nInput format:\n- First line: n\n- Next n lines: start end profit",
    constraints:
      "1 <= n <= 10^5\n1 <= start < end <= 10^9\n1 <= profit <= 10^9\nThe answer fits in a signed 64-bit integer.",
    tags: ["Array", "Binary Search", "Dynamic Programming", "Sorting", "Google", "Amazon"],
    difficulty: "HARD",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      {
        input: "4\n1 3 50\n2 4 10\n3 5 40\n3 6 70\n",
        expectedOutput: "120\n",
        isSample: true,
        order: 1,
      },
      {
        input: "5\n1 3 20\n2 5 20\n3 10 100\n4 6 70\n6 9 60\n",
        expectedOutput: "150\n",
        isSample: true,
        order: 2,
      },
      { input: "3\n1 2 5\n1 3 6\n1 4 4\n", expectedOutput: "6\n", isSample: false, order: 3 },
    ],
  },
  {
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    statement:
      "Given two sorted arrays, print the median of all the numbers combined. The median is a multiple of 0.5: print it as a whole number when it is an integer, otherwise print it with exactly one digit after the decimal point (for example `2.5`).\n\nInput format:\n- First line: m n\n- Second line: m integers in ascending order (may be blank when m is 0)\n- Third line: n integers in ascending order (may be blank when n is 0)",
    constraints:
      "0 <= m, n\n1 <= m + n <= 2 * 10^5\n-10^6 <= values <= 10^6\nEach array is sorted ascending.",
    tags: ["Array", "Binary Search", "Divide and Conquer", "Google", "Amazon"],
    difficulty: "HARD",
    timeLimitMs: 3000,
    published: true,
    testCases: [
      { input: "2 1\n1 3\n2\n", expectedOutput: "2\n", isSample: true, order: 1 },
      { input: "2 2\n1 2\n3 4\n", expectedOutput: "2.5\n", isSample: true, order: 2 },
      { input: "0 1\n\n1\n", expectedOutput: "1\n", isSample: false, order: 3 },
    ],
  },
];

module.exports = { additionalPracticeProblems, practiceOrderSlugs };
