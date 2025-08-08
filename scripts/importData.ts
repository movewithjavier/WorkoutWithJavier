import 'dotenv/config';
import { db } from '../server/db.js';
import * as schema from '@shared/schema';
import fs from 'fs';
import path from 'path';

// Helper function to convert string dates to Date objects
function convertDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string' && obj.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/)) {
    return new Date(obj);
  }
  
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDates(value);
    }
    return converted;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  }
  
  return obj;
}

async function importData() {
  console.log('Starting data import...');

  try {
    // Read all JSON files
    const exportDir = path.join(process.cwd(), 'export');
    
    const users = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'users.json'), 'utf8')));
    const exercises = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'exercises.json'), 'utf8')));
    const clients = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'clients.json'), 'utf8')));
    const workoutTemplates = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'workout_templates.json'), 'utf8')));
    const templateExercises = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'template_exercises.json'), 'utf8')));
    const workouts = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'workouts.json'), 'utf8')));
    const workoutExercises = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'workout_exercises.json'), 'utf8')));
    const sets = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'sets.json'), 'utf8')));
    const sharedWorkoutLinks = convertDates(JSON.parse(fs.readFileSync(path.join(exportDir, 'shared_workout_links.json'), 'utf8')));

    // Import in dependency order
    console.log('Importing users...');
    if (users.length > 0) {
      await db.insert(schema.users).values(users);
      console.log(`✓ Imported ${users.length} users`);
    }

    console.log('Importing exercises...');
    if (exercises.length > 0) {
      await db.insert(schema.exercises).values(exercises);
      console.log(`✓ Imported ${exercises.length} exercises`);
    }

    console.log('Importing clients...');
    if (clients.length > 0) {
      await db.insert(schema.clients).values(clients);
      console.log(`✓ Imported ${clients.length} clients`);
    }

    console.log('Importing workout templates...');
    if (workoutTemplates.length > 0) {
      await db.insert(schema.workoutTemplates).values(workoutTemplates);
      console.log(`✓ Imported ${workoutTemplates.length} workout templates`);
    }

    console.log('Importing template exercises...');
    if (templateExercises.length > 0) {
      await db.insert(schema.templateExercises).values(templateExercises);
      console.log(`✓ Imported ${templateExercises.length} template exercises`);
    }

    console.log('Importing workouts...');
    if (workouts.length > 0) {
      await db.insert(schema.workouts).values(workouts);
      console.log(`✓ Imported ${workouts.length} workouts`);
    }

    console.log('Importing workout exercises...');
    if (workoutExercises.length > 0) {
      await db.insert(schema.workoutExercises).values(workoutExercises);
      console.log(`✓ Imported ${workoutExercises.length} workout exercises`);
    }

    console.log('Importing sets...');
    if (sets.length > 0) {
      await db.insert(schema.sets).values(sets);
      console.log(`✓ Imported ${sets.length} sets`);
    }

    console.log('Importing shared workout links...');
    if (sharedWorkoutLinks.length > 0) {
      await db.insert(schema.sharedWorkoutLinks).values(sharedWorkoutLinks);
      console.log(`✓ Imported ${sharedWorkoutLinks.length} shared workout links`);
    }

    console.log('🎉 Data import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();