## Database reference

This document summarizes the current relational model and a snapshot of the live data to help rapid development.

### Entities (tables)
- users
  - id (varchar, pk)
  - email (varchar, unique)
  - firstName (varchar)
  - lastName (varchar)
  - profileImageUrl (varchar)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- clients
  - id (uuid, pk)
  - trainerId (varchar, fk → users.id)
  - name (varchar)
  - email (varchar)
  - phone (varchar)
  - notes (text)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- exercises
  - id (uuid, pk)
  - name (varchar)
  - category (varchar)
  - videoUrl (text)
  - instructions (text)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- workout_templates
  - id (uuid, pk)
  - clientId (uuid, fk → clients.id)
  - name (varchar)
  - isActive (boolean)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- template_exercises
  - id (uuid, pk)
  - workoutTemplateId (uuid, fk → workout_templates.id)
  - exerciseId (uuid, fk → exercises.id)
  - orderIndex (int)
  - targetSets (int | null)
  - targetReps (int | null)
  - notes (text | null)

- workouts
  - id (uuid, pk)
  - clientId (uuid, fk → clients.id)
  - workoutTemplateId (uuid, fk → workout_templates.id | null)
  - date (timestamp)
  - durationMinutes (int | null)
  - notes (text | null)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- workout_exercises
  - id (uuid, pk)
  - workoutId (uuid, fk → workouts.id)
  - exerciseId (uuid, fk → exercises.id)
  - orderIndex (int)
  - notes (text | null)

- sets
  - id (uuid, pk)
  - workoutExerciseId (uuid, fk → workout_exercises.id)
  - setNumber (int)
  - reps (int)
  - weightKg (decimal)
  - restSeconds (int | null)
  - rpe (int | null)
  - notes (text | null)

- shared_workout_links
  - id (uuid, pk)
  - clientId (uuid, fk → clients.id)
  - workoutTemplateId (uuid, fk → workout_templates.id)
  - uniqueToken (varchar, unique)
  - expiresAt (timestamp)
  - isUsed (boolean)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- sessions (for Replit Auth integration)
  - sid (varchar, pk)
  - sess (jsonb)
  - expire (timestamp, indexed)

### Relations overview
- users 1—N clients
- clients 1—N workout_templates, workouts, shared_workout_links
- workout_templates 1—N template_exercises, workouts, shared_workout_links
- exercises 1—N template_exercises, workout_exercises
- workouts 1—N workout_exercises
- workout_exercises 1—N sets

### API-to-DB mapping (selected)
- GET /api/clients
  - storage.getClients(trainerId) → clients
  - last workout per client derived via storage.getWorkouts(clientId) and sets
- POST /api/clients
  - insertClientSchema → clients
- GET /api/exercises
  - storage.getExercises() → exercises
- POST /api/exercises
  - insertExerciseSchema → exercises
- GET /api/clients/:clientId/templates
  - storage.getWorkoutTemplates(clientId) → workout_templates
- POST /api/clients/:clientId/templates
  - insertWorkoutTemplateSchema → workout_templates
- GET /api/templates/:id
  - storage.getWorkoutTemplateWithExercises(id) joins template_exercises + exercises
- POST /api/templates/:templateId/exercises
  - insertTemplateExerciseSchema → template_exercises
- GET /api/clients/:clientId/workouts
  - storage.getWorkouts(clientId) → workouts
- POST /api/workouts
  - insertWorkoutSchema → workouts
- POST /api/workout-exercises
  - insertWorkoutExerciseSchema → workout_exercises
- POST /api/sets
  - insertSetSchema → sets
- POST /api/clients/:clientId/templates/:templateId/share
  - insertSharedWorkoutLinkSchema → shared_workout_links
  - uniqueToken generated server-side
- GET /api/workout/:token
  - shared_workout_links → workout_templates + template_exercises + exercises; last sets via storage.getLastWorkoutForClient
- POST /api/workout/:token/submit
  - writes to workouts, workout_exercises, sets; marks shared_workout_links.isUsed = true

### Current data snapshot (export/)
- users.json: 1 row
  - id: "trainer-1" (fixed trainer)
- clients.json: 2 rows (Cel Manotok, Jan Parales), both owned by trainer-1
- exercises.json: 0
- workout_templates.json: 0
- template_exercises.json: 0
- workouts.json: 0
- workout_exercises.json: 0
- sets.json: 0
- shared_workout_links.json: 0

Implications
- You can create exercises and templates next; shared links and client workout flow will work once templates and exercises exist.
- Because clients reference users.id, ensure the fixed user (trainer-1) remains present.
