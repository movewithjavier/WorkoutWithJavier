import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

export default function Clients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
    enabled: !!user,
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      await apiRequest("POST", "/api/clients", clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddClientOpen(false);
      setNewClient({ name: "", email: "", phone: "", notes: "" });
      toast({
        title: "Success",
        description: "Client added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    },
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }
    addClientMutation.mutate(newClient);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Loading clients...</p>
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
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <i className="fas fa-dumbbell text-primary text-2xl"></i>
                  <h1 className="text-xl font-bold text-text-primary">WorkoutsWithJavier</h1>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
                    <i className="fas fa-plus mr-2"></i>Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newClient.name}
                        onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter client name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newClient.notes}
                        onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional notes about the client"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddClientOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark text-white"
                        disabled={addClientMutation.isPending}
                      >
                        {addClientMutation.isPending ? "Adding..." : "Add Client"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <span className="font-medium">{user?.firstName || "Trainer"}</span>
                <Button 
                  variant="ghost"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Clients</h2>
          <p className="text-text-secondary">Manage your client list and their workout programs</p>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <i className="fas fa-users text-gray-300 text-6xl mb-6"></i>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No clients yet</h3>
                <p className="text-text-secondary mb-6">
                  Start by adding your first client to begin tracking their workouts
                </p>
                <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white">
                      <i className="fas fa-plus mr-2"></i>Add Your First Client
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client: any, index: number) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-warning'
                    }`}>
                      <i className="fas fa-user text-white text-lg"></i>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <p className="text-sm text-text-secondary">
                        {client.lastWorkout 
                          ? `Last workout: ${client.lastWorkout.daysAgo} days ago`
                          : 'No workouts yet'
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {client.email && (
                      <p className="text-sm text-text-secondary">
                        <i className="fas fa-envelope mr-2"></i>
                        {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-sm text-text-secondary">
                        <i className="fas fa-phone mr-2"></i>
                        {client.phone}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary-dark text-white"
                    >
                      <i className="fas fa-play mr-2"></i>
                      Start Workout
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="fas fa-share-alt"></i>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="fas fa-cog"></i>
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
