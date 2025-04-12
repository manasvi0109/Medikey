import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalRecord } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Clock, Clipboard, Download, FileText, Loader2, Maximize2, MessageSquare, Minimize2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordViewerProps {
  record: MedicalRecord;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordViewer({ record, isOpen, onClose }: RecordViewerProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get AI summary for this record if it doesn't already have one
  const { data: aiSummary, isLoading: summaryLoading } = useQuery({
    queryKey: [`/api/records/${record.id}/summary`],
    enabled: !record.aiSummary,
  });

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/records/${record.id}/generate-summary`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/records/${record.id}/summary`] });
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "Summary generated",
        description: "AI summary has been generated for this record.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate summary: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle fullscreen mode
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Determine file type for preview
  const getFileType = () => {
    const ext = record.fileName.split('.').pop()?.toLowerCase();
    if (["pdf"].includes(ext || "")) return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
    if (["doc", "docx", "txt", "rtf"].includes(ext || "")) return "document";
    return "unsupported";
  };

  const fileType = getFileType();

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      className={cn(isFullscreen ? "fixed inset-0 z-50 bg-background" : "")}
    >
      <DialogContent 
        className={cn(
          "sm:max-w-[700px] p-0 overflow-hidden",
          isFullscreen ? "w-screen h-screen max-w-none max-h-none rounded-none" : ""
        )}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <DialogTitle className="text-lg">{record.title}</DialogTitle>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="preview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b">
            <div className="flex items-center justify-between px-4">
              <TabsList className="mt-2">
                <TabsTrigger value="preview" className="data-[state=active]:bg-background">
                  <FileText className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="summary" className="data-[state=active]:bg-background">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  AI Summary
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-background">
                  <Clipboard className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
          
          <TabsContent value="preview" className="m-0">
            <div className={cn(
              "flex flex-col justify-center items-center bg-gray-50",
              isFullscreen ? "h-[calc(100vh-120px)]" : "h-[500px]"
            )}>
              {fileType === "image" ? (
                <img 
                  src={`data:${record.fileType};base64,${record.fileContent}`} 
                  alt={record.title} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : fileType === "pdf" ? (
                <iframe 
                  src={`data:${record.fileType};base64,${record.fileContent}`} 
                  className="w-full h-full" 
                  title={record.title}
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
                  <p className="text-gray-500 mb-4">
                    This file type cannot be previewed directly. Please download the file to view its contents.
                  </p>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="summary" className="m-0">
            <div className={cn(
              "p-6 overflow-auto bg-white",
              isFullscreen ? "h-[calc(100vh-120px)]" : "h-[500px]"
            )}>
              {record.aiSummary ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-medium text-gray-900">AI-Generated Summary</h3>
                    <div dangerouslySetInnerHTML={{ __html: record.aiSummary }} />
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      Generated on {format(new Date(record.createdAt), "MMMM d, yyyy")}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateSummaryMutation.mutate()}
                      disabled={generateSummaryMutation.isPending}
                    >
                      {generateSummaryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Regenerate Summary
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : summaryLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
                  <p className="text-gray-600">Analyzing document...</p>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-medium text-gray-900">AI-Generated Summary</h3>
                    <div dangerouslySetInnerHTML={{ __html: aiSummary }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Available</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    Generate an AI-powered summary to quickly understand the key points in this document.
                  </p>
                  <Button
                    onClick={() => generateSummaryMutation.mutate()}
                    disabled={generateSummaryMutation.isPending}
                  >
                    {generateSummaryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="m-0">
            <div className={cn(
              "p-6 overflow-auto bg-white",
              isFullscreen ? "h-[calc(100vh-120px)]" : "h-[500px]"
            )}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Record Type</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1).replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Record Date</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(record.recordDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Provider</h3>
                  <p className="mt-1 text-sm text-gray-900">{record.provider}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Provider Type</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {record.providerType || "Not specified"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {record.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">File Name</h3>
                  <p className="mt-1 text-sm text-gray-900">{record.fileName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">File Size</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatFileSize(record.fileSize)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                  <div className="mt-1">
                    {record.tags && record.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {record.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No tags</p>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(record.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
