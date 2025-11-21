import { AlertTriangle, CheckCircle2, Leaf } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PestAnalysis {
  detected: boolean;
  pestType: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  recommendations: string[];
  preventiveMeasures: string[];
}

interface AnalysisResultsProps {
  analysis: PestAnalysis | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  return (
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
  );
};
