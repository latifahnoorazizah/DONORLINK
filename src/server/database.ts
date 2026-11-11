import fs from 'fs';
import path from 'path';
import { hashPassword } from './security';
import { 
  INITIAL_USERS, 
  INITIAL_FACILITIES, 
  INITIAL_REQUESTS, 
  INITIAL_DONOR_PROFILES, 
  INITIAL_STOCK_ITEMS,
  INITIAL_BLOOD_BAGS,
  INITIAL_BOOKINGS,
  INITIAL_RESPONSES,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHAT_MESSAGES
} from '../data/initialData';

export interface DatabaseSchema {
  users: any[];
  facilities: any[];
  requests: any[];
  donorProfiles: Record<string, any>;
  stockItems: any[];
  bloodBags: any[];
  donorBookings: any[];
  responses: any[];
  abuseReports: any[];
  auditLogs: any[];
  notifications: any[];
  chatMessages: any[];
  lastBackupAt?: string;
  version: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');
const DB_FILE = path.resolve(DATA_DIR, 'donorlink_database.json');

class DatabaseService {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDirectories();
    this.data = this.loadDatabase();
  }

  private ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        console.log('[DONORLINK DB] Database loaded successfully from file.');
        return parsed;
      } catch (err) {
        console.error('[DONORLINK DB] Error reading database file, re-initializing:', err);
      }
    }

    console.log('[DONORLINK DB] Initializing fresh production database with Super Admin...');
    return this.initializeSeedData();
  }

  private initializeSeedData(): DatabaseSchema {
    // Setup Super Admin account
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'latifahnoorazizah7@gmail.com';
    const superAdminPass = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminCirebon2026!';
    const { hash, salt } = hashPassword(superAdminPass);

    const superAdminUser = {
      id: 'usr-superadmin-latifah',
      fullName: 'Latifah Noor Azizah',
      email: superAdminEmail,
      phone: '081222334455',
      role: 'ADMIN',
      status: 'ACTIVE',
      donorIdNumber: 'DL-ADM-001',
      city: 'Kota Cirebon',
      district: 'Kesambi',
      birthDate: '1995-10-12',
      isDonorEnabled: true,
      isRequesterEnabled: true,
      passwordHash: hash,
      passwordSalt: salt,
      isSuperAdmin: true,
      createdAt: new Date().toISOString()
    };

    // Seed users with secure hashes
    const seededUsers = [
      superAdminUser,
      ...INITIAL_USERS.filter(u => u.email !== superAdminEmail).map(u => {
        const pHash = hashPassword('DonorLink123!');
        return {
          ...u,
          passwordHash: pHash.hash,
          passwordSalt: pHash.salt
        };
      })
    ];

    const initialSchema: DatabaseSchema = {
      users: seededUsers,
      facilities: INITIAL_FACILITIES,
      requests: INITIAL_REQUESTS,
      donorProfiles: INITIAL_DONOR_PROFILES,
      stockItems: INITIAL_STOCK_ITEMS,
      bloodBags: INITIAL_BLOOD_BAGS,
      donorBookings: INITIAL_BOOKINGS,
      responses: INITIAL_RESPONSES,
      abuseReports: INITIAL_REPORTS,
      auditLogs: [
        {
          id: `log-init-${Date.now()}`,
          actorId: superAdminUser.id,
          actorName: superAdminUser.fullName,
          actorRole: 'ADMIN',
          action: 'DATABASE_INITIALIZED',
          targetEntity: 'System',
          targetId: 'db-root',
          details: `Pangkalan data produksi DONORLINK Cirebon diinisialisasi oleh Super Admin ${superAdminUser.fullName}.`,
          timestamp: new Date().toISOString()
        },
        ...INITIAL_AUDIT_LOGS
      ],
      notifications: INITIAL_NOTIFICATIONS,
      chatMessages: INITIAL_CHAT_MESSAGES,
      lastBackupAt: new Date().toISOString(),
      version: 1
    };

    this.saveToDiskSync(initialSchema);
    return initialSchema;
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      try {
        const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf8');
        fs.renameSync(tempFile, DB_FILE);
      } catch (err) {
        console.error('[DONORLINK DB] Error saving to disk:', err);
      } finally {
        this.isSaving = false;
      }
    }, 100);
  }

  private saveToDiskSync(data: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DONORLINK DB] Sync save failed:', err);
    }
  }

  // Backup & Restore
  public createBackup(): { filename: string; path: string; sizeBytes: number } {
    this.ensureDirectories();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `donorlink_backup_${timestamp}.json`;
    const targetPath = path.resolve(BACKUPS_DIR, backupFilename);
    
    fs.writeFileSync(targetPath, JSON.stringify(this.data, null, 2), 'utf8');
    const stat = fs.statSync(targetPath);
    
    this.data.lastBackupAt = new Date().toISOString();
    this.save();

    return {
      filename: backupFilename,
      path: targetPath,
      sizeBytes: stat.size
    };
  }

  public listBackups(): string[] {
    this.ensureDirectories();
    return fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json')).sort().reverse();
  }

  public restoreBackup(filename: string): boolean {
    const targetPath = path.resolve(BACKUPS_DIR, filename);
    if (!fs.existsSync(targetPath)) return false;
    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      this.data = JSON.parse(content);
      this.saveToDiskSync(this.data);
      console.log(`[DONORLINK DB] Restored successfully from ${filename}`);
      return true;
    } catch (err) {
      console.error('[DONORLINK DB] Restore failed:', err);
      return false;
    }
  }

  // Data Accessors
  public get(): DatabaseSchema {
    return this.data;
  }

  public resetToDefault() {
    this.data = this.initializeSeedData();
    return this.data;
  }
}

export const db = new DatabaseService();
