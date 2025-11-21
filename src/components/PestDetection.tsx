import { useState, useRef, useEffect } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResults } from "@/components/AnalysisResults";

interface PestAnalysis {
  detected: boolean;
  pestType: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  recommendations: string[];
  preventiveMeasures: string[];
}

export const PestDetection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PestAnalysis | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <>
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
        <AnalysisResults analysis={analysis} />
      </div>

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
    </>
  );
};
