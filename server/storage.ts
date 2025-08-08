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
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Exercise,
  type InsertExercise,
  type WorkoutTemplate,
  type InsertWorkoutTemplate,
  type TemplateExercise,
  type InsertTemplateExercise,
  type Workout,
  type InsertWorkout,
  type WorkoutExercise,
  type InsertWorkoutExercise,
  type Set,
  type InsertSet,
  type SharedWorkoutLink,
  type InsertSharedWorkoutLink,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client operations
  getClients(trainerId: string): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Workout template operations
  getWorkoutTemplates(clientId: string): Promise<WorkoutTemplate[]>;
  getWorkoutTemplate(id: string): Promise<WorkoutTemplate | undefined>;
  createWorkoutTemplate(template: InsertWorkoutTemplate): Promise<WorkoutTemplate>;
  getWorkoutTemplateWithExercises(id: string): Promise<any>;
  
  // Template exercise operations
  getTemplateExercises(templateId: string): Promise<TemplateExercise[]>;
  createTemplateExercise(templateExercise: InsertTemplateExercise): Promise<TemplateExercise>;
  
  // Workout operations
  getWorkouts(clientId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getLastWorkoutForClient(clientId: string, exerciseId: string): Promise<any>;
  
  // Workout exercise operations
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  
  // Set operations
  createSet(set: InsertSet): Promise<Set>;
  getLastSetsForExercise(clientId: string, exerciseId: string): Promise<Set[]>;
  
  // Shared workout link operations
  createSharedWorkoutLink(link: InsertSharedWorkoutLink): Promise<SharedWorkoutLink>;
  getSharedWorkoutLink(token: string): Promise<any>;
  markSharedWorkoutLinkAsUsed(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Client operations
  async getClients(trainerId: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.trainerId, trainerId));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Exercise operations
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises).orderBy(asc(exercises.name));
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [newExercise] = await db.insert(exercises).values(exercise).returning();
    return newExercise;
  }

  // Workout template operations
  async getWorkoutTemplates(clientId: string): Promise<WorkoutTemplate[]> {
    return await db
      .select()
      .from(workoutTemplates)
      .where(eq(workoutTemplates.clientId, clientId))
      .orderBy(desc(workoutTemplates.createdAt));
  }

  async getWorkoutTemplate(id: string): Promise<WorkoutTemplate | undefined> {
    const [template] = await db.select().from(workoutTemplates).where(eq(workoutTemplates.id, id));
    return template;
  }

  async createWorkoutTemplate(template: InsertWorkoutTemplate): Promise<WorkoutTemplate> {
    const [newTemplate] = await db.insert(workoutTemplates).values(template).returning();
    return newTemplate;
  }

  async getWorkoutTemplateWithExercises(id: string): Promise<any> {
    const template = await db
      .select({
        id: workoutTemplates.id,
        name: workoutTemplates.name,
        clientId: workoutTemplates.clientId,
        clientName: clients.name,
      })
      .from(workoutTemplates)
      .leftJoin(clients, eq(workoutTemplates.clientId, clients.id))
      .where(eq(workoutTemplates.id, id));

    const templateExercisesList = await db
      .select({
        id: templateExercises.id,
        orderIndex: templateExercises.orderIndex,
        targetSets: templateExercises.targetSets,
        targetReps: templateExercises.targetReps,
        notes: templateExercises.notes,
        exerciseId: exercises.id,
        exerciseName: exercises.name,
        exerciseCategory: exercises.category,
        exerciseInstructions: exercises.instructions,
      })
      .from(templateExercises)
      .leftJoin(exercises, eq(templateExercises.exerciseId, exercises.id))
      .where(eq(templateExercises.workoutTemplateId, id))
      .orderBy(asc(templateExercises.orderIndex));

    return {
      ...template[0],
      exercises: templateExercisesList,
    };
  }

  // Template exercise operations
  async getTemplateExercises(templateId: string): Promise<TemplateExercise[]> {
    return await db
      .select()
      .from(templateExercises)
      .where(eq(templateExercises.workoutTemplateId, templateId))
      .orderBy(asc(templateExercises.orderIndex));
  }

  async createTemplateExercise(templateExercise: InsertTemplateExercise): Promise<TemplateExercise> {
    const [newTemplateExercise] = await db.insert(templateExercises).values(templateExercise).returning();
    return newTemplateExercise;
  }

  // Workout operations
  async getWorkouts(clientId: string): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.clientId, clientId))
      .orderBy(desc(workouts.date));
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  async getLastWorkoutForClient(clientId: string, exerciseId: string): Promise<any> {
    const lastWorkout = await db
      .select({
        workoutId: workouts.id,
        workoutDate: workouts.date,
        workoutExerciseId: workoutExercises.id,
      })
      .from(workouts)
      .leftJoin(workoutExercises, eq(workouts.id, workoutExercises.workoutId))
      .where(
        and(
          eq(workouts.clientId, clientId),
          eq(workoutExercises.exerciseId, exerciseId)
        )
      )
      .orderBy(desc(workouts.date))
      .limit(1);

    if (lastWorkout.length === 0) return null;

    const lastSets = await db
      .select()
      .from(sets)
      .where(eq(sets.workoutExerciseId, lastWorkout[0].workoutExerciseId!))
      .orderBy(asc(sets.setNumber));

    return {
      workout: lastWorkout[0],
      sets: lastSets,
    };
  }

  // Workout exercise operations
  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const [newWorkoutExercise] = await db.insert(workoutExercises).values(workoutExercise).returning();
    return newWorkoutExercise;
  }

  // Set operations
  async createSet(set: InsertSet): Promise<Set> {
    const [newSet] = await db.insert(sets).values(set).returning();
    return newSet;
  }

  async getLastSetsForExercise(clientId: string, exerciseId: string): Promise<Set[]> {
    const lastWorkoutData = await this.getLastWorkoutForClient(clientId, exerciseId);
    return lastWorkoutData ? lastWorkoutData.sets : [];
  }

  // Shared workout link operations
  async createSharedWorkoutLink(link: InsertSharedWorkoutLink): Promise<SharedWorkoutLink> {
    // Generate unique token
    const uniqueToken = randomBytes(32).toString('hex');
    const linkWithToken = {
      ...link,
      uniqueToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    
    const [newLink] = await db.insert(sharedWorkoutLinks).values(linkWithToken).returning();
    return newLink;
  }

  async getSharedWorkoutLink(token: string): Promise<any> {
    const link = await db
      .select({
        id: sharedWorkoutLinks.id,
        clientId: sharedWorkoutLinks.clientId,
        workoutTemplateId: sharedWorkoutLinks.workoutTemplateId,
        expiresAt: sharedWorkoutLinks.expiresAt,
        isUsed: sharedWorkoutLinks.isUsed,
        clientName: clients.name,
        templateName: workoutTemplates.name,
      })
      .from(sharedWorkoutLinks)
      .leftJoin(clients, eq(sharedWorkoutLinks.clientId, clients.id))
      .leftJoin(workoutTemplates, eq(sharedWorkoutLinks.workoutTemplateId, workoutTemplates.id))
      .where(eq(sharedWorkoutLinks.uniqueToken, token));

    return link[0];
  }

  async markSharedWorkoutLinkAsUsed(token: string): Promise<void> {
    await db
      .update(sharedWorkoutLinks)
      .set({ isUsed: true, updatedAt: new Date() })
      .where(eq(sharedWorkoutLinks.uniqueToken, token));
  }
}

export const storage = new DatabaseStorage();
