"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from "@/components/ui";
import { 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Settings,
  RefreshCw,
  Globe,
  ShoppingBag,
  MapPin,
  Search,
  Shield
} from "lucide-react";
import type { GoogleIntegrationDashboard, GoogleService } from "@/types/google-integrations";

const serviceIcons: Record<GoogleService, any> = {
  ANALYTICS: BarChart3,
  TAG_MANAGER: Activity,
  SEARCH_CONSOLE: Search,
  MERCHANT_CENTER: ShoppingBag,
  BUSINESS_PROFILE: Globe,
  RECAPTCHA: Shield,
  MAPS: MapPin,
  OAUTH: Users,
};

const serviceNames: Record<GoogleService, string> = {
  ANALYTICS: "Google Analytics 4",
  TAG_MANAGER: "Google Tag Manager",
  SEARCH_CONSOLE: "Search Console",
  MERCHANT_CENTER: "Merchant Center",
  BUSINESS_PROFILE: "Business Profile",
  RECAPTCHA: "reCAPTCHA v3",
  MAPS: "Google Maps",
  OAUTH: "Google OAuth",
};

interface Props {
  organizationId: string;
}

export function GoogleIntegrationDashboard({ organizationId }: Props) {
  const [dashboard, setDashboard] = useState<GoogleIntegrationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/admin/integrations/google/dashboard?organizationId=${organizationId}`);
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  useEffect(() => {
    fetchDashboard();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load Google integration data</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-500";
      case "DISCONNECTED":
        return "bg-gray-500";
      case "ERROR":
        return "bg-red-500";
      case "PENDING":
        return "bg-yellow-500";
      case "SYNCING":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Connected</Badge>;
      case "DISCONNECTED":
        return <Badge variant="outline">Disconnected</Badge>;
      case "ERROR":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Error</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>;
      case "SYNCING":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Syncing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Integration Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage all Google services and integrations for your organization
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.healthScore}%</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all" 
                  style={{ 
                    width: `${dashboard.healthScore}%`,
                    backgroundColor: dashboard.healthScore >= 80 ? '#22c55e' : dashboard.healthScore >= 50 ? '#eab308' : '#ef4444'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.analytics.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.analytics.todayEvents.toLocaleString()} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Tracked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboard.analytics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {dashboard.analytics.sessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.lastSync 
                ? new Date(dashboard.lastSync).toLocaleDateString()
                : "Never"
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard.lastSync 
                ? new Date(dashboard.lastSync).toLocaleTimeString()
                : "No sync performed"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>
                Status of all Google service integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.integrations.map((integration) => {
                  const Icon = serviceIcons[integration.service];
                  return (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${integration.enabled ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`h-5 w-5 ${integration.enabled ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="font-medium">{serviceNames[integration.service]}</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.enabled ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(integration.status)}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {dashboard.integrations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No Google services connected yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Feeds</span>
                <span className="font-semibold">
                  {dashboard.merchantFeeds.filter(f => f.status === "ACTIVE").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verified Sites</span>
                <span className="font-semibold">
                  {dashboard.searchConsoleSites.filter(s => s.verified).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Business Profiles</span>
                <span className="font-semibold">
                  {dashboard.businessProfiles.filter(p => p.verified).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Map Locations</span>
                <span className="font-semibold">{dashboard.mapsLocations.length}</span>
              </div>
            </CardContent>
          </Card>

          {dashboard.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggestions to improve your Google integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
