import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface Exercise {
  id: string;
  name: string;
  category: string;
  instructions: string;
}

interface TemplateExercise {
  exerciseId: string;
  orderIndex: number;
  targetSets?: number;
  targetReps?: number;
  notes?: string;
}

export default function ClientDetail() {
  const { clientId } = useParams();
  const { toast } = useToast();
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<TemplateExercise[]>([]);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}/templates`],
    enabled: !!clientId,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["/api/exercises"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: { name: string; exercises: TemplateExercise[] }) => {
      const template = await apiRequest("POST", `/api/clients/${clientId}/templates`, {
        name: templateData.name,
      });
      
      // Add exercises to template
      for (const exercise of templateData.exercises) {
        await apiRequest("POST", `/api/templates/${template.id}/exercises`, exercise);
      }
      
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/templates`] });
      setIsCreateTemplateOpen(false);
      setTemplateName("");
      setSelectedExercises([]);
      toast({
        title: "Success",
        description: "Workout template created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to create workout template",
        variant: "destructive",
      });
    },
  });

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;
    
    const newExercise: TemplateExercise = {
      exerciseId: selectedExerciseId,
      orderIndex: selectedExercises.length,
      targetSets: 3,
      targetReps: 10,
    };
    
    setSelectedExercises([...selectedExercises, newExercise]);
    setSelectedExerciseId("");
    setIsAddExerciseOpen(false);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(updated.map((ex, i) => ({ ...ex, orderIndex: i })));
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim() || selectedExercises.length === 0) {
      toast({
        title: "Error",
        description: "Template name and at least one exercise are required",
        variant: "destructive",
      });
      return;
    }
    
    createTemplateMutation.mutate({
      name: templateName,
      exercises: selectedExercises,
    });
  };

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-text-secondary">Client not found</p>
          <Link href="/clients">
            <Button className="mt-4">Back to Clients</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/clients">
                <Button variant="ghost" size="sm">
                  <i className="fas fa-arrow-left mr-2"></i>Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">{client.name}</h1>
                  <p className="text-sm text-text-secondary">Client Workouts</p>
                </div>
              </div>
            </div>
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <i className="fas fa-plus mr-2"></i>Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Workout Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Upper Body A, Full Body Workout"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Exercises ({selectedExercises.length})</Label>
                      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <i className="fas fa-plus mr-1"></i>Add Exercise
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Exercise</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Exercise</Label>
                              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an exercise" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exercises
                                    .filter((ex: Exercise) => !selectedExercises.some(sel => sel.exerciseId === ex.id))
                                    .map((exercise: Exercise) => (
                                    <SelectItem key={exercise.id} value={exercise.id}>
                                      {exercise.name} ({exercise.category})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAddExerciseOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddExercise} disabled={!selectedExerciseId}>
                                Add Exercise
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {selectedExercises.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        <i className="fas fa-dumbbell text-gray-400 text-2xl mb-2"></i>
                        <p className="text-text-secondary">No exercises added yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedExercises.map((templateEx, index) => {
                          const exercise = exercises.find((ex: Exercise) => ex.id === templateEx.exerciseId);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">{exercise?.name}</p>
                                <p className="text-sm text-text-secondary">
                                  Target: {templateEx.targetSets} sets × {templateEx.targetReps} reps
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeExercise(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateTemplate} 
                      disabled={createTemplateMutation.isPending || !templateName.trim() || selectedExercises.length === 0}
                    >
                      {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Workout Templates</h2>
          <p className="text-text-secondary">Manage {client.name}'s default workout routines</p>
        </div>

        {templatesLoading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <i className="fas fa-dumbbell text-gray-300 text-6xl mb-6"></i>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No workout templates yet</h3>
                <p className="text-text-secondary mb-6">
                  Create a workout template for {client.name} to get started
                </p>
                <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white">
                      <i className="fas fa-plus mr-2"></i>Create First Template
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="text-sm text-text-secondary">
                      {template.isActive ? (
                        <i className="fas fa-check-circle text-green-500"></i>
                      ) : (
                        <i className="fas fa-pause-circle text-gray-400"></i>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-text-secondary">
                      <i className="fas fa-list mr-2"></i>
                      View exercises and details
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/workout-session/${clientId}/${template.id}`}>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary-dark text-white"
                      >
                        <i className="fas fa-play mr-2"></i>
                        Start Workout
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="fas fa-share-alt"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}