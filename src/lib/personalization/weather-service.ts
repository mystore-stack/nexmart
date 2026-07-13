import { WeatherCondition } from "@prisma/client";

export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  location: string;
}

/**
 * Fetch weather data for a location
 * Uses OpenWeatherMap API or fallback mock data
 */
export async function getWeatherData(
  location: string
): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn("[WEATHER_SERVICE] No API key configured, using mock data");
      return getMockWeatherData();
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Weather API request failed");
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      condition: mapWeatherCondition(data.weather[0].main),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      location: data.name,
    };
  } catch (error) {
    console.error("[WEATHER_SERVICE] Error:", error);
    return null;
  }
}

/**
 * Map OpenWeatherMap conditions to our enum
 */
function mapWeatherCondition(condition: string): WeatherCondition {
  const mapping: Record<string, WeatherCondition> = {
    Clear: "SUNNY",
    Clouds: "CLOUDY",
    Rain: "RAINY",
    Drizzle: "RAINY",
    Thunderstorm: "RAINY",
    Snow: "SNOWY",
    Mist: "CLOUDY",
    Smoke: "CLOUDY",
    Haze: "CLOUDY",
    Dust: "CLOUDY",
    Fog: "CLOUDY",
    Sand: "WINDY",
    Ash: "CLOUDY",
    Squall: "WINDY",
    Tornado: "WINDY",
  };

  return mapping[condition] || "CLOUDY";
}

/**
 * Get mock weather data for development/fallback
 */
function getMockWeatherData(): WeatherData {
  const conditions: WeatherCondition[] = [
    "SUNNY",
    "CLOUDY",
    "RAINY",
    "SNOWY",
    "WINDY",
    "HOT",
    "COLD",
  ];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];

  let temperature = 20;
  if (condition === "HOT") temperature = 30 + Math.random() * 10;
  if (condition === "COLD") temperature = 0 - Math.random() * 10;

  return {
    temperature,
    condition,
    humidity: 60 + Math.random() * 30,
    windSpeed: Math.random() * 20,
    location: "Rabat", // Default to Rabat, Morocco
  };
}

/**
 * Check if weather matches personalization conditions
 */
export function isWeatherMatch(
  weatherData: WeatherData,
  condition: WeatherCondition,
  minTemp?: number,
  maxTemp?: number
): boolean {
  // Check main condition
  if (weatherData.condition !== condition) {
    return false;
  }

  // Check temperature range if specified
  if (minTemp !== undefined && weatherData.temperature < minTemp) {
    return false;
  }

  if (maxTemp !== undefined && weatherData.temperature > maxTemp) {
    return false;
  }

  return true;
}

/**
 * Get personalized products based on weather
 */
export async function getWeatherPersonalizedProducts(
  weather: WeatherData,
  personalizations: any[]
) {
  const matchingPersonalizations = personalizations.filter((p) =>
    isWeatherMatch(
      weather,
      p.condition,
      p.minTemperature,
      p.maxTemperature
    )
  );

  if (matchingPersonalizations.length === 0) {
    return [];
  }

  // Sort by priority and return the top matching one
  const top = matchingPersonalizations.sort(
    (a, b) => b.displayPriority - a.displayPriority
  )[0];

  return {
    personalization: top,
    recommendation: {
      type: "WEATHER_BASED",
      condition: weather.condition,
      temperature: weather.temperature,
      productIds: top.productIds,
      categoryIds: top.categoryIds,
    },
  };
}
