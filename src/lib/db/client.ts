import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { resolveDatabaseUrl } from "@/lib/db/connection-url";

config({ path: ".env" });

const client = postgres(resolveDatabaseUrl(), {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client);
