import { Leaf, AlertTriangle, Cloud, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PestDetection } from "@/components/PestDetection";
import { WeatherMonitoring } from "@/components/WeatherMonitoring";
import { Chatbot } from "@/components/Chatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CropGuard AI</h1>
              <p className="text-sm text-muted-foreground">Smart Pest Detection System</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-leaf bg-clip-text text-transparent">
            Protect Your Crops with AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time weather alerts and AI-powered pest detection
          </p>
        </div>

        {/* Weather Alert Section */}
        <WeatherMonitoring />

        {/* Pest Detection Section */}
        <PestDetection />

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Weather Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time weather analysis to predict pest outbreak conditions and provide early warnings
              </p>
            </CardContent>
          </Card>
          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                AI Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced image analysis to identify pests and diseases from visual symptoms
              </p>
            </CardContent>
          </Card>
          <Card className="border-leaf/20 hover:border-leaf/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Smart Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Location-based risk alerts help you take preventive action before pests damage crops
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Index;