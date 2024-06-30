import { PrismaClient } from "@prisma/client";
import { format } from "sql-formatter";

const db = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
  ],
});

if (typeof window === "undefined") {
  db.$on("query", (e) => {
    // console.log(`👉Query: ${e.query}`);
    console.log(`👉Query: ${format(e.query)}`);
    console.log(`Params: ${e.params}\n`);
  });
}

export default db;
