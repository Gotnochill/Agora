// Problems for "ShardUp Contest #3". These are unpublished (contest-only) and
// escalate in difficulty: A (battery reset simulation) < B (cohort batching
// greedy) < C (stable trading windows via monotonic deques). Each is an
// original story built on a standard technique, deliberately not a copy of a
// well-known LeetCode task or an existing practice problem.
//
// Reference solutions live in scripts/reference-solutions/<slug>.{py,cpp} and are
// attached by prisma/seed.js. Stress-test outputs below are closed-form and
// cross-checked against the references (see scripts/verify-contest-3.mjs).

const CONTEST_THREE_SLUG = "shardup-contest-3";

function repeatValues(count, value) {
  return `${new Array(count).fill(value).join(" ")}\n`;
}

function sequenceLine(count, mapper) {
  return `${Array.from({ length: count }, (_, index) => mapper(index)).join(" ")}\n`;
}

// --- Problem A: Battery Reset Counter ----------------------------------------
const batteryResetCounter = {
  slug: "battery-reset-counter",
  title: "Battery Reset Counter",
  statement:
    "A rechargeable battery starts empty (charge = 0). You process n signed events in order; event e adds e to the current charge, and e may be negative. The battery can never hold a negative charge: the instant the charge would drop below 0 it is clamped back to exactly 0, and that clamp counts as one reset.\n\nFormally, start with charge = 0 and resets = 0. For each event e in order, set charge = charge + e; then if charge < 0, set charge = 0 and add 1 to resets.\n\nInput format:\n- First line: n\n- Second line: n integers (the events)\n\nPrint two integers separated by a single space: the final charge and the number of resets. The final charge can exceed a 32-bit integer, so use 64-bit arithmetic.",
  constraints: "1 <= n <= 10^5\n-10^9 <= e <= 10^9",
  tags: ["Array", "Simulation", "Prefix Sum", "Contest"],
  difficulty: "EASY",
  timeLimitMs: 2000,
  samples: [
    { input: "6\n5 -8 3 -1 -10 4\n", expectedOutput: "4 2\n" },
    { input: "4\n1 2 3 4\n", expectedOutput: "10 0\n" },
  ],
  hidden: [
    { input: "1\n-5\n", expectedOutput: "0 1\n" },
    { input: "5\n-1 -1 -1 -1 -1\n", expectedOutput: "0 5\n" },
    { input: "7\n10 -3 -3 -3 -3 -3 100\n", expectedOutput: "100 2\n" },
    { input: "3\n1000000000 1000000000 1000000000\n", expectedOutput: "3000000000 0\n" },
    { input: "2\n-1000000000 -1000000000\n", expectedOutput: "0 2\n" },
  ],
};

// --- Problem B: Uniform Cohort Batches ---------------------------------------
const uniformCohortBatches = {
  slug: "uniform-cohort-batches",
  title: "Uniform Cohort Batches",
  statement:
    "A bootcamp must split n students into batches by skill level. You are given each student's skill and two limits: d, the maximum allowed skill spread inside a batch (the largest skill minus the smallest skill in that batch must be at most d), and c, the maximum number of students per batch. You may place any students together in a batch regardless of their original order.\n\nEvery student must belong to exactly one batch. Print the minimum number of batches needed so that both limits are respected in every batch.\n\nInput format:\n- First line: n d c\n- Second line: n integers (the skills)\n\nPrint a single integer.",
  constraints: "1 <= n <= 10^5\n0 <= d <= 10^9\n1 <= c <= n\n-10^9 <= skill[i] <= 10^9",
  tags: ["Array", "Sorting", "Greedy", "Contest"],
  difficulty: "MEDIUM",
  timeLimitMs: 2000,
  samples: [
    { input: "5 2 3\n1 3 6 2 5\n", expectedOutput: "2\n" },
    { input: "4 0 10\n4 4 7 7\n", expectedOutput: "2\n" },
  ],
  hidden: [
    { input: "1 5 1\n10\n", expectedOutput: "1\n" },
    { input: "6 1000000000 2\n-1000000000 1000000000 0 5 -5 3\n", expectedOutput: "3\n" },
    { input: "5 0 5\n7 7 7 7 7\n", expectedOutput: "1\n" },
    { input: "7 3 100\n1 2 3 10 11 12 20\n", expectedOutput: "3\n" },
    { input: "8 2 3\n1 1 2 2 3 3 4 4\n", expectedOutput: "3\n" },
  ],
};

