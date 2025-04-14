import { sql } from 'drizzle-orm';
import { db } from './db';
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
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
        tags TEXT[],
        ai_summary TEXT,
        created_at TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        appointment_type TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        provider_type TEXT,
        location TEXT,
        appointment_date TIMESTAMP NOT NULL,
        duration INTEGER,
        reminder_set BOOLEAN DEFAULT FALSE,
        reminder_time TIMESTAMP,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        blood_type TEXT,
        allergies TEXT,
        chronic_conditions TEXT,
        avatar_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        metric_type TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT NOT NULL,
        recorded_at TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS medical_summary (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
        summary TEXT,
        last_updated TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS smartwatch_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        device_name TEXT NOT NULL,
        device_id TEXT NOT NULL,
        device_type TEXT NOT NULL,
        connected_at TIMESTAMP DEFAULT NOW(),
        last_sync TIMESTAMP,
        status TEXT DEFAULT 'active'
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
