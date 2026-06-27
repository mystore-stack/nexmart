"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from "@/components/ui";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Link,
  Image as ImageIcon,
  Zap,
  RefreshCw
} from "lucide-react";

interface SEOAnalysis {
  seoScore: number;
  readability: number;
  keywordDensity: number;
  missingKeywords: string[];
  titleLength: number;
  descriptionLength: number;
  slugQuality: number;
  headingStructure: {
    hasH1: boolean;
    h1Count: number;
    h2Count: number;
    h3Count: number;
  };
  imageOptimization: number;
  suggestions: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    description: string;
    fix?: string;
  }>;
  oneClickFixes: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

interface SEOAnalyzerProps {
  content: {
    title: string;
    description: string;
    slug: string;
    content: string;
    keywords?: string[];
  };
  onFix?: (fixId: string) => void;
  onReanalyze?: () => void;
}

export function SEOAnalyzer({ content, onFix, onReanalyze }: SEOAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const analyzeSEO = async () => {
    setAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAnalysis({
      seoScore: 78,
      readability: 85,
      keywordDensity: 2.3,
      missingKeywords: ["luxury", "handmade", "moroccan"],
      titleLength: content.title.length,
      descriptionLength: content.description.length,
      slugQuality: 90,
      headingStructure: {
        hasH1: true,
        h1Count: 1,
        h2Count: 4,
        h3Count: 8,
      },
      imageOptimization: 65,
      suggestions: [
        {
          type: "critical",
          title: "Title too long",
          description: "Your title exceeds 60 characters, which may be truncated in search results.",
          fix: "Shorten title to under 60 characters",
        },
        {
          type: "warning",
          title: "Missing meta keywords",
          description: "Add relevant keywords to improve search visibility.",
          fix: "Add 3-5 relevant keywords",
        },
        {
          type: "info",
          title: "Add internal links",
          description: "Link to related products to improve site structure.",
        },
        {
          type: "warning",
          title: "Image alt text missing",
          description: "Some images lack descriptive alt text.",
          fix: "Add alt text to all images",
        },
      ],
      oneClickFixes: [
        {
          id: "fix-title",
          title: "Optimize Title Length",
          description: "AI will shorten your title to optimal length",
        },
        {
          id: "fix-description",
          title: "Enhance Description",
          description: "AI will improve meta description for better CTR",
        },
        {
          id: "fix-keywords",
          title: "Add Keywords",
          description: "AI will suggest and add relevant keywords",
        },
      ],
    });
    setAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-amber-600";
    return "bg-red-600";
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "critical": return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "info": return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">SEO Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Analyze your product content for SEO optimization
          </p>
          <Button onClick={analyzeSEO} disabled={analyzing}>
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze SEO
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SEO Analysis Results</CardTitle>
            <Button variant="outline" size="sm" onClick={onReanalyze || analyzeSEO}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reanalyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall SEO Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                  {analysis.seoScore}%
                </span>
              </div>
              <Progress value={analysis.seoScore} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Readability</span>
                <span className={`text-lg font-semibold ${getScoreColor(analysis.readability)}`}>
                  {analysis.readability}%
                </span>
              </div>
              <Progress value={analysis.readability} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Keyword Density</span>
                <span className="text-lg font-semibold">{analysis.keywordDensity}%</span>
              </div>
              <Progress value={analysis.keywordDensity * 10} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Slug Quality</span>
                <span className={`text-lg font-semibold ${getScoreColor(analysis.slugQuality)}`}>
                  {analysis.slugQuality}%
                </span>
              </div>
              <Progress value={analysis.slugQuality} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Image Optimization</span>
                <span className={`text-lg font-semibold ${getScoreColor(analysis.imageOptimization)}`}>
                  {analysis.imageOptimization}%
                </span>
              </div>
              <Progress value={analysis.imageOptimization} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Heading Structure</span>
                <Badge variant={analysis.headingStructure.hasH1 ? "default" : "destructive"}>
                  {analysis.headingStructure.h1Count} H1, {analysis.headingStructure.h2Count} H2, {analysis.headingStructure.h3Count} H3
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One-Click Fixes */}
      {analysis.oneClickFixes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              One-Click Fixes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {analysis.oneClickFixes.map((fix) => (
                <Button
                  key={fix.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start text-left"
                  onClick={() => onFix?.(fix.id)}
                >
                  <span className="font-semibold mb-1">{fix.title}</span>
                  <span className="text-xs text-muted-foreground">{fix.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border"
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <Badge variant={
                      suggestion.type === "critical" ? "destructive" :
                      suggestion.type === "warning" ? "secondary" : "outline"
                    }>
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  {suggestion.fix && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      {suggestion.fix}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Title Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Length</span>
                <span className={analysis.titleLength > 60 ? "text-red-600" : "text-green-600"}>
                  {analysis.titleLength}/60 chars
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={analysis.titleLength <= 60 ? "default" : "destructive"}>
                  {analysis.titleLength <= 60 ? "Good" : "Too Long"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="h-4 w-4" />
              Meta Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Length</span>
                <span className={analysis.descriptionLength > 160 ? "text-red-600" : "text-green-600"}>
                  {analysis.descriptionLength}/160 chars
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={analysis.descriptionLength <= 160 ? "default" : "destructive"}>
                  {analysis.descriptionLength <= 160 ? "Good" : "Too Long"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" />
              Image Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Optimization Score</span>
                <span className={getScoreColor(analysis.imageOptimization)}>
                  {analysis.imageOptimization}%
                </span>
              </div>
              <Progress value={analysis.imageOptimization} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" />
              Missing Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-600">All keywords present ✓</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
