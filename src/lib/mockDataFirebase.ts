// Data types and utility functions for Panchakarma Management Platform
// Now using Firebase for backend storage

import { 
  addPatient as firebaseAddPatient,
  addDoctor as firebaseAddDoctor,
  addTherapist as firebaseAddTherapist,
  addHospital as firebaseAddHospital,
  getPatient as firebaseGetPatient,
  getAllHospitals as firebaseGetAllHospitals,
  generatePanchakarmaId as firebaseGeneratePanchakarmaId
} from './firebaseService';
import QRCode from 'qrcode';

export interface Patient {
  id: string;
  name: string;
  dob: string;
  bloodGroup: string;
  address: string;
  photoUrl?: string;
  abhaPassport: string;
  registrationTime: string;
  isResident: boolean;
  password: string;
}

export interface Doctor {
  id: string;
  hospitalId: string;
  name: string;
  specialty: string;
  username: string;
  password: string;
  email: string;
  phone: string;
}

export interface Therapist {
  id: string;
  hospitalId: string;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  adminUsername: string;
  adminPassword: string;
  numDoctors: number;
  numTherapists: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  therapistId?: string;
  hospitalId: string;
  symptoms: string[];
  dateTime: string;
  preInstructions: string;
  postInstructions: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Therapy {
  id: string;
  appointmentId: string;
  steps: TherapyStep[];
  status: 'pending' | 'in-progress' | 'completed';
  photoProofs: string[];
}

export interface TherapyStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  notes?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'therapist' | 'hospital';
  username?: string;
  email?: string;
}

// Standard therapy steps for Panchakarma treatment
export const standardTherapySteps: TherapyStep[] = [
  { id: 's1', name: 'Abhyanga', description: 'Full body oil massage', completed: false },
  { id: 's2', name: 'Swedana', description: 'Steam therapy', completed: false },
  { id: 's3', name: 'Virechana', description: 'Purgation therapy', completed: false },
  { id: 's4', name: 'Nasya', description: 'Nasal administration', completed: false },
  { id: 's5', name: 'Basti', description: 'Medicated enema', completed: false }
];

// ====================
// FIREBASE FUNCTIONS
// ====================

// Use Firebase ID generator
export const generatePanchakarmaId = firebaseGeneratePanchakarmaId;

// Get patient by ID using Firebase
export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const patient = await firebaseGetPatient(id);
    console.log(`Getting patient by ID: ${id}`, patient ? '✅ Found' : '❌ Not found');
    return patient;
  } catch (error) {
    console.error('Error getting patient by ID:', error);
    return null;
  }
};

// Get data from Firebase (replaces localStorage)
export const getFromLocalStorage = async (key: string): Promise<unknown> => {
  try {
    if (key === 'hospitals') {
      return await firebaseGetAllHospitals();
    }
    // For other keys, return empty array until migrated
    console.log(`⚠️ ${key} not yet migrated to Firebase, returning empty array`);
    return [];
  } catch (error) {
    console.error(`Failed to get ${key} from Firebase:`, error);
    return [];
  }
};

