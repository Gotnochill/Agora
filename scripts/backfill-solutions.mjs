// Backfills each Problem's reference solutions from scripts/reference-solutions/<slug>.<ext>
// into the live DB. Idempotent. Run: tsx --env-file=.env.local scripts/backfill-solutions.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../lib/generated/prisma/client.ts";
import { createPrismaAdapter } from "../lib/prisma-adapter.ts";

const here = dirname(fileURLToPath(import.meta.url));
const solutionsDir = join(here, "reference-solutions");
const prisma = new PrismaClient({ adapter: createPrismaAdapter(process.env.DATABASE_URL) });
const referenceSolutionExtensions = {
  python: "py",
  cpp: "cpp",
};

const problems = await prisma.problem.findMany({ select: { id: true, slug: true } });

let updated = 0;
let missing = 0;
for (const problem of problems) {
  const referenceSolutions = [];
  for (const [language, extension] of Object.entries(referenceSolutionExtensions)) {
    const file = join(solutionsDir, `${problem.slug}.${extension}`);
    if (!existsSync(file)) {
      console.log(`MISSING ${problem.slug}.${extension}`);
      missing += 1;
      continue;
    }
    referenceSolutions.push({ language, code: readFileSync(file, "utf8") });
  }

  const primarySolution = referenceSolutions.find((solution) => solution.language === "python");
  await prisma.problem.update({
    where: { id: problem.id },
    data: {
      solutionCode: primarySolution?.code,
      solutionLanguage: primarySolution?.language,
      referenceSolutions: {
        deleteMany: {},
        create: referenceSolutions,
      },
    },
  });
  updated += referenceSolutions.length;
}

console.log(`Updated ${updated} reference solution(s); ${missing} missing solution file(s).`);
await prisma.$disconnect();
