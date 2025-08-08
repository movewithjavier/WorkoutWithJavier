import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Link } from "wouter";

export default function WorkoutSession() {
  const { clientId, templateId } = useParams();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseData, setExerciseData] = useState<any>({});

  const { data: template, isLoading } = useQuery({
    queryKey: ["/api/templates", templateId],
    enabled: !!templateId,
  });

  const { data: client } = useQuery({
    queryKey: ["/api/clients", clientId],
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Loading workout session...</p>
        </div>
      </div>
    );
  }

  if (!template || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-warning text-4xl mb-4"></i>
              <p className="text-text-secondary">Workout session not found</p>
              <Link href="/">
                <Button className="mt-4">Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExercise = template?.exercises?.[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === (template?.exercises?.length || 0) - 1;

  const handleNextExercise = () => {
    if (template?.exercises && currentExerciseIndex < template.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-text-primary">{template?.name || 'Workout'} - {client?.name || 'Client'}</h1>
              <p className="text-sm text-text-secondary">
                Exercise {currentExerciseIndex + 1} of {template?.exercises?.length || 0}
              </p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
            <span>Progress</span>
            <span>{currentExerciseIndex + 1} of {template?.exercises?.length || 0} exercises</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentExerciseIndex + 1) / (template?.exercises?.length || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Exercise */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">{currentExercise?.exerciseName || 'Exercise'}</h3>
              <p className="text-text-secondary">{currentExercise?.exerciseInstructions || 'No instructions available'}</p>
            </div>

            {/* Last Performance */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-text-secondary mb-3">Last Performance</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary">Set 1</p>
                  <p className="font-semibold text-text-primary">12 × 25kg</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary">Set 2</p>
                  <p className="font-semibold text-text-primary">10 × 25kg</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-secondary">Set 3</p>
                  <p className="font-semibold text-text-primary">8 × 25kg</p>
                </div>
              </div>
            </div>

            {/* Current Performance Input */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Today's Performance</h4>
              <div className="space-y-4">
                {[1, 2, 3].map((setNumber) => (
                  <div key={setNumber} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-text-primary">Set {setNumber}</span>
                      <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary-dark">
                        Use Previous
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-text-secondary mb-1">Reps</Label>
                        <Input
                          type="number"
                          placeholder="12"
                          className="focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-text-secondary mb-1">Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="25"
                          className="focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Notes */}
            <div className="mt-6">
              <Label className="text-sm font-medium text-text-secondary mb-2">Notes (optional)</Label>
              <Textarea
                className="focus:ring-primary focus:border-primary"
                rows={2}
                placeholder="How did this exercise feel? Any observations..."
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
          
          <div className="flex space-x-3">
            <Button variant="outline" className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500">
              Save & Exit
            </Button>
            
            {isLastExercise ? (
              <Button className="bg-secondary hover:bg-secondary-dark text-white">
                Complete Workout<i className="fas fa-check ml-2"></i>
              </Button>
            ) : (
              <Button 
                onClick={handleNextExercise}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                Next Exercise<i className="fas fa-arrow-right ml-2"></i>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
