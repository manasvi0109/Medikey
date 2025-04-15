import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { openai, summarizeText, generateHealthSummary, generateHealthResponse, analyzeMedicalDocument } from "./lib/openai";
import { smartWatchService } from "./lib/smartwatch";
import bcrypt from 'bcrypt';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      secret: process.env.SESSION_SECRET || "medikey-secret",
      resave: false,
      saveUninitialized: false
    })
  );

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, fullName, email } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user with hashed password
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        email
      });

      res.status(201).json({ message: "User created successfully", id: user.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to register user", error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare the password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set user in session
      req.session.userId = user.id;

      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout", error: err.message });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error: error.message });
    }
  });

  // User profile routes
  app.get("/api/users/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile", error: error.message });
    }
  });

  app.patch("/api/users/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const updatedUser = await storage.updateUser(userId, req.body);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile", error: error.message });
    }
  });

  app.patch("/api/users/emergency-info", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const { bloodType, allergies, chronicConditions, emergencyContactName, emergencyContactPhone } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        bloodType,
        allergies,
        chronicConditions,
        emergencyContactName,
        emergencyContactPhone
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update emergency info", error: error.message });
    }
  });

  // Medical records routes
  app.get("/api/records", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const records = await storage.getMedicalRecordsByUserId(req.session.userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to get medical records", error: error.message });
    }
  });

  app.get("/api/records/recent", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = 3; // Number of records per page

      const allRecords = await storage.getMedicalRecordsByUserId(req.session.userId);

      // Sort by most recent
      const sortedRecords = allRecords.sort((a, b) => {
        return new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime();
      });

      // Paginate
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedRecords = sortedRecords.slice(startIndex, endIndex);

      res.json({
        records: paginatedRecords,
        total: allRecords.length,
        perPage,
        page
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent medical records", error: error.message });
    }
  });

  app.post("/api/records", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const {
        title,
        description,
        recordType,
        provider,
        providerType,
        recordDate,
        tags
      } = req.body;

      // Simulate file handling (in a real app, you'd process an actual file)
      const file = {
        content: "base64EncodedContent", // In a real app, this would be the actual base64 encoded file
        type: "application/pdf",
        name: "sample.pdf",
        size: 1024 * 1024 // 1MB
      };

      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

      const newRecord = await storage.createMedicalRecord({
        userId,
        title,
        description: description || "",
        recordType,
        provider,
        providerType: providerType || "",
        recordDate: new Date(recordDate).toISOString(),
        fileContent: file.content,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
        tags: parsedTags
      });

      res.status(201).json(newRecord);
    } catch (error) {
      res.status(500).json({ message: "Failed to create medical record", error: error.message });
    }
  });

  app.get("/api/records/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(recordId);

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      // Check if user has access to this record
      if (record.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to get medical record", error: error.message });
    }
  });

  app.delete("/api/records/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(recordId);

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      // Check if user has access to this record
      if (record.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteMedicalRecord(recordId);
      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medical record", error: error.message });
    }
  });

  app.get("/api/records/:id/summary", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(recordId);

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      // Check if user has access to this record
      if (record.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Return existing summary if available
      if (record.aiSummary) {
        return res.json({ summary: record.aiSummary });
      }

      // For now, return empty. In a real app, this would trigger summary generation
      res.json({ summary: null });
    } catch (error) {
      res.status(500).json({ message: "Failed to get record summary", error: error.message });
    }
  });

  app.post("/api/records/:id/generate-summary", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const recordId = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(recordId);

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      // Check if user has access to this record
      if (record.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Sample document text (in a real app, we'd extract text from the actual document)
      const documentText = "Patient shows normal blood pressure at 120/80 mmHg. Cholesterol levels are within normal range. Patient reports occasional headaches which may be related to stress or eyestrain. Recommended follow-up in 6 months.";

      // Generate summary using OpenAI
      const summary = await summarizeText(documentText);

      // Update record with summary
      const updatedRecord = await storage.updateMedicalRecord(recordId, {
        aiSummary: summary
      });

      res.json({ success: true, summary: updatedRecord.aiSummary });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate summary", error: error.message });
    }
  });

  // Health metrics routes
  app.get("/api/health-metrics", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const timeRange = req.query.timeRange || "3m";
      const metrics = await storage.getHealthMetricsByUserId(req.session.userId);

      // Sample data for demonstration
      const today = new Date();

      // Blood pressure data
      const bloodPressureData = Array.from({ length: 10 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i * 9);
        return {
          date: date.toISOString().split('T')[0],
          systolic: Math.floor(Math.random() * 10) + 120,
          diastolic: Math.floor(Math.random() * 10) + 75
        };
      }).reverse();

      // Blood sugar data
      const bloodSugarData = Array.from({ length: 10 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i * 9);
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 15) + 95
        };
      }).reverse();

      // Weight data
      const weightData = Array.from({ length: 10 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i * 9);
        const weight = 165 - (i * 0.2);
        return {
          date: date.toISOString().split('T')[0],
          value: parseFloat(weight.toFixed(1)),
          bmi: parseFloat((weight / (1.75 * 1.75) * 0.45359237).toFixed(1))
        };
      }).reverse();

      const analyticsData = {
        bloodPressure: {
          latest: "128/82",
          change: -4,
          data: bloodPressureData
        },
        bloodSugar: {
          latest: "105 mg/dL",
          change: -2,
          data: bloodSugarData
        },
        weight: {
          latest: "165 lbs / 27.2",
          change: -1.3,
          data: weightData
        }
      };

      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get health metrics", error: error.message });
    }
  });

  app.post("/api/health-metrics", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const { metricType, value, unit, recordedAt, notes } = req.body;

      const newMetric = await storage.createHealthMetric({
        userId,
        metricType,
        value,
        unit,
        recordedAt: new Date(recordedAt).toISOString(),
        notes: notes || ""
      });

      res.status(201).json(newMetric);
    } catch (error) {
      res.status(500).json({ message: "Failed to create health metric", error: error.message });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const appointments = await storage.getAppointmentsByUserId(req.session.userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get appointments", error: error.message });
    }
  });

  app.get("/api/appointments/upcoming", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const allAppointments = await storage.getAppointmentsByUserId(req.session.userId);

      // Filter for upcoming appointments
      const now = new Date();
      const upcomingAppointments = allAppointments
        .filter(app => new Date(app.appointmentDate) > now)
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .slice(0, 3); // Limit to 3 upcoming appointments

      res.json(upcomingAppointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get upcoming appointments", error: error.message });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const {
        title,
        description,
        appointmentType,
        providerName,
        providerType,
        location,
        appointmentDate,
        duration,
        reminderSet,
        reminderTime,
        notes
      } = req.body;

      const newAppointment = await storage.createAppointment({
        userId,
        title,
        description: description || "",
        appointmentType,
        providerName,
        providerType: providerType || "",
        location: location || "",
        appointmentDate,
        duration: duration || 30,
        reminderSet: reminderSet || false,
        reminderTime,
        notes: notes || ""
      });

      res.status(201).json(newAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create appointment", error: error.message });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;

      const appointment = await storage.getAppointment(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if user has access to this appointment
      if (appointment.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedAppointment = await storage.updateAppointment(appointmentId, { status });
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status", error: error.message });
    }
  });

  // Family members routes
  app.get("/api/family-members", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const familyMembers = await storage.getFamilyMembersByUserId(req.session.userId);
      res.json(familyMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get family members", error: error.message });
    }
  });

  app.post("/api/family-members", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const {
        name,
        relationship,
        dateOfBirth,
        gender,
        bloodType,
        allergies,
        chronicConditions
      } = req.body;

      const newFamilyMember = await storage.createFamilyMember({
        userId,
        name,
        relationship,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        chronicConditions: chronicConditions || null
      });

      res.status(201).json(newFamilyMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to create family member", error: error.message });
    }
  });

  app.patch("/api/family-members/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getFamilyMember(memberId);

      if (!member) {
        return res.status(404).json({ message: "Family member not found" });
      }

      // Check if user has access to this family member
      if (member.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedMember = await storage.updateFamilyMember(memberId, req.body);
      res.json(updatedMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to update family member", error: error.message });
    }
  });

  app.delete("/api/family-members/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getFamilyMember(memberId);

      if (!member) {
        return res.status(404).json({ message: "Family member not found" });
      }

      // Check if user has access to this family member
      if (member.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteFamilyMember(memberId);
      res.json({ message: "Family member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete family member", error: error.message });
    }
  });

  // AI Assistant routes
  app.get("/api/ai-chat/history", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const chatHistory = await storage.getAiChatHistoryByUserId(req.session.userId);
      res.json(chatHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat history", error: error.message });
    }
  });

  app.post("/api/ai-chat", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;
      const { message } = req.body;

      console.log("Received message from client:", message);

      // Get user's health context for personalized responses
      const user = await storage.getUser(userId);
      const medicalRecords = await storage.getMedicalRecordsByUserId(userId);
      const healthMetrics = await storage.getHealthMetricsByUserId(userId);

      // Process message with OpenAI
      let aiResponse = "I don't have enough information to answer that question specifically. However, I can provide general health information or answer questions about medical terminology.";

      // Try to generate a response based on context
      try {
        aiResponse = await generateHealthResponse(message, user, medicalRecords, healthMetrics);
      } catch (error) {
        console.error("Error generating AI response:", error);
        // Fall back to default response if AI fails
      }

      // Save chat history
      const chatEntry = await storage.createAiChatHistory({
        userId,
        message,
        response: aiResponse
      });

      res.json(chatEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to process message", error: error.message });
    }
  });

  // Medical summary endpoint
  app.get("/api/medical-summary", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;

      // Get user information and medical records
      const user = await storage.getUser(userId);
      const medicalRecords = await storage.getMedicalRecordsByUserId(userId);
      const healthMetrics = await storage.getHealthMetricsByUserId(userId);

      if (!user || medicalRecords.length === 0) {
        return res.json({
          summary: null,
          lastUpdated: null
        });
      }

      // Generate a context for the AI to summarize
      const context = {
        user: {
          name: user.fullName,
          age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : "Unknown",
          bloodType: user.bloodType || "Unknown",
          allergies: user.allergies || "None recorded",
          chronicConditions: user.chronicConditions || "None recorded"
        },
        recentRecords: medicalRecords
          .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
          .slice(0, 5)
          .map(record => ({
            title: record.title,
            type: record.recordType,
            provider: record.provider,
            date: record.recordDate,
            summary: record.aiSummary || "No summary available"
          }))
      };

      // Generate summary
      const summary = await generateHealthSummary(context);

      res.json({
        summary,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate medical summary", error: error.message });
    }
  });

  // Emergency access routes
  app.get("/api/emergency/qr-code", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = req.session.userId;

      // Create a QR code URL for emergency access
      // This would normally generate a secure token and store it
      const qrData = {
        url: `${req.protocol}://${req.get('host')}/emergency/${userId}`,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      res.json(qrData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code", error: error.message });
    }
  });

  const httpServer = createServer(app);

  // Initialize the SmartWatch WebSocket service
  smartWatchService.initialize(httpServer);
  console.log('SmartWatch integration initialized');

  return httpServer;
}

// Helper functions
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Function removed - using the one from openai.ts instead
