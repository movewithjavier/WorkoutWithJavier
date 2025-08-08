import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function ClientWorkout() {
  const { token } = useParams();
  const { toast } = useToast();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseData, setExerciseData] = useState<any>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: workoutData, isLoading, error } = useQuery({
    queryKey: ["/api/workout", token],
    retry: false,
  });

  const submitWorkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", `/api/workout/${token}/submit`, data);
    },
    onSuccess: () => {
      setIsCompleted(true);
      toast({
        title: "Success",
        description: "Workout submitted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit workout",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-warning text-4xl mb-4"></i>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Workout Not Available</h3>
              <p className="text-text-secondary mb-4">
                This workout link may have expired or been used already.
              </p>
              <p className="text-sm text-text-secondary">
                Please contact your trainer for a new workout link.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Workout Complete!</h3>
              <p className="text-text-secondary mb-6">
                Great job, {workoutData.client.name}! Your workout has been saved and your trainer will see your progress.
              </p>
              <Button className="bg-primary hover:bg-primary-dark text-white">
                View Your Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workoutData) return null;

  const currentExercise = workoutData.template.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workoutData.template.exercises.length - 1;

  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutData.template.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Complete workout
      handleSubmitWorkout();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleSubmitWorkout = () => {
    const exercises = workoutData.template.exercises.map((exercise: any, index: number) => ({
      exerciseId: exercise.exerciseId,
      sets: exerciseData[index]?.sets || [],
      notes: exerciseData[index]?.notes || "",
    }));

    submitWorkoutMutation.mutate({
      exercises,
      notes: "",
    });
  };

  const updateExerciseData = (exerciseIndex: number, field: string, value: any) => {
    setExerciseData((prev: any) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        [field]: value,
      },
    }));
  };

  const updateSetData = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    setExerciseData((prev: any) => {
      const exerciseData = prev[exerciseIndex] || { sets: [] };
      const sets = [...exerciseData.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        setNumber: setIndex + 1,
        [field]: value,
      };
      
      return {
        ...prev,
        [exerciseIndex]: {
          ...exerciseData,
          sets,
        },
      };
    });
  };

  const usePreviousWeight = (setIndex: number) => {
    if (currentExercise.lastPerformance[setIndex]) {
      const lastSet = currentExercise.lastPerformance[setIndex];
      updateSetData(currentExerciseIndex, setIndex, "reps", lastSet.reps);
      updateSetData(currentExerciseIndex, setIndex, "weightKg", lastSet.weightKg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <i className="fas fa-dumbbell text-primary text-3xl"></i>
            <h1 className="text-2xl font-bold text-text-primary">WorkoutsWithJavier</h1>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">{workoutData.template.name}</h2>
          <p className="text-text-secondary">
            Hi <span className="font-medium">{workoutData.client.name}</span>! Complete your workout below.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
            <span>Progress</span>
            <span>{currentExerciseIndex + 1} of {workoutData.template.exercises.length} exercises</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentExerciseIndex + 1) / workoutData.template.exercises.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Exercise */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">{currentExercise.exerciseName}</h3>
              <p className="text-text-secondary">{currentExercise.exerciseInstructions}</p>
            </div>

            {/* Last Performance Display */}
            {currentExercise.lastPerformance.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text-secondary mb-3">Your Last Performance</h4>
                <div className="grid grid-cols-3 gap-3">
                  {currentExercise.lastPerformance.slice(0, 3).map((set: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-text-secondary">Set {index + 1}</p>
                      <p className="font-semibold text-text-primary">{set.reps} × {set.weightKg}kg</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Performance Input */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Today's Performance</h4>
              <div className="space-y-4">
                {[0, 1, 2].map((setIndex) => (
                  <div key={setIndex} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-text-primary">Set {setIndex + 1}</span>
                      {currentExercise.lastPerformance[setIndex] && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => usePreviousWeight(setIndex)}
                          className="text-sm text-primary hover:text-primary-dark"
                        >
                          Use Previous
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-text-secondary mb-1">Reps</Label>
                        <Input
                          type="number"
                          placeholder={currentExercise.lastPerformance[setIndex]?.reps || "12"}
                          value={exerciseData[currentExerciseIndex]?.sets?.[setIndex]?.reps || ""}
                          onChange={(e) => updateSetData(currentExerciseIndex, setIndex, "reps", e.target.value)}
                          className="focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-text-secondary mb-1">Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder={currentExercise.lastPerformance[setIndex]?.weightKg || "25"}
                          value={exerciseData[currentExerciseIndex]?.sets?.[setIndex]?.weightKg || ""}
                          onChange={(e) => updateSetData(currentExerciseIndex, setIndex, "weightKg", e.target.value)}
                          className="focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Notes */}
            <div className="mt-6">
              <Label className="block text-sm font-medium text-text-secondary mb-2">Notes (optional)</Label>
              <Textarea
                className="focus:ring-2 focus:ring-primary focus:border-primary"
                rows={2}
                placeholder="How did this exercise feel? Any observations..."
                value={exerciseData[currentExerciseIndex]?.notes || ""}
                onChange={(e) => updateExerciseData(currentExerciseIndex, "notes", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="border-gray-300 hover:bg-gray-50 text-text-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i>Previous
          </Button>
          
          <Button
            onClick={handleNextExercise}
            disabled={submitWorkoutMutation.isPending}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {submitWorkoutMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>Submitting...
              </>
            ) : isLastExercise ? (
              <>Complete Workout<i className="fas fa-check ml-2"></i></>
            ) : (
              <>Next Exercise<i className="fas fa-arrow-right ml-2"></i></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
