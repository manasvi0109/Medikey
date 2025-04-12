import { 
  users, 
  medicalRecords, 
  healthMetrics, 
  appointments, 
  familyMembers, 
  aiChatHistory,
  type User, 
  type InsertUser, 
  type MedicalRecord, 
  type InsertMedicalRecord,
  type HealthMetric,
  type InsertHealthMetric,
  type Appointment,
  type InsertAppointment,
  type FamilyMember,
  type InsertFamilyMember,
  type AiChatHistory,
  type InsertAiChatHistory
} from "@shared/schema";

// Interface with all the storage methods we need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;

  // Medical Records methods
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByUserId(userId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord>;
  deleteMedicalRecord(id: number): Promise<void>;

  // Health Metrics methods
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  getHealthMetricsByUserId(userId: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;

  // Appointments methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;

  // Family Members methods
  getFamilyMember(id: number): Promise<FamilyMember | undefined>;
  getFamilyMembersByUserId(userId: number): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: number, memberData: Partial<FamilyMember>): Promise<FamilyMember>;
  deleteFamilyMember(id: number): Promise<void>;

  // AI Chat History methods
  getAiChatHistory(id: number): Promise<AiChatHistory | undefined>;
  getAiChatHistoryByUserId(userId: number): Promise<AiChatHistory[]>;
  createAiChatHistory(chat: InsertAiChatHistory): Promise<AiChatHistory>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medicalRecords: Map<number, MedicalRecord>;
  private healthMetrics: Map<number, HealthMetric>;
  private appointments: Map<number, Appointment>;
  private familyMembers: Map<number, FamilyMember>;
  private aiChatHistory: Map<number, AiChatHistory>;

  private userIdCounter: number;
  private recordIdCounter: number;
  private metricIdCounter: number;
  private appointmentIdCounter: number;
  private memberIdCounter: number;
  private chatIdCounter: number;

  constructor() {
    this.users = new Map();
    this.medicalRecords = new Map();
    this.healthMetrics = new Map();
    this.appointments = new Map();
    this.familyMembers = new Map();
    this.aiChatHistory = new Map();

    this.userIdCounter = 1;
    this.recordIdCounter = 1;
    this.metricIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.memberIdCounter = 1;
    this.chatIdCounter = 1;

    // Add a default user for testing
    this.createUser({
      username: "demo",
      password: "password",
      fullName: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      dateOfBirth: "1980-04-15",
      gender: "Female",
      bloodType: "B+",
      allergies: "Penicillin, Peanuts",
      chronicConditions: "Asthma, Hypertension",
      emergencyContactName: "John Johnson",
      emergencyContactPhone: "+1 (555) 987-6543"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date().toISOString();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Medical Records methods
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }

  async getMedicalRecordsByUserId(userId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      (record) => record.userId === userId
    );
  }

  async createMedicalRecord(recordData: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.recordIdCounter++;
    const now = new Date().toISOString();
    const record: MedicalRecord = { ...recordData, id, aiSummary: null, createdAt: now };
    this.medicalRecords.set(id, record);
    return record;
  }

  async updateMedicalRecord(id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const record = await this.getMedicalRecord(id);
    if (!record) {
      throw new Error(`Medical record with ID ${id} not found`);
    }
    
    const updatedRecord = { ...record, ...recordData };
    this.medicalRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    if (!this.medicalRecords.has(id)) {
      throw new Error(`Medical record with ID ${id} not found`);
    }
    
    this.medicalRecords.delete(id);
  }

  // Health Metrics methods
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.get(id);
  }

  async getHealthMetricsByUserId(userId: number): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values()).filter(
      (metric) => metric.userId === userId
    );
  }

  async createHealthMetric(metricData: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.metricIdCounter++;
    const now = new Date().toISOString();
    const metric: HealthMetric = { ...metricData, id, createdAt: now };
    this.healthMetrics.set(id, metric);
    return metric;
  }

  // Appointments methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const now = new Date().toISOString();
    const appointment: Appointment = { 
      ...appointmentData, 
      id, 
      status: "scheduled", 
      createdAt: now 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    if (!this.appointments.has(id)) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    this.appointments.delete(id);
  }

  // Family Members methods
  async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
    return this.familyMembers.get(id);
  }

  async getFamilyMembersByUserId(userId: number): Promise<FamilyMember[]> {
    return Array.from(this.familyMembers.values()).filter(
      (member) => member.userId === userId
    );
  }

  async createFamilyMember(memberData: InsertFamilyMember): Promise<FamilyMember> {
    const id = this.memberIdCounter++;
    const now = new Date().toISOString();
    const member: FamilyMember = { ...memberData, id, createdAt: now };
    this.familyMembers.set(id, member);
    return member;
  }

  async updateFamilyMember(id: number, memberData: Partial<FamilyMember>): Promise<FamilyMember> {
    const member = await this.getFamilyMember(id);
    if (!member) {
      throw new Error(`Family member with ID ${id} not found`);
    }
    
    const updatedMember = { ...member, ...memberData };
    this.familyMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteFamilyMember(id: number): Promise<void> {
    if (!this.familyMembers.has(id)) {
      throw new Error(`Family member with ID ${id} not found`);
    }
    
    this.familyMembers.delete(id);
  }

  // AI Chat History methods
  async getAiChatHistory(id: number): Promise<AiChatHistory | undefined> {
    return this.aiChatHistory.get(id);
  }

  async getAiChatHistoryByUserId(userId: number): Promise<AiChatHistory[]> {
    return Array.from(this.aiChatHistory.values()).filter(
      (chat) => chat.userId === userId
    );
  }

  async createAiChatHistory(chatData: InsertAiChatHistory): Promise<AiChatHistory> {
    const id = this.chatIdCounter++;
    const now = new Date().toISOString();
    const chat: AiChatHistory = { ...chatData, id, createdAt: now };
    this.aiChatHistory.set(id, chat);
    return chat;
  }
}

