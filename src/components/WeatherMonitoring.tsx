import { useEffect, useState } from "react";
import { Cloud, Droplets, Thermometer, Wind, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WeatherAlert {
  temperature: number;
  humidity: number;
  condition: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  alerts: string[];
  recommendations: string[];
  pestTypes: string[];
  windSpeed?: number;
  pressure?: number;
}

const OPENWEATHER_API_KEY = '2c0fee88dd8f9bf8d1c9907bb979a3dd';

export const WeatherMonitoring = () => {
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [location, setLocation] = useState<string>("");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    // Auto-fetch on mount with a small delay
    const timer = setTimeout(() => {
      fetchWeatherAlert();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const analyzePestRisk = (temp: number, humidity: number, condition: string) => {
    const alerts: string[] = [];
    const recommendations: string[] = [];
    const pestTypes: string[] = [];
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';

    // High humidity risk (>70%)
    if (humidity > 70) {
      alerts.push("High humidity levels detected - favorable for fungal diseases");
      pestTypes.push("Powdery Mildew", "Late Blight", "Downy Mildew");
      recommendations.push("Apply fungicide preventively");
      recommendations.push("Improve air circulation around plants");
      riskLevel = humidity > 85 ? 'Critical' : 'High';
    }

    // Temperature-based risks
    if (temp > 30) {
      alerts.push("High temperature may stress plants and attract pests");
      pestTypes.push("Aphids", "Whiteflies", "Spider Mites");
      recommendations.push("Monitor for heat-loving pests");
      recommendations.push("Ensure adequate irrigation");
      if (riskLevel === 'Low') riskLevel = 'Medium';
    } else if (temp > 25 && humidity > 60) {
      alerts.push("Warm and humid conditions ideal for pest breeding");
      pestTypes.push("Thrips", "Leaf Miners", "Fruit Flies");
      recommendations.push("Inspect crops regularly");
      recommendations.push("Consider organic pest control methods");
      riskLevel = riskLevel === 'Critical' ? 'Critical' : 'High';
    }

    // Rain-related risks
    if (condition.toLowerCase().includes('rain')) {
      alerts.push("Wet conditions increase disease spread risk");
      pestTypes.push("Bacterial Wilt", "Root Rot", "Stem Borers");
      recommendations.push("Avoid overhead irrigation");
      recommendations.push("Ensure proper drainage");
      if (riskLevel !== 'Critical') riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
    }

    // Cloudy/overcast conditions
    if (condition.toLowerCase().includes('cloud') && humidity > 65) {
      alerts.push("Overcast conditions with high humidity - monitor closely");
      pestTypes.push("Fungus Gnats", "Slugs", "Snails");
      recommendations.push("Check underside of leaves for pests");
      if (riskLevel === 'Low') riskLevel = 'Medium';
    }

    // Low risk conditions
    if (temp >= 15 && temp <= 25 && humidity < 60) {
      alerts.push("Current conditions are favorable for crop health");
      recommendations.push("Maintain regular monitoring schedule");
      recommendations.push("Continue with preventive measures");
      riskLevel = 'Low';
    }

    return {
      riskLevel,
      alerts: alerts.length > 0 ? alerts : ["No significant pest risks detected"],
      recommendations: recommendations.length > 0 ? recommendations : ["Continue regular crop monitoring"],
      pestTypes: [...new Set(pestTypes)], // Remove duplicates
    };
  };

  const fetchWeatherAlert = async () => {
    setIsLoadingWeather(true);
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        setIsLoadingWeather(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            console.log('Fetching weather for:', latitude, longitude);

            // Fetch weather data from OpenWeather API
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`;
            console.log('API URL:', url.replace(OPENWEATHER_API_KEY, 'API_KEY_HIDDEN'));
            
            const response = await fetch(url);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
              console.error('Weather API error:', errorData);
              throw new Error(errorData.message || `Failed to fetch weather data (Status: ${response.status})`);
            }

            const data = await response.json();
            console.log('Weather data received:', data);

            // Extract weather information
            const temperature = Math.round(data.main.temp);
            const humidity = data.main.humidity;
            const condition = data.weather[0].main;
            const windSpeed = data.wind.speed;
            const pressure = data.main.pressure;
            const locationName = data.name;
            const country = data.sys.country;

            // Analyze pest risk based on weather conditions
            const riskAnalysis = analyzePestRisk(temperature, humidity, condition);

            const alert: WeatherAlert = {
              temperature,
              humidity,
              condition,
              windSpeed,
              pressure,
              ...riskAnalysis,
            };

            setWeatherAlert(alert);
            setLocation(`${locationName}, ${country}`);

            // Show toast for high risk conditions
            if (alert.riskLevel === 'High' || alert.riskLevel === 'Critical') {
              toast.warning(`${alert.riskLevel} pest risk in your area!`, {
                description: alert.alerts[0],
              });
            }
          } catch (error: any) {
            console.error('Weather fetch error:', error);
            
            // If API key is invalid, show helpful message with fallback data
            if (error.message?.includes('Invalid API key') || error.message?.includes('401')) {
              toast.error("Weather API key needs activation. Using demo data.", {
                description: "Get your API key at openweathermap.org"
              });
              
              // Use demo weather data as fallback
              const demoAlert: WeatherAlert = {
                temperature: 28,
                humidity: 75,
                condition: 'Clouds',
                windSpeed: 3.5,
                pressure: 1013,
                riskLevel: 'High',
                alerts: ['High humidity levels detected - favorable for fungal diseases', 'Warm and humid conditions ideal for pest breeding'],
                recommendations: ['Apply fungicide preventively', 'Improve air circulation around plants', 'Inspect crops regularly'],
                pestTypes: ['Powdery Mildew', 'Late Blight', 'Thrips', 'Leaf Miners'],
              };
              
              setWeatherAlert(demoAlert);
              setLocation('Demo Location (API key pending activation)');
            } else {
              toast.error(error.message || "Failed to fetch weather data");
            }
          } finally {
            setIsLoadingWeather(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = "Unable to get your location. ";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please enable location permissions in your browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "The request to get location timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
          }
          
          toast.error(errorMessage);
          setIsLoadingWeather(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error: any) {
      console.error('Weather alert error:', error);
      toast.error("Failed to fetch weather alert");
      setIsLoadingWeather(false);
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

  if (!weatherAlert) {
    return (
      <Card className="mb-8 border-2">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            {isLoadingWeather ? (
              <>
                <Cloud className="h-16 w-16 mx-auto mb-4 opacity-20 animate-pulse" />
                <p className="mb-4">Loading weather data...</p>
                <p className="text-xs">Requesting location access...</p>
              </>
            ) : (
              <>
                <Cloud className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="mb-4">Enable location to view weather alerts</p>
                <Button 
                  onClick={fetchWeatherAlert}
                  variant="outline"
                  className="mt-2"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Enable Location
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            {isLoadingWeather ? "Loading..." : "Refresh"}
          </Button>
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" />
          {location || 'Loading location...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weather Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          {weatherAlert.windSpeed && (
            <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
              <Wind className="h-4 w-4 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Wind Speed</div>
                <div className="font-semibold">{weatherAlert.windSpeed} m/s</div>
              </div>
            </div>
          )}
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
  );
};
