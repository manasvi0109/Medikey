import { useState } from "react";
import RecordList from "@/components/records/RecordList";
import RecordUploadModal from "@/components/records/RecordUploadModal";
import RecordViewer from "@/components/records/RecordViewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalRecord } from "@shared/schema";
import { Plus, Search, Filter } from "lucide-react";

export default function Records() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");

  const { data: records, isLoading } = useQuery({
    queryKey: ["/api/records"],
  });

  const filteredRecords = records
    ? records.filter((record: MedicalRecord) => {
        const matchesSearch =
          record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          record.provider.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = recordTypeFilter === "all" || record.recordType === recordTypeFilter;

        return matchesSearch && matchesType;
      })
    : [];

  const recordTypes = records
    ? Array.from(new Set(records.map((record: MedicalRecord) => record.recordType)))
    : [];

  return (
    <>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all your medical documents in one place
            </p>
          </div>
          <Button 
            className="mt-4 sm:mt-0 flex items-center" 
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Record
          </Button>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow overflow-hidden p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select 
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={recordTypeFilter}
                onChange={(e) => setRecordTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="lab_reports">Lab Reports</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="w-full">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <RecordList 
                records={filteredRecords} 
                onRecordSelect={(record) => setSelectedRecord(record)} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="prescriptions">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <RecordList 
                records={filteredRecords.filter((r: MedicalRecord) => r.recordType === 'prescription')} 
                onRecordSelect={(record) => setSelectedRecord(record)} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="lab_reports">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <RecordList 
                records={filteredRecords.filter((r: MedicalRecord) => r.recordType === 'lab_report')} 
                onRecordSelect={(record) => setSelectedRecord(record)} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="diagnostics">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <RecordList 
                records={filteredRecords.filter((r: MedicalRecord) => r.recordType === 'diagnostic_image')} 
                onRecordSelect={(record) => setSelectedRecord(record)} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="summaries">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <RecordList 
                records={filteredRecords.filter((r: MedicalRecord) => r.recordType === 'summary')} 
                onRecordSelect={(record) => setSelectedRecord(record)} 
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <RecordUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {selectedRecord && (
        <RecordViewer 
          record={selectedRecord} 
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </>
  );
}
