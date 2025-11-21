import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Leaf, AlertTriangle, CheckCircle2, Cloud, Droplets, Thermometer, Wind, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PestAnalysis {
  detected: boolean;
  pestType: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  recommendations: string[];
  preventiveMeasures: string[];
}

interface WeatherAlert {
  temperature: number;
  humidity: number;
  condition: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  alerts: string[];
  recommendations: string[];
  pestTypes: string[];
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PestAnalysis | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [location, setLocation] = useState<string>("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Fetch weather alert on component mount
    fetchWeatherAlert();
  }, []);

  useEffect(() => {
    // Cleanup camera stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error: any) {
      console.error('Camera access error:', error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        setAnalysis(null);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const fetchWeatherAlert = async () => {
    setIsLoadingWeather(true);
    try {
      // Get user's location
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const { data, error } = await supabase.functions.invoke('get-weather-alert', {
            body: { latitude, longitude }
          });

          if (error) throw error;

          if (data?.alert) {
            setWeatherAlert(data.alert);
            setLocation(data.location ? `${data.location}, ${data.country}` : 'Your Location');
            
            // Show toast for high risk conditions
            if (data.alert.riskLevel === 'High' || data.alert.riskLevel === 'Critical') {
              toast.warning(`${data.alert.riskLevel} pest risk in your area!`, {
                description: data.alert.alerts[0]
              });
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error("Unable to get your location. Please enable location services.");
        }
      );
    } catch (error: any) {
      console.error('Weather alert error:', error);
      toast.error("Failed to fetch weather alert");
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePest = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-pest', {
        body: { image: selectedImage }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast.success("Analysis complete!");
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical':
      case 'High':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'Medium':
        return <AlertTriangle className="h-5 w-5 text-secondary" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-accent" />;
    }
  };

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
        {weatherAlert && (
          <Card className={`mb-8 border-2 ${
            weatherAlert.riskLevel === 'Critical' ? 'border-destructive/50 bg-destructive/5' :
            weatherAlert.riskLevel === 'High' ? 'border-destructive/30 bg-destructive/5' :
            weatherAlert.riskLevel === 'Medium' ? 'border-secondary/50 bg-secondary/5' :
            'border-accent/50 bg-accent/5'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getRiskIcon(weatherAlert.riskLevel)}
                  Weather-Based Pest Alert
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchWeatherAlert}
                  disabled={isLoadingWeather}
                >
                  Refresh
                </Button>
              </div>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {location || 'Loading location...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weather Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Temperature</div>
                    <div className="font-semibold">{weatherAlert.temperature}°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                  <Droplets className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Humidity</div>
                    <div className="font-semibold">{weatherAlert.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                  <Cloud className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Condition</div>
                    <div className="font-semibold">{weatherAlert.condition}</div>
                  </div>
                </div>
              </div>

              {/* Risk Level */}
              <Alert className="border-current">
                <AlertDescription className="flex items-center justify-between">
                  <span className="font-semibold">Risk Level:</span>
                  <Badge variant={getSeverityColor(weatherAlert.riskLevel)} className="text-sm">
                    {weatherAlert.riskLevel}
                  </Badge>
                </AlertDescription>
              </Alert>

              {/* Alerts */}
              {weatherAlert.alerts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Current Alerts
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {weatherAlert.alerts.map((alert, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-destructive mt-1">⚠</span>
                        <span>{alert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* At-Risk Pests */}
              {weatherAlert.pestTypes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Pests to Watch For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {weatherAlert.pestTypes.map((pest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {pest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {weatherAlert.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {weatherAlert.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-accent mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Capture or Upload
              </CardTitle>
              <CardDescription>
                Take a photo or upload an existing image of affected crops
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedImage ? (
                <div className="space-y-3">
                  <Button
                    onClick={openCamera}
                    className="w-full h-24 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    size="lg"
                  >
                    <Camera className="mr-2 h-6 w-6" />
                    Take Photo
                  </Button>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-24 border-2"
                    size="lg"
                  >
                    <Upload className="mr-2 h-6 w-6" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border-2 border-border">
                    <img
                      src={selectedImage}
                      alt="Selected crop"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={analyzePest}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-primary to-accent"
                    >
                      {isAnalyzing ? "Analyzing..." : "Analyze Crop"}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setAnalysis(null);
                      }}
                      variant="outline"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analysis?.detected ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                )}
                Analysis Results
              </CardTitle>
              <CardDescription>
                AI-powered pest and disease detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Leaf className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Upload and analyze an image to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detection Status */}
                  <Alert className={analysis.detected ? "border-destructive/50 bg-destructive/5" : "border-accent/50 bg-accent/5"}>
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{analysis.pestType}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Confidence: {analysis.confidence}%
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(analysis.severity)}>
                        {analysis.severity}
                      </Badge>
                    </AlertDescription>
                  </Alert>

                  {/* Symptoms */}
                  {analysis.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Observed Symptoms
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {analysis.symptoms.map((symptom, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-accent mt-1">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preventive Measures */}
                  {analysis.preventiveMeasures.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        Prevention Tips
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {analysis.preventiveMeasures.map((measure, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span>{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-16 px-8"
              >
                <Camera className="mr-2 h-6 w-6" />
                Capture
              </Button>
              <Button
                onClick={closeCamera}
                size="lg"
                variant="outline"
                className="h-16 px-8 bg-background/80 backdrop-blur-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;