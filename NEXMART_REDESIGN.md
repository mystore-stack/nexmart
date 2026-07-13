# NexMart Morocco Homepage Redesign - Implementation Guide

## Overview

This document outlines the comprehensive redesign of the NexMart Morocco homepage with a focus on personalization, real-time updates, and admin-friendly content management.

## Phase 1: Core Infrastructure (Completed)

### Database Schema Extensions

New models added to support personalization and inventory tracking:

1. **WeatherPersonalization** - Store weather-based product recommendations
   - Condition, temperature ranges, product IDs
   - Priority and display order for UI rendering

2. **AIRecommendationRule** - AI-powered recommendation strategies
   - Multiple strategies: Weather-Based, AI-Powered, User Behavior, Manual
   - Confidence scoring and result limiting

3. **InventoryUpdateLog** - Real-time inventory tracking
   - Previous/new stock levels, change reasons
   - Priority levels for critical updates

4. **HomepageSectionAnalytics** - Section performance metrics
   - Views, clicks, conversions by section
   - Device type and location tracking

### Database Enums

- `WeatherCondition`: SUNNY, CLOUDY, RAINY, SNOWY, WINDY, HOT, COLD
- `PersonalizationStrategy`: WEATHER_BASED, AI_POWERED, USER_BEHAVIOR, MANUAL
- `InventoryUpdatePriority`: LOW, MEDIUM, HIGH, CRITICAL

## Phase 2: Admin Interface (Completed)

### Enhanced Homepage Editor

**Location**: `/admin/cms/homepage`

Features:
- **Tabbed Interface**: Visual Builder | Sections Manager | Analytics | Settings
- **Drag-and-Drop Section Management**: Reorder sections with intuitive interface
- **Undo/Redo History**: Full edit history with navigation
- **Live Statistics**: View and click metrics per section
- **Bulk Actions**: Duplicate, hide/show, delete sections
- **Performance Analytics**: Real-time conversion tracking

### Component: SectionManager

```tsx
<SectionManager
  sections={sections}
  onSectionsChange={handleSectionsChange}
  onEditSection={handleEditSection}
  onDeleteSection={handleSectionDelete}
  onSave={handleSaveChanges}
  isLoading={saving}
/>
```

Features:
- Drag-and-drop reordering using `@hello-pangea/dnd`
- History-based undo/redo system
- Visual section type indicators with color-coding
- Inline analytics display
- Smooth animations with Framer Motion

## Phase 3: Weather-Based Personalization

### API Routes

**GET/POST/PUT/DELETE**: `/api/admin/personalization/weather`

Create weather rules that show specific products based on conditions:

```bash
POST /api/admin/personalization/weather
{
  "condition": "RAINY",
  "minTemperature": 10,
  "maxTemperature": 20,
  "title": "Rainy Day Fashion",
  "productIds": ["uuid1", "uuid2", "uuid3"],
  "displayPriority": 1
}
```

### Service: WeatherService

**Location**: `/lib/personalization/weather-service.ts`

Features:
- Real weather data from OpenWeatherMap API
- Fallback mock data for development
- Weather condition mapping
- Personalization matching logic

### Component: WeatherPersonalizationManager

Admins can:
- Create weather-based rules with temperature ranges
- Assign specific products or categories
- Set display priority
- Monitor active rules

## Phase 4: AI-Powered Recommendations

### API Routes

**GET/POST/PUT/DELETE**: `/api/admin/personalization/ai-recommendations`

Create AI recommendation rules:

```bash
POST /api/admin/personalization/ai-recommendations
{
  "name": "Top-Rated Summer Products",
  "strategy": "AI_POWERED",
  "minScore": 0.7,
  "maxResults": 5,
  "productIds": ["uuid1", "uuid2", "uuid3"],
  "description": "Show best-selling summer items"
}
```

### Service: AIService

**Location**: `/lib/personalization/ai-service.ts`

Features:
- Generative AI recommendations using Vercel AI SDK
- Multiple recommendation strategies
- Confidence scoring system
- Trending product detection
- Custom scoring algorithm based on:
  - Product rating (25 points)
  - Popularity/sold count (30 points)
  - Review count (20 points)
  - Recent visibility (15 points)
  - Purchase frequency (10 points)

### Component: AIRecommendationsManager

Admins can:
- Define AI recommendation rules
- Choose personalization strategies
- Set confidence thresholds
- Monitor rule performance

## Phase 5: Real-Time Inventory Updates

### API Routes

**GET/POST**: `/api/admin/inventory/updates`

Track inventory changes:

```bash
POST /api/admin/inventory/updates
{
  "productId": "uuid-123",
  "newStock": 45,
  "changeReason": "Sales reduction",
  "priority": "MEDIUM"
}
```

### SSE Streaming Endpoint

**Location**: `/api/home/inventory-stream`

- Establishes Server-Sent Events connection
- Streams inventory updates every 5 seconds
- Automatic heartbeat (30 seconds)
- Reconnection support with exponential backoff

Sample event:
```json
{
  "type": "inventory_update",
  "productId": "uuid-123",
  "productName": "Product Name",
  "previousStock": 50,
  "newStock": 45,
  "changeReason": "Sales reduction",
  "priority": "MEDIUM",
  "timestamp": "2026-07-13T21:40:00.000Z"
}
```

