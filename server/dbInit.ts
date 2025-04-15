import { sql } from 'drizzle-orm';
import { db, sqlite } from './db';
import * as schema from '@shared/schema';

export async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Create tables if they don't exist
    await createUsersTable();
    await createMedicalRecordsTable();
    await createAppointmentsTable();
    await createFamilyMembersTable();
    await createHealthMetricsTable();
    await createMedicalSummaryTable();
    await createAiChatHistoryTable();
    await createSmartWatchDevicesTable();

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

async function createUsersTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        date_of_birth TEXT,
        gender TEXT,
        blood_type TEXT,
        allergies TEXT,
        chronic_conditions TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

async function createMedicalRecordsTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        record_date TIMESTAMP NOT NULL,
        record_type TEXT NOT NULL,
        provider TEXT,
        provider_type TEXT,
        file_content TEXT,
        file_name TEXT,
        file_size INTEGER,
        file_type TEXT,
        tags TEXT,
        ai_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Medical records table created or already exists');
  } catch (error) {
    console.error('Error creating medical records table:', error);
    throw error;
  }
}

async function createAppointmentsTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        appointment_type TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        provider_type TEXT,
        location TEXT,
        appointment_date TIMESTAMP NOT NULL,
        duration INTEGER,
        reminder_set BOOLEAN DEFAULT 0,
        reminder_time TIMESTAMP,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Appointments table created or already exists');
  } catch (error) {
    console.error('Error creating appointments table:', error);
    throw error;
  }
}

async function createFamilyMembersTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS family_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        blood_type TEXT,
        allergies TEXT,
        chronic_conditions TEXT,
        avatar_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Family members table created or already exists');
  } catch (error) {
    console.error('Error creating family members table:', error);
    throw error;
  }
}

async function createHealthMetricsTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        metric_type TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT NOT NULL,
        recorded_at TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Health metrics table created or already exists');
  } catch (error) {
    console.error('Error creating health metrics table:', error);
    throw error;
  }
}

async function createMedicalSummaryTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS medical_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        summary TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Medical summary table created or already exists');
  } catch (error) {
    console.error('Error creating medical summary table:', error);
    throw error;
  }
}

async function createAiChatHistoryTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ai_chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('AI chat history table created or already exists');
  } catch (error) {
    console.error('Error creating AI chat history table:', error);
    throw error;
  }
}

async function createSmartWatchDevicesTable() {
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS smartwatch_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        device_name TEXT NOT NULL,
        device_id TEXT NOT NULL,
        device_type TEXT NOT NULL,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_sync TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('Smartwatch devices table created or already exists');
  } catch (error) {
    console.error('Error creating smartwatch devices table:', error);
    throw error;
  }
}

// Create a default admin user if no users exist
export async function createDefaultUserIfNeeded() {
  try {
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });

    if (existingUsers.length === 0) {
      console.log('No users found, creating default user...');

      // Hash for password "password123"
      const hashedPassword = '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQICjYJ7ogs/D3Q1vIwLRrJfQ7mNZS';

      await db.insert(schema.users).values({
        username: 'manasvi',
        password: hashedPassword,
        fullName: 'Manasvi',
        email: 'manasvi@example.com',
        phone: '1234567890',
        gender: 'Male',
        bloodType: 'O+',
      });

      console.log('Default user created successfully');
    } else {
      console.log('Users already exist, skipping default user creation');
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }
}
