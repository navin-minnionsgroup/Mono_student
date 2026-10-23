
import { db } from "./index";
import { students } from "./schema";

async function main() {
  try {
    const result = await db
      .select()
      .from(students);

    console.log("Students:", result);
  } catch (error) {
    console.error("Drizzle query failed:", error);
    process.exitCode = 1;
  } finally {
    await db.$client.end();
  }
}

main();
