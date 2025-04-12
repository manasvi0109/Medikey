import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { storage } from '../storage';
import { InsertHealthMetric } from '@shared/schema';

// Define the supported smartwatch device types
export enum SmartWatchType {
  APPLE_WATCH = 'apple_watch',
  FITBIT = 'fitbit',
  SAMSUNG_GALAXY_WATCH = 'samsung_galaxy_watch',
  GARMIN = 'garmin',
  GENERIC = 'generic'
}

// Data structure for received smartwatch metrics
export interface SmartWatchMetric {
  type: string;  // 'heart_rate', 'blood_pressure', 'blood_oxygen', etc.
  value: any;    // Value depends on the metric type
  timestamp: string;
  deviceType: SmartWatchType;
  deviceId: string;
}

// Connection information for each connected device
interface ConnectedDevice {
  userId: number;
  deviceType: SmartWatchType;
  deviceId: string;
  lastSeen: Date;
}

class SmartWatchService {
  private wss: WebSocketServer | null = null;
  private connectedDevices: Map<string, ConnectedDevice> = new Map();
  
  /**
   * Initialize the smartwatch WebSocket server
   * @param server The HTTP server to attach to
   */
  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/smartwatch' 
    });

    this.wss.on('connection', (ws, req) => {
      // Extract userId from query string (in real app, would use proper auth)
      const userId = this.extractUserIdFromUrl(req.url);
      if (!userId) {
        ws.close(4000, 'Missing user ID');
        return;
      }
      
      const deviceId = req.headers['x-device-id'] as string || 'unknown';
      const deviceType = (req.headers['x-device-type'] as SmartWatchType) || SmartWatchType.GENERIC;
      
      // Register this device
      const connectionId = `${userId}-${deviceId}`;
      this.connectedDevices.set(connectionId, {
        userId: userId,
        deviceType: deviceType,
        deviceId: deviceId,
        lastSeen: new Date()
      });
      
      console.log(`SmartWatch connected: User ${userId}, Device ${deviceId} (${deviceType})`);
      
      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'connection', 
        status: 'success',
        message: `Connected to MediKey health monitoring service`
      }));
      
      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString()) as SmartWatchMetric;
          await this.processMetric(userId, data);
          
          // Update the device's last seen timestamp
          const device = this.connectedDevices.get(connectionId);
          if (device) {
            device.lastSeen = new Date();
          }
          
          // Acknowledge the received data
          ws.send(JSON.stringify({ 
            type: 'ack', 
            metricType: data.type,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error processing smartwatch data:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Failed to process data'
          }));
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        this.connectedDevices.delete(connectionId);
        console.log(`SmartWatch disconnected: User ${userId}, Device ${deviceId}`);
      });
    });
    
    console.log('SmartWatch WebSocket service initialized');
  }
  
  /**
   * Process received health metrics and save to database
   */
  private async processMetric(userId: number, metric: SmartWatchMetric): Promise<void> {
    // Convert metric to appropriate database format
    let metricToSave: InsertHealthMetric;
    
    switch (metric.type) {
      case 'heart_rate':
        metricToSave = {
          userId,
          metricType: 'heart_rate',
          value: String(metric.value),
          unit: 'bpm',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
        break;
        
      case 'blood_pressure':
        metricToSave = {
          userId,
          metricType: 'blood_pressure',
          value: JSON.stringify(metric.value), // Expecting { systolic: number, diastolic: number }
          unit: 'mmHg',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
        break;
        
      case 'blood_oxygen':
        metricToSave = {
          userId,
          metricType: 'blood_oxygen',
          value: String(metric.value),
          unit: '%',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
        break;
        
      case 'temperature':
        metricToSave = {
          userId,
          metricType: 'temperature',
          value: String(metric.value),
          unit: '°C',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
        break;
        
      case 'sleep':
        metricToSave = {
          userId,
          metricType: 'sleep',
          value: JSON.stringify(metric.value), // Expecting sleep stages data
          unit: 'min',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
        break;
        
      case 'activity':
        metricToSave = {
          userId,
          metricType: 'activity',
          value: JSON.stringify(metric.value), // Expecting steps, calories, distance
          unit: 'steps',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
        break;
        
      default:
        metricToSave = {
          userId,
          metricType: metric.type,
          value: typeof metric.value === 'object' ? JSON.stringify(metric.value) : String(metric.value),
          unit: '',
          recordedAt: new Date(metric.timestamp),
          notes: `Recorded from ${metric.deviceType} (${metric.deviceId})`
        };
    }
    
    // Save to database
    await storage.createHealthMetric(metricToSave);
    
    console.log(`Saved ${metric.type} metric for user ${userId} from ${metric.deviceType}`);
  }
  
  /**
   * Extract user ID from WebSocket URL
   * Expected format: /api/smartwatch?userId=123
   */
  private extractUserIdFromUrl(url: string | undefined): number | null {
    if (!url) return null;
    
    const match = url.match(/userId=(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    return null;
  }
  
  /**
   * Get a list of currently connected devices
   */
  getConnectedDevices() {
    return Array.from(this.connectedDevices.values());
  }
  
  /**
   * Send a command to a specific user's device
   */
  sendCommandToDevice(userId: number, deviceId: string, command: string, data: any): boolean {
    if (!this.wss) return false;
    
    const connectionId = `${userId}-${deviceId}`;
    let sent = false;
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(JSON.stringify({
            type: 'command',
            command,
            data
          }));
          sent = true;
        } catch (error) {
          console.error('Error sending command to device:', error);
        }
      }
    });
    
    return sent;
  }
  
  /**
   * Broadcast a message to all connected devices
   */
  broadcastMessage(message: string): void {
    if (!this.wss) return;
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(JSON.stringify({
            type: 'broadcast',
            message
          }));
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
    });
  }
}

// Singleton instance
export const smartWatchService = new SmartWatchService();