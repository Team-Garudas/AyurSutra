import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { addNotification } from './firebaseService';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  medications: Medication[];
  notes: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  refillsAllowed: number;
  refillsUsed: number;
  isElectronic: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// Add a new prescription
export const addPrescription = async (prescriptionData: Omit<Prescription, 'id'>): Promise<Prescription> => {
  try {
    const prescriptionWithId = {
      ...prescriptionData,
      id: uuidv4(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionWithId);
    
    // Send notification to patient
    await addNotification({
      userId: prescriptionData.patientId,
      userType: 'patient',
      title: 'New Prescription Added',
      message: `Dr. ${prescriptionData.doctorName} has prescribed ${prescriptionData.medications.map(m => m.name).join(', ')}`,
      type: 'prescription',
      read: false,
      timestamp: new Date().toISOString(),
      relatedId: prescriptionWithId.id
    });

    return prescriptionWithId;
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error;
  }
};

// Get prescriptions for a patient
export const getPrescriptions = async (patientId: string): Promise<Prescription[]> => {
  try {
    const q = query(collection(db, 'prescriptions'), where('patientId', '==', patientId));
    const querySnapshot = await getDocs(q);
    
    const prescriptions: Prescription[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Prescription;
      prescriptions.push(data);
    });
    
    // Sort by date (newest first)
    return prescriptions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting prescriptions:', error);
    throw error;
  }
};

// Get prescriptions by doctor
export const getPrescriptionsByDoctor = async (doctorId: string): Promise<Prescription[]> => {
  try {
    const q = query(collection(db, 'prescriptions'), where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);
    
    const prescriptions: Prescription[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Prescription;
      prescriptions.push(data);
    });
    
    return prescriptions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting prescriptions by doctor:', error);
    throw error;
  }
};

// Update a prescription
export const updatePrescription = async (prescription: Prescription): Promise<void> => {
  try {
    const q = query(collection(db, 'prescriptions'), where('id', '==', prescription.id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'prescriptions', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        ...prescription,
        updatedAt: serverTimestamp()
      });
      
      // If this is a refill, send notification
      if (prescription.status === 'active' && prescription.refillsUsed > 0) {
        await addNotification({
          userId: prescription.patientId,
          userType: 'patient',
          title: 'Prescription Refilled',
          message: `Your prescription for ${prescription.medications.map(m => m.name).join(', ')} has been refilled. Refills remaining: ${prescription.refillsAllowed - prescription.refillsUsed}`,
          type: 'prescription',
          read: false,
          timestamp: new Date().toISOString(),
          relatedId: prescription.id
        });
      }
      
      // If prescription is completed, send notification
      if (prescription.status === 'completed') {
        await addNotification({
          userId: prescription.patientId,
          userType: 'patient',
          title: 'Prescription Completed',
          message: `Your prescription for ${prescription.medications.map(m => m.name).join(', ')} has been completed with no refills remaining.`,
          type: 'prescription',
          read: false,
          timestamp: new Date().toISOString(),
          relatedId: prescription.id
        });
      }
    }
  } catch (error) {
    console.error('Error updating prescription:', error);
    throw error;
  }
};

// Generate mock prescriptions for testing
export const generateMockPrescriptions = async (patientId: string, patientName: string, doctorId: string, doctorName: string): Promise<void> => {
  const mockMedications = [
    {
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '10 days',
      instructions: 'Take with food to reduce stomach upset'
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take in the morning'
    },
    {
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Every 6 hours as needed',
      duration: '7 days',
      instructions: 'Take with food or milk'
    },
    {
      name: 'Metformin',
      dosage: '1000mg',
      frequency: 'Twice daily',
      duration: '90 days',
      instructions: 'Take with meals'
    }
  ];

  const mockPrescriptions = [
    {
      patientId,
      patientName,
      doctorId,
      doctorName,
      medications: [mockMedications[0]],
      notes: 'For bacterial infection. Complete the full course even if symptoms improve.',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      status: 'completed' as const,
      refillsAllowed: 0,
      refillsUsed: 0,
      isElectronic: true
    },
    {
      patientId,
      patientName,
      doctorId,
      doctorName,
      medications: [mockMedications[1]],
      notes: 'For blood pressure management. Monitor blood pressure regularly.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      status: 'active' as const,
      refillsAllowed: 3,
      refillsUsed: 0,
      isElectronic: true
    },
    {
      patientId,
      patientName,
      doctorId,
      doctorName,
      medications: [mockMedications[2]],
      notes: 'For pain relief. Do not exceed recommended dosage.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'active' as const,
      refillsAllowed: 1,
      refillsUsed: 0,
      isElectronic: false
    },
    {
      patientId,
      patientName,
      doctorId,
      doctorName,
      medications: [mockMedications[3]],
      notes: 'For diabetes management. Take regularly and monitor blood sugar levels.',
      date: new Date().toISOString(), // Today
      status: 'active' as const,
      refillsAllowed: 5,
      refillsUsed: 0,
      isElectronic: true
    }
  ];

  try {
    // Check if prescriptions already exist for this patient
    const existingPrescriptions = await getPrescriptions(patientId);
    
    if (existingPrescriptions.length === 0) {
      // Add mock prescriptions
      for (const prescription of mockPrescriptions) {
        await addPrescription(prescription);
      }
      console.log('Mock prescriptions generated successfully');
    }
  } catch (error) {
    console.error('Error generating mock prescriptions:', error);
  }
};