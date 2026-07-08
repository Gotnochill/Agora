import { PrismaClient } from "./generated/prisma/client";
import { createPrismaAdapter } from "./prisma-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: createPrismaAdapter(connectionString),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

let client: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (client) {
    return client;
  }

  client = globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Lazily construct the client on first use. This keeps importing this module
// side-effect free (e.g. unit tests that never touch the DB) while still
// validating DATABASE_URL and building the driver adapter when actually used.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPrismaClient(), prop, receiver);
    return typeof value === "function" ? value.bind(getPrismaClient()) : value;
  },
}) as PrismaClient;
