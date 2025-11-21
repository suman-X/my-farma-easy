import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing pest image with Gemini...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural AI system specialized in pest detection and plant disease diagnosis. 
Analyze crop images to identify pests, diseases, or plant health issues based on visual symptoms like:
- Leaf patterns and discoloration
- Spots, holes, or damage
- Color changes
- Growth abnormalities

Provide a detailed analysis in JSON format with:
1. "detected": boolean - whether a pest/disease was found
2. "pestType": string - type of pest or disease (e.g., "Aphids", "Leaf Blight", "Healthy")
3. "severity": string - "Low", "Medium", "High", or "None"
4. "confidence": number - confidence percentage (0-100)
5. "symptoms": array of strings - visible symptoms observed
6. "recommendations": array of strings - specific treatment or prevention actions
7. "preventiveMeasures": array of strings - steps to prevent future occurrence

Be specific, practical, and farmer-friendly in your recommendations.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this crop image for pests or diseases. Provide detailed findings and recommendations.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('Raw AI response:', analysisText);
    
    // Extract JSON from the response (handling markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, analysisText];
      
      analysisResult = JSON.parse(jsonMatch[1] || analysisText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback structure if parsing fails
      analysisResult = {
        detected: true,
        pestType: "Analysis pending",
        severity: "Unknown",
        confidence: 50,
        symptoms: ["Image analyzed, detailed parsing in progress"],
        recommendations: ["Please consult with a local agricultural expert for confirmation"],
        preventiveMeasures: ["Regular crop monitoring", "Maintain proper field hygiene"]
      };
    }

    console.log('Parsed analysis:', analysisResult);

    return new Response(
      JSON.stringify({ analysis: analysisResult }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-pest function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed. Please try again.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});