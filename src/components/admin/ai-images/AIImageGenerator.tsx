"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Trash2,
  Eye,
  Star
} from "lucide-react";
import { generateProductImages } from "@/app/actions/ai-images";
import toast from "react-hot-toast";

interface AIImageGeneratorProps {
  productId: string;
  organizationId: string;
  existingImages?: any[];
  onImagesGenerated?: (images: any[]) => void;
}

export function AIImageGenerator({
  productId,
  organizationId,
  existingImages = [],
  onImagesGenerated,
}: AIImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generateLifestyle, setGenerateLifestyle] = useState(true);
  const [generatePackaging, setGeneratePackaging] = useState(true);
  const [quality, setQuality] = useState<"standard" | "hd">("hd");
  const [autoApprove, setAutoApprove] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);
    setCurrentStep("Initializing AI generation...");

    try {
      setCurrentStep("Generating prompts...");
      setProgress(10);

      const result = await generateProductImages({
        productId,
        organizationId,
        generateLifestyle,
        generatePackaging,
        quality,
        autoApprove,
      });

      setCurrentStep("Processing results...");
      setProgress(90);

      if (result.success) {
        setGeneratedImages(result.images);
        setProgress(100);
        setCurrentStep("Complete!");
        toast.success(`Generated ${result.totalGenerated} images successfully`);
        
        if (onImagesGenerated) {
          onImagesGenerated(result.images);
        }
      } else {
        setCurrentStep("Failed");
        toast.error(`Failed to generate images: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      setCurrentStep("Error");
      toast.error(error instanceof Error ? error.message : "Failed to generate images");
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep("");
      }, 2000);
    }
  };

  const imageTypes = [
    { type: "MAIN", label: "Main Image", icon: Star },
    { type: "GALLERY", label: "Gallery", icon: ImageIcon },
    { type: "DETAIL", label: "Detail", icon: Eye },
    { type: "LIFESTYLE", label: "Lifestyle", icon: ImageIcon },
    { type: "PACKAGING", label: "Packaging", icon: ImageIcon },
  ];

  const viewTypes = [
    "FRONT",
    "FORTY_FIVE_DEGREE",
    "SIDE",
    "BACK",
    "TOP",
    "CLOSE_UP",
    "LIFESTYLE_SCENE",
    "PACKAGING_SHOT",
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          AI Image Generator
        </CardTitle>
        <CardDescription>
          Generate professional product images using AI. Creates multiple views including front, side, back, and lifestyle shots.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lifestyle">Generate Lifestyle Images</Label>
            <Switch
              id="lifestyle"
              checked={generateLifestyle}
              onCheckedChange={setGenerateLifestyle}
            />
            <p className="text-xs text-muted-foreground">
              Include lifestyle context shots
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packaging">Generate Packaging Images</Label>
            <Switch
              id="packaging"
              checked={generatePackaging}
              onCheckedChange={setGeneratePackaging}
            />
            <p className="text-xs text-muted-foreground">
              Include packaging shots
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Image Quality</Label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as "standard" | "hd")}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="standard">Standard</option>
              <option value="hd">HD (High Definition)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              HD images take longer but have better quality
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-approve">Auto-Approve Images</Label>
            <Switch
              id="auto-approve"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
            />
            <p className="text-xs text-muted-foreground">
              Automatically approve generated images
            </p>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{currentStep}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Images...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Product Images
            </>
          )}
        </Button>

        {generatedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Images</h3>
              <span className="text-sm text-muted-foreground">
                {generatedImages.length} images
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
                <div
                  key={image.id || index}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(image.url, "_blank")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                    <div className="font-medium">{image.viewType}</div>
                    <div className="text-muted-foreground">{image.imageType}</div>
                  </div>
                  {image.success ? (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500 bg-white rounded-full p-0.5" />
                  ) : (
                    <XCircle className="absolute top-2 right-2 w-5 h-5 text-red-500 bg-white rounded-full p-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {existingImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Images ({existingImages.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={image.cloudinarySecureUrl || image.cloudinaryUrl}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(image.cloudinarySecureUrl || image.cloudinaryUrl, "_blank")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                    <div className="font-medium">{image.viewType}</div>
                    <div className="text-muted-foreground">{image.imageType}</div>
                  </div>
                  {image.isMain && (
                    <Star className="absolute top-2 left-2 w-5 h-5 text-yellow-500 bg-white rounded-full p-0.5" />
                  )}
                  {image.isApproved ? (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500 bg-white rounded-full p-0.5" />
                  ) : (
                    <XCircle className="absolute top-2 right-2 w-5 h-5 text-red-500 bg-white rounded-full p-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
