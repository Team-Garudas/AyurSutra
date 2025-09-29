// SQLite3 Service for local storage of images and QR codes
// This will handle patient photos and QR codes locally using browser's IndexedDB

interface SQLiteRecord {
  id: string;
  type: 'photo' | 'qr';
  data: string;
  patientId: string;
  createdAt: string;
  metadata?: any;
}

class SQLiteService {
  private dbName = 'AyurSutraLocalDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ SQLite IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('patientId', 'patientId', { unique: false });
          mediaStore.createIndex('type', 'type', { unique: false });
          console.log('📦 Created media object store');
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  // Store patient photo
  async storePatientPhoto(patientId: string, photoData: string, metadata?: any): Promise<string> {
    try {
      const db = await this.ensureDB();
      const photoId = `photo_${patientId}_${Date.now()}`;
      
      const record: SQLiteRecord = {
        id: photoId,
        type: 'photo',
        data: photoData,
        patientId,
        createdAt: new Date().toISOString(),
        metadata
      };

      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`📸 Photo stored in SQLite with ID: ${photoId}`);
      return photoId;
    } catch (error) {
      console.error('❌ Error storing patient photo:', error);
      throw error;
    }
  }

  // Store QR code
  async storeQRCode(patientId: string, qrData: string, metadata?: any): Promise<string> {
    try {
      const db = await this.ensureDB();
      const qrId = `qr_${patientId}_${Date.now()}`;
      
      const record: SQLiteRecord = {
        id: qrId,
        type: 'qr',
        data: qrData,
        patientId,
        createdAt: new Date().toISOString(),
        metadata
      };

      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`🔗 QR code stored in SQLite with ID: ${qrId}`);
      return qrId;
    } catch (error) {
      console.error('❌ Error storing QR code:', error);
      throw error;
    }
  }

  // Retrieve patient photo
  async getPatientPhoto(photoId: string): Promise<string | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      
      const record = await new Promise<SQLiteRecord | null>((resolve, reject) => {
        const request = store.get(photoId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (record && record.type === 'photo') {
        return record.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving patient photo:', error);
      return null;
    }
  }

  // Retrieve QR code
  async getQRCode(qrId: string): Promise<string | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      
      const record = await new Promise<SQLiteRecord | null>((resolve, reject) => {
        const request = store.get(qrId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (record && record.type === 'qr') {
        return record.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving QR code:', error);
      return null;
    }
  }

  // Get all media for a patient
  async getPatientMedia(patientId: string): Promise<SQLiteRecord[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      const index = store.index('patientId');
      
      const records = await new Promise<SQLiteRecord[]>((resolve, reject) => {
        const request = index.getAll(patientId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      return records;
    } catch (error) {
      console.error('❌ Error retrieving patient media:', error);
      return [];
    }
  }

  // Delete media record
  async deleteMedia(mediaId: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(mediaId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`🗑️ Media deleted: ${mediaId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting media:', error);
      return false;
    }
  }

  // Clear all data (for testing/cleanup)
  async clearAllData(): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('🧹 All SQLite data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return false;
    }
  }

  // Get database statistics
  async getStats(): Promise<{ totalRecords: number; photos: number; qrCodes: number }> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      
      const allRecords = await new Promise<SQLiteRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      const photos = allRecords.filter(r => r.type === 'photo').length;
      const qrCodes = allRecords.filter(r => r.type === 'qr').length;

      return {
        totalRecords: allRecords.length,
        photos,
        qrCodes
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { totalRecords: 0, photos: 0, qrCodes: 0 };
    }
  }
}

// Create singleton instance
export const sqliteService = new SQLiteService();

// Utility functions for easy access
export const storePatientPhoto = (patientId: string, photoData: string, metadata?: any) => 
  sqliteService.storePatientPhoto(patientId, photoData, metadata);

export const storeQRCode = (patientId: string, qrData: string, metadata?: any) => 
  sqliteService.storeQRCode(patientId, qrData, metadata);

export const getPatientPhoto = (photoId: string) => 
  sqliteService.getPatientPhoto(photoId);

export const getQRCode = (qrId: string) => 
  sqliteService.getQRCode(qrId);

export const getPatientMedia = (patientId: string) => 
  sqliteService.getPatientMedia(patientId);

export const deleteMedia = (mediaId: string) => 
  sqliteService.deleteMedia(mediaId);

export const clearAllSQLiteData = () => 
  sqliteService.clearAllData();

export const getSQLiteStats = () => 
  sqliteService.getStats();