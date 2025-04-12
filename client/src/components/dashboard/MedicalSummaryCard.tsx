import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface MedicalSummaryCardProps {
  className?: string;
}

export default function MedicalSummaryCard({ className }: MedicalSummaryCardProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/medical-summary"],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Medical Summary</CardTitle>
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Medical Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Failed to load medical summary</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">
          Medical Summary
        </CardTitle>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          AI-generated summary based on your records
        </p>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="prose prose-sm max-w-none text-gray-700">
          {data?.summary ? (
            <>
              <div 
                className={showFullSummary ? "" : "line-clamp-6"}
                dangerouslySetInnerHTML={{ __html: data.summary }}
              />
              
              {data.summary.length > 300 && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-primary-600 hover:text-primary-800"
                  onClick={() => setShowFullSummary(!showFullSummary)}
                >
                  <ChevronDown className="mr-1 h-4 w-4" />
                  {showFullSummary ? "Show less" : "Read more"}
                </Button>
              )}
            </>
          ) : (
            <p className="italic text-gray-500">
              No medical records available to generate a summary. Upload your medical records to see an AI-generated summary of your health history.
            </p>
          )}
        </div>
        <div className="mt-4">
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm text-primary-600 hover:text-primary-800"
          >
            <ChevronDown className="mr-1 h-4 w-4" />
            View detailed health timeline
          </Button>
        </div>
        {data?.lastUpdated && (
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <Clock className="mr-1 h-3 w-3" />
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
