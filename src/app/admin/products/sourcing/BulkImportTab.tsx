"use client";

import { useState } from "react";
import { fetchExternalProductAction, bulkImportProductsAction } from "@/actions/sourcing";
import { ExternalProduct } from "@/lib/sourcing/types";
import { Check, AlertTriangle, XCircle, Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type BulkItem = {
  id: string;
  externalProduct: ExternalProduct | null;
  status: "READY" | "DUPLICATE" | "INVALID" | "API ERROR" | "PENDING";
  error?: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  selected: boolean;
};

export function BulkImportTab({ categories, mode, provider }: { categories: { id: string; name: string }[], mode: string, provider: string }) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<BulkItem[]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [globalCategoryId, setGlobalCategoryId] = useState("");

  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number; failed: number } | null>(null);

  const handleValidate = async () => {
    const lines = inputText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    setValidating(true);
    setImportResult(null);

    const initialItems: BulkItem[] = lines.map(line => ({
      id: line,
      externalProduct: null,
      status: "PENDING",
      categoryId: globalCategoryId || (categories[0]?.id || ""),
      costPrice: 0,
      sellingPrice: 0,
      selected: false,
    }));

    setItems([...initialItems]);

    for (let i = 0; i < initialItems.length; i++) {
      const item = initialItems[i];
      try {
        const res = await fetchExternalProductAction(item.id, provider);
        
        setItems(prev => {
          const newItems = [...prev];
          if (res.success && res.data) {
            newItems[i].externalProduct = res.data;
            newItems[i].costPrice = res.data.originalPrice || 0;
            newItems[i].sellingPrice = (res.data.originalPrice || 0) * 1.5;
            newItems[i].status = "READY";
            newItems[i].selected = true;
          } else {
            newItems[i].status = "API ERROR";
            newItems[i].error = res.error;
          }
          return newItems;
        });
      } catch (e: any) {
        setItems(prev => {
          const newItems = [...prev];
          newItems[i].status = "API ERROR";
          newItems[i].error = e.message;
          return newItems;
        });
      }
    }
    
    setValidating(false);
  };

  const handleApplyGlobalCategory = () => {
    if (!globalCategoryId) return;
    setItems(prev => prev.map(item => item.selected ? { ...item, categoryId: globalCategoryId } : item));
  };

  const toggleSelectAll = () => {
    const allSelected = items.every(i => i.selected);
    setItems(prev => prev.map(i => ({ ...i, selected: i.status === "READY" ? !allSelected : false })));
  };

  const handleImport = async () => {
    const selectedItems = items.filter(i => i.selected && i.status === "READY" && i.externalProduct);
    if (selectedItems.length === 0) return;

    if (!confirm(`${selectedItems.length} real products will be imported as Drafts.`)) return;

    setImporting(true);

    const payload = selectedItems.map(i => ({
      externalProduct: i.externalProduct!,
      categoryId: i.categoryId,
      costPrice: i.costPrice,
      sellingPrice: i.sellingPrice,
    }));

    const res = await bulkImportProductsAction({ items: payload });
    
    if (res.success && res.data) {
      setImportResult({
        imported: res.data.valid,
        duplicates: 0,
        failed: res.data.invalid,
      });
      // Deselect imported
      setItems(prev => prev.map(i => i.selected ? { ...i, selected: false, status: "INVALID" } : i));
    } else {
      alert(res.error || "Bulk import failed");
    }

    setImporting(false);
  };

  const readyCount = items.filter(i => i.status === "READY").length;
  const selectedCount = items.filter(i => i.selected).length;
  const errorCount = items.filter(i => i.status === "API ERROR" || i.status === "INVALID").length;

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-6 bg-card text-card-foreground">
        <h3 className="text-lg font-medium mb-4">Bulk Import Products</h3>
        <p className="text-sm text-muted-foreground mb-4">Paste Product URLs or IDs (one per line). Supported provider: {provider}</p>
        
        <textarea
          className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          placeholder="https://...&#10;https://...&#10;DEMO-001"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          disabled={validating || importing}
        />

        <div className="flex gap-4 mt-4 items-center">
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-6"
            onClick={handleValidate}
            disabled={validating || importing || !inputText.trim()}
          >
            {validating ? (
              <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/> Validating...</span>
            ) : (
              <span className="flex items-center gap-2"><Search className="w-4 h-4"/> Validate Batch</span>
            )}
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="rounded-md border bg-card">
          <div className="p-4 border-b flex items-center justify-between bg-muted/50">
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-primary">Selected: {selectedCount}</span>
              <span className="text-emerald-600">Ready: {readyCount}</span>
              <span className="text-destructive">Errors: {errorCount}</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={globalCategoryId}
                onChange={e => setGlobalCategoryId(e.target.value)}
              >
                <option value="">Select Category for Selected...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button 
                onClick={handleApplyGlobalCategory}
                className="text-xs bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/80"
              >
                Apply
              </button>
              
              <button
                className="text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 ml-4 disabled:opacity-50"
                onClick={handleImport}
                disabled={importing || selectedCount === 0}
              >
                {importing ? "Importing..." : `Import ${selectedCount} Products`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedCount > 0 && selectedCount === readyCount} />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Cost (DH)</th>
                  <th className="px-4 py-3">Price (DH)</th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className={`border-b ${item.status === "API ERROR" ? "bg-destructive/5" : ""}`}>
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        disabled={item.status !== "READY"}
                        onChange={e => {
                          setItems(prev => {
                            const newItems = [...prev];
                            newItems[idx].selected = e.target.checked;
                            return newItems;
                          });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.externalProduct?.images?.[0] ? (
                          <img src={item.externalProduct.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-muted-foreground"/></div>
                        )}
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate" title={item.externalProduct?.title || item.id}>
                            {item.externalProduct?.title || item.id}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.externalProduct?.supplierName || "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "READY" ? (
                        <input 
                          type="number" 
                          className="w-20 border rounded px-2 py-1 text-xs" 
                          value={item.costPrice} 
                          onChange={e => setItems(prev => {
                            const newItems = [...prev];
                            newItems[idx].costPrice = Number(e.target.value);
                            return newItems;
                          })} 
                        />
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "READY" ? (
                        <input 
                          type="number" 
                          className="w-20 border rounded px-2 py-1 text-xs" 
                          value={item.sellingPrice} 
                          onChange={e => setItems(prev => {
                            const newItems = [...prev];
                            newItems[idx].sellingPrice = Number(e.target.value);
                            return newItems;
                          })} 
                        />
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.status === "READY" && item.costPrice > 0 ? (
                        <span className="text-emerald-600">
                          {(((item.sellingPrice - item.costPrice) / item.costPrice) * 100).toFixed(0)}%
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "READY" && (
                        <select
                          className="w-32 border rounded px-2 py-1 text-xs"
                          value={item.categoryId}
                          onChange={e => setItems(prev => {
                            const newItems = [...prev];
                            newItems[idx].categoryId = e.target.value;
                            return newItems;
                          })}
                        >
                          <option value="">Select...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "READY" && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded font-bold">READY</span>}
                      {item.status === "PENDING" && <span className="text-muted-foreground text-[10px] font-bold"><RefreshCw className="w-3 h-3 animate-spin inline mr-1"/></span>}
                      {item.status === "API ERROR" && <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-1 rounded font-bold" title={item.error}>ERROR</span>}
                      {item.status === "INVALID" && <span className="bg-destructive/10 text-destructive text-[10px] px-2 py-1 rounded font-bold">INVALID</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-md text-emerald-900">
          <h4 className="font-bold flex items-center gap-2 mb-2"><Check className="w-5 h-5"/> Import Complete</h4>
          <p className="text-sm">✓ Imported as Drafts: <strong>{importResult.imported}</strong></p>
          {importResult.failed > 0 && <p className="text-sm text-destructive mt-1">✕ Failed/Duplicates: <strong>{importResult.failed}</strong></p>}
          
          <button 
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700 font-medium"
            onClick={() => router.push("/admin/products")}
          >
            View Imported Products
          </button>
        </div>
      )}

    </div>
  );
}
