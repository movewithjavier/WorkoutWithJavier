import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  videoUrl: text("video_url"),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  trainerId: varchar("trainer_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout templates table
export const workoutTemplates = pgTable("workout_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Template exercises table
export const templateExercises = pgTable("template_exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutTemplateId: uuid("workout_template_id").notNull().references(() => workoutTemplates.id),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  orderIndex: integer("order_index").notNull(),
  targetSets: integer("target_sets"),
  targetReps: integer("target_reps"),
  notes: text("notes"),
});

// Workouts table (historical records)
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  workoutTemplateId: uuid("workout_template_id").references(() => workoutTemplates.id),
  date: timestamp("date").notNull().defaultNow(),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout exercises table
export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: uuid("workout_id").notNull().references(() => workouts.id),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id),
  orderIndex: integer("order_index").notNull(),
  notes: text("notes"),
});

// Sets table
export const sets = pgTable("sets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutExerciseId: uuid("workout_exercise_id").notNull().references(() => workoutExercises.id),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weightKg: decimal("weight_kg", { precision: 5, scale: 2 }).notNull(),
  restSeconds: integer("rest_seconds"),
  rpe: integer("rpe"), // rate of perceived exertion
  notes: text("notes"),
});

// Shared workout links table
export const sharedWorkoutLinks = pgTable("shared_workout_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  workoutTemplateId: uuid("workout_template_id").notNull().references(() => workoutTemplates.id),
  uniqueToken: varchar("unique_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  trainer: one(users, { fields: [clients.trainerId], references: [users.id] }),
  workoutTemplates: many(workoutTemplates),
  workouts: many(workouts),
  sharedWorkoutLinks: many(sharedWorkoutLinks),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  templateExercises: many(templateExercises),
  workoutExercises: many(workoutExercises),
}));

export const workoutTemplatesRelations = relations(workoutTemplates, ({ one, many }) => ({
  client: one(clients, { fields: [workoutTemplates.clientId], references: [clients.id] }),
  templateExercises: many(templateExercises),
  workouts: many(workouts),
  sharedWorkoutLinks: many(sharedWorkoutLinks),
}));

export const templateExercisesRelations = relations(templateExercises, ({ one }) => ({
  workoutTemplate: one(workoutTemplates, { fields: [templateExercises.workoutTemplateId], references: [workoutTemplates.id] }),
  exercise: one(exercises, { fields: [templateExercises.exerciseId], references: [exercises.id] }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  client: one(clients, { fields: [workouts.clientId], references: [clients.id] }),
  workoutTemplate: one(workoutTemplates, { fields: [workouts.workoutTemplateId], references: [workoutTemplates.id] }),
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, { fields: [sets.workoutExerciseId], references: [workoutExercises.id] }),
}));

export const sharedWorkoutLinksRelations = relations(sharedWorkoutLinks, ({ one }) => ({
  client: one(clients, { fields: [sharedWorkoutLinks.clientId], references: [clients.id] }),
  workoutTemplate: one(workoutTemplates, { fields: [sharedWorkoutLinks.workoutTemplateId], references: [workoutTemplates.id] }),
}));

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutTemplateSchema = createInsertSchema(workoutTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateExerciseSchema = createInsertSchema(templateExercises).omit({
  id: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export const insertSetSchema = createInsertSchema(sets).omit({
  id: true,
});

export const insertSharedWorkoutLinkSchema = createInsertSchema(sharedWorkoutLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type InsertWorkoutTemplate = z.infer<typeof insertWorkoutTemplateSchema>;
export type TemplateExercise = typeof templateExercises.$inferSelect;
export type InsertTemplateExercise = z.infer<typeof insertTemplateExerciseSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type Set = typeof sets.$inferSelect;
export type InsertSet = z.infer<typeof insertSetSchema>;
export type SharedWorkoutLink = typeof sharedWorkoutLinks.$inferSelect;
export type InsertSharedWorkoutLink = z.infer<typeof insertSharedWorkoutLinkSchema>;
