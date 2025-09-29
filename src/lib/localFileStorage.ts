// Local File Storage Utility
// Used instead of Firebase Storage to avoid paid plan costs

export interface LocalFileData {
  dataUrl: string;
  name: string;
  size: number;
  type: string;
  uploadTime: string;
  folder: string;
}

// Store file locally as base64 data URL
export const storeFileLocally = async (file: File, folder: string = 'uploads'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // Generate unique filename with timestamp
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fileKey = `${folder}_${fileName}`;
      
      // Store in localStorage with file metadata
      const fileData: LocalFileData = {
        dataUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadTime: new Date().toISOString(),
        folder
      };
      
      try {
        localStorage.setItem(fileKey, JSON.stringify(fileData));
        console.log(`✅ File stored locally: ${fileName} (${(file.size / 1024).toFixed(1)}KB)`);
        
        // Return a local reference URL
        resolve(`local://${fileKey}`);
      } catch (error) {
        console.error('❌ Error storing file locally:', error);
        
        // Check if localStorage is full
        if (error instanceof DOMException && error.code === 22) {
          reject(new Error('Local storage is full. Please clear some files.'));
        } else {
          reject(new Error('Failed to store file locally'));
        }
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Retrieve file data URL from local storage
export const getLocalFileData = (fileUrl: string): string | null => {
  try {
    if (!fileUrl.startsWith('local://')) {
      return fileUrl; // Return as-is if it's not a local file reference
    }
    
    const fileKey = fileUrl.replace('local://', '');
    const fileDataStr = localStorage.getItem(fileKey);
    
    if (!fileDataStr) {
      console.warn('Local file not found:', fileKey);
      return null;
    }
    
    const fileData: LocalFileData = JSON.parse(fileDataStr);
    return fileData.dataUrl;
  } catch (error) {
    console.error('Error retrieving local file:', error);
    return null;
  }
};

// Get file metadata
export const getLocalFileMetadata = (fileUrl: string): LocalFileData | null => {
  try {
    if (!fileUrl.startsWith('local://')) {
      return null;
    }
    
    const fileKey = fileUrl.replace('local://', '');
    const fileDataStr = localStorage.getItem(fileKey);
    
    if (!fileDataStr) {
      return null;
    }
    
    return JSON.parse(fileDataStr);
  } catch (error) {
    console.error('Error retrieving file metadata:', error);
    return null;
  }
};

// Delete local file
export const deleteLocalFile = (fileUrl: string): boolean => {
  try {
    if (!fileUrl.startsWith('local://')) {
      console.warn('Cannot delete non-local file:', fileUrl);
      return false;
    }
    
    const fileKey = fileUrl.replace('local://', '');
    const fileData = getLocalFileMetadata(fileUrl);
    
    localStorage.removeItem(fileKey);
    
    if (fileData) {
      console.log(`✅ Local file deleted: ${fileData.name} (${(fileData.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log('✅ Local file deleted:', fileKey);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting local file:', error);
    return false;
  }
};

// List all local files in a folder
export const listLocalFiles = (folder: string): LocalFileData[] => {
  const files: LocalFileData[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${folder}_`)) {
        const fileDataStr = localStorage.getItem(key);
        if (fileDataStr) {
          const fileData: LocalFileData = JSON.parse(fileDataStr);
          files.push(fileData);
        }
      }
    }
    
    // Sort by upload time (newest first)
    files.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
    
    console.log(`📁 Found ${files.length} files in folder: ${folder}`);
    return files;
  } catch (error) {
    console.error('Error listing local files:', error);
    return [];
  }
};

// Get total storage usage
export const getStorageUsage = (): { used: number; percentage: number } => {
  try {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
    
    // localStorage limit is typically 5-10MB
    const limitMB = 10;
    const limitBytes = limitMB * 1024 * 1024;
    const percentage = (totalSize / limitBytes) * 100;
    
    console.log(`💾 Storage usage: ${(totalSize / 1024 / 1024).toFixed(2)}MB / ${limitMB}MB (${percentage.toFixed(1)}%)`);
    
    return {
      used: totalSize,
      percentage: Math.min(percentage, 100)
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { used: 0, percentage: 0 };
  }
};

// Clear all files in a folder
export const clearFolder = (folder: string): number => {
  let deletedCount = 0;
  
  try {
    const keysToDelete: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${folder}_`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
      deletedCount++;
    });
    
    console.log(`🗑️ Cleared ${deletedCount} files from folder: ${folder}`);
    return deletedCount;
  } catch (error) {
    console.error('Error clearing folder:', error);
    return 0;
  }
};

// Utility to check if file is a local reference
export const isLocalFile = (fileUrl: string): boolean => {
  return fileUrl.startsWith('local://');
};

// Utility to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
