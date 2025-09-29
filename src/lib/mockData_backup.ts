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

// Get all hospitals using Firebase
export const getFromLocalStorage = async (key: string): Promise<unknown> => {
  try {
    if (key === 'hospitals') {
      return await firebaseGetAllHospitals();
    }
    // For other keys, you can add more Firebase functions
    console.log(`Warning: ${key} not yet migrated to Firebase, returning empty array`);
    return [];
  } catch (error) {
    console.error(`Failed to get ${key} from Firebase:`, error);
    return [];
  }
};

// Legacy localStorage functions - deprecated, keeping for compatibility
const saveToLocalStorage = (key: string, data: unknown): void => {
  console.warn(`saveToLocalStorage is deprecated. Data should be saved to Firebase instead.`);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Utility functions
import QRCode from 'qrcode';

export const generateQRCode = async (patientId: string): Promise<string> => {
  try {
    // Create the URL that the QR code will redirect to
    const patientUrl = `${window.location.origin}/patient-card/${patientId}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(patientUrl, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to a simple placeholder if QR generation fails
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

// Synchronous version for immediate use (generates QR for the patient data)
export const generateQRCodeSync = (patientId: string): string => {
  const patientUrl = `${window.location.origin}/patient-card/${patientId}`;
  
  // Use a larger size for better scanning
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(patientUrl)}&format=png&margin=10`;
};

// Use Firebase ID generator
export const generatePanchakarmaId = firebaseGeneratePanchakarmaId;

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

// Local storage utilities
export const saveToLocalStorage = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getFromLocalStorage = (key: string): unknown => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return null;
  }
};

// Authentication functions with enhanced logging
export const authenticatePatient = (id: string, password: string): Patient | null => {
  try {
    const patients = getFromLocalStorage('patients') as Patient[] || [];
    console.log(`Attempting patient login for ID: ${id}`);
    console.log(`Total patients in database: ${patients.length}`);
    
    const patient = patients.find(p => {
      console.log(`Checking patient: ${p.id} with password check`);
      return p.id === id && p.password === password;
    });
    
    if (patient) {
      console.log(`Patient login successful: ${patient.name}`);
      return patient;
    } else {
      console.log('Patient login failed: Invalid ID or password');
      return null;
    }
  } catch (error) {
    console.error('Patient authentication error:', error);
    return null;
  }
};

export const authenticateDoctor = (username: string, password: string): Doctor | null => {
  try {
    const doctors = getFromLocalStorage('doctors') as Doctor[] || [];
    console.log(`Attempting doctor login for username: ${username}`);
    console.log(`Total doctors in database: ${doctors.length}`);
    
    const doctor = doctors.find(d => {
      console.log(`Checking doctor: ${d.username} (${d.name})`);
      return d.username === username && d.password === password;
    });
    
    if (doctor) {
      console.log(`Doctor login successful: ${doctor.name}`);
      return doctor;
    } else {
      console.log('Doctor login failed: Invalid username or password');
      return null;
    }
  } catch (error) {
    console.error('Doctor authentication error:', error);
    return null;
  }
};

export const authenticateTherapist = (username: string, password: string): Therapist | null => {
  try {
    const therapists = getFromLocalStorage('therapists') as Therapist[] || [];
    console.log(`Attempting therapist login for username: ${username}`);
    console.log(`Total therapists in database: ${therapists.length}`);
    
    const therapist = therapists.find(t => {
      console.log(`Checking therapist: ${t.username} (${t.name})`);
      return t.username === username && t.password === password;
    });
    
    if (therapist) {
      console.log(`Therapist login successful: ${therapist.name}`);
      return therapist;
    } else {
      console.log('Therapist login failed: Invalid username or password');
      return null;
    }
  } catch (error) {
    console.error('Therapist authentication error:', error);
    return null;
  }
};

