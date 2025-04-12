import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, File, Loader2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RecordUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordUploadModal({ isOpen, onClose }: RecordUploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordType, setRecordType] = useState("");
  const [provider, setProvider] = useState("");
  const [providerType, setProviderType] = useState("");
  const [recordDate, setRecordDate] = useState<Date | undefined>(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadRecordMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      try {
        const response = await apiRequest("POST", "/api/records", formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return response;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "Record uploaded",
        description: "Your medical record has been uploaded successfully.",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: `Failed to upload record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRecordType("");
    setProvider("");
    setProviderType("");
    setRecordDate(new Date());
    setTags([]);
    setCurrentTag("");
    setFile(null);
    setUploadProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !recordType || !provider || !recordDate || !file) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("recordType", recordType);
    formData.append("provider", provider);
    if (providerType) formData.append("providerType", providerType);
    formData.append("recordDate", recordDate!.toISOString());
    if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
    formData.append("file", file);

    uploadRecordMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Medical Record</DialogTitle>
          <DialogDescription>
            Add a new medical record to your health portfolio.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title" className="text-right">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Annual Blood Test Results"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this record"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="recordType" className="text-right">
                  Record Type <span className="text-red-500">*</span>
                </Label>
                <Select value={recordType} onValueChange={setRecordType} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="diagnostic_image">Diagnostic Image</SelectItem>
                    <SelectItem value="summary">Medical Summary</SelectItem>
                    <SelectItem value="vaccination">Vaccination Record</SelectItem>
                    <SelectItem value="insurance">Insurance Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="recordDate" className="text-right">
                  Record Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !recordDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recordDate ? format(recordDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={recordDate}
                      onSelect={setRecordDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="provider" className="text-right">
                  Provider Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="E.g., Dr. Smith, City Hospital"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="providerType" className="text-right">
                  Provider Type
                </Label>
                <Input
                  id="providerType"
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  placeholder="E.g., Hospital, Clinic, Laboratory"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags" className="text-right">
                Tags (Press Enter to add)
              </Label>
              <div className="flex items-center mt-1">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="E.g., diabetes, cardiology"
                  className="flex-grow"
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="file" className="text-right">
                Upload File <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  required
                />
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  {file ? (
                    <div className="flex items-center justify-center flex-col">
                      <File className="h-8 w-8 text-primary-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setFile(null)}
                      >
                        Remove file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center flex-col">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop your file here, or
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse files
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX, CSV, TXT
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isUploading && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              disabled={uploadRecordMutation.isPending}
            >
              Reset Form
            </Button>
            <Button 
              type="submit"
              disabled={uploadRecordMutation.isPending}
            >
              {uploadRecordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Record
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
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
