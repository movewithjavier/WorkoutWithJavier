import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface WorkoutSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  templateId: string;
  clientName: string;
  templateName: string;
}

export default function WorkoutSessionModal({
  isOpen,
  onClose,
  clientId,
  templateId,
  clientName,
  templateName,
}: WorkoutSessionModalProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Mock data for demo
  const exercises = [
    {
      id: "1",
      name: "Dumbbell Chest Press",
      instructions: "Lie on bench, press dumbbells from chest level to full extension",
      lastPerformance: [
        { setNumber: 1, reps: 12, weight: 25 },
        { setNumber: 2, reps: 10, weight: 25 },
        { setNumber: 3, reps: 8, weight: 25 },
      ],
    },
    {
      id: "2",
      name: "Lat Pulldown",
      instructions: "Pull bar down to chest level while seated",
      lastPerformance: [
        { setNumber: 1, reps: 12, weight: 60 },
        { setNumber: 2, reps: 10, weight: 60 },
        { setNumber: 3, reps: 8, weight: 60 },
      ],
    },
  ];

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Complete workout
      onClose();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-text-primary">
            {templateName} - {clientName}
          </DialogTitle>
          <p className="text-text-secondary">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Progress</span>
              <span>{currentExerciseIndex + 1} of {exercises.length} exercises</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Exercise */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-text-primary mb-2">{currentExercise.name}</h3>
              <p className="text-text-secondary">{currentExercise.instructions}</p>
            </div>

            {/* Last Performance */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-text-secondary mb-3">
                Last Performance (Dec 12, 2024)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {currentExercise.lastPerformance.map((set, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-text-secondary">Set {set.setNumber}</p>
                    <p className="font-semibold text-text-primary">{set.reps} reps @ {set.weight}kg</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Performance Input */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Today's Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentExercise.lastPerformance.map((set, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-secondary">Set {set.setNumber}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs text-primary hover:text-primary-dark"
                      >
                        Copy Last
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="block text-xs text-text-secondary mb-1">Reps</Label>
                        <Input
                          type="number"
                          className="text-sm"
                          placeholder={set.reps.toString()}
                        />
                      </div>
                      <div>
                        <Label className="block text-xs text-text-secondary mb-1">Weight (kg)</Label>
                        <Input
                          type="number"
                          className="text-sm"
                          placeholder={set.weight.toString()}
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
                rows={2}
                placeholder="How did this exercise feel? Any observations..."
                className="text-sm"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button 
              variant="outline"
              className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
            >
              Save & Exit
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                className="border-gray-300 hover:bg-gray-50 text-text-primary"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextExercise}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {isLastExercise ? "Complete Workout" : "Next Exercise"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
