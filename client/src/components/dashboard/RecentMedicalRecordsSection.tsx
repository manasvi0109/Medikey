import { useState } from "react";
import { MedicalRecord } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Download, Eye, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import RecordViewer from "../records/RecordViewer";
import { cn } from "@/lib/utils";

export default function RecentMedicalRecordsSection() {
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/records/recent", page],
  });

  const records = data?.records || [];
  const totalRecords = data?.total || 0;
  const perPage = data?.perPage || 3;

  const maxPage = Math.ceil(totalRecords / perPage);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, maxPage));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Medical Records</h2>
        <Link href="/records">
          <a className="text-sm font-medium text-primary-600 hover:text-primary-800">
            View all records
          </a>
        </Link>
      </div>
      
      <Card className="shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <>
              <RecordItemSkeleton />
              <RecordItemSkeleton />
              <RecordItemSkeleton />
            </>
          ) : error ? (
            <li className="p-8 text-center">
              <p className="text-red-500 mb-2">Failed to load medical records</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </li>
          ) : records.length > 0 ? (
            records.map((record) => (
              <RecordItem 
                key={record.id} 
                record={record} 
                onViewClick={() => setSelectedRecord(record)} 
              />
            ))
          ) : (
            <li className="p-8 text-center">
              <p className="text-gray-500 mb-2">No medical records found</p>
              <Link href="/records">
                <Button>
                  Upload your first record
                </Button>
              </Link>
            </li>
          )}
        </ul>
        
        {records.length > 0 && (
          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalRecords)} of {totalRecords} records
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 text-gray-500 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= maxPage}
              >
                Next
                <ChevronRight className="h-4 w-4 text-gray-500 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Viewer Dialog */}
      {selectedRecord && (
        <RecordViewer
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

interface RecordItemProps {
  record: MedicalRecord;
  onViewClick: () => void;
}

function RecordItem({ record, onViewClick }: RecordItemProps) {
  return (
    <li>
      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
        <div className="flex items-center justify-between">
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
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{record.title}</div>
              <div className="text-sm text-gray-500">
                {record.provider} - {format(new Date(record.recordDate), "MMM d, yyyy")}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onViewClick}>
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewClick}>View details</DropdownMenuItem>
                <DropdownMenuItem>Download</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </li>
  );
}

function RecordTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "prescription":
      return (
        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12H15" />
          <path d="M12 9V15" />
          <path d="M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H15L21 10V18C21 19.1046 20.1046 20 19 20Z" />
          <path d="M17 4V10H21" />
        </svg>
      );
    case "lab_report":
      return (
        <svg className="h-5 w-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
          <path d="M8 10H16" />
          <path d="M8 14H12" />
          <path d="M8 18H16" />
          <path d="M8 6H16" />
        </svg>
      );
    case "diagnostic_image":
      return (
        <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15L16 10L5 21" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 3V7C14 7.55228 14.4477 8 15 8H19" />
          <path d="M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H14L19 8V19C19 20.1046 18.1046 21 17 21Z" />
          <path d="M9 7H10" />
          <path d="M9 13H15" />
          <path d="M9 17H15" />
        </svg>
      );
  }
}

function RecordItemSkeleton() {
  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-4">
              <Skeleton className="h-4 w-36 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </li>
  );
}
