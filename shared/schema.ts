import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Records table
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  recordType: text("record_type").notNull(), // prescription, lab_report, diagnostic_image, etc.
  provider: text("provider"), // hospital or laboratory name
  providerType: text("provider_type"), // hospital, clinic, lab, etc.
  recordDate: timestamp("record_date").notNull(),
  fileContent: text("file_content").notNull(), // Base64 encoded file content
  fileType: text("file_type").notNull(), // MIME type
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  tags: text("tags").array(), // Array of tags for easier searching
  aiSummary: text("ai_summary"), // AI-generated summary of the record
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Metrics table
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  metricType: text("metric_type").notNull(), // blood_pressure, blood_sugar, weight, etc.
  value: text("value").notNull(), // JSON string of the metric value (e.g., {"systolic": 120, "diastolic": 80})
  unit: text("unit").notNull(), // mmHg, mg/dL, kg, etc.
  recordedAt: timestamp("recorded_at").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  appointmentType: text("appointment_type").notNull(), // checkup, test, follow_up, etc.
  providerName: text("provider_name").notNull(),
  providerType: text("provider_type"), // doctor, laboratory, hospital, etc.
  location: text("location"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration"), // in minutes
  reminderSet: boolean("reminder_set").default(false),
  reminderTime: timestamp("reminder_time"),
  status: text("status").default("scheduled"), // scheduled, completed, cancelled, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family Members table
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // The user who owns the family vault
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // spouse, child, parent, etc.
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Assistant Chat History table
export const aiChatHistory = pgTable("ai_chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  aiSummary: true,
  createdAt: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  createdAt: true,
});

export const insertAiChatHistorySchema = createInsertSchema(aiChatHistory).omit({
  id: true,
  createdAt: true,
});

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  medicalRecords: many(medicalRecords),
  healthMetrics: many(healthMetrics),
  appointments: many(appointments),
  familyMembers: many(familyMembers),
  aiChatHistory: many(aiChatHistory)
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  user: one(users, {
    fields: [medicalRecords.userId],
    references: [users.id]
  })
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  user: one(users, {
    fields: [healthMetrics.userId],
    references: [users.id]
  })
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id]
  })
}));

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  user: one(users, {
    fields: [familyMembers.userId],
    references: [users.id]
  })
}));

export const aiChatHistoryRelations = relations(aiChatHistory, ({ one }) => ({
  user: one(users, {
    fields: [aiChatHistory.userId],
    references: [users.id]
  })
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;

export type AiChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAiChatHistory = z.infer<typeof insertAiChatHistorySchema>;
