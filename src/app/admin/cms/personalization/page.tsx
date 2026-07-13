"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Brain, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { WeatherPersonalizationManager } from "@/components/admin/personalization/WeatherPersonalizationManager";
import { AIRecommendationsManager } from "@/components/admin/personalization/AIRecommendationsManager";
import { InventoryMonitor } from "@/components/admin/inventory/InventoryMonitor";

export default function PersonalizationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("weather");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Personalization Hub</h1>
                <p className="text-sm text-muted-foreground">
                  Configure AI, weather, and inventory-based product recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 mb-8">
            <TabsTrigger value="weather" className="gap-2">
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">Weather-Based Personalization</h3>
              <p className="text-sm text-muted-foreground">
                Show different products based on local weather conditions. Perfect for seasonal items, weather-dependent products, or location-specific recommendations. The system automatically detects user location and weather to display relevant products.
              </p>
            </div>
            <WeatherPersonalizationManager />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">AI-Powered Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Leverage artificial intelligence to provide intelligent product recommendations based on user behavior, browsing history, and purchase patterns. Rules can use multiple strategies including behavioral analysis, trending products, and predictive recommendations using the Vercel AI SDK.
              </p>
            </div>
            <AIRecommendationsManager />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">Real-Time Inventory Updates</h3>
              <p className="text-sm text-muted-foreground">
                Monitor inventory changes in real-time using Server-Sent Events (SSE). Track stock updates, identify critical low-stock situations, and respond to inventory changes instantly. All updates are streamed live to the dashboard with automatic reconnection support.
              </p>
            </div>
            <InventoryMonitor />
          </TabsContent>
        </Tabs>

        {/* Info Box */}
        <div className="mt-12 bg-muted/30 border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Integration Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Weather API</p>
              <p className="text-muted-foreground">
                Set OPENWEATHER_API_KEY environment variable for real weather data integration
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">AI Recommendations</p>
              <p className="text-muted-foreground">
                Powered by Vercel AI SDK. Configure your preferred AI model in environment variables
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Live Updates</p>
              <p className="text-muted-foreground">
                Real-time SSE streaming with automatic reconnection and heartbeat monitoring
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
