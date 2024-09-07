// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";

// const sql = neon(getEnvVar("DATABASE_URL"));
// export const db = drizzle(sql);

import { getEnvVar } from "./utils";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString : getEnvVar("DATABASE_URL"),
})

export const db = drizzle(pool);
