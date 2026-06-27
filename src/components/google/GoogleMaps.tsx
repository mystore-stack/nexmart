"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface GoogleMapsProps {
  apiKey?: string;
}

interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: "roadmap" | "satellite" | "hybrid" | "terrain";
}

interface MarkerOptions {
  position: { lat: number; lng: number };
  title?: string;
  label?: string;
  map?: any;
}

declare global {
  interface Window {
    google: {
      maps:{
        Map: new (element: HTMLElement, options: MapOptions) => any;
        Marker: new (options: MarkerOptions) => any;
        LatLng: new (lat: number, lng: number) => any;
      };
    };
    initGoogleMaps: () => void;
  }
}

export function GoogleMaps({ apiKey }: GoogleMapsProps) {
  const mapKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mapKey) return;

    const loadMaps = () => {
      if (window.google && window.google.maps) {
        window.initGoogleMaps = () => {};
      }
    };

    loadMaps();
  }, [mapKey]);

  if (!mapKey) return null;

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${mapKey}&libraries=places`}
      strategy="afterInteractive"
    />
  );
}

export function GoogleMap({
  center,
  zoom = 14,
  markers = [],
  className = "",
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; title?: string; label?: string }>;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: new window.google.maps.LatLng(center.lat, center.lng),
        zoom,
        mapTypeId: "roadmap",
      });

      markers.forEach((marker) => {
        new window.google.maps.Marker({
          position: new window.google.maps.LatLng(marker.lat, marker.lng),
          map,
          title: marker.title,
          label: marker.label,
        });
      });

      setIsLoaded(true);
    };

    if (window.google?.maps) {
      initMap();
    } else {
      window.initGoogleMaps = initMap;
    }

    return () => {
      window.initGoogleMaps = () => {};
    };
  }, [center, zoom, markers]);

  return <div ref={mapRef} className={className} style={{ height: "400px", width: "100%" }} />;
}

export function StoreLocator({
  locations,
  onLocationSelect,
}: {
  locations: Array<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    phone?: string;
    hours?: string;
  }>;
  onLocationSelect?: (location: any) => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState(
    locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : { lat: 33.5731, lng: -7.5898 }
  );

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    setMapCenter({ lat: location.lat, lng: location.lng });
    onLocationSelect?.(location);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => handleLocationClick(location)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedLocation?.id === location.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
            }`}
          >
            <h3 className="font-semibold">{location.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
            {location.phone && (
              <p className="text-sm text-muted-foreground mt-1">{location.phone}</p>
            )}
            {location.hours && (
              <p className="text-sm text-muted-foreground mt-1">{location.hours}</p>
            )}
          </div>
        ))}
      </div>
      <div>
        <GoogleMap
          center={mapCenter}
          zoom={12}
          markers={locations.map((loc) => ({
            lat: loc.lat,
            lng: loc.lng,
            title: loc.name,
          }))}
        />
      </div>
    </div>
  );
}

export function DeliveryZoneMap({
  center,
  zones,
}: {
  center: { lat: number; lng: number };
  zones: Array<{
    id: string;
    name: string;
    coordinates: Array<{ lat: number; lng: number }>;
    color: string;
    fee: number;
  }>;
}) {
  return (
    <GoogleMap
      center={center}
      zoom={12}
      markers={zones.flatMap((zone) =>
        zone.coordinates.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
          title: zone.name,
        }))
      )}
    />
  );
}
