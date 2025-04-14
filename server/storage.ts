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
import { db } from "./db";
import { eq } from "drizzle-orm";

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

import fs from 'fs';
import path from 'path';

// Memory storage implementation with file persistence
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
  private dataFilePath: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), 'data.json');

    // Initialize with default values
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

    // Load data from file if it exists
    this.loadFromFile();

    // Add a default user for testing if no users exist
    if (this.users.size === 0) {
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
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = JSON.parse(fs.readFileSync(this.dataFilePath, 'utf8'));

        // Restore counters from file
        this.userIdCounter = data.userIdCounter || 1;
        this.recordIdCounter = data.recordIdCounter || 1;
        this.metricIdCounter = data.metricIdCounter || 1;
        this.appointmentIdCounter = data.appointmentIdCounter || 1;
        this.memberIdCounter = data.memberIdCounter || 1;
        this.chatIdCounter = data.chatIdCounter || 1;

        // Restore maps
        if (data.users) {
          this.users = new Map(Object.entries(data.users).map(([k, v]) => [Number(k), v as User]));
        }
        if (data.medicalRecords) {
          this.medicalRecords = new Map(Object.entries(data.medicalRecords).map(([k, v]) => [Number(k), v as MedicalRecord]));
        }
        if (data.healthMetrics) {
          this.healthMetrics = new Map(Object.entries(data.healthMetrics).map(([k, v]) => [Number(k), v as HealthMetric]));
        }
        if (data.appointments) {
          this.appointments = new Map(Object.entries(data.appointments).map(([k, v]) => [Number(k), v as Appointment]));
        }
        if (data.familyMembers) {
          this.familyMembers = new Map(Object.entries(data.familyMembers).map(([k, v]) => [Number(k), v as FamilyMember]));
        }
        if (data.aiChatHistory) {
          this.aiChatHistory = new Map(Object.entries(data.aiChatHistory).map(([k, v]) => [Number(k), v as AiChatHistory]));
        }
      }
    } catch (error) {
      console.error('Error loading data from file:', error);
    }
  }

  private saveToFile() {
    try {
      // Convert maps to objects for JSON serialization
      const data = {
        userIdCounter: this.userIdCounter,
        recordIdCounter: this.recordIdCounter,
        metricIdCounter: this.metricIdCounter,
        appointmentIdCounter: this.appointmentIdCounter,
        memberIdCounter: this.memberIdCounter,
        chatIdCounter: this.chatIdCounter,
        users: Object.fromEntries(this.users),
        medicalRecords: Object.fromEntries(this.medicalRecords),
        healthMetrics: Object.fromEntries(this.healthMetrics),
        appointments: Object.fromEntries(this.appointments),
        familyMembers: Object.fromEntries(this.familyMembers),
        aiChatHistory: Object.fromEntries(this.aiChatHistory)
      };

      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
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
    this.saveToFile();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    this.saveToFile();
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
    this.saveToFile();
    return record;
  }

  async updateMedicalRecord(id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const record = await this.getMedicalRecord(id);
    if (!record) {
      throw new Error(`Medical record with ID ${id} not found`);
    }

    const updatedRecord = { ...record, ...recordData };
    this.medicalRecords.set(id, updatedRecord);
    this.saveToFile();
    return updatedRecord;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    if (!this.medicalRecords.has(id)) {
      throw new Error(`Medical record with ID ${id} not found`);
    }

    this.medicalRecords.delete(id);
    this.saveToFile();
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
    this.saveToFile();
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
    this.saveToFile();
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    if (!appointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    this.saveToFile();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    if (!this.appointments.has(id)) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    this.appointments.delete(id);
    this.saveToFile();
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
    this.saveToFile();
    return member;
  }

  async updateFamilyMember(id: number, memberData: Partial<FamilyMember>): Promise<FamilyMember> {
    const member = await this.getFamilyMember(id);
    if (!member) {
      throw new Error(`Family member with ID ${id} not found`);
    }

    const updatedMember = { ...member, ...memberData };
    this.familyMembers.set(id, updatedMember);
    this.saveToFile();
    return updatedMember;
  }

  async deleteFamilyMember(id: number): Promise<void> {
    if (!this.familyMembers.has(id)) {
      throw new Error(`Family member with ID ${id} not found`);
    }

    this.familyMembers.delete(id);
    this.saveToFile();
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
    this.saveToFile();
    return chat;
  }
}

// Database implementation
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record;
  }

  async getMedicalRecordsByUserId(userId: number): Promise<MedicalRecord[]> {
    return db.select().from(medicalRecords).where(eq(medicalRecords.userId, userId));
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db
      .insert(medicalRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async updateMedicalRecord(id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const [record] = await db
      .update(medicalRecords)
      .set(recordData)
      .where(eq(medicalRecords.id, id))
      .returning();
    return record;
  }

  async deleteMedicalRecord(id: number): Promise<void> {
    await db.delete(medicalRecords).where(eq(medicalRecords.id, id));
  }

  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    const [metric] = await db.select().from(healthMetrics).where(eq(healthMetrics.id, id));
    return metric;
  }

  async getHealthMetricsByUserId(userId: number): Promise<HealthMetric[]> {
    return db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId));
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const [newMetric] = await db
      .insert(healthMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.userId, userId));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
    const [member] = await db.select().from(familyMembers).where(eq(familyMembers.id, id));
    return member;
  }

  async getFamilyMembersByUserId(userId: number): Promise<FamilyMember[]> {
    return db.select().from(familyMembers).where(eq(familyMembers.userId, userId));
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db
      .insert(familyMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async updateFamilyMember(id: number, memberData: Partial<FamilyMember>): Promise<FamilyMember> {
    const [member] = await db
      .update(familyMembers)
      .set(memberData)
      .where(eq(familyMembers.id, id))
      .returning();
    return member;
  }

  async deleteFamilyMember(id: number): Promise<void> {
    await db.delete(familyMembers).where(eq(familyMembers.id, id));
  }

  async getAiChatHistory(id: number): Promise<AiChatHistory | undefined> {
    const [chat] = await db.select().from(aiChatHistory).where(eq(aiChatHistory.id, id));
    return chat;
  }

  async getAiChatHistoryByUserId(userId: number): Promise<AiChatHistory[]> {
    return db.select().from(aiChatHistory).where(eq(aiChatHistory.userId, userId));
  }

  async createAiChatHistory(chat: InsertAiChatHistory): Promise<AiChatHistory> {
    const [newChat] = await db
      .insert(aiChatHistory)
      .values(chat)
      .returning();
    return newChat;
  }
}

// Use MemStorage for now to simplify deployment
export const storage = new MemStorage();

console.log(`Using MemStorage for data storage`);
