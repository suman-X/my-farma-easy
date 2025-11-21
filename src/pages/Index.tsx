import { Leaf, AlertTriangle, Cloud, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PestDetection } from "@/components/PestDetection";
import { WeatherMonitoring } from "@/components/WeatherMonitoring";
import { Chatbot } from "@/components/Chatbot";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t.appName}</h1>
                <p className="text-sm text-muted-foreground">{t.appTagline}</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-leaf bg-clip-text text-transparent">
            {t.heroTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.heroSubtitle}
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
                {t.weatherMonitoring}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.weatherMonitoringDesc}
              </p>
            </CardContent>
          </Card>
          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t.aiDetection}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.aiDetectionDesc}
              </p>
            </CardContent>
          </Card>
          <Card className="border-leaf/20 hover:border-leaf/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t.smartAlerts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t.smartAlertsDesc}
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