// Registration functions with Firebase backend
export const registerPatient = async (patient: Patient): Promise<boolean> => {
  try {
    // Enhanced validation
    if (!patient.name || !patient.password || !patient.abhaPassport) {
      console.error('Missing required patient fields');
      return false;
    }
    
    // Add timestamp if not present
    if (!patient.registrationTime) {
      patient.registrationTime = new Date().toISOString();
    }
    
    // Use Firebase to add patient (without id since Firebase auto-generates)
    const { id, ...patientData } = patient;
    const firebaseId = await firebaseAddPatient(patientData);
    
    console.log(`✅ Patient registered successfully with Firebase ID: ${firebaseId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to register patient:', error);
    return false;
  }
};

export const registerDoctor = async (doctor: Doctor): Promise<boolean> => {
  try {
    // Enhanced validation
    if (!doctor.name || !doctor.username || !doctor.password || !doctor.email) {
      console.error('Missing required doctor fields');
      return false;
    }
    
    // Use Firebase to add doctor
    const { id, ...doctorData } = doctor;
    const firebaseId = await firebaseAddDoctor(doctorData);
    
    console.log(`✅ Doctor registered successfully with Firebase ID: ${firebaseId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to register doctor:', error);
    return false;
  }
};

export const registerTherapist = async (therapist: Therapist): Promise<boolean> => {
  try {
    // Enhanced validation
    if (!therapist.name || !therapist.username || !therapist.password || !therapist.email) {
      console.error('Missing required therapist fields');
      return false;
    }
    
    // Use Firebase to add therapist
    const { id, ...therapistData } = therapist;
    const firebaseId = await firebaseAddTherapist(therapistData);
    
    console.log(`✅ Therapist registered successfully with Firebase ID: ${firebaseId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to register therapist:', error);
    return false;
  }
};

export const registerHospital = async (hospital: Hospital): Promise<boolean> => {
  try {
    // Enhanced validation
    if (!hospital.name || !hospital.adminUsername || !hospital.adminPassword || !hospital.email) {
      console.error('Missing required hospital fields');
      return false;
    }
    
    // Use Firebase to add hospital
    const { id, ...hospitalData } = hospital;
    const firebaseId = await firebaseAddHospital(hospitalData);
    
    console.log(`✅ Hospital registered successfully with Firebase ID: ${firebaseId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to register hospital:', error);
    return false;
  }
};

// Authentication functions - these will be updated to use Firebase Authentication
export const authenticatePatient = async (id: string, password: string): Promise<Patient | null> => {
  try {
    // TODO: Replace with Firebase authentication
    console.log(`⚠️ Patient authentication not yet migrated to Firebase for ID: ${id}`);
    return null;
  } catch (error) {
    console.error('Patient authentication error:', error);
    return null;
  }
};

export const authenticateDoctor = async (username: string, password: string): Promise<Doctor | null> => {
  try {
    // TODO: Replace with Firebase authentication
    console.log(`⚠️ Doctor authentication not yet migrated to Firebase for username: ${username}`);
    return null;
  } catch (error) {
    console.error('Doctor authentication error:', error);
    return null;
  }
};

export const authenticateTherapist = async (username: string, password: string): Promise<Therapist | null> => {
  try {
    // TODO: Replace with Firebase authentication
    console.log(`⚠️ Therapist authentication not yet migrated to Firebase for username: ${username}`);
    return null;
  } catch (error) {
    console.error('Therapist authentication error:', error);
    return null;
  }
};

export const authenticateHospital = async (username: string, password: string): Promise<Hospital | null> => {
  try {
    // TODO: Replace with Firebase authentication
    console.log(`⚠️ Hospital authentication not yet migrated to Firebase for username: ${username}`);
    return null;
  } catch (error) {
    console.error('Hospital authentication error:', error);
    return null;
  }
};

// ====================
// UTILITY FUNCTIONS
// ====================

export const generateQRCode = async (patientId: string): Promise<string> => {
  try {
    const patientUrl = `${window.location.origin}/patient-card/${patientId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(patientUrl, {
      width: 100,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M'
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white"/>
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="black" stroke-width="2"/>
        <text x="50" y="45" text-anchor="middle" font-size="6" fill="black">${patientId}</text>
        <text x="50" y="60" text-anchor="middle" font-size="4" fill="black">Panchakarma ID</text>
      </svg>
    `)}`;
  }
};

export const generateQRCodeSync = (patientId: string): string => {
  const patientUrl = `${window.location.origin}/patient-card/${patientId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(patientUrl)}&format=png&margin=10`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Legacy functions for compatibility (will be removed later)
export const searchPatientById = (id: string): Patient | null => {
  console.warn('searchPatientById is deprecated. Use getPatientById instead.');
  return null;
};

export const getAppointmentsByPatient = (patientId: string): Appointment[] => {
  console.warn('getAppointmentsByPatient is deprecated. Use Firebase service instead.');
  return [];
};

export const createAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
  console.warn('createAppointment is deprecated. Use Firebase service instead.');
  return { ...appointment, id: `A${Date.now()}` };
};

export const updateTherapyProgress = (therapyId: string, stepId: string, completed: boolean): void => {
  console.warn('updateTherapyProgress is deprecated. Use Firebase service instead.');
  console.log(`Updated therapy ${therapyId}, step ${stepId} to ${completed ? 'completed' : 'pending'}`);
};

// Initialize Firebase (no more localStorage)
export const initializeStorage = (): void => {
  console.log('🔥 Firebase backend initialized');
  console.log('✅ Ready for Firebase operations');
};

// Start fresh with Firebase
export const startFresh = (): void => {
  console.log('🔄 Starting with Firebase backend...');
  console.log('🔥 All data will be stored in Firebase');
  console.log('✅ Ready for new registrations!');
};

// Clear function (for Firebase, this would reset collections)
export const clearAllData = (): void => {
  console.log('⚠️ clearAllData: Firebase data should be managed through Firebase Console');
  console.log('🔥 Firebase backend is active');
};
