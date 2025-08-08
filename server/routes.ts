import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertClientSchema,
  insertExerciseSchema,
  insertWorkoutTemplateSchema,
  insertTemplateExerciseSchema,
  insertWorkoutSchema,
  insertWorkoutExerciseSchema,
  insertSetSchema,
  insertSharedWorkoutLinkSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple auth endpoint for compatibility (no auth required)
  app.get('/api/auth/user', async (req: any, res) => {
    res.json({ 
      id: 'trainer-1', 
      firstName: 'Javier', 
      email: 'javier@workouts.com' 
    });
  });

  // Client routes (no auth required)
  app.get('/api/clients', async (req: any, res) => {
    try {
      const trainerId = 'trainer-1'; // Fixed trainer ID since no auth
      const clients = await storage.getClients(trainerId);
      
      // Get last workout info for each client
      const clientsWithLastWorkout = await Promise.all(
        clients.map(async (client) => {
          const workouts = await storage.getWorkouts(client.id);
          const lastWorkout = workouts[0];
          return {
            ...client,
            lastWorkout: lastWorkout ? {
              date: lastWorkout.date,
              daysAgo: Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24))
            } : null
          };
        })
      );
      
      res.json(clientsWithLastWorkout);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', async (req: any, res) => {
    try {
      const trainerId = 'trainer-1'; // Fixed trainer ID since no auth
      const clientData = insertClientSchema.parse({ ...req.body, trainerId });
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.get('/api/clients/:id', async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Exercise routes
  app.get('/api/exercises', async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post('/api/exercises', async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(400).json({ message: "Failed to create exercise" });
    }
  });

  // Workout template routes
  app.get('/api/clients/:clientId/templates', async (req, res) => {
    try {
      const templates = await storage.getWorkoutTemplates(req.params.clientId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching workout templates:", error);
      res.status(500).json({ message: "Failed to fetch workout templates" });
    }
  });

  app.post('/api/clients/:clientId/templates', async (req, res) => {
    try {
      const templateData = insertWorkoutTemplateSchema.parse({
        ...req.body,
        clientId: req.params.clientId,
      });
      const template = await storage.createWorkoutTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating workout template:", error);
      res.status(400).json({ message: "Failed to create workout template" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getWorkoutTemplateWithExercises(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Workout template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching workout template:", error);
      res.status(500).json({ message: "Failed to fetch workout template" });
    }
  });

  // Template exercise routes
  app.post('/api/templates/:templateId/exercises', async (req, res) => {
    try {
      const templateExerciseData = insertTemplateExerciseSchema.parse({
        ...req.body,
        workoutTemplateId: req.params.templateId,
      });
      const templateExercise = await storage.createTemplateExercise(templateExerciseData);
      res.json(templateExercise);
    } catch (error) {
      console.error("Error creating template exercise:", error);
      res.status(400).json({ message: "Failed to create template exercise" });
    }
  });

  // Workout routes
  app.get('/api/clients/:clientId/workouts', async (req, res) => {
    try {
      const workouts = await storage.getWorkouts(req.params.clientId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.post('/api/workouts', async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error) {
      console.error("Error creating workout:", error);
      res.status(400).json({ message: "Failed to create workout" });
    }
  });

  // Get last performance for exercise
  app.get('/api/clients/:clientId/exercises/:exerciseId/last-performance', async (req, res) => {
    try {
      const lastPerformance = await storage.getLastWorkoutForClient(
        req.params.clientId,
        req.params.exerciseId
      );
      res.json(lastPerformance);
    } catch (error) {
      console.error("Error fetching last performance:", error);
      res.status(500).json({ message: "Failed to fetch last performance" });
    }
  });

  // Workout exercise routes
  app.post('/api/workout-exercises', async (req, res) => {
    try {
      const workoutExerciseData = insertWorkoutExerciseSchema.parse(req.body);
      const workoutExercise = await storage.createWorkoutExercise(workoutExerciseData);
      res.json(workoutExercise);
    } catch (error) {
      console.error("Error creating workout exercise:", error);
      res.status(400).json({ message: "Failed to create workout exercise" });
    }
  });

  // Set routes
  app.post('/api/sets', async (req, res) => {
    try {
      const setData = insertSetSchema.parse(req.body);
      const set = await storage.createSet(setData);
      res.json(set);
    } catch (error) {
      console.error("Error creating set:", error);
      res.status(400).json({ message: "Failed to create set" });
    }
  });

  // Shared workout link routes
  app.post('/api/clients/:clientId/templates/:templateId/share', async (req, res) => {
    try {
      const linkData = insertSharedWorkoutLinkSchema.parse({
        clientId: req.params.clientId,
        workoutTemplateId: req.params.templateId,
      });
      const link = await storage.createSharedWorkoutLink(linkData);
      res.json(link);
    } catch (error) {
      console.error("Error creating shared workout link:", error);
      res.status(400).json({ message: "Failed to create shared workout link" });
    }
  });

  // Client workout submission routes (no auth required)
  app.get('/api/workout/:token', async (req, res) => {
    try {
      const link = await storage.getSharedWorkoutLink(req.params.token);
      
      if (!link) {
        return res.status(404).json({ message: "Workout link not found" });
      }

      if (link.isUsed) {
        return res.status(410).json({ message: "Workout link has already been used" });
      }

      if (new Date() > new Date(link.expiresAt)) {
        return res.status(410).json({ message: "Workout link has expired" });
      }

      // Get workout template with exercises
      const template = await storage.getWorkoutTemplateWithExercises(link.workoutTemplateId);
      
      // Get last performance for each exercise
      const exercisesWithLastPerformance = await Promise.all(
        template.exercises.map(async (exercise: any) => {
          const lastPerformance = await storage.getLastWorkoutForClient(
            link.clientId,
            exercise.exerciseId
          );
          return {
            ...exercise,
            lastPerformance: lastPerformance?.sets || [],
          };
        })
      );

      res.json({
        client: {
          name: link.clientName,
        },
        template: {
          ...template,
          exercises: exercisesWithLastPerformance,
        },
      });
    } catch (error) {
      console.error("Error fetching workout data:", error);
      res.status(500).json({ message: "Failed to fetch workout data" });
    }
  });

  app.post('/api/workout/:token/submit', async (req, res) => {
    try {
      const link = await storage.getSharedWorkoutLink(req.params.token);
      
      if (!link) {
        return res.status(404).json({ message: "Workout link not found" });
      }

      if (link.isUsed) {
        return res.status(410).json({ message: "Workout link has already been used" });
      }

      if (new Date() > new Date(link.expiresAt)) {
        return res.status(410).json({ message: "Workout link has expired" });
      }

      const { exercises, notes } = req.body;

      // Create workout record
      const workout = await storage.createWorkout({
        clientId: link.clientId,
        workoutTemplateId: link.workoutTemplateId,
        date: new Date(),
        notes,
      });

      // Create workout exercises and sets
      for (const [index, exercise] of exercises.entries()) {
        const workoutExercise = await storage.createWorkoutExercise({
          workoutId: workout.id,
          exerciseId: exercise.exerciseId,
          orderIndex: index,
          notes: exercise.notes,
        });

        // Create sets
        for (const set of exercise.sets) {
          if (set.reps && set.weightKg) {
            await storage.createSet({
              workoutExerciseId: workoutExercise.id,
              setNumber: set.setNumber,
              reps: parseInt(set.reps.toString()),
              weightKg: parseFloat(set.weightKg.toString()),
              restSeconds: set.restSeconds ? parseInt(set.restSeconds.toString()) : null,
              rpe: set.rpe ? parseInt(set.rpe.toString()) : null,
              notes: set.notes,
            });
          }
        }
      }

      // Mark link as used
      await storage.markSharedWorkoutLinkAsUsed(req.params.token);

      res.json({ message: "Workout submitted successfully" });
    } catch (error) {
      console.error("Error submitting workout:", error);
      res.status(500).json({ message: "Failed to submit workout" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
