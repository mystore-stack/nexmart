"use client";

import React, { useState, useEffect } from "react";
import { CloudSun, Thermometer, Wind, Droplets } from "lucide-react";

interface WeatherSectionProps {
  config: any;
}

export function WeatherSection({ config }: WeatherSectionProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch weather data based on user location or default city
    const fetchWeather = async () => {
      try {
        // In production, integrate with real weather API
        // For now, using mock data that would come from database config
        const mockWeather = {
          city: config.city || "Casablanca",
          temperature: 24,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          icon: "☀️"
        };
        setWeather(mockWeather);
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [config]);

  if (loading) return null;
  if (!weather) return null;

  const recommendations = [
    { icon: "☂️", text: "Light jacket recommended" },
    { icon: "🌡️", text: "Perfect for outdoor shopping" },
    { icon: "💨", text: "Windy, dress accordingly" },
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{config.title || "Weather & Recommendations"}</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weather Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{weather.city}</h3>
                <p className="text-gray-500">{weather.condition}</p>
              </div>
              <div className="text-6xl">{weather.icon}</div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Droplets className="w-5 h-5" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wind className="w-5 h-5" />
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {config.showRecommendations && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-blue-500" />
                Shopping Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{rec.icon}</span>
                    <span className="text-gray-700">{rec.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
