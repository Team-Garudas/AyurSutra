// LocalStorage service for browser-based data storage
// This replaces SQLite3 for better browser compatibility and Render deployment

export interface PhotoMetadata {
  fileName: string;
  uploadedAt: string;
  size?: number;
  type?: string;
}

export interface QRCodeMetadata {
  patientUrl: string;
  generatedAt: string;
  format?: string;
}

export class LocalStorageService {
  private static readonly PHOTO_PREFIX = 'patient_photo_';
  private static readonly QR_PREFIX = 'patient_qr_';
  private static readonly METADATA_PREFIX = 'metadata_';

  // Patient Photo Operations
  static async storePatientPhoto(
    patientId: string, 
    photoData: string, 
    metadata: PhotoMetadata
  ): Promise<string> {
    try {
      const photoId = `photo_${patientId}_${Date.now()}`;
      const photoKey = this.PHOTO_PREFIX + photoId;
      const metadataKey = this.METADATA_PREFIX + photoKey;

      // Compress photo data if it's too large
      const compressedPhoto = this.compressBase64Image(photoData);
      
      // Store photo data
      localStorage.setItem(photoKey, compressedPhoto);
      
      // Store metadata
      localStorage.setItem(metadataKey, JSON.stringify({
        ...metadata,
        patientId,
        photoId,
        size: compressedPhoto.length,
        storedAt: new Date().toISOString()
      }));

      console.log(`📸 Photo stored in localStorage with ID: ${photoId}`);
      return photoId;
    } catch (error) {
      console.error('❌ Error storing photo in localStorage:', error);
      throw new Error('Failed to store patient photo');
    }
  }

  static async getPatientPhoto(patientId: string): Promise<string | null> {
    try {
      // Find photo by patient ID
      const photoKey = this.findPhotoKeyByPatientId(patientId);
      if (!photoKey) {
        console.log(`📸 No photo found for patient: ${patientId}`);
        return null;
      }

      const photoData = localStorage.getItem(photoKey);
      if (photoData) {
        console.log(`📸 Photo retrieved for patient: ${patientId}`);
        return photoData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error retrieving photo from localStorage:', error);
      return null;
    }
  }

  // QR Code Operations
  static async storeQRCode(
    patientId: string, 
    qrCodeData: string, 
    metadata: QRCodeMetadata
  ): Promise<string> {
    try {
      const qrId = `qr_${patientId}_${Date.now()}`;
      const qrKey = this.QR_PREFIX + qrId;
      const metadataKey = this.METADATA_PREFIX + qrKey;

      // Store QR code data
      localStorage.setItem(qrKey, qrCodeData);
      
      // Store metadata
      localStorage.setItem(metadataKey, JSON.stringify({
        ...metadata,
        patientId,
        qrId,
        size: qrCodeData.length,
        storedAt: new Date().toISOString()
      }));

      console.log(`🔗 QR code stored in localStorage with ID: ${qrId}`);
      return qrId;
    } catch (error) {
      console.error('❌ Error storing QR code in localStorage:', error);
      throw new Error('Failed to store QR code');
    }
  }

  static async getQRCode(patientId: string): Promise<string | null> {
    try {
      // Find QR code by patient ID
      const qrKey = this.findQRKeyByPatientId(patientId);
      if (!qrKey) {
        console.log(`🔗 No QR code found for patient: ${patientId}`);
        return null;
      }

      const qrData = localStorage.getItem(qrKey);
      if (qrData) {
        console.log(`🔗 QR code retrieved for patient: ${patientId}`);
        return qrData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error retrieving QR code from localStorage:', error);
      return null;
    }
  }

  // Utility Methods
  private static findPhotoKeyByPatientId(patientId: string): string | null {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.PHOTO_PREFIX)) {
        const metadataKey = this.METADATA_PREFIX + key;
        const metadataStr = localStorage.getItem(metadataKey);
        if (metadataStr) {
          try {
            const metadata = JSON.parse(metadataStr);
            if (metadata.patientId === patientId) {
              return key;
            }
          } catch (e) {
            // Skip invalid metadata
          }
        }
      }
    }
    return null;
  }

  private static findQRKeyByPatientId(patientId: string): string | null {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.QR_PREFIX)) {
        const metadataKey = this.METADATA_PREFIX + key;
        const metadataStr = localStorage.getItem(metadataKey);
        if (metadataStr) {
          try {
            const metadata = JSON.parse(metadataStr);
            if (metadata.patientId === patientId) {
              return key;
            }
          } catch (e) {
            // Skip invalid metadata
          }
        }
      }
    }
    return null;
  }

  private static compressBase64Image(base64String: string): string {
    try {
      // If the image is already compressed or small enough, return as is
      if (base64String.length < 500000) { // 500KB threshold
        return base64String;
      }

      // For larger images, we could implement client-side compression
      // For now, just return the original (in production, implement proper compression)
      console.log(`📸 Image size: ${Math.round(base64String.length / 1024)}KB - Consider compression`);
      return base64String;
    } catch (error) {
      console.error('❌ Error compressing image:', error);
      return base64String;
    }
  }

  // Cleanup operations
  static removePatientData(patientId: string): void {
    try {
      const photoKey = this.findPhotoKeyByPatientId(patientId);
      const qrKey = this.findQRKeyByPatientId(patientId);

      if (photoKey) {
        localStorage.removeItem(photoKey);
        localStorage.removeItem(this.METADATA_PREFIX + photoKey);
        console.log(`🗑️ Removed photo data for patient: ${patientId}`);
      }

      if (qrKey) {
        localStorage.removeItem(qrKey);
        localStorage.removeItem(this.METADATA_PREFIX + qrKey);
        console.log(`🗑️ Removed QR code data for patient: ${patientId}`);
      }
    } catch (error) {
      console.error('❌ Error removing patient data from localStorage:', error);
    }
  }

  // Storage info
  static getStorageInfo(): { used: number; available: number; photos: number; qrCodes: number } {
    let used = 0;
    let photos = 0;
    let qrCodes = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length;
          if (key.startsWith(this.PHOTO_PREFIX)) photos++;
          if (key.startsWith(this.QR_PREFIX)) qrCodes++;
        }
      }
    }

    // LocalStorage typically has 5-10MB limit
    const available = (10 * 1024 * 1024) - used; // Assume 10MB limit

    return {
      used: Math.round(used / 1024), // KB
      available: Math.round(available / 1024), // KB
      photos,
      qrCodes
    };
  }
}

// Export convenience functions that match the SQLite3 interface
export const storePatientPhoto = LocalStorageService.storePatientPhoto.bind(LocalStorageService);
export const getPatientPhoto = LocalStorageService.getPatientPhoto.bind(LocalStorageService);
export const storeQRCode = LocalStorageService.storeQRCode.bind(LocalStorageService);
export const getQRCode = LocalStorageService.getQRCode.bind(LocalStorageService);

export default LocalStorageService;