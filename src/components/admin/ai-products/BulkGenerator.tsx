"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Link,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Download,
  Trash2
} from "lucide-react";

type ImportSource = "csv" | "excel" | "urls" | "images" | "pdf";

interface BulkImportJob {
  id: string;
  source: ImportSource;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface BulkGeneratorProps {
  onImportComplete?: (jobs: BulkImportJob[]) => void;
  disabled?: boolean;
}

export function BulkGenerator({ onImportComplete, disabled = false }: BulkGeneratorProps) {
  const [activeTab, setActiveTab] = useState<ImportSource>("csv");
  const [jobs, setJobs] = useState<BulkImportJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlList, setUrlList] = useState<string[]>([]);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      setUrlList([...urlList, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const removeUrl = (index: number) => {
    setUrlList(urlList.filter((_, i) => i !== index));
  };

  const startImport = async (source: ImportSource) => {
    setIsProcessing(true);
    
    const totalItems = source === "csv" ? 50 : source === "urls" ? urlList.length : 25;
    
    const newJob: BulkImportJob = {
      id: Date.now().toString(),
      source,
      totalItems,
      processedItems: 0,
      failedItems: 0,
      status: "processing",
      progress: 0,
      startedAt: new Date(),
    };
    
    setJobs([newJob, ...jobs]);
    
    // Simulate processing
    const interval = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.id !== newJob.id) return job;
        
        const newProgress = Math.min(job.progress + 5, 100);
        const newProcessed = Math.floor((newProgress / 100) * totalItems);
        const newFailed = Math.floor(Math.random() * (newProcessed * 0.1));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return {
            ...job,
            processedItems: totalItems,
            failedItems: newFailed,
            status: newFailed > totalItems * 0.5 ? "failed" : "completed",
            progress: 100,
            completedAt: new Date(),
          };
        }
        
        return {
          ...job,
          processedItems: newProcessed,
          failedItems: newFailed,
          progress: newProgress,
        };
      }));
    }, 200);
  };

  const cancelJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: "cancelled" as const } : job
    ));
  };

  const retryJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      startImport(job.source);
    }
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-blue-600";
      case "failed": return "text-red-600";
      case "cancelled": return "text-gray-600";
      default: return "text-amber-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4 animate-spin" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bulk Product Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ImportSource)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="excel">Excel</TabsTrigger>
              <TabsTrigger value="urls">URLs</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-4 mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload CSV file with product data
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  disabled={disabled}
                  className="max-w-xs mx-auto"
                />
                {csvFile && (
                  <p className="text-sm font-medium mt-2">{csvFile.name}</p>
                )}
              </div>
              <Button
                onClick={() => startImport("csv")}
                disabled={!csvFile || disabled || isProcessing}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start CSV Import
              </Button>
            </TabsContent>

            <TabsContent value="excel" className="space-y-4 mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload Excel file with product data
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  disabled={disabled}
                  className="max-w-xs mx-auto"
                />
              </div>
              <Button
                onClick={() => startImport("excel")}
                disabled={disabled || isProcessing}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Excel Import
              </Button>
            </TabsContent>

            <TabsContent value="urls" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter product URL"
                    value={urlInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrlInput(e.target.value)}
                    disabled={disabled}
                    onKeyPress={(e) => e.key === "Enter" && addUrl()}
                  />
                  <Button onClick={addUrl} disabled={disabled}>
                    Add
                  </Button>
                </div>
                {urlList.length > 0 && (
                  <div className="space-y-2">
                    {urlList.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{url}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrl(index)}
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={() => startImport("urls")}
                disabled={urlList.length === 0 || disabled || isProcessing}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start URL Import ({urlList.length} items)
              </Button>
            </TabsContent>

            <TabsContent value="images" className="space-y-4 mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload product images for AI analysis
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={disabled}
                  className="max-w-xs mx-auto"
                />
              </div>
              <Button
                onClick={() => startImport("images")}
                disabled={disabled || isProcessing}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Image Import
              </Button>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-4 mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload PDF catalog for product extraction
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  disabled={disabled}
                  className="max-w-xs mx-auto"
                />
              </div>
              <Button
                onClick={() => startImport("pdf")}
                disabled={disabled || isProcessing}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start PDF Import
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Import Jobs ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{job.source} Import</p>
                        <p className="text-sm text-muted-foreground">
                          {job.processedItems}/{job.totalItems} items
                          {job.failedItems > 0 && ` (${job.failedItems} failed)`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={job.status === "completed" ? "default" : "outline"}>
                      {job.status}
                    </Badge>
                  </div>
                  
                  {job.status === "processing" && (
                    <Progress value={job.progress} className="h-2" />
                  )}
                  
                  {job.error && (
                    <p className="text-sm text-red-600">{job.error}</p>
                  )}
                  
                  <div className="flex gap-2">
                    {job.status === "processing" && (
                      <Button variant="outline" size="sm" onClick={() => cancelJob(job.id)} disabled={disabled}>
                        <Pause className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    {job.status === "failed" && (
                      <Button variant="outline" size="sm" onClick={() => retryJob(job.id)} disabled={disabled}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    {job.status === "completed" && (
                      <Button variant="outline" size="sm" disabled={disabled}>
                        <Download className="h-4 w-4 mr-1" />
                        Export Results
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteJob(job.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