// Initialize and export storage instance
export const storage = new MemStorage();

// Seed some initial data for the default user
(async () => {
  try {
    // Get the demo user
    const demoUser = await storage.getUserByUsername("demo");
    if (!demoUser) return;

    const userId = demoUser.id;

    // Add family members
    await storage.createFamilyMember({
      userId,
      name: "John Johnson",
      relationship: "Husband",
      dateOfBirth: "1978-09-22",
      gender: "Male",
      bloodType: "A+",
      allergies: "Shellfish",
      chronicConditions: "High Cholesterol"
    });

    await storage.createFamilyMember({
      userId,
      name: "Emma Johnson",
      relationship: "Daughter",
      dateOfBirth: "2008-03-15",
      gender: "Female",
      bloodType: "B+",
      allergies: "Pollen, Peanuts",
      chronicConditions: "Mild Asthma"
    });

    // Add some medical records
    await storage.createMedicalRecord({
      userId,
      title: "Annual Physical Results",
      description: "Results from annual checkup with Dr. Emily Chen",
      recordType: "summary",
      provider: "Dr. Emily Chen",
      providerType: "Primary Care",
      recordDate: "2023-03-15T10:30:00Z",
      fileContent: "base64EncodedContent",
      fileType: "application/pdf",
      fileName: "annual_physical_2023.pdf",
      fileSize: 1024 * 1024,
      tags: ["annual", "physical", "checkup"]
    });

    await storage.createMedicalRecord({
      userId,
      title: "Blood Test Results",
      description: "Comprehensive metabolic panel and lipid profile",
      recordType: "lab_report",
      provider: "LabCorp",
      providerType: "Laboratory",
      recordDate: "2023-04-12T14:45:00Z",
      fileContent: "base64EncodedContent",
      fileType: "application/pdf",
      fileName: "blood_test_apr2023.pdf",
      fileSize: 889 * 1024,
      tags: ["blood test", "cholesterol", "metabolic panel"]
    });

    await storage.createMedicalRecord({
      userId,
      title: "Prescription - Lisinopril",
      description: "Prescription for blood pressure medication",
      recordType: "prescription",
      provider: "Dr. James Wilson",
      providerType: "Cardiologist",
      recordDate: "2023-03-28T16:15:00Z",
      fileContent: "base64EncodedContent",
      fileType: "application/pdf",
      fileName: "lisinopril_rx_mar2023.pdf",
      fileSize: 512 * 1024,
      tags: ["prescription", "blood pressure", "hypertension"]
    });

    // Add some appointments
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    await storage.createAppointment({
      userId,
      title: "Annual Physical Exam",
      description: "Yearly checkup",
      appointmentType: "checkup",
      providerName: "Dr. Emily Chen",
      providerType: "Primary Care",
      location: "Memorial Hospital",
      appointmentDate: new Date(nextMonth.setDate(15)).toISOString(),
      duration: 60,
      reminderSet: true,
      reminderTime: new Date(nextMonth.setDate(14)).toISOString(),
      notes: "Remember to fast 12 hours before appointment"
    });

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    await storage.createAppointment({
      userId,
      title: "Blood Work",
      description: "Routine blood work",
      appointmentType: "test",
      providerName: "LabCorp",
      providerType: "Laboratory",
      location: "LabCorp Center",
      appointmentDate: nextWeek.toISOString(),
      duration: 30,
      reminderSet: true,
      reminderTime: new Date(nextWeek.setDate(nextWeek.getDate() - 1)).toISOString(),
      notes: "Fasting required"
    });

    const nextTwoWeeks = new Date(today);
    nextTwoWeeks.setDate(today.getDate() + 14);
    
    await storage.createAppointment({
      userId,
      title: "Pulmonology Follow-up",
      description: "Follow-up for asthma management",
      appointmentType: "follow_up",
      providerName: "Dr. Mark Williams",
      providerType: "Pulmonologist",
      location: "City Medical Center",
      appointmentDate: nextTwoWeeks.toISOString(),
      duration: 45,
      reminderSet: true,
      reminderTime: new Date(nextTwoWeeks.setDate(nextTwoWeeks.getDate() - 1)).toISOString(),
      notes: "Bring inhaler for evaluation"
    });

    // Seed some health metrics
    // Blood pressure readings
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 9);
      
      await storage.createHealthMetric({
        userId,
        metricType: "blood_pressure",
        value: JSON.stringify({
          systolic: Math.floor(Math.random() * 10) + 120,
          diastolic: Math.floor(Math.random() * 10) + 75
        }),
        unit: "mmHg",
        recordedAt: date.toISOString(),
        notes: "Measured in the morning"
      });
    }

    // Blood sugar readings
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 9);
      
      await storage.createHealthMetric({
        userId,
        metricType: "blood_sugar",
        value: String(Math.floor(Math.random() * 15) + 95),
        unit: "mg/dL",
        recordedAt: date.toISOString(),
        notes: "Fasting blood glucose"
      });
    }

    // Weight readings
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 9);
      const weight = 165 - (i * 0.2);
      
      await storage.createHealthMetric({
        userId,
        metricType: "weight",
        value: weight.toFixed(1),
        unit: "lbs",
        recordedAt: date.toISOString(),
        notes: (weight / (1.75 * 1.75) * 0.45359237).toFixed(1) // BMI
      });
    }

    // Add sample chat history
    await storage.createAiChatHistory({
      userId,
      message: "What were my last blood pressure readings?",
      response: "Your most recent blood pressure reading was 128/82 mmHg, taken on April 20, 2023. This is within the normal range, showing good control of your hypertension. Would you like to see your blood pressure trend over time?"
    });

    await storage.createAiChatHistory({
      userId,
      message: "What are the side effects of Lisinopril?",
      response: "Common side effects of Lisinopril may include dizziness, headache, fatigue, dry cough, and in some cases, a decrease in blood pressure. Less common but more serious side effects can include swelling of the face, lips, tongue, or throat, which requires immediate medical attention. It's important to take this medication as prescribed by your doctor and report any concerning side effects."
    });

  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
})();