export const authenticateHospital = (username: string, password: string): Hospital | null => {
  try {
    const hospitals = getFromLocalStorage('hospitals') as Hospital[] || [];
    console.log(`Attempting hospital login for username: ${username}`);
    console.log(`Total hospitals in database: ${hospitals.length}`);
    
    const hospital = hospitals.find(h => {
      console.log(`Checking hospital: ${h.adminUsername} (${h.name})`);
      return h.adminUsername === username && h.adminPassword === password;
    });
    
    if (hospital) {
      console.log(`Hospital login successful: ${hospital.name}`);
      return hospital;
    } else {
      console.log('Hospital login failed: Invalid username or password');
      return null;
    }
  } catch (error) {
    console.error('Hospital authentication error:', error);
    return null;
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

// Search functions
export const searchPatientById = (id: string): Patient | null => {
  const patients = getFromLocalStorage('patients') as Patient[] || [];
  return patients.find(p => p.id === id) || null;
};

export const getAppointmentsByPatient = (patientId: string): Appointment[] => {
  const appointments = getFromLocalStorage('appointments') as Appointment[] || [];
  return appointments.filter(a => a.patientId === patientId);
};

export const createAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
  const appointments = getFromLocalStorage('appointments') as Appointment[] || [];
  const newAppointment = {
    ...appointment,
    id: `A${Date.now()}`
  };
  appointments.push(newAppointment);
  saveToLocalStorage('appointments', appointments);
  return newAppointment;
};

export const updateTherapyProgress = (therapyId: string, stepId: string, completed: boolean): void => {
  // Implementation for therapy progress update
  console.log(`Updated therapy ${therapyId}, step ${stepId} to ${completed ? 'completed' : 'pending'}`);
};

// Initialize empty data structure
export const initializeStorage = (): void => {
  // Clear all existing data first to ensure clean state
  localStorage.removeItem('patients');
  localStorage.removeItem('doctors');
  localStorage.removeItem('therapists');
  localStorage.removeItem('hospitals');
  localStorage.removeItem('appointments');
  
  // Initialize with empty arrays
  saveToLocalStorage('patients', []);
  saveToLocalStorage('doctors', []);
  saveToLocalStorage('therapists', []);
  saveToLocalStorage('hospitals', []);
  saveToLocalStorage('appointments', []);
  
  // Log current database state
  console.log('=== DATABASE INITIALIZED (CLEAN STATE) ===');
  console.log('All dummy data removed. Starting with empty database.');
  console.log('Patients: 0');
  console.log('Doctors: 0');
  console.log('Therapists: 0');
  console.log('Hospitals: 0');
  console.log('Appointments: 0');
  console.log('==========================================');
};

// Debug function to check database state
export const debugDatabase = (): void => {
  console.log('=== DEBUG DATABASE STATE ===');
  const patients = getFromLocalStorage('patients') as Patient[] || [];
  const doctors = getFromLocalStorage('doctors') as Doctor[] || [];
  const therapists = getFromLocalStorage('therapists') as Therapist[] || [];
  const hospitals = getFromLocalStorage('hospitals') as Hospital[] || [];
  
  console.log(`Patients: ${patients.length}`);
  patients.forEach((p, i) => console.log(`  ${i+1}. ${p.name} (ID: ${p.id})`));
  
  console.log(`Doctors: ${doctors.length}`);
  doctors.forEach((d, i) => console.log(`  ${i+1}. ${d.name} (Username: ${d.username})`));
  
  console.log(`Therapists: ${therapists.length}`);
  therapists.forEach((t, i) => console.log(`  ${i+1}. ${t.name} (Username: ${t.username})`));
  
  console.log(`Hospitals: ${hospitals.length}`);
  hospitals.forEach((h, i) => console.log(`  ${i+1}. ${h.name} (Admin: ${h.adminUsername})`));
  
  console.log('============================');
};

// Clear all data function for testing
export const clearAllData = (): void => {
  localStorage.removeItem('patients');
  localStorage.removeItem('doctors');
  localStorage.removeItem('therapists');
  localStorage.removeItem('hospitals');
  localStorage.removeItem('appointments');
  localStorage.removeItem('therapies');
  localStorage.removeItem('therapy_steps');
  console.log('🗑️ All dummy/mock data cleared from localStorage');
  initializeStorage();
};

// Force clear all existing data and start fresh
export const startFresh = (): void => {
  console.log('🔄 Starting with completely clean database...');
  clearAllData();
  console.log('✅ Ready for new registrations!');
};