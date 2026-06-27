"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { 
  Download, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileJson,
  FileSpreadsheet
} from "lucide-react";

type ExportFormat = "json" | "csv" | "excel" | "pdf";
type ImportFormat = "json" | "csv" | "excel";

interface ExportImportProps {
  onExport?: (format: ExportFormat, data: any) => void;
  onImport?: (format: ImportFormat, file: File) => void;
  disabled?: boolean;
}

export function ExportImport({ onExport, onImport, disabled = false }: ExportImportProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [exportScope, setExportScope] = useState<"all" | "selected" | "filtered">("all");
  const [importFormat, setImportFormat] = useState<ImportFormat>("json");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handleExport = async () => {
    setExportStatus("processing");
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const data = {
      products: [
        { id: 1, name: "Moroccan Vase", price: 150, category: "Home" },
        { id: 2, name: "Leather Bag", price: 200, category: "Fashion" },
      ],
      metadata: {
        exportedAt: new Date().toISOString(),
        scope: exportScope,
        format: exportFormat,
      },
    };
    
    onExport?.(exportFormat, data);
    setExportStatus("success");
    
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setImportStatus("processing");
    
    // Simulate import
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onImport?.(importFormat, importFile);
    setImportStatus("success");
    
    setTimeout(() => {
      setImportStatus("idle");
      setImportFile(null);
    }, 3000);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "json": return <FileJson className="h-5 w-5" />;
      case "csv": return <FileText className="h-5 w-5" />;
      case "excel": return <FileSpreadsheet className="h-5 w-5" />;
      case "pdf": return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge variant="outline" className="animate-pulse">Processing...</Badge>;
      case "success":
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case "error":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export & Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "export" | "import")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)} disabled={disabled}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          JSON
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CSV
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF Report
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Export Scope</Label>
                  <Select value={exportScope} onValueChange={(v) => setExportScope(v as "all" | "selected" | "filtered")} disabled={disabled}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="selected">Selected Products</SelectItem>
                      <SelectItem value="filtered">Current Filter Results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Product data (name, description, price, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>AI-generated content</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>SEO analysis results</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Image metadata</span>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={disabled || exportStatus === "processing"}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                {getStatusBadge(exportStatus)}
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label>Import Format</Label>
                  <Select value={importFormat} onValueChange={(v) => setImportFormat(v as ImportFormat)} disabled={disabled}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          JSON
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          CSV
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Upload File</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Input
                      type="file"
                      accept={importFormat === "json" ? ".json" : importFormat === "csv" ? ".csv" : ".xlsx,.xls"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImportFile(e.target.files?.[0] || null)}
                      disabled={disabled}
                      className="max-w-xs mx-auto"
                    />
                    {importFile && (
                      <p className="text-sm font-medium mt-2">{importFile.name}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p className="font-medium mb-1">Import Notes</p>
                      <ul className="list-disc list-inside space-y-1 text-amber-800">
                        <li>Existing products with matching IDs will be updated</li>
                        <li>New products will be created</li>
                        <li>AI-generated content will be preserved</li>
                        <li>Review imported data before publishing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!importFile || disabled || importStatus === "processing"}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>

                {getStatusBadge(importStatus)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" disabled={disabled}>
              <FileJson className="h-5 w-5" />
              <span>Export All as JSON</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" disabled={disabled}>
              <FileSpreadsheet className="h-5 w-5" />
              <span>Export Report as Excel</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" disabled={disabled}>
              <ImageIcon className="h-5 w-5" />
              <span>Export Images Only</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" disabled={disabled}>
              <Database className="h-5 w-5" />
              <span>Backup All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
