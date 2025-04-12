import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Droplet, Scale } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function HealthAnalyticsSection() {
  const [timeRange, setTimeRange] = useState("3m");
  
  const { data: healthMetrics, isLoading, error } = useQuery({
    queryKey: ["/api/health-metrics", timeRange],
  });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Health Analytics</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Time Period:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Blood Pressure Chart */}
        <MetricCard
          title="Blood Pressure"
          value={healthMetrics?.bloodPressure?.latest || "128/82"}
          change={healthMetrics?.bloodPressure?.change || -4}
          isLoading={isLoading}
          error={error}
          icon={<Heart className="h-6 w-6 text-primary-600" />}
        >
          {healthMetrics?.bloodPressure?.data && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthMetrics.bloodPressure.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <Line type="monotone" dataKey="systolic" stroke="#3F83F8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="diastolic" stroke="#76A9FA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </MetricCard>

        {/* Blood Sugar Chart */}
        <MetricCard
          title="Blood Sugar"
          value={healthMetrics?.bloodSugar?.latest || "105 mg/dL"}
          change={healthMetrics?.bloodSugar?.change || -2}
          isLoading={isLoading}
          error={error}
          icon={<Droplet className="h-6 w-6 text-primary-600" />}
        >
          {healthMetrics?.bloodSugar?.data && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthMetrics.bloodSugar.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <Area type="monotone" dataKey="value" stroke="#22C55E" fill="rgba(34, 197, 94, 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </MetricCard>

        {/* Weight/BMI Chart */}
        <MetricCard
          title="Weight / BMI"
          value={healthMetrics?.weight?.latest || "165 lbs / 27.2"}
          change={healthMetrics?.weight?.change || -1.3}
          isLoading={isLoading}
          error={error}
          icon={<Scale className="h-6 w-6 text-primary-600" />}
        >
          {healthMetrics?.weight?.data && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthMetrics.weight.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <Line type="monotone" dataKey="value" stroke="#9333EA" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </MetricCard>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  isLoading: boolean;
  error: any;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function MetricCard({ title, value, change, isLoading, error, icon, children }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="ml-5 w-0 flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
              <p className="text-sm text-red-500">Failed to load data</p>
            </div>
          </div>
          <div className="h-24 bg-gray-50 rounded-md flex items-center justify-center">
            <p className="text-xs text-gray-500">Data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="flex items-center">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {change !== undefined && (
                <div className={cn(
                  "ml-2 flex items-center text-sm font-semibold",
                  change < 0 ? "text-green-600" : change > 0 ? "text-red-600" : "text-gray-600"
                )}>
                  <span className={cn(
                    "material-icons text-sm",
                    change < 0 ? "text-green-500" : change > 0 ? "text-red-500" : "text-gray-500"
                  )}>
                    {change < 0 ? "↓" : change > 0 ? "↑" : "→"}
                  </span>
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-24 bg-gray-50 rounded-md overflow-hidden">
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
