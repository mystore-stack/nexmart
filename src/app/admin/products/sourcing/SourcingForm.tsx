"use client";

import { useState, useEffect } from "react";
import { fetchExternalProductAction, importProductAction, getSourcingModeAction, searchDemoProductsAction, clearDemoDataAction } from "@/actions/sourcing";
import { ExternalProduct } from "@/lib/sourcing/types";
import { useRouter } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";
import { BulkImportTab } from "./BulkImportTab";
import { CsvBulkImportTab } from "./CsvBulkImportTab";

export function SourcingForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SINGLE" | "BULK" | "CSV">("CSV");
  const [mode, setMode] = useState<"LIVE" | "DEMO" | "CONFIGURATION_REQUIRED" | "LOADING">("LOADING");
  const [provider, setProvider] = useState("ALIEXPRESS");
  const [urlOrId, setUrlOrId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [externalProduct, setExternalProduct] = useState<ExternalProduct | null>(null);
  const [demoResults, setDemoResults] = useState<ExternalProduct[]>([]);
  
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    getSourcingModeAction().then(mode => {
      setMode(mode as any);
      // Only set DEMO provider if explicitly in DEMO mode
      // CONFIGURATION_REQUIRED should not auto-switch to DEMO
    });
  }, []);

  const handleSearch = async () => {
    if (!urlOrId) return;
    setLoading(true);
    setError("");
    setExternalProduct(null);
    setDemoResults([]);

    // Only allow demo search in DEMO mode, not CONFIGURATION_REQUIRED
    if (mode === "DEMO") {
      const res = await searchDemoProductsAction(urlOrId);
      if (res.success && res.data) {
        setDemoResults(res.data);
      }
    } else if (mode === "LIVE") {
      await handleFetch(urlOrId);
    } else {
      setError("Please configure API credentials or use CSV import for real products.");
    }
    setLoading(false);
  };

  const handleFetch = async (id: string) => {
    setLoading(true);
    setError("");
    setExternalProduct(null);

    const res = await fetchExternalProductAction(id, provider);
    if (res.success && res.data) {
      setExternalProduct(res.data);
      setCostPrice(res.data.originalPrice || 0);
      setSellingPrice((res.data.originalPrice || 0) * 1.5);
    } else {
      setError(res.error || "Failed to fetch product");
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!externalProduct || !categoryId) return;
    setImporting(true);
    setError("");

    const res = await importProductAction({
      externalProduct,
      sellingPrice,
      costPrice,
      categoryId,
    });

    if (res.success) {
      alert(mode === "DEMO" ? "✓ Demo import successful\n\nSource: DEMO\nStatus: TEST ONLY\nCustomer visibility: DISABLED" : "Import successful");
      router.push("/admin/products");
    } else {
      setError(res.error || "Failed to import product");
    }
    setImporting(false);
  };

  const handleClearDemoData = async () => {
    if (mode !== "DEMO") return;
    if (confirm("Delete all Demo products? This will not affect real products.")) {
      setClearing(true);
      const res = await clearDemoDataAction();
      if (res.success) {
        alert("Demo data cleared successfully.");
      } else {
        alert(res.error || "Failed to clear demo data");
      }
      setClearing(false);
    }
  };

  const margin = sellingPrice - costPrice;
  const marginPercent = costPrice > 0 ? (margin / costPrice) * 100 : 0;

  if (mode === "LOADING") return <div className="p-4">Loading mode...</div>;

  return (
    <div className="space-y-6">
      {mode === "CONFIGURATION_REQUIRED" ? (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-md flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900">CONFIGURATION REQUIRED</h3>
            <p className="text-blue-800 text-sm">AliExpress API credentials are not configured. Use CSV import for real products or configure API credentials in environment variables.</p>
          </div>
        </div>
      ) : mode === "DEMO" ? (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-md flex justify-between items-center">
          <div>
            <h3 className="font-bold text-amber-900">DEMO MODE</h3>
            <p className="text-amber-800 text-sm">Test data only. Live credentials are missing.</p>
          </div>
          <button 
            onClick={handleClearDemoData}
            disabled={clearing}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            {clearing ? "Clearing..." : "Clear Demo Data"}
          </button>
        </div>
      ) : (
        <div className="bg-emerald-100 border-l-4 border-emerald-500 p-4 rounded-r-md">
          <h3 className="font-bold text-emerald-900">LIVE MODE</h3>
          <p className="text-emerald-800 text-sm">Connected to AliExpress API.</p>
        </div>
      )}

      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "CSV" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("CSV")}
        >
          CSV Import (500 Products)
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "SINGLE" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("SINGLE")}
        >
          Single Import
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "BULK" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("BULK")}
        >
          Bulk Import
        </button>
      </div>

      {activeTab === "CSV" ? (
        <CsvBulkImportTab categories={categories} />
      ) : activeTab === "BULK" ? (
        <BulkImportTab categories={categories} mode={mode} provider={provider} />
      ) : (
        <>
          <div className="rounded-md border p-6 bg-card text-card-foreground">
        <h3 className="text-lg font-medium mb-4">Find Product</h3>
        <div className="flex space-x-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={mode === "DEMO"}
            >
              <option value="ALIEXPRESS">AliExpress</option>
              {mode === "DEMO" && <option value="DEMO">Demo Data</option>}
            </select>
          </div>
          <div className="flex-[3] space-y-2">
            <label className="text-sm font-medium">Search / Product ID</label>
            <input
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={urlOrId}
              onChange={(e) => setUrlOrId(e.target.value)}
              placeholder={mode === "DEMO" ? "e.g., watch or DEMO-001" : "https://..."}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2"
            onClick={handleSearch}
            disabled={loading || !urlOrId}
          >
            {loading ? "Searching..." : <span className="flex items-center gap-2"><Search className="w-4 h-4"/> Search</span>}
          </button>
        </div>
        {error && <div className="mt-4 p-4 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
      </div>

      {demoResults.length > 0 && !externalProduct && (
        <div className="rounded-md border p-6 bg-card">
          <h3 className="text-lg font-medium mb-4">Demo Results</h3>
          <div className="space-y-4">
            {demoResults.map(p => (
              <div key={p.externalProductId} className="flex gap-4 p-4 border rounded-md items-center">
                <img src={p.images[0]} alt={p.title} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium">{p.title} <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">DEMO PRODUCT</span></h4>
                  <p className="text-sm text-muted-foreground">${p.originalPrice} • Stock: {p.stock} • Rating: {p.rating}</p>
                </div>
                <button 
                  onClick={() => {
                    setDemoResults([]);
                    handleFetch(p.externalProductId);
                  }}
                  className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {externalProduct && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* External Data Preview */}
          <div className="rounded-md border p-6 bg-card relative overflow-hidden">
            {mode === "DEMO" && (
              <div className="absolute top-4 right-[-35px] rotate-45 bg-amber-500 text-white text-[10px] font-bold py-1 px-10 shadow-sm z-10">
                DEMO DATA
              </div>
            )}
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              External Product Details
              {mode === "DEMO" && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase font-bold">NOT LIVE ALIEXPRESS DATA</span>}
            </h3>
            <div className="space-y-4">
              {externalProduct.images?.[0] && (
                <img src={externalProduct.images[0]} alt="Product" className="w-full max-h-64 object-cover rounded-md" />
              )}
              <div>
                <p className="font-semibold">{externalProduct.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{externalProduct.description}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span>Supplier: {externalProduct.supplierName || "Unknown"}</span>
                <span>Original Price: {externalProduct.currency} {externalProduct.originalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Stock: {externalProduct.stock || "N/A"}</span>
                <span>Rating: {externalProduct.rating || "N/A"}</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground pt-2 border-t">
                ID: {externalProduct.externalProductId} | Source: {externalProduct.source}
              </div>
            </div>
          </div>

          {/* NexMart Config */}
          <div className="rounded-md border p-6 bg-card">
            <h3 className="text-lg font-medium mb-4">NexMart Import Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="" disabled>Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Price (DH)</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selling Price (DH)</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Gross Margin:</span>
                  <span className="font-medium">{margin.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margin %:</span>
                  <span className="font-medium">{marginPercent.toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled>
                  <option>Draft {mode === "DEMO" && "(TEST ONLY)"}</option>
                </select>
                <p className="text-xs text-muted-foreground">Imported products are always saved as Draft.</p>
              </div>

              <button
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 mt-4"
                onClick={handleImport}
                disabled={importing || !categoryId}
              >
                {importing ? "Importing..." : "Import Product to NexMart"}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
