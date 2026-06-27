"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { 
  Image as ImageIcon, 
  Wand2, 
  Eye, 
  Scissors,
  Sparkles,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  Palette,
  Tag,
  Maximize
} from "lucide-react";

interface ImageAnalysis {
  altText: string;
  title: string;
  caption: string;
  tags: string[];
  dominantColors: string[];
  width: number;
  height: number;
  fileSize: number;
  confidence: number;
}

interface ProcessedImage {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  analysis?: ImageAnalysis;
  backgroundRemoved?: boolean;
  enhanced?: boolean;
  compressed?: boolean;
}

interface ImageAIProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ImageAI({ images, onImagesChange, disabled = false }: ImageAIProps) {
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>(
    images.map((url, index) => ({ id: `${index}`, originalUrl: url }))
  );
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);

  const analyzeImage = async (image: ProcessedImage) => {
    setProcessing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis: ImageAnalysis = {
      altText: "Luxury Moroccan handcrafted ceramic vase with intricate geometric patterns",
      title: "Moroccan Ceramic Vase",
      caption: "Handcrafted traditional Moroccan pottery featuring authentic geometric designs",
      tags: ["ceramic", "moroccan", "handcrafted", "geometric", "traditional", "pottery"],
      dominantColors: ["#8B4513", "#D2691E", "#F5DEB3", "#DEB887"],
      width: 1920,
      height: 1080,
      fileSize: 245760,
      confidence: 0.94,
    };
    
    setProcessedImages(prev =>
      prev.map(img => img.id === image.id ? { ...img, analysis } : img)
    );
    setProcessing(false);
  };

  const removeBackground = async (image: ProcessedImage) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessedImages(prev =>
      prev.map(img => img.id === image.id ? { ...img, backgroundRemoved: true } : img)
    );
    setProcessing(false);
  };

  const enhanceImage = async (image: ProcessedImage) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessedImages(prev =>
      prev.map(img => img.id === image.id ? { ...img, enhanced: true } : img)
    );
    setProcessing(false);
  };

  const compressImage = async (image: ProcessedImage) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessedImages(prev =>
      prev.map(img => img.id === image.id ? { ...img, compressed: true } : img)
    );
    setProcessing(false);
  };

  const generateAltText = async (image: ProcessedImage) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!image.analysis) {
      await analyzeImage(image);
    }
    setProcessing(false);
  };

  const removeImage = (imageId: string) => {
    const newImages = images.filter((_, index) => `${index}` !== imageId);
    onImagesChange(newImages);
    setProcessedImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Image Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Images ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {processedImages.map((image) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.id === image.id
                    ? "border-brand-600 ring-2 ring-brand-200"
                    : "border-border hover:border-brand-300"
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.originalUrl}
                  alt="Product image"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize className="h-6 w-6 text-white" />
                </div>
                {image.backgroundRemoved && (
                  <Badge className="absolute top-2 left-2 bg-green-600">
                    <Scissors className="h-3 w-3 mr-1" />
                    BG Removed
                  </Badge>
                )}
                {image.enhanced && (
                  <Badge className="absolute top-2 right-2 bg-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Enhanced
                  </Badge>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Image Actions */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Image Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Preview */}
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Original</p>
                <img
                  src={selectedImage.originalUrl}
                  alt="Original"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
              {selectedImage.processedUrl && (
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Processed</p>
                  <img
                    src={selectedImage.processedUrl}
                    alt="Processed"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* AI Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => !disabled && !processing && generateAltText(selectedImage)}
                disabled={disabled || processing}
              >
                <Eye className="h-5 w-5" />
                <span className="text-sm">Generate Alt Text</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => !disabled && !processing && removeBackground(selectedImage)}
                disabled={disabled || processing || selectedImage.backgroundRemoved}
              >
                <Scissors className="h-5 w-5" />
                <span className="text-sm">Remove Background</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => !disabled && !processing && enhanceImage(selectedImage)}
                disabled={disabled || processing || selectedImage.enhanced}
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-sm">Enhance</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => !disabled && !processing && compressImage(selectedImage)}
                disabled={disabled || processing || selectedImage.compressed}
              >
                <RefreshCw className="h-5 w-5" />
                <span className="text-sm">Compress</span>
              </Button>
            </div>

            {/* Analysis Results */}
            {selectedImage.analysis && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Analysis Complete</p>
                    <p className="text-sm text-green-700">
                      Confidence: {Math.round(selectedImage.analysis.confidence * 100)}%
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Alt Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedImage.analysis.altText}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.analysis.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Dominant Colors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {selectedImage.analysis.dominantColors.map((color) => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Image Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-medium">
                          {selectedImage.analysis.width} × {selectedImage.analysis.height}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">
                          {formatFileSize(selectedImage.analysis.fileSize)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {processing && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <div className="flex-1">
                <p className="font-medium text-brand-900">Processing Image...</p>
                <Progress value={66} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
