// Problems for the "HireUp Online Assessment" — the first round of the HireUp
// mock-hiring event. The pair escalates from a prefix-imbalance observation to
// weighted tree rerooting, giving candidates an approachable entry point and a
// stronger second problem within the assessment window.
//
// Reference solutions live in scripts/reference-solutions/<slug>.{py,cpp} and are
// attached by prisma/seed.mjs. Stress-test outputs below are closed-form and
// independently verified against the references (see scripts/validate-problems.mjs).

const HIREUP_OA_SLUG = "hireup-oa";

function repeatValues(count, value) {
  return `${new Array(count).fill(value).join(" ")}\n`;
}

function sequenceLine(count, mapper) {
  return `${Array.from({ length: count }, (_, index) => mapper(index)).join(" ")}\n`;
}

function weightedChain(nodes, weight) {
  const lines = [String(nodes)];
  for (let node = 1; node < nodes; node += 1) {
    lines.push(`${node - 1} ${node} ${weight}`);
  }
  return `${lines.join("\n")}\n`;
}

// --- Problem A: Driver Rebalancing Across City Corridors ---------------------
const driverRebalancing = {
  slug: "driver-rebalancing",
  title: "Driver Rebalancing Across City Corridors",
  statement:
    "A city has N zones arranged in a straight line and numbered 1 through N. Zone i currently has current[i] available drivers, while target[i] is the desired number of drivers in that zone.\n\nIn one move, you may move one driver from a zone to either adjacent zone. Moving a driver across one zone boundary costs 1. A driver may cross several boundaries through several moves.\n\nThe total number of current drivers equals the total target, so it is always possible to reach the target distribution. Find the minimum total movement cost.\n\nInput format:\n- First line: N\n- Second line: N integers current[1], current[2], ..., current[N]\n- Third line: N integers target[1], target[2], ..., target[N]\n\nPrint a single integer: the minimum total movement cost. The answer can exceed a 32-bit integer.",
  constraints:
    "1 <= N <= 2 * 10^5\n0 <= current[i], target[i] <= 10^9\nsum(current) = sum(target) <= 10^13",
  tags: ["Array", "Prefix Sum", "Greedy", "Uber", "HireUp"],
  difficulty: "MEDIUM",
  timeLimitMs: 2000,
  samples: [
    { input: "4\n0 3 0 2\n1 1 2 1\n", expectedOutput: "3\n" },
    { input: "5\n10 0 0 0 0\n0 0 0 0 10\n", expectedOutput: "40\n" },
  ],
  hidden: [
    { input: "1\n7\n7\n", expectedOutput: "0\n" },
    { input: "5\n1 2 3 4 5\n1 2 3 4 5\n", expectedOutput: "0\n" },
    { input: "6\n5 0 4 0 0 3\n0 3 0 4 2 3\n", expectedOutput: "15\n" },
    { input: "3\n0 0 1000000000\n1000000000 0 0\n", expectedOutput: "2000000000\n" },
  ],
};

// --- Problem B: Best Dispatch Hub ---------------------------------------------
const bestDispatchHub = {
  slug: "best-dispatch-hub",
  title: "Best Dispatch Hub",
  statement:
    "Uber operates in a city whose road network forms a tree. There are N intersections numbered 0 through N-1 and exactly N-1 bidirectional roads. Every intersection is reachable from every other intersection.\n\nEach road connects intersections u and v and has a positive travel time w. If a driver dispatch hub is placed at intersection r, its dispatch cost is the sum of the shortest travel times from r to all N intersections, including a travel time of 0 from r to itself.\n\nFor every possible hub location r, compute its dispatch cost.\n\nInput format:\n- First line: N\n- Next N-1 lines: three integers u, v, and w describing a bidirectional road\n\nPrint N space-separated integers. The value at index r must be the dispatch cost when the hub is placed at intersection r. Use 64-bit arithmetic.",
  constraints: "1 <= N <= 5 * 10^4\n0 <= u, v < N\n1 <= w <= 10^6",
  tags: ["Tree", "Dynamic Programming", "Rerooting", "DFS", "Uber", "HireUp"],
  difficulty: "HARD",
  timeLimitMs: 3000,
  samples: [
    { input: "4\n0 1 1\n0 2 1\n2 3 1\n", expectedOutput: "4 6 4 6\n" },
    { input: "2\n0 1 7\n", expectedOutput: "7 7\n" },
  ],
  hidden: [
    { input: "1\n", expectedOutput: "0\n" },
    { input: "3\n0 1 2\n1 2 3\n", expectedOutput: "7 5 8\n" },
    { input: "5\n0 1 1\n0 2 2\n0 3 3\n0 4 4\n", expectedOutput: "10 13 16 19 22\n" },
    {
      input: "4\n0 1 1000000\n1 2 1000000\n2 3 1000000\n",
      expectedOutput: "6000000 4000000 4000000 6000000\n",
    },
  ],
};

// Efficiency / stress tests. Inputs are large; expected outputs are closed-form
// and independently verified against the reference solutions.
function buildHireupStressTests() {
  const bigN = 200_000;
  // Best Dispatch Hub prints one cost per intersection, so its answer grows with
  // N. Cap it well under the judge's 2 MB output limit (lib/judge/piston.ts) —
  // otherwise a correct solution would have its output truncated and be marked
  // wrong. At 50k nodes an O(N^2) solution still times out comfortably.
  const treeN = 50_000;

  // A: moving one large group from the first zone to the last makes every driver
  // cross every boundary.
  const aLongTransfer = {
    input: `${bigN}\n100000000 ${repeatValues(bigN - 1, 0)}${repeatValues(bigN - 1, 0).trim()} 100000000\n`,
    expectedOutput: `${(bigN - 1) * 100_000_000}\n`,
  };

  // A: each adjacent pair starts with its driver in the left zone and needs it
  // in the right zone, so exactly half the boundaries carry one driver.
  const aAlternating = {
    input: `${bigN}\n${sequenceLine(bigN, (index) => (index % 2 === 0 ? 1 : 0))}${sequenceLine(bigN, (index) => (index % 2 === 0 ? 0 : 1))}`,
    expectedOutput: `${bigN / 2}\n`,
  };

  const aAlreadyBalanced = {
    input: `${bigN}\n${repeatValues(bigN, 1000000)}${repeatValues(bigN, 1000000)}`,
    expectedOutput: "0\n",
  };

  // B: a long chain forces linear-time traversal and reroot propagation. For a
  // node r, the sum is 1 + ... + r plus 1 + ... + (N-1-r).
  const bChain = {
    input: weightedChain(treeN, 1),
    expectedOutput: sequenceLine(treeN, (root) => {
      const left = (root * (root + 1)) / 2;
      const rightNodes = treeN - 1 - root;
      const right = (rightNodes * (rightNodes + 1)) / 2;
      return left + right;
    }),
  };

  // B: in a unit-weight star the center costs N-1 and every leaf costs 2N-3.
  const starEdges = Array.from({ length: treeN - 1 }, (_, index) => `0 ${index + 1} 1`).join("\n");
  const bStar = {
    input: `${treeN}\n${starEdges}\n`,
    expectedOutput: `${treeN - 1} ${repeatValues(treeN - 1, 2 * treeN - 3)}`,
  };

  return {
    "driver-rebalancing": [aLongTransfer, aAlternating, aAlreadyBalanced],
    "best-dispatch-hub": [bChain, bStar],
  };
}

const hireupProblems = [driverRebalancing, bestDispatchHub];

module.exports = {
  HIREUP_OA_SLUG,
  hireupProblems,
  buildHireupStressTests,
};
