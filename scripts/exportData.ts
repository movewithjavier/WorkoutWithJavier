import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import fs from "fs";
import path from "path";
import {
  users,
  clients,
  exercises,
  workoutTemplates,
  templateExercises,
  workouts,
  workoutExercises,
  sets,
  sharedWorkoutLinks,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws as any;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  const outDir = path.resolve(process.cwd(), "export");
  await fs.promises.mkdir(outDir, { recursive: true });

  // Helper to write JSON
  const write = async (name: string, data: unknown) => {
    const file = path.join(outDir, `${name}.json`);
    await fs.promises.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Wrote ${file}`);
  };

  // Fetch data per table (limit to reasonable sizes for sharing)
  const [usersData, clientsData, exercisesData, templatesData, templateExercisesData, workoutsData, workoutExercisesData, setsData, sharedLinksData] = await Promise.all([
    db.select().from(users).limit(100),
    db.select().from(clients).limit(200),
    db.select().from(exercises).limit(500),
    db.select().from(workoutTemplates).limit(200),
    db.select().from(templateExercises).limit(1000),
    db.select().from(workouts).limit(500),
    db.select().from(workoutExercises).limit(2000),
    db.select().from(sets).limit(5000),
    db.select().from(sharedWorkoutLinks).limit(200),
  ]);

  await write("users", usersData);
  await write("clients", clientsData);
  await write("exercises", exercisesData);
  await write("workout_templates", templatesData);
  await write("template_exercises", templateExercisesData);
  await write("workouts", workoutsData);
  await write("workout_exercises", workoutExercisesData);
  await write("sets", setsData);
  await write("shared_workout_links", sharedLinksData);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
