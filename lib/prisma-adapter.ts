import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";

function isNeonHost(connectionString: string) {
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

// Prisma 7 requires a driver adapter. Dev/prod run against Neon, while CI and
// local Docker use a plain Postgres server that the Neon serverless driver
// cannot talk to. Pick the adapter based on the connection host so both work.
export function createPrismaAdapter(connectionString: string) {
  if (isNeonHost(connectionString)) {
    // Node 20 has no global WebSocket, so the Neon driver needs `ws`.
    neonConfig.webSocketConstructor = ws;
    return new PrismaNeon({ connectionString });
  }

  return new PrismaPg({ connectionString });
}
