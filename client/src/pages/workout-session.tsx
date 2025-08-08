import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface Set {
  setNumber: number;
  reps: string;
  weightKg: string;
  restSeconds?: string;
  rpe?: string;
  notes?: string;
}

interface ExerciseSession {
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  exerciseInstructions: string;
  orderIndex: number;
  targetSets?: number;
  targetReps?: number;
  notes?: string;
  sets: Set[];
  lastPerformance?: any[];
}

export default function WorkoutSession() {
  const { clientId, templateId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseSession[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/templates/${templateId}`],
    enabled: !!templateId,
  });

  // Initialize workout exercises when template loads
  useEffect(() => {
    if (template?.exercises) {
      const initializeExercises = async () => {
        const exercisesWithLastPerformance = await Promise.all(
          template.exercises.map(async (exercise: any) => {
            try {
              const lastPerformance = await apiRequest("GET", 
                `/api/clients/${clientId}/exercises/${exercise.exerciseId}/last-performance`
              );
              
              // Initialize with one set, using last performance as template
              const initialSets: Set[] = [{
                setNumber: 1,
                reps: lastPerformance?.sets?.[0]?.reps?.toString() || exercise.targetReps?.toString() || "10",
                weightKg: lastPerformance?.sets?.[0]?.weightKg?.toString() || "0",
                restSeconds: "",
                rpe: "",
                notes: "",
              }];

              return {
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                exerciseCategory: exercise.exerciseCategory,
                exerciseInstructions: exercise.exerciseInstructions,
                orderIndex: exercise.orderIndex,
                targetSets: exercise.targetSets,
                targetReps: exercise.targetReps,
                notes: exercise.notes || "",
                sets: initialSets,
                lastPerformance: lastPerformance?.sets || [],
              };
            } catch (error) {
              // If no last performance, just use defaults
              return {
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                exerciseCategory: exercise.exerciseCategory,
                exerciseInstructions: exercise.exerciseInstructions,
                orderIndex: exercise.orderIndex,
                targetSets: exercise.targetSets,
                targetReps: exercise.targetReps,
                notes: exercise.notes || "",
                sets: [{
                  setNumber: 1,
                  reps: exercise.targetReps?.toString() || "10",
                  weightKg: "0",
                  restSeconds: "",
                  rpe: "",
                  notes: "",
                }],
                lastPerformance: [],
              };
            }
          })
        );
        
        setWorkoutExercises(exercisesWithLastPerformance);
      };

      initializeExercises();
    }
  }, [template, clientId]);

  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      // Create workout record
      const workout = await apiRequest("POST", "/api/workouts", {
        clientId,
        workoutTemplateId: templateId,
        notes: workoutNotes,
      });

      // Create workout exercises and sets
      for (const exercise of workoutData.exercises) {
        if (exercise.sets.some((set: Set) => set.reps && (set.weightKg || set.weightKg === "0"))) {
          const workoutExercise = await apiRequest("POST", "/api/workout-exercises", {
            workoutId: workout.id,
            exerciseId: exercise.exerciseId,
            orderIndex: exercise.orderIndex,
            notes: exercise.notes,
          });

          // Create sets (only those with reps filled in)
          for (const set of exercise.sets) {
            if (set.reps && set.reps.trim()) {
              await apiRequest("POST", "/api/sets", {
                workoutExerciseId: workoutExercise.id,
                setNumber: set.setNumber,
                reps: parseInt(set.reps),
                weightKg: parseFloat(set.weightKg) || 0,
                restSeconds: set.restSeconds ? parseInt(set.restSeconds) : null,
                rpe: set.rpe ? parseInt(set.rpe) : null,
                notes: set.notes || null,
              });
            }
          }
        }
      }

      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/workouts`] });
      toast({
        title: "Success",
        description: "Workout completed successfully!",
      });
      navigate(`/clients/${clientId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive",
      });
    },
  });

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    const exercise = updated[exerciseIndex];
    const newSetNumber = exercise.sets.length + 1;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    exercise.sets.push({
      setNumber: newSetNumber,
      reps: lastSet?.reps || exercise.targetReps?.toString() || "10",
      weightKg: lastSet?.weightKg || "0",
      restSeconds: "",
      rpe: "",
      notes: "",
    });
    
    setWorkoutExercises(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (workoutExercises[exerciseIndex].sets.length <= 1) return; // Always keep at least one set
    
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets
      .filter((_, i) => i !== setIndex)
      .map((set, i) => ({ ...set, setNumber: i + 1 }));
    
    setWorkoutExercises(updated);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: string) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setWorkoutExercises(updated);
  };

  const updateExerciseNotes = (exerciseIndex: number, notes: string) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].notes = notes;
    setWorkoutExercises(updated);
  };

  const copyLastSet = (exerciseIndex: number, setIndex: number, lastPerformanceIndex: number) => {
    const exercise = workoutExercises[exerciseIndex];
    if (exercise.lastPerformance?.[lastPerformanceIndex]) {
      const lastSet = exercise.lastPerformance[lastPerformanceIndex];
      updateSet(exerciseIndex, setIndex, 'reps', lastSet.reps.toString());
      updateSet(exerciseIndex, setIndex, 'weightKg', lastSet.weightKg.toString());
    }
  };

  const handleCompleteWorkout = () => {
    setIsCompleting(true);
    completeWorkoutMutation.mutate({
      exercises: workoutExercises,
      notes: workoutNotes,
    });
  };

  if (clientLoading || templateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!client || !template || workoutExercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-text-secondary">Workout data not found</p>
          <Link href={`/clients/${clientId}`}>
            <Button className="mt-4">Back to Client</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentExercise = workoutExercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workoutExercises.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/clients/${clientId}`}>
                <Button variant="ghost" size="sm">
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-text-primary">{template.name}</h1>
                <p className="text-sm text-text-secondary">{client.name}</p>
              </div>
            </div>
            <div className="text-sm text-text-secondary">
              Exercise {currentExerciseIndex + 1} of {workoutExercises.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
            <span>Progress</span>
            <span>{currentExerciseIndex + 1} of {workoutExercises.length} exercises</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentExerciseIndex + 1) / workoutExercises.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentExercise.exerciseName}</CardTitle>
            <p className="text-text-secondary">{currentExercise.exerciseInstructions}</p>
            <div className="text-sm text-text-secondary">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                {currentExercise.exerciseCategory}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Last Performance */}
            {currentExercise.lastPerformance && currentExercise.lastPerformance.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-secondary mb-3">
                  Last Performance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentExercise.lastPerformance.map((set: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-text-secondary">Set {set.setNumber}</p>
                      <p className="font-semibold text-text-primary">
                        {set.reps} reps @ {set.weightKg}kg
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Performance */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-text-primary">Today's Performance</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addSet(currentExerciseIndex)}
                >
                  <i className="fas fa-plus mr-1"></i>Add Set
                </Button>
              </div>

              <div className="space-y-3">
                {currentExercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-text-secondary">Set {set.setNumber}</span>
                      <div className="flex items-center space-x-2">
                        {currentExercise.lastPerformance?.[setIndex] && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyLastSet(currentExerciseIndex, setIndex, setIndex)}
                            className="text-xs text-primary hover:text-primary-dark"
                          >
                            Copy Last
                          </Button>
                        )}
                        {currentExercise.sets.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSet(currentExerciseIndex, setIndex)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-text-secondary">Reps</Label>
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(currentExerciseIndex, setIndex, 'reps', e.target.value)}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-text-secondary">Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={set.weightKg}
                          onChange={(e) => updateSet(currentExerciseIndex, setIndex, 'weightKg', e.target.value)}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-xs text-text-secondary">Rest (seconds)</Label>
                        <Input
                          type="number"
                          value={set.restSeconds}
                          onChange={(e) => updateSet(currentExerciseIndex, setIndex, 'restSeconds', e.target.value)}
                          className="mt-1"
                          placeholder="60"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-text-secondary">RPE (1-10)</Label>
                        <Input
                          type="number"
                          value={set.rpe}
                          onChange={(e) => updateSet(currentExerciseIndex, setIndex, 'rpe', e.target.value)}
                          className="mt-1"
                          placeholder="7"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Notes */}
            <div>
              <Label className="text-sm font-medium text-text-secondary">Exercise Notes</Label>
              <Textarea
                rows={2}
                value={currentExercise.notes}
                onChange={(e) => updateExerciseNotes(currentExerciseIndex, e.target.value)}
                placeholder="How did this exercise feel? Any observations..."
                className="mt-2"
              />
            </div>

            {/* Workout Notes (show on last exercise) */}
            {isLastExercise && (
              <div>
                <Label className="text-sm font-medium text-text-secondary">Workout Notes</Label>
                <Textarea
                  rows={3}
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="Overall workout notes, how did it feel today?"
                  className="mt-2"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button 
                variant="outline"
                onClick={() => navigate(`/clients/${clientId}`)}
                className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
              >
                Save & Exit Later
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
                  disabled={currentExerciseIndex === 0}
                >
                  Previous
                </Button>
                
                {!isLastExercise ? (
                  <Button
                    onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    Next Exercise
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompleteWorkout}
                    disabled={isCompleting || completeWorkoutMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isCompleting ? "Saving..." : "Complete Workout"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
