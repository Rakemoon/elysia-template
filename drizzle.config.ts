import process from "node:process";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/libs/database/schema.ts",
    out: "./drizzle",
    dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'
    dbCredentials: {
        url: process.env.DB_URL!
    }
});
