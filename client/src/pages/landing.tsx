import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <i className="fas fa-dumbbell text-primary text-4xl"></i>
              <h1 className="text-3xl font-bold text-text-primary">WorkoutsWithJavier</h1>
            </div>
            <p className="text-text-secondary mb-8">
              Professional workout tracking for personal trainers and their clients
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3"
            >
              Sign In to Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
