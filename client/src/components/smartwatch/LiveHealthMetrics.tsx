import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Activity, Droplet, BarChart, Clock, Wind } from "lucide-react";

// Create a WebSocket connection
// In a real app, this would be part of a service or custom hook
// and would have reconnection logic, authentication, etc.
const setupWebSocket = (onMessage: (data: any) => void) => {
  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/smartwatch`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    
    return socket;
  } catch (error) {
    console.error("Failed to setup WebSocket:", error);
    return null;
  }
};

// Define types for different health metrics
interface HealthMetric {
  value: number | string;
  timestamp: string;
  trend?: 'up' | 'down' | 'stable';
  range?: {
    min: number;
    max: number;
  };
  status?: 'normal' | 'warning' | 'alert';
}

interface LiveMetricsData {
  heartRate: HealthMetric;
  bloodPressure: HealthMetric;
  bloodOxygen: HealthMetric;
  steps: HealthMetric;
  sleep: HealthMetric;
  temperature: HealthMetric;
}

// Demo values - in a real app, these would come from the WebSocket
const demoData: LiveMetricsData = {
  heartRate: {
    value: 72,
    timestamp: new Date().toISOString(),
    trend: 'stable',
    range: { min: 60, max: 100 },
    status: 'normal'
  },
  bloodPressure: {
    value: '120/80',
    timestamp: new Date().toISOString(),
    trend: 'down',
    status: 'normal'
  },
  bloodOxygen: {
    value: 98,
    timestamp: new Date().toISOString(),
    trend: 'stable',
    range: { min: 95, max: 100 },
    status: 'normal'
  },
  steps: {
    value: 6542,
    timestamp: new Date().toISOString(),
    trend: 'up',
    range: { min: 0, max: 10000 },
    status: 'normal'
  },
  sleep: {
    value: '7h 23m',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    trend: 'up',
    status: 'normal'
  },
  temperature: {
    value: 98.6,
    timestamp: new Date().toISOString(),
    trend: 'stable',
    range: { min: 97, max: 99 },
    status: 'normal'
  }
};

// Helper to get color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'text-green-500';
    case 'warning':
      return 'text-amber-500';
    case 'alert':
      return 'text-red-500';
    default:
      return 'text-green-500';
  }
};

// Helper to get icon for trend
const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <span className="text-green-500">↑</span>;
    case 'down':
      return <span className="text-red-500">↓</span>;
    case 'stable':
      return <span className="text-gray-500">→</span>;
    default:
      return null;
  }
};

// Single metric card component
const MetricCard = ({ 
  title, 
  value, 
  status, 
  trend, 
  icon, 
  range, 
  lastUpdated 
}: { 
  title: string; 
  value: string | number; 
  status?: string; 
  trend?: string;
  icon: React.ReactNode;
  range?: { min: number; max: number };
  lastUpdated: string;
}) => {
  const statusColor = status ? getStatusColor(status) : '';
  const trendIcon = trend ? getTrendIcon(trend) : null;
  const progress = range && typeof value === 'number' 
    ? Math.round(((value - range.min) / (range.max - range.min)) * 100) 
    : undefined;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
          {trendIcon && <span className="ml-1">{trendIcon}</span>}
        </CardTitle>
        <CardDescription className="text-xs">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className={`text-2xl font-bold ${statusColor}`}>
            {value}
            {typeof value === 'number' && (
              <span className="text-sm font-normal ml-1">
                {title === 'Heart Rate' && 'bpm'}
                {title === 'Blood Oxygen' && '%'}
                {title === 'Temperature' && '°F'}
              </span>
            )}
          </div>
          {status && (
            <Badge variant={
              status === 'normal' 
                ? 'outline' 
                : status === 'warning' 
                ? 'secondary' 
                : 'destructive'
            }>
              {status}
            </Badge>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="h-2 mt-2" />
        )}
      </CardContent>
    </Card>
  );
};

export const LiveHealthMetrics = () => {
  const [metrics, setMetrics] = useState<LiveMetricsData>(demoData);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  useEffect(() => {
    // Setup WebSocket connection
    const socket = setupWebSocket((data) => {
      // In a real app, we would update the metrics based on the data received
      if (data.type === 'metric') {
        setMetrics(currentMetrics => ({
          ...currentMetrics,
          [data.metricType]: {
            value: data.value,
            timestamp: data.timestamp,
            trend: data.trend || 'stable',
            status: data.status || 'normal',
            range: data.range
          }
        }));
      }
    });
    
    setIsConnected(!!socket);
    
    // Clean up on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
  
  // In a real app, we would poll for updates if not connected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        // Simulate changing heart rate
        setMetrics(currentMetrics => ({
          ...currentMetrics,
          heartRate: {
            ...currentMetrics.heartRate,
            value: Math.floor(Math.random() * 20) + 65,
            timestamp: new Date().toISOString()
          }
        }));
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Live Health Metrics
        </CardTitle>
        <CardDescription>
          Real-time health metrics from your connected smartwatch
          {!isConnected && ' (Demo data)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Metrics</TabsTrigger>
            <TabsTrigger value="heart">Cardiac</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard 
                title="Heart Rate"
                value={metrics.heartRate.value}
                status={metrics.heartRate.status}
                trend={metrics.heartRate.trend}
                icon={<Heart className="h-4 w-4" />}
                range={metrics.heartRate.range}
                lastUpdated={metrics.heartRate.timestamp}
              />
              <MetricCard 
                title="Blood Pressure"
                value={metrics.bloodPressure.value}
                status={metrics.bloodPressure.status}
                trend={metrics.bloodPressure.trend}
                icon={<Activity className="h-4 w-4" />}
                lastUpdated={metrics.bloodPressure.timestamp}
              />
              <MetricCard 
                title="Blood Oxygen"
                value={metrics.bloodOxygen.value}
                status={metrics.bloodOxygen.status}
                trend={metrics.bloodOxygen.trend}
                icon={<Droplet className="h-4 w-4" />}
                range={metrics.bloodOxygen.range}
                lastUpdated={metrics.bloodOxygen.timestamp}
              />
              <MetricCard 
                title="Steps"
                value={metrics.steps.value}
                status={metrics.steps.status}
                trend={metrics.steps.trend}
                icon={<BarChart className="h-4 w-4" />}
                range={metrics.steps.range}
                lastUpdated={metrics.steps.timestamp}
              />
              <MetricCard 
                title="Sleep"
                value={metrics.sleep.value}
                status={metrics.sleep.status}
                trend={metrics.sleep.trend}
                icon={<Clock className="h-4 w-4" />}
                lastUpdated={metrics.sleep.timestamp}
              />
              <MetricCard 
                title="Temperature"
                value={metrics.temperature.value}
                status={metrics.temperature.status}
                trend={metrics.temperature.trend}
                icon={<Wind className="h-4 w-4" />}
                range={metrics.temperature.range}
                lastUpdated={metrics.temperature.timestamp}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="heart">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard 
                title="Heart Rate"
                value={metrics.heartRate.value}
                status={metrics.heartRate.status}
                trend={metrics.heartRate.trend}
                icon={<Heart className="h-4 w-4" />}
                range={metrics.heartRate.range}
                lastUpdated={metrics.heartRate.timestamp}
              />
              <MetricCard 
                title="Blood Pressure"
                value={metrics.bloodPressure.value}
                status={metrics.bloodPressure.status}
                trend={metrics.bloodPressure.trend}
                icon={<Activity className="h-4 w-4" />}
                lastUpdated={metrics.bloodPressure.timestamp}
              />
              <MetricCard 
                title="Blood Oxygen"
                value={metrics.bloodOxygen.value}
                status={metrics.bloodOxygen.status}
                trend={metrics.bloodOxygen.trend}
                icon={<Droplet className="h-4 w-4" />}
                range={metrics.bloodOxygen.range}
                lastUpdated={metrics.bloodOxygen.timestamp}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard 
                title="Steps"
                value={metrics.steps.value}
                status={metrics.steps.status}
                trend={metrics.steps.trend}
                icon={<BarChart className="h-4 w-4" />}
                range={metrics.steps.range}
                lastUpdated={metrics.steps.timestamp}
              />
              <MetricCard 
                title="Sleep"
                value={metrics.sleep.value}
                status={metrics.sleep.status}
                trend={metrics.sleep.trend}
                icon={<Clock className="h-4 w-4" />}
                lastUpdated={metrics.sleep.timestamp}
              />
              <MetricCard 
                title="Temperature"
                value={metrics.temperature.value}
                status={metrics.temperature.status}
                trend={metrics.temperature.trend}
                icon={<Wind className="h-4 w-4" />}
                range={metrics.temperature.range}
                lastUpdated={metrics.temperature.timestamp}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};