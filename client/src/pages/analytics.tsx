import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Heart, Droplet, Scale, Stethoscope, Activity } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend
} from "recharts";

// Define the structure of the data returned from the API
interface HealthAnalyticsData {
  bloodPressure: {
    latest: string;
    change: number;
    data: {
      date: string;
      systolic: number;
      diastolic: number;
    }[];
  };
  bloodSugar: {
    latest: string;
    change: number;
    data: {
      date: string;
      value: number;
    }[];
  };
  weight: {
    latest: string;
    change: number;
    data: {
      date: string;
      value: number;
      bmi: number;
    }[];
  };
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("3m");
  
  const { data: metricsData, isLoading } = useQuery<HealthAnalyticsData>({
    queryKey: ["/api/health-metrics"],
  });

  // These arrays will contain the charting data
  // Access data from the nested structure
  const bloodPressureData = metricsData?.bloodPressure?.data || [];
  const bloodSugarData = metricsData?.bloodSugar?.data || [];
  const weightData = metricsData?.weight?.data || [];
  
  // For cholesterol, we'll use an empty array for now as it's not in our mock data
  const cholesterolData: any[] = [];

  // Values for the metrics cards 
  const latestBloodPressure = metricsData?.bloodPressure?.latest || null;
  const bloodPressureChange = metricsData?.bloodPressure?.change || 0;
  
  const latestBloodSugar = metricsData?.bloodSugar?.latest || null;
  const bloodSugarChange = metricsData?.bloodSugar?.change || 0;
  
  const latestWeight = metricsData?.weight?.latest || null;
  const weightChange = metricsData?.weight?.change || 0;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Health Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and monitor your health metrics over time
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Time Period:</span>
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Blood Pressure */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-500 truncate">Blood Pressure</h3>
                {latestBloodPressure ? (
                  <p className="text-2xl font-semibold text-gray-900">
                    {latestBloodPressure}
                    <span className="text-sm font-normal ml-2 text-gray-500">
                      {bloodPressureChange > 0 ? '↑' : '↓'} {Math.abs(bloodPressureChange)}%
                    </span>
                  </p>
                ) : (
                  <p className="text-lg text-gray-500">No data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Sugar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Droplet className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-500 truncate">Blood Sugar</h3>
                {latestBloodSugar ? (
                  <p className="text-2xl font-semibold text-gray-900">
                    {latestBloodSugar}
                    <span className="text-sm font-normal ml-2 text-gray-500">
                      {bloodSugarChange > 0 ? '↑' : '↓'} {Math.abs(bloodSugarChange)}%
                    </span>
                  </p>
                ) : (
                  <p className="text-lg text-gray-500">No data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight/BMI */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Scale className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-500 truncate">Weight / BMI</h3>
                {latestWeight ? (
                  <p className="text-2xl font-semibold text-gray-900">
                    {latestWeight}
                    <span className="text-sm font-normal ml-2 text-gray-500">
                      {weightChange > 0 ? '↑' : '↓'} {Math.abs(weightChange)}%
                    </span>
                  </p>
                ) : (
                  <p className="text-lg text-gray-500">No data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Health Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-500 truncate">Health Score</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  78/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="blood-pressure" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
          <TabsTrigger value="blood-sugar">Blood Sugar</TabsTrigger>
          <TabsTrigger value="weight">Weight & BMI</TabsTrigger>
          <TabsTrigger value="cholesterol">Cholesterol</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blood-pressure">
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure Trends</CardTitle>
              <CardDescription>
                Systolic and diastolic readings over time (mmHg)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {bloodPressureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bloodPressureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 160]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#3F83F8" strokeWidth={2} />
                    <Line type="monotone" dataKey="diastolic" stroke="#76A9FA" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No blood pressure data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blood-sugar">
          <Card>
            <CardHeader>
              <CardTitle>Blood Sugar Trends</CardTitle>
              <CardDescription>
                Fasting blood glucose readings over time (mg/dL)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {bloodSugarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bloodSugarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[70, 180]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#22C55E" fill="rgba(34, 197, 94, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No blood sugar data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weight">
          <Card>
            <CardHeader>
              <CardTitle>Weight & BMI Trends</CardTitle>
              <CardDescription>
                Weight (lbs) and BMI measurements over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[15, 35]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#9333EA" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#C084FC" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No weight data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cholesterol">
          <Card>
            <CardHeader>
              <CardTitle>Cholesterol Profile</CardTitle>
              <CardDescription>
                LDL, HDL, total cholesterol and triglycerides (mg/dL)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {cholesterolData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cholesterolData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ldl" fill="#EF4444" name="LDL" />
                    <Bar dataKey="hdl" fill="#10B981" name="HDL" />
                    <Bar dataKey="total" fill="#6366F1" name="Total" />
                    <Bar dataKey="triglycerides" fill="#F59E0B" name="Triglycerides" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No cholesterol data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Health Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Health Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-generated insights based on your health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              Your blood pressure readings are showing improvement over the past 3 months, with a 4% reduction in systolic pressure. 
              Continue with your current medication regimen and consider maintaining or slightly increasing your physical activity.
            </p>
            <p className="mb-3">
              Recent fasting blood sugar values are consistently within the normal range (70-100 mg/dL), 
              indicating good glycemic control. Continue with your current diet and monitoring schedule.
            </p>
            <p>
              Your BMI has decreased from 28.5 to 27.2, showing positive progress. 
              Consider scheduling your next cholesterol screening as your last one was over 6 months ago.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
