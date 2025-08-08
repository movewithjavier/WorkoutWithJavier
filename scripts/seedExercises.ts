import 'dotenv/config';
import { db } from '../server/db.js';
import * as schema from '@shared/schema';

const basicExercises = [
  {
    name: "Dumbbell Chest Press",
    category: "Chest",
    instructions: "Lie on bench, press dumbbells up and together"
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    instructions: "Pull bar down to chest, squeeze shoulder blades"
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    instructions: "Press dumbbells overhead from shoulder height"
  },
  {
    name: "Dumbbell Bicep Curls",
    category: "Arms",
    instructions: "Curl dumbbells to shoulders, control the negative"
  },
  {
    name: "Tricep Dips",
    category: "Arms",
    instructions: "Dip down and press back up using triceps"
  },
  {
    name: "Goblet Squats",
    category: "Legs",
    instructions: "Hold dumbbell at chest, squat down and up"
  },
  {
    name: "Romanian Deadlifts",
    category: "Legs",
    instructions: "Hinge at hips, lower weight and return to standing"
  },
  {
    name: "Walking Lunges",
    category: "Legs",
    instructions: "Step forward into lunge, alternate legs"
  },
  {
    name: "Plank",
    category: "Core",
    instructions: "Hold plank position, keep core tight"
  },
  {
    name: "Russian Twists",
    category: "Core",
    instructions: "Sit back, rotate torso side to side"
  }
];

async function seedExercises() {
  console.log('Seeding exercises...');
  
  try {
    for (const exercise of basicExercises) {
      await db.insert(schema.exercises).values(exercise);
      console.log(`✓ Added ${exercise.name}`);
    }
    
    console.log(`🎉 Successfully added ${basicExercises.length} exercises!`);
  } catch (error) {
    console.error('❌ Failed to seed exercises:', error);
    process.exit(1);
  }
}

seedExercises();