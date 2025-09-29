// Data types and utility functions for Panchakarma Management Platform
// Now using Firebase for backend storage + Enhanced with advanced data structures

import { 
  addPatient as firebaseAddPatient,
  addDoctor as firebaseAddDoctor,
  addTherapist as firebaseAddTherapist,
  addHospital as firebaseAddHospital,
  getPatient as firebaseGetPatient,
  getAllHospitals as firebaseGetAllHospitals,
  getAllDoctors as firebaseGetAllDoctors,
  getAllTherapists as firebaseGetAllTherapists,
  getAllPatients as firebaseGetAllPatients,
  getAppointmentsByPatient as firebaseGetAppointmentsByPatient,
  addAppointment as firebaseAddAppointment,
  generatePanchakarmaId as firebaseGeneratePanchakarmaId,
  authenticatePatientByIdPassword,
  authenticateDoctorByUsername,
  authenticateTherapistByUsername,
  authenticateHospitalByUsername,
  // Enhanced functions using data structures
  initializeDataMaps,
  getPatientFast,
  getDoctorFast,
  getHospitalFast,
  registerPatientWithValidation,
  addToAppointmentWaitingList,
  processNextAppointmentFromQueue,
  getWaitingListStatus,
  addNotificationToQueue,
  getPatientVisitedDoctors,
  getAllMedicalSpecialties,
  runPerformanceComparison
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
  hospitalId?: string; // Optional - for backward compatibility
  hospitals: string[]; // Array of hospital IDs the doctor is associated with
  name: string;
  specialty: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  isGlobal: boolean; // True if doctor is available to all hospitals
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
    switch (key) {
      case 'hospitals':
        return await firebaseGetAllHospitals();
      
      case 'doctors':
        return await firebaseGetAllDoctors();
      
      case 'therapists':
        return await firebaseGetAllTherapists();
      
      default:
        console.log(`⚠️ ${key} not yet migrated to Firebase, returning empty array`);
        return [];
    }
  } catch (error) {
    console.error(`Failed to get ${key} from Firebase:`, error);
    return [];
  }
};

