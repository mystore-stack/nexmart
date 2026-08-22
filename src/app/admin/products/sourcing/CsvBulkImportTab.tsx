"use client";

import { useState } from "react";
import { bulkImportCsvAction } from "@/actions/sourcing";
import { Upload, FileText, Check, AlertTriangle, XCircle, RefreshCw, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export function CsvBulkImportTab({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [csvData, setCsvData] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [margin, setMargin] = useState(0.5); // 50% default margin
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "validating" | "importing" | "complete" | "error">("idle");
  const [result, setResult] = useState<{
    imported: number;
    duplicates: number;
    invalid: number;
    outOfStock: number;
    noImage: number;
    totalFound: number;
    source: string;
    areDrafts: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      setError("Please provide CSV data");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    setImporting(true);
    setStatus("validating");
    setProgress(0);
    setError("");
    setResult(null);

    try {
      // Simulate progress for validation
      for (let i = 0; i <= 30; i += 10) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      setStatus("importing");
      
      const res = await bulkImportCsvAction({
        csvData,
        categoryId,
        defaultMargin: margin,
      });

      if (res.success && res.data) {
        setProgress(100);
        setStatus("complete");
        setResult(res.data);
      } else {
        setStatus("error");
        setError(res.error || "Import failed");
      }
    } catch (e: any) {
      setStatus("error");
      setError(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,description,price,currency,images,stock,category,brand,externalProductId,externalUrl,supplierName
"Premium Smartwatch","A high-end smartwatch with AMOLED display and 14-day battery life.",19.90,USD,"https://example.com/image1.jpg;https://example.com/image2.jpg",245,Electronics,TechBrand,PROD-001,https://supplier.com/item/001,TechSupplier
"Minimalist Stainless Steel Bracelet","Elegant, rust-proof minimalist bracelet suitable for all occasions.",8.50,USD,"https://example.com/bracelet.jpg",120,Fashion,FashionBrand,PROD-002,https://supplier.com/item/002,FashionCo
"Wireless Earbuds Pro","Active noise cancelling wireless earbuds with premium sound.",45.00,USD,"https://example.com/earbuds.jpg",85,Electronics,AudioBrand,PROD-003,https://supplier.com/item/003,SoundTech`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-6 bg-card text-card-foreground">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">CSV Bulk Import</h3>
          <button
            onClick={downloadTemplate}
            className="text-sm flex items-center gap-2 text-primary hover:underline"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Import up to 500 real products from a CSV file. All products will be imported as drafts and require admin approval before publishing.
        </p>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload CSV File</label>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {csvData ? "CSV file loaded" : "Click to upload or drag and drop"}
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={importing}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Default Category</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={importing}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Margin Setting */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Profit Margin: {(margin * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full"
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Selling price = Cost price × (1 + margin)
            </p>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={importing || !csvData.trim()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {status === "validating" ? "Validating..." : "Importing..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Real Products
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress */}
      {status !== "idle" && status !== "error" && (
        <div className="rounded-md border p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {status === "validating" && "Validating CSV data..."}
              {status === "importing" && "Importing products..."}
              {status === "complete" && "Import complete!"}
            </span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {status === "importing" && (
            <p className="text-xs text-muted-foreground mt-2">
              Processing in batches of 100 products...
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive">Import Failed</h4>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3 mb-4">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-emerald-900">Import Complete</h4>
              <p className="text-sm text-emerald-700 mt-1">
                Source: {result.source} · Products imported as drafts: {result.areDrafts ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <p className="text-emerald-600 font-semibold text-lg">{result.totalFound}</p>
              <p className="text-emerald-700">Total Found</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <p className="text-emerald-600 font-semibold text-lg">{result.imported}</p>
              <p className="text-emerald-700">Imported</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="text-orange-600 font-semibold text-lg">{result.duplicates}</p>
              <p className="text-orange-700">Duplicates</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <p className="text-red-600 font-semibold text-lg">{result.invalid}</p>
              <p className="text-red-700">Invalid</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-yellow-100">
              <p className="text-yellow-600 font-semibold text-lg">{result.outOfStock}</p>
              <p className="text-yellow-700">Out of Stock</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-purple-600 font-semibold text-lg">{result.noImage}</p>
              <p className="text-purple-700">No Image</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/products")}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Review Imported Products
          </button>
        </div>
      )}

      {/* CSV Format Info */}
      <div className="rounded-md border p-4 bg-muted/30">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Required CSV Format
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Required columns:</strong> title, price, externalProductId, images</p>
          <p><strong>Optional columns:</strong> description, currency, stock, category, brand, externalUrl, supplierName</p>
          <p><strong>Images:</strong> Separate multiple URLs with semicolons (;)</p>
          <p><strong>Important:</strong> All products must have at least one valid image URL</p>
        </div>
      </div>
    </div>
  );
}