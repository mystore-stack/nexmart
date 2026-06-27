"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Label, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { 
  BarChart3, 
  Activity, 
  Search, 
  ShoppingBag, 
  Globe, 
  Shield, 
  MapPin, 
  Users,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import type { GoogleService } from "@/types/google-integrations";

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

export function GoogleSettings({ organizationId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("analytics");

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/admin/integrations/google/settings?organizationId=${organizationId}`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/integrations/google/settings?organizationId=${organizationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        alert("Settings saved successfully");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [organizationId]);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Integration Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure all Google services for your organization
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="merchant">Merchant</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Google Analytics 4
              </CardTitle>
              <CardDescription>
                Track user behavior, conversions, and revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics-enabled">Enable Analytics</Label>
                <Switch
                  id="analytics-enabled"
                  checked={settings.analyticsEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("analyticsEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ga4-measurement-id">GA4 Measurement ID</Label>
                <Input
                  id="ga4-measurement-id"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.ga4MeasurementId || ""}
                  onChange={(e) => updateSetting("ga4MeasurementId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ga4-api-secret">GA4 API Secret</Label>
                <Input
                  id="ga4-api-secret"
                  type="password"
                  placeholder="Enter API secret"
                  value={settings.ga4ApiSecret || ""}
                  onChange={(e) => updateSetting("ga4ApiSecret", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Google Tag Manager
              </CardTitle>
              <CardDescription>
                Manage marketing tags and tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="gtm-enabled">Enable Tag Manager</Label>
                <Switch
                  id="gtm-enabled"
                  checked={settings.gtmEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("gtmEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtm-container-id">GTM Container ID</Label>
                <Input
                  id="gtm-container-id"
                  placeholder="GTM-XXXXXX"
                  value={settings.gtmContainerId || ""}
                  onChange={(e) => updateSetting("gtmContainerId", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Google Merchant Center
              </CardTitle>
              <CardDescription>
                Showcase products on Google Shopping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="merchant-enabled">Enable Merchant Center</Label>
                <Switch
                  id="merchant-enabled"
                  checked={settings.merchantEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("merchantEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant-id">Merchant Center ID</Label>
                <Input
                  id="merchant-id"
                  placeholder="Enter Merchant Center ID"
                  value={settings.merchantCenterId || ""}
                  onChange={(e) => updateSetting("merchantCenterId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant-api-key">Merchant Center API Key</Label>
                <Input
                  id="merchant-api-key"
                  type="password"
                  placeholder="Enter API key"
                  value={settings.merchantApiKey || ""}
                  onChange={(e) => updateSetting("merchantApiKey", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-feed">Auto-refresh Feeds</Label>
                <Switch
                  id="auto-feed"
                  checked={settings.autoRefreshFeeds || false}
                  onCheckedChange={(checked: boolean) => updateSetting("autoRefreshFeeds", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Google Business Profile
              </CardTitle>
              <CardDescription>
                Manage local business listings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="business-enabled">Enable Business Profile</Label>
                <Switch
                  id="business-enabled"
                  checked={settings.businessEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("businessEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-api-key">Business Profile API Key</Label>
                <Input
                  id="business-api-key"
                  type="password"
                  placeholder="Enter API key"
                  value={settings.businessApiKey || ""}
                  onChange={(e) => updateSetting("businessApiKey", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Google Search Console
              </CardTitle>
              <CardDescription>
                Monitor search performance and SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="search-enabled">Enable Search Console</Label>
                <Switch
                  id="search-enabled"
                  checked={settings.searchEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("searchEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-verification">Verification Token</Label>
                <Input
                  id="search-verification"
                  type="password"
                  placeholder="Enter verification token"
                  value={settings.searchVerificationToken || ""}
                  onChange={(e) => updateSetting("searchVerificationToken", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-sitemap">Auto-submit Sitemap</Label>
                <Switch
                  id="auto-sitemap"
                  checked={settings.autoSubmitSitemap || false}
                  onCheckedChange={(checked: boolean) => updateSetting("autoSubmitSitemap", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Google Maps
              </CardTitle>
              <CardDescription>
                Display maps for locations and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maps-enabled">Enable Maps</Label>
                <Switch
                  id="maps-enabled"
                  checked={settings.mapsEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("mapsEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maps-api-key">Maps API Key</Label>
                <Input
                  id="maps-api-key"
                  type="password"
                  placeholder="Enter Maps API key"
                  value={settings.mapsApiKey || ""}
                  onChange={(e) => updateSetting("mapsApiKey", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Google reCAPTCHA v3
              </CardTitle>
              <CardDescription>
                Protect forms from spam and abuse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="recaptcha-enabled">Enable reCAPTCHA</Label>
                <Switch
                  id="recaptcha-enabled"
                  checked={settings.recaptchaEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("recaptchaEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recaptcha-site-key">Site Key</Label>
                <Input
                  id="recaptcha-site-key"
                  placeholder="Enter site key"
                  value={settings.recaptchaSiteKey || ""}
                  onChange={(e) => updateSetting("recaptchaSiteKey", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recaptcha-secret-key">Secret Key</Label>
                <Input
                  id="recaptcha-secret-key"
                  type="password"
                  placeholder="Enter secret key"
                  value={settings.recaptchaSecretKey || ""}
                  onChange={(e) => updateSetting("recaptchaSecretKey", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Google OAuth
              </CardTitle>
              <CardDescription>
                Enable Google login for users and admins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="oauth-enabled">Enable OAuth</Label>
                <Switch
                  id="oauth-enabled"
                  checked={settings.oauthEnabled || false}
                  onCheckedChange={(checked: boolean) => updateSetting("oauthEnabled", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oauth-admin-client-id">Admin Client ID</Label>
                <Input
                  id="oauth-admin-client-id"
                  placeholder="Enter admin client ID"
                  value={settings.oauthAdminClientId || ""}
                  onChange={(e) => updateSetting("oauthAdminClientId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oauth-admin-client-secret">Admin Client Secret</Label>
                <Input
                  id="oauth-admin-client-secret"
                  type="password"
                  placeholder="Enter admin client secret"
                  value={settings.oauthAdminClientSecret || ""}
                  onChange={(e) => updateSetting("oauthAdminClientSecret", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oauth-customer-client-id">Customer Client ID</Label>
                <Input
                  id="oauth-customer-client-id"
                  placeholder="Enter customer client ID"
                  value={settings.oauthCustomerClientId || ""}
                  onChange={(e) => updateSetting("oauthCustomerClientId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oauth-customer-client-secret">Customer Client Secret</Label>
                <Input
                  id="oauth-customer-client-secret"
                  type="password"
                  placeholder="Enter customer client secret"
                  value={settings.oauthCustomerClientSecret || ""}
                  onChange={(e) => updateSetting("oauthCustomerClientSecret", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