// --- Problem C: Stable Trading Windows ---------------------------------------
const stableTradingWindows = {
  slug: "stable-trading-windows",
  title: "Stable Trading Windows",
  statement:
    "You are given n daily prices of an asset and an integer k. A trading window is a contiguous block of days [i, j] with i <= j. A window is stable if, inside it, the highest price minus the lowest price is at most k.\n\nCount how many stable windows exist. A single day is always a stable window. The answer can be very large and may exceed a 32-bit integer.\n\nInput format:\n- First line: n k\n- Second line: n integers (the prices)\n\nPrint a single integer: the number of stable windows.",
  constraints: "1 <= n <= 10^5\n0 <= k <= 2*10^9\n-10^9 <= price[i] <= 10^9",
  tags: ["Array", "Sliding Window", "Monotonic Queue", "Contest"],
  difficulty: "HARD",
  timeLimitMs: 3000,
  samples: [
    { input: "5 2\n1 3 2 4 3\n", expectedOutput: "13\n" },
    { input: "3 0\n5 5 5\n", expectedOutput: "6\n" },
  ],
  hidden: [
    { input: "1 100\n7\n", expectedOutput: "1\n" },
    { input: "4 1\n1 2 3 4\n", expectedOutput: "7\n" },
    {
      input: "5 2000000000\n-1000000000 1000000000 0 -1000000000 1000000000\n",
      expectedOutput: "15\n",
    },
    { input: "6 0\n1 1 2 2 2 3\n", expectedOutput: "10\n" },
    { input: "7 3\n10 12 9 8 14 11 13\n", expectedOutput: "14\n" },
  ],
};

// Efficiency / stress tests. Inputs are large; expected outputs are closed-form
// and independently verified against the reference solutions.
function buildContestThreeStressTests() {
  const bigN = 100_000;

  // A: all zeros -> charge never dips below 0, never resets.
  const aAllZeros = {
    input: `${bigN}\n${repeatValues(bigN, 0)}`,
    expectedOutput: "0 0\n",
  };
  // A: all +1 -> charge climbs to n, never resets.
  const aAllOnes = {
    input: `${bigN}\n${repeatValues(bigN, 1)}`,
    expectedOutput: `${bigN} 0\n`,
  };
  // A: all -1 -> every event clamps back to 0, so n resets.
  const aAllNegOnes = {
    input: `${bigN}\n${repeatValues(bigN, -1)}`,
    expectedOutput: `0 ${bigN}\n`,
  };

  // B: all equal, d=0, c=1 -> one student per batch -> n batches.
  const bSingletons = {
    input: `${bigN} 0 1\n${repeatValues(bigN, 7)}`,
    expectedOutput: `${bigN}\n`,
  };
  // B: strictly increasing by 1, d=0, c=n -> every neighbour differs -> n batches.
  const bDistinctTight = {
    input: `${bigN} 0 ${bigN}\n${sequenceLine(bigN, (i) => i + 1)}`,
    expectedOutput: `${bigN}\n`,
  };
  // B: all equal, d=0, c=7 -> pack 7 per batch -> ceil(n / 7) batches.
  const bPacked = {
    input: `${bigN} 0 7\n${repeatValues(bigN, 3)}`,
    expectedOutput: `${Math.ceil(bigN / 7)}\n`,
  };

  // C: all equal, k=0 -> every window is stable -> n(n+1)/2.
  const cAllEqual = {
    input: `${bigN} 0\n${repeatValues(bigN, 4)}`,
    expectedOutput: `${(bigN * (bigN + 1)) / 2}\n`,
  };
  // C: strictly increasing 1..n, k=0 -> only single days are stable -> n.
  const cIncreasingTight = {
    input: `${bigN} 0\n${sequenceLine(bigN, (i) => i + 1)}`,
    expectedOutput: `${bigN}\n`,
  };
  // C: strictly increasing 1..n, k huge -> every window is stable -> n(n+1)/2.
  const cIncreasingWide = {
    input: `${bigN} 2000000000\n${sequenceLine(bigN, (i) => i + 1)}`,
    expectedOutput: `${(bigN * (bigN + 1)) / 2}\n`,
  };

  return {
    "battery-reset-counter": [aAllZeros, aAllOnes, aAllNegOnes],
    "uniform-cohort-batches": [bSingletons, bDistinctTight, bPacked],
    "stable-trading-windows": [cAllEqual, cIncreasingTight, cIncreasingWide],
  };
}

const contestThreeProblems = [batteryResetCounter, uniformCohortBatches, stableTradingWindows];

module.exports = {
  CONTEST_THREE_SLUG,
  contestThreeProblems,
  buildContestThreeStressTests,
};
