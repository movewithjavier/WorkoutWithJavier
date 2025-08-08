import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import WorkoutSessionModal from "@/components/workout-session-modal";

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState<{clientId: string, templateId: string, clientName: string, templateName: string} | null>(null);

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", clients],
    queryFn: async () => {
      // Calculate stats from clients
      const activeClients = Array.isArray(clients) ? clients.length : 0;
      const weeklyWorkouts = Array.isArray(clients) ? clients.reduce((sum: number, client: any) => {
        if (client.lastWorkout && client.lastWorkout.daysAgo <= 7) {
          return sum + 1;
        }
        return sum;
      }, 0) : 0;
      
      return {
        activeClients,
        weeklyWorkouts,
        templates: 42, // placeholder
        sharedLinks: 7, // placeholder
      };
    },
  });

  if (clientsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleStartWorkout = (client: any) => {
    // For demo, we'll use the first template for the client
    // In real implementation, we'd show a template selector
    setSelectedWorkout({
      clientId: client.id,
      templateId: "demo-template-id",
      clientName: client.name,
      templateName: "Upper Body A"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-dumbbell text-primary text-2xl"></i>
                <h1 className="text-xl font-bold text-text-primary">WorkoutsWithJavier</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/clients">
                <Button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
                  <i className="fas fa-plus mr-2"></i>New Workout
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <span className="font-medium">{user?.firstName || "Javier"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Dashboard</h2>
          <p className="text-text-secondary">Manage your clients and workout sessions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-users text-primary text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Active Clients</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.activeClients || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-calendar-check text-secondary text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">This Week</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.weeklyWorkouts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-chart-line text-warning text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Templates</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.templates || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-share-alt text-primary text-2xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Shared Links</p>
                  <p className="text-2xl font-bold text-text-primary">{stats?.sharedLinks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">Recent Clients</h3>
                  <Link href="/clients">
                    <Button variant="ghost" className="text-primary hover:text-primary-dark font-medium">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {Array.isArray(clients) && clients.slice(0, 5).map((client: any, index: number) => (
                  <div key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-secondary' : 'bg-warning'
                        }`}>
                          <i className="fas fa-user text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{client.name}</p>
                          <p className="text-sm text-text-secondary">
                            Last workout: {client.lastWorkout ? `${client.lastWorkout.daysAgo} days ago` : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary-dark text-white"
                          onClick={() => handleStartWorkout(client)}
                        >
                          Start Workout
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <i className="fas fa-share-alt"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!Array.isArray(clients) || clients.length === 0) && (
                  <div className="px-6 py-12 text-center">
                    <i className="fas fa-users text-gray-300 text-4xl mb-4"></i>
                    <p className="text-text-secondary mb-4">No clients yet</p>
                    <Link href="/clients">
                      <Button className="bg-primary hover:bg-primary-dark text-white">
                        Add Your First Client
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/clients">
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-left flex items-center">
                      <i className="fas fa-user-plus mr-3"></i>Add New Client
                    </Button>
                  </Link>
                  <Button className="w-full bg-secondary hover:bg-secondary-dark text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-left flex items-center">
                    <i className="fas fa-plus mr-3"></i>Create Template
                  </Button>
                  <Button variant="outline" className="w-full border border-gray-300 hover:bg-gray-50 text-text-primary px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-left flex items-center">
                    <i className="fas fa-chart-bar mr-3"></i>View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">New client added</p>
                      <p className="text-xs text-text-secondary">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">Workout completed</p>
                      <p className="text-xs text-text-secondary">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">Template updated</p>
                      <p className="text-xs text-text-secondary">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Workout Session Modal */}
      {selectedWorkout && (
        <WorkoutSessionModal
          isOpen={!!selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          clientId={selectedWorkout.clientId}
          templateId={selectedWorkout.templateId}
          clientName={selectedWorkout.clientName}
          templateName={selectedWorkout.templateName}
        />
      )}
    </div>
  );
}
