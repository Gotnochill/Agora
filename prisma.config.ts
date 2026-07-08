import { config } from "dotenv";

// The Prisma CLI does not load .env files automatically in v7, and this project
// keeps local secrets in .env.local. Load it (falling back to .env) before the
// config is evaluated so DIRECT_URL/DATABASE_URL are available.
config({ path: ".env.local" });
config();

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.mjs",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection; fall back to
    // DATABASE_URL for single-URL environments such as CI.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
