import { useState } from "react";
import { MedicalRecord } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Download, Eye, FileText, MoreVertical, Share2, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, RecordTypeIcon, formatFileSize } from "./RecordBadge";

interface RecordListProps {
  records: MedicalRecord[];
  onRecordSelect: (record: MedicalRecord) => void;
}

export default function RecordList({ records, onRecordSelect }: RecordListProps) {
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteRecordMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      toast({
        title: "Record deleted",
        description: "The medical record has been deleted successfully.",
      });
      setRecordToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteRecordMutation.mutate(recordToDelete.id);
    }
  };

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="overflow-hidden">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center">
              <div className={cn(
                "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                record.recordType === "prescription"
                  ? "bg-green-100"
                  : record.recordType === "lab_report"
                    ? "bg-primary-100"
                    : record.recordType === "diagnostic_image"
                      ? "bg-purple-100"
                      : "bg-blue-100"
              )}>
                <RecordTypeIcon type={record.recordType} />
              </div>

              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{record.title}</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <span>{record.provider}</span>
                      <span className="mx-1">•</span>
                      <span>{format(new Date(record.recordDate), "MMMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge type={record.recordType} />
                  </div>
                </div>

                {record.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{record.description}</p>
                )}

                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span className="truncate">{record.fileName}</span>
                  <span className="mx-1">•</span>
                  <span>{formatFileSize(record.fileSize)}</span>

                  {record.tags && record.tags.length > 0 && (
                    <div className="ml-4 flex flex-wrap gap-1">
                      {record.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 flex-shrink-0 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRecordSelect(record)}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRecordSelect(record)}>
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" /> Share Record
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setRecordToDelete(record)}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Delete Record
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone and the record will be permanently removed from your medical history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={deleteRecordMutation.isPending}
            >
              {deleteRecordMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Using the imported RecordTypeIcon from RecordBadge.tsx

// Using the imported Badge from RecordBadge.tsx

// Using the imported formatFileSize from RecordBadge.tsx
