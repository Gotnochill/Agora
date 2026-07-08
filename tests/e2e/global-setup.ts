import { execSync } from "node:child_process";
import { DATABASE_URL } from "./env";

// Applies migrations and seeds a deterministic, always-future event so the
// events suite has stable data regardless of the current date or DB contents.
// Both steps run in child processes: `prisma migrate deploy` via the CLI, and
// the fixture seeding via tsx, so the ESM/TypeScript Prisma Client loads
// correctly instead of through Playwright's CommonJS test loader.
export default async function globalSetup() {
  process.env.DATABASE_URL = DATABASE_URL;

  // Point both the pooled (DATABASE_URL) and direct (DIRECT_URL, used by the
  // Prisma CLI for migrations) connections at the e2e database so a developer's
  // .env.local does not redirect migrations to a different database.
  const env = { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL };

  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
  execSync("npx tsx tests/e2e/seed-fixtures.mjs", { stdio: "inherit", env });
}
