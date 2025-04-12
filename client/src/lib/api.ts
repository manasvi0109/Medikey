import { apiRequest } from "./queryClient";

/**
 * Authentication
 */
export const loginUser = async (username: string, password: string) => {
  return apiRequest("POST", "/api/auth/login", { username, password });
};

export const registerUser = async (userData: any) => {
  return apiRequest("POST", "/api/auth/register", userData);
};

export const logoutUser = async () => {
  return apiRequest("POST", "/api/auth/logout", {});
};

export const getCurrentUser = async () => {
  const res = await apiRequest("GET", "/api/auth/me", undefined);
  return res.json();
};

/**
 * Medical Records
 */
export const uploadMedicalRecord = async (formData: FormData) => {
  // Note: apiRequest doesn't handle FormData, so using fetch directly
  const res = await fetch("/api/records", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  
  return res;
};

export const deleteMedicalRecord = async (recordId: number) => {
  return apiRequest("DELETE", `/api/records/${recordId}`, undefined);
};

export const generateAISummary = async (recordId: number) => {
  return apiRequest("POST", `/api/records/${recordId}/generate-summary`, undefined);
};

/**
 * Health Metrics
 */
export const addHealthMetric = async (data: any) => {
  return apiRequest("POST", "/api/health-metrics", data);
};

/**
 * Appointments
 */
export const createAppointment = async (data: any) => {
  return apiRequest("POST", "/api/appointments", data);
};

export const updateAppointmentStatus = async (appointmentId: number, status: string) => {
  return apiRequest("PATCH", `/api/appointments/${appointmentId}/status`, { status });
};

/**
 * Family Members
 */
export const addFamilyMember = async (data: any) => {
  return apiRequest("POST", "/api/family-members", data);
};

export const updateFamilyMember = async (memberId: number, data: any) => {
  return apiRequest("PATCH", `/api/family-members/${memberId}`, data);
};

export const deleteFamilyMember = async (memberId: number) => {
  return apiRequest("DELETE", `/api/family-members/${memberId}`, undefined);
};

/**
 * AI Assistant
 */
export const sendMessageToAI = async (message: string) => {
  return apiRequest("POST", "/api/ai-chat", { message });
};

/**
 * User Profile
 */
export const updateUserProfile = async (data: any) => {
  return apiRequest("PATCH", "/api/users/profile", data);
};

export const updateEmergencyInfo = async (data: any) => {
  return apiRequest("PATCH", "/api/users/emergency-info", data);
};

/**
 * Emergency Access
 */
export const getEmergencyAccessQR = async () => {
  const res = await apiRequest("GET", "/api/emergency/qr-code", undefined);
  return res.json();
};

/**
 * Smartwatch Integration
 */
export const getConnectedSmartWatchDevices = async () => {
  const res = await apiRequest("GET", "/api/smartwatch/connected-devices", undefined);
  return res.json();
};

export const sendCommandToSmartWatch = async (deviceId: string, command: string, data: any = {}) => {
  return apiRequest("POST", "/api/smartwatch/send-command", { deviceId, command, data });
};
