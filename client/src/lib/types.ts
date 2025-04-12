export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: number;
  userId: number;
  title: string;
  description?: string;
  recordType: string;
  provider: string;
  providerType?: string;
  recordDate: string;
  fileContent: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  tags?: string[];
  aiSummary?: string;
  createdAt: string;
}

export interface HealthMetric {
  id: number;
  userId: number;
  metricType: string;
  value: string;
  unit: string;
  recordedAt: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  userId: number;
  title: string;
  description?: string;
  appointmentType: string;
  providerName: string;
  providerType?: string;
  location?: string;
  appointmentDate: string;
  duration?: number;
  reminderSet: boolean;
  reminderTime?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: number;
  userId: number;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AiChatHistory {
  id: number;
  userId: number;
  message: string;
  response: string;
  createdAt: string;
}

export interface HealthAnalyticsData {
  bloodPressure?: {
    latest: string;
    change: number;
    data: Array<{
      date: string;
      systolic: number;
      diastolic: number;
    }>;
  };
  bloodSugar?: {
    latest: string;
    change: number;
    data: Array<{
      date: string;
      value: number;
    }>;
  };
  weight?: {
    latest: string;
    change: number;
    data: Array<{
      date: string;
      value: number;
      bmi?: number;
    }>;
  };
  cholesterol?: {
    latest: {
      total: number;
      ldl: number;
      hdl: number;
      triglycerides: number;
    };
    change: number;
    data: Array<{
      date: string;
      total: number;
      ldl: number;
      hdl: number;
      triglycerides: number;
    }>;
  };
}

export interface MedicalSummary {
  summary: string;
  lastUpdated: string;
}

export interface EmergencyInfo {
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface EmergencyQRCode {
  url: string;
  userId: number;
  expiresAt: string;
}
