import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import WorkoutSession from "@/pages/workout-session";
import ClientWorkout from "@/pages/client-workout";

function Router() {
  return (
    <Switch>
      {/* Public client workout route */}
      <Route path="/workout/:token" component={ClientWorkout} />
      
      {/* Main app routes (no auth required) */}
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/workout-session/:clientId/:templateId" component={WorkoutSession} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
