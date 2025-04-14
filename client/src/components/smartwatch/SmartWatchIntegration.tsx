import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Heart, BarChart, CircleDashed, Waves, CheckCircle2, XCircle } from "lucide-react";
import { getConnectedSmartWatchDevices, sendCommandToSmartWatch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Supported smartwatch types
enum SmartWatchType {
  APPLE_WATCH = 'apple_watch',
  FITBIT = 'fitbit',
  SAMSUNG_GALAXY_WATCH = 'samsung_galaxy_watch',
  GARMIN = 'garmin',
  GENERIC = 'generic'
}

// For demonstration - URL to connect smartwatch
const getSmartWatchConnectUrl = (userId: number, deviceType: SmartWatchType) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/smartwatch?userId=${userId}&deviceType=${deviceType}`;
};

const SmartWatchTypeIcons = {
  [SmartWatchType.APPLE_WATCH]: <CircleDashed className="h-6 w-6" />,
  [SmartWatchType.FITBIT]: <Activity className="h-6 w-6" />,
  [SmartWatchType.SAMSUNG_GALAXY_WATCH]: <BarChart className="h-6 w-6" />,
  [SmartWatchType.GARMIN]: <Waves className="h-6 w-6" />,
  [SmartWatchType.GENERIC]: <Heart className="h-6 w-6" />
};

interface SmartWatchDevice {
  userId: number;
  deviceType: SmartWatchType;
  deviceId: string;
  lastSeen: Date;
}

export const SmartWatchIntegration = ({ userId }: { userId: number }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('connected');
  const queryClient = useQueryClient();

  // Query for connected devices
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/smartwatch/connected-devices'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Mutation for sending commands
  const sendCommandMutation = useMutation({
    mutationFn: ({ deviceId, command, data }: {deviceId: string, command: string, data: any}) =>
      sendCommandToSmartWatch(deviceId, command, data),
    onSuccess: () => {
      toast({
        title: "Command sent successfully",
        description: "The command has been sent to your smartwatch.",
      });
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/smartwatch/connected-devices'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send command",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle sending a command to a device
  const handleSendCommand = (deviceId: string, command: string, data: any = {}) => {
    sendCommandMutation.mutate({ deviceId, command, data });
  };

  // Generate QR code for connecting
  const renderSmartWatchConnectionInfo = () => {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(SmartWatchType).map(type => (
            <Card key={type} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {SmartWatchTypeIcons[type]}
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </CardTitle>
                <CardDescription>
                  Connect your {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} device
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm">
                  Use this connection URL in your smartwatch app:
                </p>
                <div className="mt-2 p-2 bg-secondary rounded text-xs font-mono break-all">
                  {getSmartWatchConnectUrl(userId, type)}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => {
                  navigator.clipboard.writeText(getSmartWatchConnectUrl(userId, type));
                  toast({
                    title: "URL copied to clipboard",
                    description: "You can now paste this URL in your smartwatch app."
                  });
                }}>
                  Copy URL
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Alert className="mt-6">
          <AlertTitle>How to connect your smartwatch</AlertTitle>
          <AlertDescription>
            <ol className="ml-6 list-decimal">
              <li>Install the MediKey companion app on your smartwatch</li>
              <li>Open the app and select "Connect to MediKey"</li>
              <li>Enter the URL provided above or scan the QR code</li>
              <li>Authorize the connection on your smartwatch</li>
              <li>Your health data will now sync automatically</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  // Render connected devices
  const renderConnectedDevices = () => {
    if (isLoading) {
      return <div className="py-8 text-center">Loading connected devices...</div>;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load connected devices. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    const connectedDevices = data?.connectedDevices || [];

    if (connectedDevices.length === 0) {
      return (
        <Alert className="my-4">
          <AlertTitle>No devices connected</AlertTitle>
          <AlertDescription>
            You don't have any smartwatches connected. Go to the "Connect Device" tab to set up a new connection.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {connectedDevices.map((device: SmartWatchDevice) => (
          <Card key={device.deviceId} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  {SmartWatchTypeIcons[device.deviceType]}
                  {device.deviceType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </CardTitle>
                <Badge variant="outline" className="ml-2">
                  {new Date(device.lastSeen).toLocaleTimeString()}
                </Badge>
              </div>
              <CardDescription>
                Device ID: {device.deviceId}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Real-time monitoring</span>
                <Switch
                  checked={true}
                  onCheckedChange={(checked) => {
                    handleSendCommand(device.deviceId, 'set_monitoring', { enabled: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Alerts enabled</span>
                <Switch
                  checked={true}
                  onCheckedChange={(checked) => {
                    handleSendCommand(device.deviceId, 'set_alerts', { enabled: checked });
                  }}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Currently monitoring:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Heart Rate</Badge>
                  <Badge variant="secondary">Blood Pressure</Badge>
                  <Badge variant="secondary">Blood Oxygen</Badge>
                  <Badge variant="secondary">Activity</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => {
                handleSendCommand(device.deviceId, 'refresh', {});
              }}>
                Refresh Data
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                handleSendCommand(device.deviceId, 'disconnect', {});
              }}>
                Disconnect
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          SmartWatch Integration
        </CardTitle>
        <CardDescription>
          Connect your smartwatch to monitor real-time health metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connected" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="connected">Connected Devices</TabsTrigger>
            <TabsTrigger value="connect">Connect New Device</TabsTrigger>
          </TabsList>
          <TabsContent value="connected">
            {renderConnectedDevices()}
          </TabsContent>
          <TabsContent value="connect">
            {renderSmartWatchConnectionInfo()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};