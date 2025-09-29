import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { addNotification } from './firebaseService';

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  date: string;
  createdAt?: any;
  updatedAt?: any;
}

// Add a new medical record
export const addMedicalRecord = async (recordData: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
  try {
    const recordWithId = {
      ...recordData,
      id: uuidv4(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'medicalRecords'), recordWithId);
    
    // Send notification to patient
    await addNotification({
      userId: recordData.patientId,
      userType: 'patient',
      title: 'New Medical Record Added',
      message: `A new medical record "${recordData.title}" has been added to your profile`,
      type: 'medical_record',
      read: false,
      timestamp: new Date().toISOString(),
      relatedId: recordWithId.id
    });

    return recordWithId;
  } catch (error) {
    console.error('Error adding medical record:', error);
    throw error;
  }
};

// Get medical records for a patient
export const getMedicalRecords = async (patientId: string): Promise<MedicalRecord[]> => {
  try {
    const q = query(collection(db, 'medicalRecords'), where('patientId', '==', patientId));
    const querySnapshot = await getDocs(q);
    
    const records: MedicalRecord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as MedicalRecord;
      records.push(data);
    });
    
    return records;
  } catch (error) {
    console.error('Error getting medical records:', error);
    throw error;
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (recordId: string): Promise<void> => {
  try {
    const q = query(collection(db, 'medicalRecords'), where('id', '==', recordId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'medicalRecords', querySnapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error('Error deleting medical record:', error);
    throw error;
  }
};

// Generate mock medical records for testing
export const generateMockMedicalRecords = async (patientId: string): Promise<MedicalRecord[]> => {
  const mockRecords = [
    {
      patientId,
      title: 'Complete Blood Count (CBC)',
      description: 'Routine blood test to check overall health and detect a wide range of disorders.',
      category: 'lab_result',
      fileType: 'pdf',
      fileUrl: 'https://example.com/files/cbc_results.pdf',
      fileName: 'cbc_results.pdf',
      fileSize: 1458000,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    {
      patientId,
      title: 'Chest X-Ray',
      description: 'Chest radiograph to examine lungs, heart and chest wall.',
      category: 'imaging',
      fileType: 'jpg',
      fileUrl: 'https://example.com/files/chest_xray.jpg',
      fileName: 'chest_xray.jpg',
      fileSize: 3245000,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    },
    {
      patientId,
      title: 'Annual Physical Examination',
      description: 'Comprehensive health assessment including vital signs, general appearance, and organ systems examination.',
      category: 'clinical_note',
      fileType: 'pdf',
      fileUrl: 'https://example.com/files/annual_physical.pdf',
      fileName: 'annual_physical.pdf',
      fileSize: 2156000,
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    },
    {
      patientId,
      title: 'COVID-19 Vaccination Record',
      description: 'Documentation of COVID-19 vaccination including date, manufacturer, and lot number.',
      category: 'vaccination',
      fileType: 'pdf',
      fileUrl: 'https://example.com/files/covid_vaccination.pdf',
      fileName: 'covid_vaccination.pdf',
      fileSize: 1024000,
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    },
    {
      patientId,
      title: 'Lipid Panel Results',
      description: 'Blood test that measures lipids—fats and fatty substances used as a source of energy by your body.',
      category: 'lab_result',
      fileType: 'pdf',
      fileUrl: 'https://example.com/files/lipid_panel.pdf',
      fileName: 'lipid_panel.pdf',
      fileSize: 1124000,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    }
  ];

  try {
    // Check if records already exist for this patient
    const existingRecords = await getMedicalRecords(patientId);
    
    if (existingRecords.length === 0) {
      // Add mock records
      for (const record of mockRecords) {
        await addMedicalRecord(record);
      }
      console.log('Mock medical records generated successfully');
    }
    
    // Return all records (either existing or newly created)
    return await getMedicalRecords(patientId);
  } catch (error) {
    console.error('Error generating mock medical records:', error);
    return [];
  }
};