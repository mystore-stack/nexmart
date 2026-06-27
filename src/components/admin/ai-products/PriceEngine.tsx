"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge, Progress } from "@/components/ui";
import { 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Target,
  Truck,
  Percent,
  Zap,
  CheckCircle,
  Info
} from "lucide-react";

interface PricingAnalysis {
  suggestedPrice: number;
  profitMargin: number;
  shippingEstimate: number;
  competitorPrice: number;
  discountPrice: number;
  wholesalePrice: number;
  taxEstimate: number;
  currency: string;
  pricingStrategy: string;
  marketAnalysis: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketPosition: "low" | "medium" | "high";
    competitiveness: number;
  };
  confidence: number;
}

interface PriceEngineProps {
  cost?: number;
  currentPrice?: number;
  onPriceSuggestion?: (price: number) => void;
  disabled?: boolean;
}

export function PriceEngine({ 
  cost = 0, 
  currentPrice, 
  onPriceSuggestion, 
  disabled = false 
}: PriceEngineProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [customCost, setCustomCost] = useState(cost.toString());
  const [targetMargin, setTargetMargin] = useState(30);

  const analyzePricing = async () => {
    setAnalyzing(true);
    const costValue = parseFloat(customCost) || 0;
    
    // Simulate AI pricing analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestedPrice = costValue * (1 + targetMargin / 100);
    const competitorPrice = suggestedPrice * (0.9 + Math.random() * 0.2);
    
    setAnalysis({
      suggestedPrice: Math.round(suggestedPrice),
      profitMargin: targetMargin,
      shippingEstimate: Math.round(costValue * 0.1),
      competitorPrice: Math.round(competitorPrice),
      discountPrice: Math.round(suggestedPrice * 0.85),
      wholesalePrice: Math.round(suggestedPrice * 0.6),
      taxEstimate: Math.round(suggestedPrice * 0.2),
      currency: "MAD",
      pricingStrategy: "value_based",
      marketAnalysis: {
        averagePrice: Math.round(competitorPrice),
        priceRange: { min: Math.round(competitorPrice * 0.7), max: Math.round(competitorPrice * 1.3) },
        marketPosition: suggestedPrice < competitorPrice ? "low" : suggestedPrice > competitorPrice * 1.1 ? "high" : "medium",
        competitiveness: Math.round(70 + Math.random() * 25),
      },
      confidence: 0.87,
    });
    setAnalyzing(false);
  };

  const applySuggestion = () => {
    if (analysis && onPriceSuggestion) {
      onPriceSuggestion(analysis.suggestedPrice);
    }
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case "low": return "text-green-600 bg-green-50";
      case "medium": return "text-blue-600 bg-blue-50";
      case "high": return "text-amber-600 bg-amber-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getCompetitivenessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            AI Price Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Product Cost (MAD)</Label>
              <Input
                type="number"
                value={customCost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomCost(e.target.value)}
                disabled={disabled}
                placeholder="Enter cost price"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Target Margin (%)</Label>
              <Input
                type="number"
                value={targetMargin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetMargin(Number(e.target.value))}
                disabled={disabled}
                placeholder="Enter target margin"
                className="mt-2"
              />
            </div>
          </div>
          <Button
            onClick={analyzePricing}
            disabled={disabled || analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing Market...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Pricing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Recommendations
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Price Card */}
              <div className="p-6 bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg border border-brand-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-brand-700 font-medium">Suggested Selling Price</p>
                    <p className="text-4xl font-bold text-brand-900">
                      {analysis.currency} {analysis.suggestedPrice.toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={applySuggestion} disabled={disabled}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Price
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Profit Margin</p>
                    <p className="font-semibold text-green-600">{analysis.profitMargin}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profit Amount</p>
                    <p className="font-semibold">
                      {analysis.currency} {Math.round(analysis.suggestedPrice * analysis.profitMargin / 100).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ROI</p>
                    <p className="font-semibold text-blue-600">{analysis.profitMargin}%</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Competitor Price</span>
                    </div>
                    <span className="font-semibold">
                      {analysis.currency} {analysis.competitorPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Shipping Estimate</span>
                    </div>
                    <span className="font-semibold">
                      {analysis.currency} {analysis.shippingEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Tax Estimate</span>
                    </div>
                    <span className="font-semibold">
                      {analysis.currency} {analysis.taxEstimate.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Discount Price</span>
                    <span className="font-semibold text-green-600">
                      {analysis.currency} {analysis.discountPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Wholesale Price</span>
                    <span className="font-semibold text-blue-600">
                      {analysis.currency} {analysis.wholesalePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Total Cost</span>
                    <span className="font-semibold">
                      {analysis.currency} {Math.round(parseFloat(customCost) + analysis.shippingEstimate + analysis.taxEstimate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Average Market Price</p>
                  <p className="text-2xl font-bold">
                    {analysis.currency} {analysis.marketAnalysis.averagePrice.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                  <p className="text-lg font-semibold">
                    {analysis.currency} {analysis.marketAnalysis.priceRange.min.toLocaleString()} - {analysis.marketAnalysis.priceRange.max.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${getMarketPositionColor(analysis.marketAnalysis.marketPosition)}`}>
                  <p className="text-sm mb-1">Market Position</p>
                  <p className="text-lg font-semibold capitalize">{analysis.marketAnalysis.marketPosition}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Competitiveness Score</span>
                  <span className={`text-sm font-semibold ${getCompetitivenessColor(analysis.marketAnalysis.competitiveness)}`}>
                    {analysis.marketAnalysis.competitiveness}%
                  </span>
                </div>
                <Progress value={analysis.marketAnalysis.competitiveness} className="h-2" />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Pricing Strategy: {analysis.pricingStrategy.replace(/_/g, " ").toUpperCase()}</p>
                  <p className="text-blue-700">
                    Based on market analysis, your suggested price is positioned to maximize profit while remaining competitive.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Processing Indicator */}
      {analyzing && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              <div className="flex-1">
                <p className="font-medium text-brand-900">Analyzing Market Data...</p>
                <Progress value={50} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
