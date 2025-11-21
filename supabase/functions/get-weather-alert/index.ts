import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherAlert {
  temperature: number;
  humidity: number;
  condition: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  alerts: string[];
  recommendations: string[];
  pestTypes: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY is not configured');
    }

    if (!latitude || !longitude) {
      throw new Error('Location coordinates are required');
    }

    console.log(`Fetching weather for lat: ${latitude}, lon: ${longitude}`);

    // Fetch current weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('OpenWeather API error:', weatherResponse.status, errorText);
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    
    console.log('Weather data received:', {
      temp: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      condition: weatherData.weather[0].main
    });

    // Analyze pest risk based on weather conditions
    const alert = analyzePestRisk(weatherData);

    return new Response(
      JSON.stringify({ 
        alert,
        location: weatherData.name,
        country: weatherData.sys.country
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in get-weather-alert function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch weather alert' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzePestRisk(weatherData: any): WeatherAlert {
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const condition = weatherData.weather[0].main;
  const windSpeed = weatherData.wind?.speed || 0;

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  const alerts: string[] = [];
  const recommendations: string[] = [];
  const pestTypes: string[] = [];

  // Temperature-based risks
  if (temp >= 25 && temp <= 32) {
    // Optimal temperature for many pests
    if (humidity >= 60) {
      riskLevel = 'High';
      alerts.push('High temperature and humidity create ideal conditions for pest breeding');
      pestTypes.push('Aphids', 'Whiteflies', 'Spider Mites');
      recommendations.push('Increase monitoring frequency to 2-3 times daily');
      recommendations.push('Consider preventive neem oil application');
    } else {
      riskLevel = 'Medium';
      alerts.push('Warm temperatures may increase pest activity');
      pestTypes.push('Grasshoppers', 'Beetles');
    }
  } else if (temp > 32) {
    riskLevel = 'Medium';
    alerts.push('High temperatures may stress plants, making them vulnerable');
    pestTypes.push('Spider Mites', 'Thrips');
    recommendations.push('Ensure adequate irrigation to reduce plant stress');
  } else if (temp < 15) {
    riskLevel = 'Low';
    alerts.push('Cool temperatures reduce pest activity');
    recommendations.push('Good time for preventive field sanitation');
  }

  // Humidity-based risks
  if (humidity >= 80) {
    if (riskLevel === 'Low') riskLevel = 'Medium';
    else if (riskLevel === 'Medium') riskLevel = 'High';
    else if (riskLevel === 'High') riskLevel = 'Critical';
    
    alerts.push('Very high humidity increases fungal disease and pest risk');
    pestTypes.push('Leaf Miners', 'Caterpillars', 'Snails');
    recommendations.push('Improve air circulation by proper spacing');
    recommendations.push('Avoid overhead irrigation');
    recommendations.push('Apply fungicides as preventive measure');
  } else if (humidity >= 60 && humidity < 80) {
    if (riskLevel === 'Low') riskLevel = 'Medium';
    alerts.push('Moderate humidity levels favor pest reproduction');
    recommendations.push('Monitor for early signs of infestation');
  }

  // Weather condition-based risks
  if (condition === 'Rain' || condition === 'Drizzle') {
    if (humidity >= 70) {
      riskLevel = 'High';
      alerts.push('Rain combined with high humidity significantly increases disease and pest risk');
      pestTypes.push('Slugs', 'Snails', 'Fungal infections');
      recommendations.push('Inspect leaves for signs of fungal infection');
      recommendations.push('Remove standing water around crops');
      recommendations.push('Apply appropriate fungicides after rain stops');
    }
  } else if (condition === 'Clear' && temp > 28) {
    alerts.push('Hot sunny conditions may increase certain pest populations');
    recommendations.push('Check for heat-stressed plants which attract pests');
  }

  // Wind-based considerations
  if (windSpeed > 5) {
    alerts.push('Moderate winds may spread airborne pests and diseases');
    recommendations.push('Check for wind-damaged plants that attract pests');
  }

  // Default recommendations if risk exists
  if (riskLevel !== 'Low') {
    if (!recommendations.includes('Monitor for early signs of infestation')) {
      recommendations.push('Conduct regular field inspections');
    }
    recommendations.push('Keep field records of pest sightings');
    recommendations.push('Maintain proper plant nutrition for natural resistance');
  } else {
    recommendations.push('Continue regular monitoring schedule');
    recommendations.push('Maintain good field hygiene practices');
  }

  return {
    temperature: Math.round(temp * 10) / 10,
    humidity,
    condition,
    riskLevel,
    alerts: alerts.length > 0 ? alerts : ['Weather conditions are currently favorable for crops'],
    recommendations,
    pestTypes: [...new Set(pestTypes)] // Remove duplicates
  };
}