// Registration functions with Firebase backend
export const registerPatient = async (patient: Patient): Promise<boolean> => {
  try {
    console.log('🚀 Starting patient registration process...');
    console.log('📋 Patient data:', JSON.stringify(patient, null, 2));
    
    // Enhanced validation
    if (!patient.name || !patient.password || !patient.abhaPassport) {
      console.error('❌ Missing required patient fields:', {
        name: !!patient.name,
        password: !!patient.password,
        abhaPassport: !!patient.abhaPassport
      });
      return false;
    }
    
    // Generate Panchakarma ID if not present
    if (!patient.id) {
      patient.id = await generatePanchakarmaId();
    }
    
    // Add timestamp if not present
    if (!patient.registrationTime) {
      patient.registrationTime = new Date().toISOString();
    }
    
    console.log(`📝 Registering patient with Panchakarma ID: ${patient.id}`);
    console.log(`   👤 Name: ${patient.name}`);
    console.log(`   📧 ABHA: ${patient.abhaPassport}`);
    console.log(`   🩸 Blood Group: ${patient.bloodGroup}`);
    
    // Use Firebase to add patient (Firebase will generate document ID, but we store Panchakarma ID in the document)
    console.log('🔥 Calling Firebase addPatient...');
    const firebaseId = await firebaseAddPatient(patient);
    console.log(`✅ Firebase returned document ID: ${firebaseId}`);
    
    console.log(`✅ Patient registered successfully!`);
    console.log(`   📋 Panchakarma ID: ${patient.id}`);
    console.log(`   🔥 Firebase Document ID: ${firebaseId}`);
    console.log(`   👤 Patient Name: ${patient.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to register patient:', error);
    return false;
  }
};

export const registerDoctor = async (doctor: Doctor): Promise<boolean> => {
  try {
    console.log('🚀 Starting doctor registration process...');
    console.log('📋 Doctor data:', JSON.stringify(doctor, null, 2));
    
    // Enhanced validation
    if (!doctor.name || !doctor.username || !doctor.password || !doctor.email) {
      console.error('❌ Missing required doctor fields:', {
        name: !!doctor.name,
        username: !!doctor.username, 
        password: !!doctor.password,
        email: !!doctor.email
      });
      return false;
    }
    
    // Generate doctor ID if not present
    if (!doctor.id) {
      doctor.id = `DOC${Date.now()}`;
    }
    
    console.log(`📝 Registering doctor with ID: ${doctor.id}`);
    console.log(`   🏥 Hospital ID: ${doctor.hospitalId}`);
    console.log(`   👤 Name: ${doctor.name}`);
    console.log(`   🔑 Username: ${doctor.username}`);
    console.log(`   📧 Email: ${doctor.email}`);
    
    // Use Firebase to add doctor (Firebase will generate document ID, but we store doctor ID in the document)
    const { addDoctor } = await import('@/lib/firebaseService');
    console.log('🔥 Calling Firebase addDoctor...');
    const firebaseId = await addDoctor(doctor);
    console.log(`✅ Firebase returned document ID: ${firebaseId}`);
    
    console.log(`✅ Doctor registered successfully!`);
    console.log(`   👨‍⚕️ Doctor ID: ${doctor.id}`);
    console.log(`   🔥 Firebase Document ID: ${firebaseId}`);
    console.log(`   👤 Doctor Name: ${doctor.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to register doctor:', error);
    return false;
  }
};

// Utility function to get patient photo from local storage
export const getPatientPhoto = (photoKey: string): string => {
  try {
    return localStorage.getItem(photoKey) || '';
  } catch (error) {
    console.error('Failed to retrieve patient photo:', error);
    return '';
  }
};

// Utility function to store patient photo in local storage
export const storePatientPhoto = (patientId: string, photoData: string): string => {
  try {
    const photoKey = `patient_photo_${patientId}`;
    localStorage.setItem(photoKey, photoData);
    console.log(`📸 Photo stored locally with key: ${photoKey}`);
    return photoKey;
  } catch (error) {
    console.error('Failed to store patient photo:', error);
    return '';
  }
};

export const registerTherapist = async (therapist: Therapist): Promise<boolean> => {
  try {
    // Enhanced validation
    if (!therapist.name || !therapist.username || !therapist.password || !therapist.email) {
      console.error('Missing required therapist fields');
      return false;
    }
    
    // Generate therapist ID if not present
    if (!therapist.id) {
      therapist.id = `THR${Date.now()}`;
    }
    
    console.log(`📝 Registering therapist with ID: ${therapist.id}`);
    
    // Use Firebase to add therapist (Firebase will generate document ID, but we store therapist ID in the document)
    const firebaseId = await firebaseAddTherapist(therapist);
    
    console.log(`✅ Therapist registered successfully!`);
    console.log(`   🧘‍♀️ Therapist ID: ${therapist.id}`);
    console.log(`   🔥 Firebase Document ID: ${firebaseId}`);
    console.log(`   👤 Therapist Name: ${therapist.name}`);
    
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

// Get all data functions - using Firebase
export const getAllPatients = firebaseGetAllPatients;
export const getAllDoctors = firebaseGetAllDoctors;
export const getAllTherapists = firebaseGetAllTherapists;
export const getAllHospitals = firebaseGetAllHospitals;

// Appointment functions - using Firebase
export const getAppointmentsByPatient = firebaseGetAppointmentsByPatient;
export const addAppointment = firebaseAddAppointment;

// Authentication functions - now using Firebase
export const authenticatePatient = async (id: string, password: string): Promise<Patient | null> => {
  try {
    console.log(`🔐 Authenticating patient: ${id}`);
    const patient = await authenticatePatientByIdPassword(id, password);
    
    if (patient) {
      console.log(`✅ Patient login successful: ${patient.name}`);
      return patient;
    } else {
      console.log(`❌ Patient login failed for ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error('Patient authentication error:', error);
    return null;
  }
};

export const authenticateDoctor = async (username: string, password: string): Promise<Doctor | null> => {
  try {
    console.log(`🔐 Authenticating doctor: ${username}`);
    const doctor = await authenticateDoctorByUsername(username, password);
    
    if (doctor) {
      console.log(`✅ Doctor login successful: ${doctor.name}`);
      return doctor;
    } else {
      console.log(`❌ Doctor login failed for username: ${username}`);
      return null;
    }
  } catch (error) {
    console.error('Doctor authentication error:', error);
    return null;
  }
};

export const authenticateTherapist = async (username: string, password: string): Promise<Therapist | null> => {
  try {
    console.log(`🔐 Authenticating therapist: ${username}`);
    const therapist = await authenticateTherapistByUsername(username, password);
    
    if (therapist) {
      console.log(`✅ Therapist login successful: ${therapist.name}`);
      return therapist;
    } else {
      console.log(`❌ Therapist login failed for username: ${username}`);
      return null;
    }
  } catch (error) {
    console.error('Therapist authentication error:', error);
    return null;
  }
};

export const authenticateHospital = async (username: string, password: string): Promise<Hospital | null> => {
  try {
    console.log(`🔐 Authenticating hospital: ${username}`);
    const hospital = await authenticateHospitalByUsername(username, password);
    
    if (hospital) {
      console.log(`✅ Hospital login successful: ${hospital.name}`);
      return hospital;
    } else {
      console.log(`❌ Hospital login failed for username: ${username}`);
      return null;
    }
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

export const createAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
  console.warn('createAppointment is deprecated. Use addAppointment from Firebase service instead.');
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

// ====================
// ENHANCED FUNCTIONS USING ADVANCED DATA STRUCTURES
// ====================

// Export enhanced functions for use throughout the app
export {
  initializeDataMaps,
  getPatientFast,
  getDoctorFast,
  getHospitalFast,
  registerPatientWithValidation,
  addToAppointmentWaitingList,
  processNextAppointmentFromQueue,
  getWaitingListStatus,
  addNotificationToQueue,
  getPatientVisitedDoctors,
  getAllMedicalSpecialties,
  runPerformanceComparison
};

// Enhanced appointment booking with waiting queue
export const bookAppointmentWithQueue = async (
  patientId: string,
  doctorId: string,
  hospitalId: string,
  preferredDateTime: string,
  symptoms: string[],
  urgency: 'low' | 'normal' | 'high' | 'emergency' = 'normal'
): Promise<{ success: boolean; appointmentId?: string; waitingPosition?: number }> => {
  try {
    // Check if doctor is available (simplified check)
    const isAvailable = Math.random() > 0.3; // 70% chance of availability
    
    if (isAvailable) {
      // Create appointment directly
      const appointment = {
        patientId,
        doctorId,
        hospitalId,
        symptoms,
        dateTime: preferredDateTime,
        preInstructions: 'Please arrive 15 minutes early',
        postInstructions: 'Follow doctor\'s advice',
        status: 'scheduled' as const
      };
      
      const appointmentId = await addAppointment(appointment);
      
      // Send notification
      addNotificationToQueue({
        userId: patientId,
        userType: 'patient',
        title: 'Appointment Confirmed',
        message: `Your appointment has been confirmed for ${formatDate(preferredDateTime)} at ${formatTime(preferredDateTime)}`,
        type: 'success'
      });
      
      return { success: true, appointmentId };
    } else {
      // Add to waiting queue
      addToAppointmentWaitingList(patientId, doctorId, hospitalId, preferredDateTime, urgency);
      
      const waitingList = getWaitingListStatus();
      const waitingPosition = waitingList.totalWaiting;
      
      return { success: false, waitingPosition };
    }
  } catch (error) {
    console.error('Error booking appointment with queue:', error);
    return { success: false };
  }
};

// Enhanced patient search with fast lookup
export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    // First try fast lookup by exact ID
    const exactMatch = getPatientFast(searchTerm);
    if (exactMatch) {
      return [exactMatch];
    }
    
    // If no exact match, fall back to full search
    const allPatients = await getAllPatients();
    return allPatients.filter(patient => 
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.abhaPassport.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
};

// Enhanced doctor search with specialty filtering
export const searchDoctorsBySpecialty = async (specialty: string): Promise<Doctor[]> => {
  try {
    const allDoctors = await getAllDoctors();
    return allDoctors.filter(doctor => 
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching doctors by specialty:', error);
    return [];
  }
};

// Get patient statistics with unique data
export const getPatientStatistics = async (patientId: string) => {
  try {
    const patient = getPatientFast(patientId);
    if (!patient) {
      return null;
    }
    
    const appointments = await getAppointmentsByPatient(patientId);
    const visitedDoctors = await getPatientVisitedDoctors(patientId);
    const uniqueHospitals = new Set(appointments.map(apt => apt.hospitalId));
    
    return {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      uniqueDoctorsVisited: visitedDoctors.size,
      uniqueHospitalsVisited: uniqueHospitals.size,
      lastVisit: appointments[0]?.dateTime,
      upcomingAppointments: appointments.filter(apt => 
        apt.status === 'scheduled' && new Date(apt.dateTime) > new Date()
      ).length
    };
  } catch (error) {
    console.error('Error getting patient statistics:', error);
    return null;
  }
};

// Initialize the enhanced system
export const initializeEnhancedSystem = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing enhanced healthcare system...');
    
    // Initialize data maps
    await initializeDataMaps();
    
    // Run performance comparison to show improvement
    await runPerformanceComparison();
    
    console.log('✅ Enhanced healthcare system initialized!');
    console.log('📊 System now uses:');
    console.log('   - Map for O(1) patient/doctor/hospital lookups');
    console.log('   - Set for unique ID management');
    console.log('   - Queue for appointment waiting lists');
    console.log('   - Enhanced notification system');
  } catch (error) {
    console.error('❌ Error initializing enhanced system:', error);
  }
};

// Sample patient notes data for testing
export const createSamplePatientNotes = async () => {
  try {
    const { addPatientNote } = await import('./firebaseService');
    
    // Sample notes for patient "1" (John Doe)
    const sampleNotes = [
      {
        patientId: "1",
        doctorId: "1",
        appointmentId: "app1",
        content: "Patient complained of chest pain and shortness of breath. Prescribed medication and recommended rest.",
        structuredContent: {
          medicines: ["Aspirin 75mg daily", "Lisinopril 10mg daily"],
          cautions: ["Avoid strenuous exercise", "Monitor blood pressure regularly"],
          preventions: ["Regular cardio check-ups", "Healthy diet low in sodium"],
          generalNotes: ["Patient shows good compliance with previous medications", "Follow-up in 2 weeks"]
        }
      },
      {
        patientId: "1", 
        doctorId: "2",
        appointmentId: "app2",
        content: "Routine check-up. Blood pressure and heart rate normal. Patient feeling well.",
        structuredContent: {
          medicines: ["Continue current medications"],
          cautions: ["Continue monitoring symptoms"],
          preventions: ["Regular exercise", "Balanced diet"],
          generalNotes: ["Patient appears healthy", "Next appointment in 3 months"]
        }
      }
    ];

    for (const note of sampleNotes) {
      await addPatientNote(note);
    }
    
    console.log('✅ Sample patient notes created successfully');
  } catch (error) {
    console.error('❌ Error creating sample patient notes:', error);
  }
};
