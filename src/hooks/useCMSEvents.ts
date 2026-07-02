import { useEffect, useState, useCallback } from "react";

interface CMSEvent {
  type: string;
  timestamp: number;
  data?: any;
  domain?: string;
  organizationId?: string;
}

export function useCMSEvents(enabled = true) {
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<CMSEvent | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let eventSource: EventSource | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource("/api/cms/events");

        eventSource.onopen = () => {
          console.log("[CMS Events] Connected");
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("[CMS Events] Received:", data);
            
            const cmsEvent: CMSEvent = {
              type: data.type,
              timestamp: data.timestamp,
              data: data.data,
              domain: data.domain,
              organizationId: data.organizationId,
            };

            setLastEvent(cmsEvent);
            setEvents((prev) => [...prev, cmsEvent].slice(-100)); // Keep last 100 events
          } catch (error) {
            console.error("[CMS Events] Failed to parse event:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("[CMS Events] Error:", error);
          setIsConnected(false);
          
          // Reconnect after 5 seconds
          setTimeout(() => {
            if (eventSource?.readyState === EventSource.CLOSED) {
              connect();
            }
          }, 5000);
        };
      } catch (error) {
        console.error("[CMS Events] Failed to connect:", error);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [enabled]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  return {
    events,
    lastEvent,
    isConnected,
    clearEvents,
  };
}
