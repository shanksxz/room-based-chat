import type { Config } from "drizzle-kit";
import { getEnvVar } from "./src/utils";

export default {
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials : {
    "url" : getEnvVar("DATABASE_URL"),
  }
} satisfies Config;