### Hook: useInventoryUpdates

```tsx
const { updates, isConnected, disconnect } = useInventoryUpdates(true);

// updates: Array<InventoryUpdate>
// isConnected: boolean
// disconnect: () => void
```

Features:
- Automatic connection management
- Jotai atom for global state
- Error handling and reconnection
- Real-time update streaming

### Component: InventoryMonitor

Live dashboard showing:
- Real-time inventory changes
- Priority-based color coding
- Product stock trends (up/down/stable)
- Statistics: total updates, critical updates, last updated
- Live connection status

## API Endpoints Summary

### Weather Personalization
- `GET /api/admin/personalization/weather` - List rules
- `POST /api/admin/personalization/weather` - Create rule
- `PUT /api/admin/personalization/weather` - Update rule
- `DELETE /api/admin/personalization/weather?id=...` - Delete rule

### AI Recommendations
- `GET /api/admin/personalization/ai-recommendations` - List rules
- `POST /api/admin/personalization/ai-recommendations` - Create rule
- `PUT /api/admin/personalization/ai-recommendations` - Update rule
- `DELETE /api/admin/personalization/ai-recommendations?id=...` - Delete rule

### Inventory
- `GET /api/admin/inventory/updates` - Get update history (paginated)
- `POST /api/admin/inventory/updates` - Log inventory update
- `GET /api/home/inventory-stream` - SSE streaming endpoint

## Technologies Used

### Frontend
- **React 19** with Server Components
- **Next.js 16** App Router
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **@hello-pangea/dnd** for drag-and-drop
- **Jotai** for state management
- **react-hot-toast** for notifications

### Backend
- **Prisma** ORM with PostgreSQL
- **Next.js API Routes** for endpoints
- **Server-Sent Events (SSE)** for real-time updates
- **Vercel AI SDK** for AI recommendations

### External APIs
- **OpenWeatherMap** for weather data (optional)
- **Vercel AI Gateway** for AI model access

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Weather API (optional)
OPENWEATHER_API_KEY=your_api_key

# AI/LLM Configuration
AI_MODEL=gpt-4-turbo  # or other supported model
AI_GATEWAY_API_KEY=your_key  # if using non-default providers

# Optional: Existing auth and tenant configs
# (use existing setup in project)
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── personalization/
│   │   │       ├── weather/route.ts
│   │   │       └── ai-recommendations/route.ts
│   │   ├── admin/inventory/
│   │   │   └── updates/route.ts
│   │   └── home/
│   │       └── inventory-stream/route.ts
│   └── admin/cms/
│       ├── homepage/page.tsx (enhanced)
│       └── personalization/page.tsx
├── components/
│   ├── admin/
│   │   ├── homepage/
│   │   │   └── SectionManager.tsx
│   │   ├── personalization/
│   │   │   ├── WeatherPersonalizationManager.tsx
│   │   │   └── AIRecommendationsManager.tsx
│   │   └── inventory/
│   │       └── InventoryMonitor.tsx
├── hooks/
│   └── useInventoryUpdates.ts
├── lib/
│   └── personalization/
│       ├── weather-service.ts
│       └── ai-service.ts
└── prisma/
    └── schema.prisma (extended)
```

## Integration Checklist

- [ ] Run database migration: `npm run db:migrate`
- [ ] Set environment variables
- [ ] Test Weather API endpoint with test data
- [ ] Configure AI model and API keys
- [ ] Test inventory streaming in browser console
- [ ] Verify all admin pages load correctly
- [ ] Test drag-and-drop section reordering
- [ ] Verify undo/redo functionality
- [ ] Monitor browser console for errors

## Performance Considerations

1. **SSE Connection Limits**: Monitor concurrent connections
2. **Database Queries**: Inventory logs indexed by date for fast filtering
3. **Caching**: Consider caching personalization rules in production
4. **Rate Limiting**: Implement API rate limits for section updates
5. **Real-Time Updates**: SSE polling every 5 seconds (configurable)

## Future Enhancements

- [ ] Batch inventory updates
- [ ] WebSocket alternative to SSE for better duplex communication
- [ ] Advanced analytics dashboard
- [ ] A/B testing for personalization rules
- [ ] Machine learning model training for recommendations
- [ ] Mobile app support
- [ ] Webhook integrations for external inventory systems
- [ ] Multi-language support for personalization
- [ ] Geolocation-based recommendations

## Troubleshooting

### Weather API not working
- Verify OpenWeatherMap API key is set
- Check location data is being sent correctly
- Review API rate limits

### Real-time inventory not updating
- Verify SSE endpoint is accessible
- Check browser console for connection errors
- Verify database is updated with new logs
- Check EventSource availability in browser

### AI recommendations not generating
- Verify AI_MODEL and API keys are set
- Check Vercel AI SDK is installed
- Review model availability in your region
- Check API response in network tab

### Section reordering not working
- Verify @hello-pangea/dnd is installed
- Check browser console for drag-drop errors
- Ensure sections have unique IDs
- Test in different browser

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Check network tab for API failures
4. Verify environment variables are set
5. Contact support with error details and logs
