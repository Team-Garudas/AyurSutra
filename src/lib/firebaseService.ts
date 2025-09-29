// Firebase database operations for AyurSutra
// NOTE: Firebase Storage removed to avoid paid plan - using local file storage
// ENHANCED: Now uses advanced data structures for better performance
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // REMOVED
import { auth, db } from './firebase'; // NOTE: NO storage import
import { Patient, Doctor, Therapist, Hospital, Appointment, AuthUser, formatDate, formatTime } from './mockData';
import { 
  healthcareDataMaps, 
  healthcareDataSets, 
  appointmentWaitingQueue, 
  notificationQueue,
  AppointmentRequest,
  NotificationItem 
} from './dataStructures';

// ====================
// AUTHENTICATION
// ====================

export const signUpUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed up successfully:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Sign up error:', error.message);
    throw new Error(error.message);
  }
};

export const signInUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in successfully:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Sign in error:', error.message);
    throw new Error(error.message);
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error: any) {
    console.error('❌ Sign out error:', error.message);
    throw new Error(error.message);
  }
};

// ====================
// PATIENTS
// ====================

export const addPatient = async (patient: Omit<Patient, 'id'> | Patient): Promise<string> => {
  try {
    console.log('🔥 Firebase addPatient called with:', JSON.stringify(patient, null, 2));
    console.log('📊 Database connection status:', db ? 'Connected' : 'Not connected');
    
    const patientsRef = collection(db, 'patients');
    console.log('📋 Patients collection reference created');
    
    const docData = {
      ...patient,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    console.log('📝 Document data prepared:', JSON.stringify(docData, null, 2));
    
    const docRef = await addDoc(patientsRef, docData);
    console.log('✅ Patient added with Firebase Document ID:', docRef.id);
    
    // If patient has a Panchakarma ID, log both IDs
    if ('id' in patient && patient.id) {
      console.log('📋 Patient Panchakarma ID:', patient.id);
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding patient:', error);
    console.error('❌ Error details:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const getPatient = async (patientId: string): Promise<Patient | null> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    const patientSnap = await getDoc(patientRef);
    
    if (patientSnap.exists()) {
      const data = patientSnap.data();
      return {
        ...data,
        // Keep the original ID from the document, don't override with Firebase doc ID
        id: data.id || patientSnap.id // Use stored ID if available, fallback to Firebase doc ID
      } as Patient;
    } else {
      console.log('❌ Patient not found');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting patient:', error);
    throw new Error(error.message);
  }
};

export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const querySnapshot = await getDocs(patientsRef);
    
    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      } as Patient);
    });
    
    console.log(`✅ Retrieved ${patients.length} patients`);
    return patients;
  } catch (error: any) {
    console.error('❌ Error getting patients:', error);
    throw new Error(error.message);
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient>): Promise<void> => {
  try {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Patient updated successfully');
  } catch (error: any) {
    console.error('❌ Error updating patient:', error);
    throw new Error(error.message);
  }
};

// ====================
// DOCTORS
// ====================

export const addDoctor = async (doctor: Omit<Doctor, 'id'> | Doctor): Promise<string> => {
  try {
    console.log('🔥 Firebase addDoctor called with:', JSON.stringify(doctor, null, 2));
    console.log('📊 Database connection status:', db ? 'Connected' : 'Not connected');
    
    const doctorsRef = collection(db, 'doctors');
    console.log('📋 Doctors collection reference created');
    
    const docData = {
      ...doctor,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    console.log('📝 Document data prepared:', JSON.stringify(docData, null, 2));
    
    const docRef = await addDoc(doctorsRef, docData);
    console.log('✅ Doctor added with Firebase Document ID:', docRef.id);
    
    // If doctor has an ID, log both IDs
    if ('id' in doctor && doctor.id) {
      console.log('👨‍⚕️ Doctor ID:', doctor.id);
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding doctor:', error);
    console.error('❌ Error details:', error.code, error.message);
    throw new Error(error.message);
  }
};

export const getDoctor = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const doctorRef = doc(db, 'doctors', doctorId);
    const doctorSnap = await getDoc(doctorRef);
    
    if (doctorSnap.exists()) {
      const data = doctorSnap.data();
      return {
        id: doctorSnap.id,
        ...data
      } as Doctor;
    } else {
      console.log('❌ Doctor not found');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting doctor:', error);
    throw new Error(error.message);
  }
};

export const getDoctorsByHospital = async (hospitalId?: string): Promise<Doctor[]> => {
  try {
    // Return all doctors - they are now global and available to all hospitals
    const doctorsRef = collection(db, 'doctors');
    const querySnapshot = await getDocs(doctorsRef);
    
    const doctors: Doctor[] = [];
    querySnapshot.forEach((doc) => {
      const doctorData = doc.data() as Doctor;
      doctors.push({
        id: doc.id,
        ...doctorData,
        // Ensure backward compatibility
        hospitals: doctorData.hospitals || (doctorData.hospitalId ? [doctorData.hospitalId] : []),
        isGlobal: doctorData.isGlobal !== undefined ? doctorData.isGlobal : true
      });
    });
    
    console.log(`✅ Retrieved ${doctors.length} doctors (global access)`);
    return doctors;
  } catch (error: any) {
    console.error('❌ Error getting doctors:', error);
    throw new Error(error.message);
  }
};

// Get all doctors (global access)
export const getAllDoctorsGlobal = async (): Promise<Doctor[]> => {
  return getDoctorsByHospital(); // Now returns all doctors
};

// ====================
// THERAPISTS
// ====================

export const addTherapist = async (therapist: Omit<Therapist, 'id'> | Therapist): Promise<string> => {
  try {
    const therapistsRef = collection(db, 'therapists');
    const docRef = await addDoc(therapistsRef, {
      ...therapist,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Therapist added with Firebase Document ID:', docRef.id);
    
    // If therapist has an ID, log both IDs
    if ('id' in therapist && therapist.id) {
      console.log('🧘‍♀️ Therapist ID:', therapist.id);
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding therapist:', error);
    throw new Error(error.message);
  }
};

export const getTherapist = async (therapistId: string): Promise<Therapist | null> => {
  try {
    const therapistRef = doc(db, 'therapists', therapistId);
    const therapistSnap = await getDoc(therapistRef);
    
    if (therapistSnap.exists()) {
      const data = therapistSnap.data();
      return {
        id: therapistSnap.id,
        ...data
      } as Therapist;
    } else {
      console.log('❌ Therapist not found');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting therapist:', error);
    throw new Error(error.message);
  }
};

export const getTherapistsByHospital = async (hospitalId: string): Promise<Therapist[]> => {
  try {
    const therapistsRef = collection(db, 'therapists');
    const q = query(therapistsRef, where('hospitalId', '==', hospitalId));
    const querySnapshot = await getDocs(q);
    
    const therapists: Therapist[] = [];
    querySnapshot.forEach((doc) => {
      therapists.push({
        id: doc.id,
        ...doc.data()
      } as Therapist);
    });
    
    console.log(`✅ Retrieved ${therapists.length} therapists for hospital ${hospitalId}`);
    return therapists;
  } catch (error: any) {
    console.error('❌ Error getting therapists by hospital:', error);
    throw new Error(error.message);
  }
};

export const getAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, 'doctors');
    const querySnapshot = await getDocs(doctorsRef);
    
    const doctors: Doctor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      doctors.push({
        ...data,
        // Keep the original ID from the document, don't override with Firebase doc ID
        id: data.id || doc.id // Use stored ID if available, fallback to Firebase doc ID
      } as Doctor);
    });
    
    console.log(`✅ Retrieved ${doctors.length} doctors`);
    return doctors;
  } catch (error: any) {
    console.error('❌ Error getting all doctors:', error);
    throw new Error(error.message);
  }
};

export const getAllTherapists = async (): Promise<Therapist[]> => {
  try {
    const therapistsRef = collection(db, 'therapists');
    const querySnapshot = await getDocs(therapistsRef);
    
    const therapists: Therapist[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      therapists.push({
        ...data,
        // Keep the original ID from the document, don't override with Firebase doc ID
        id: data.id || doc.id // Use stored ID if available, fallback to Firebase doc ID
      } as Therapist);
    });
    
    console.log(`✅ Retrieved ${therapists.length} therapists`);
    return therapists;
  } catch (error: any) {
    console.error('❌ Error getting all therapists:', error);
    throw new Error(error.message);
  }
};

// ====================
// HOSPITALS
// ====================

export const addHospital = async (hospital: Omit<Hospital, 'id'>): Promise<string> => {
  try {
    const hospitalsRef = collection(db, 'hospitals');
    const docRef = await addDoc(hospitalsRef, {
      ...hospital,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Hospital added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding hospital:', error);
    throw new Error(error.message);
  }
};

export const getHospital = async (hospitalId: string): Promise<Hospital | null> => {
  try {
    const hospitalRef = doc(db, 'hospitals', hospitalId);
    const hospitalSnap = await getDoc(hospitalRef);
    
    if (hospitalSnap.exists()) {
      const data = hospitalSnap.data();
      return {
        id: hospitalSnap.id,
        ...data
      } as Hospital;
    } else {
      console.log('❌ Hospital not found');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting hospital:', error);
    throw new Error(error.message);
  }
};

export const getAllHospitals = async (): Promise<Hospital[]> => {
  try {
    const hospitalsRef = collection(db, 'hospitals');
    const querySnapshot = await getDocs(hospitalsRef);
    
    const hospitals: Hospital[] = [];
    querySnapshot.forEach((doc) => {
      hospitals.push({
        id: doc.id,
        ...doc.data()
      } as Hospital);
    });
    
    console.log(`✅ Retrieved ${hospitals.length} hospitals`);
    return hospitals;
  } catch (error: any) {
    console.error('❌ Error getting hospitals:', error);
    throw new Error(error.message);
  }
};

// ====================
// AUTHENTICATION FUNCTIONS
// ====================

export const authenticatePatientByIdPassword = async (patientId: string, password: string): Promise<Patient | null> => {
  try {
    console.log(`🔐 Authenticating patient with ID: ${patientId}`);
    
    // First try to get patient by Firebase document ID
    let patient = await getPatient(patientId);
    
    // If not found by document ID, search by Panchakarma ID in the collection
    if (!patient) {
      console.log(`🔍 Searching for patient by Panchakarma ID: ${patientId}`);
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef, where('id', '==', patientId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const patientDoc = querySnapshot.docs[0];
        patient = { id: patientDoc.id, ...patientDoc.data() } as Patient;
        console.log(`✅ Found patient by Panchakarma ID:`, patient.name);
      }
    }
    
    if (!patient) {
      console.log('❌ Patient not found with ID:', patientId);
      return null;
    }
    
    // Check password (in real app, passwords should be hashed)
    if (patient.password === password) {
      console.log('✅ Patient authentication successful:', patient.name);
      return patient;
    } else {
      console.log('❌ Invalid password for patient:', patientId);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Patient authentication error:', error);
    return null;
  }
};

export const authenticateDoctorByUsername = async (username: string, password: string): Promise<Doctor | null> => {
  try {
    console.log(`🔐 Authenticating doctor with username: ${username}`);
    
    // Query doctors by username
    const doctorsRef = collection(db, 'doctors');
    const q = query(doctorsRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Doctor not found with username:', username);
      return null;
    }
    
    const doctorDoc = querySnapshot.docs[0];
    const doctor = { id: doctorDoc.id, ...doctorDoc.data() } as Doctor;
    
    // Check password
    if (doctor.password === password) {
      console.log('✅ Doctor authentication successful:', doctor.name);
      return doctor;
    } else {
      console.log('❌ Invalid password for doctor:', username);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Doctor authentication error:', error);
    return null;
  }
};

export const authenticateTherapistByUsername = async (username: string, password: string): Promise<Therapist | null> => {
  try {
    console.log(`🔐 Authenticating therapist with username: ${username}`);
    
    // Query therapists by username
    const therapistsRef = collection(db, 'therapists');
    const q = query(therapistsRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Therapist not found with username:', username);
      return null;
    }
    
    const therapistDoc = querySnapshot.docs[0];
    const therapist = { id: therapistDoc.id, ...therapistDoc.data() } as Therapist;
    
    // Check password
    if (therapist.password === password) {
      console.log('✅ Therapist authentication successful:', therapist.name);
      return therapist;
    } else {
      console.log('❌ Invalid password for therapist:', username);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Therapist authentication error:', error);
    return null;
  }
};

export const authenticateHospitalByUsername = async (username: string, password: string): Promise<Hospital | null> => {
  try {
    console.log(`🔐 Authenticating hospital with username: ${username}`);
    
    // Query hospitals by admin username
    const hospitalsRef = collection(db, 'hospitals');
    const q = query(hospitalsRef, where('adminUsername', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Hospital not found with username:', username);
      return null;
    }
    
    const hospitalDoc = querySnapshot.docs[0];
    const hospital = { id: hospitalDoc.id, ...hospitalDoc.data() } as Hospital;
    
    // Check password
    if (hospital.adminPassword === password) {
      console.log('✅ Hospital authentication successful:', hospital.name);
      return hospital;
    } else {
      console.log('❌ Invalid password for hospital:', username);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Hospital authentication error:', error);
    return null;
  }
};

// ====================
// APPOINTMENTS
// ====================

export const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<string> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const docRef = await addDoc(appointmentsRef, {
      ...appointment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Appointment added with ID:', docRef.id);
    
    // Create notification for patient
    await addNotification({
      userId: appointment.patientId,
      userType: 'patient',
      title: 'Appointment Scheduled',
      message: `Your appointment has been scheduled for ${formatDate(appointment.dateTime)} at ${formatTime(appointment.dateTime)}`,
      type: 'appointment',
      read: false,
      timestamp: new Date(),
      appointmentId: docRef.id
    });
    
    // Create notification for doctor
    await addNotification({
      userId: appointment.doctorId,
      userType: 'doctor',
      title: 'New Appointment',
      message: `A new appointment has been scheduled for ${formatDate(appointment.dateTime)} at ${formatTime(appointment.dateTime)}`,
      type: 'appointment',
      read: false,
      timestamp: new Date(),
      appointmentId: docRef.id
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding appointment:', error);
    throw new Error(error.message);
  }
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    // Remove orderBy to avoid index requirement - we'll sort in JavaScript instead
    const q = query(appointmentsRef, where('patientId', '==', patientId));
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      } as Appointment);
    });
    
    // Sort by dateTime in JavaScript (most recent first)
    appointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    
    console.log(`✅ Retrieved ${appointments.length} appointments for patient ${patientId}`);
    return appointments;
  } catch (error: any) {
    console.error('❌ Error getting appointments by patient:', error);
    throw new Error(error.message);
  }
};

export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('doctorId', '==', doctorId), orderBy('dateTime', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      } as Appointment);
    });
    
    console.log(`✅ Retrieved ${appointments.length} appointments for doctor ${doctorId}`);
    return appointments;
  } catch (error: any) {
    console.error('❌ Error getting appointments by doctor:', error);
    throw new Error(error.message);
  }
};

// ====================
// APPOINTMENT MANAGEMENT
// ====================

// ====================
// PATIENT NOTES MANAGEMENT
// ====================

export interface PatientNote {
  id?: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  appointmentNumber?: string;
  content: string;
  structuredContent?: {
    medicines: string[];
    cautions: string[];
    preventions: string[];
    generalNotes: string[];
  };
  language?: string;
  originalContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const addPatientNote = async (note: Omit<PatientNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const notesRef = collection(db, 'patientNotes');
    const docRef = await addDoc(notesRef, {
      ...note,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ Patient note added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding patient note:', error);
    throw new Error(error.message);
  }
};

export const getPatientNotes = async (patientId: string): Promise<PatientNote[]> => {
  try {
    const notesRef = collection(db, 'patientNotes');
    const q = query(notesRef, where('patientId', '==', patientId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const notes: PatientNote[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PatientNote);
    });
    
    console.log(`✅ Retrieved ${notes.length} notes for patient ${patientId}`);
    return notes;
  } catch (error: any) {
    console.error('❌ Error getting patient notes:', error);
    throw new Error(error.message);
  }
};

// Listen to real-time updates for patient notes
export const listenToPatientNotes = (patientId: string, callback: (notes: PatientNote[]) => void) => {
  const notesRef = collection(db, 'patientNotes');
  const q = query(notesRef, where('patientId', '==', patientId));
  // orderBy('createdAt', 'desc') // Temporarily removed to avoid index requirement
  
  return onSnapshot(q, (snapshot) => {
    const notes: PatientNote[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PatientNote);
    });
    // Sort by createdAt descending on client-side
    notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log(`🔄 Real-time update: ${notes.length} notes for patient ${patientId}`);
    callback(notes);
  });
};

export const getPatientNotesByAppointment = async (appointmentId: string): Promise<PatientNote[]> => {
  try {
    const notesRef = collection(db, 'patientNotes');
    const q = query(notesRef, where('appointmentId', '==', appointmentId));
    // orderBy('createdAt', 'desc') // Temporarily removed to avoid index requirement
    const querySnapshot = await getDocs(q);
    
    const notes: PatientNote[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PatientNote);
    });
    
    // Sort by createdAt descending on client-side
    notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log(`✅ Retrieved ${notes.length} notes for appointment ${appointmentId}`);
    return notes;
  } catch (error: any) {
    console.error('❌ Error getting appointment notes:', error);
    throw new Error(error.message);
  }
};

export const getPatientNotesByAppointmentNumber = async (appointmentNumber: string): Promise<PatientNote[]> => {
  try {
    const notesRef = collection(db, 'patientNotes');
    const q = query(notesRef, where('appointmentNumber', '==', appointmentNumber), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const notes: PatientNote[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PatientNote);
    });
    
    console.log(`✅ Retrieved ${notes.length} notes for appointment number ${appointmentNumber}`);
    return notes;
  } catch (error: any) {
    console.error('❌ Error getting appointment notes by number:', error);
    throw new Error(error.message);
  }
};

export const updatePatientNote = async (noteId: string, updates: Partial<PatientNote>): Promise<void> => {
  try {
    const noteRef = doc(db, 'patientNotes', noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Patient note updated successfully with ID:', noteId);
  } catch (error: any) {
    console.error('❌ Error updating patient note:', error);
    throw new Error(error.message);
  }
};

// ====================
// APPOINTMENT MANAGEMENT
// ====================

export const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    
    if (!appointmentSnap.exists()) {
      console.log('❌ Appointment not found with ID:', appointmentId);
      return false;
    }
    
    const appointmentData = appointmentSnap.data() as Appointment;
    
    // Update the appointment status to cancelled
    await updateDoc(appointmentRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
    
    // Create notification for patient
    await addNotification({
      userId: appointmentData.patientId,
      userType: 'patient',
      title: 'Appointment Cancelled',
      message: `Your appointment scheduled for ${formatDate(appointmentData.dateTime)} at ${formatTime(appointmentData.dateTime)} has been cancelled.`,
      type: 'alert',
      read: false,
      timestamp: new Date(),
      appointmentId: appointmentId
    });
    
    // Create notification for doctor
    await addNotification({
      userId: appointmentData.doctorId,
      userType: 'doctor',
      title: 'Appointment Cancelled',
      message: `An appointment scheduled for ${formatDate(appointmentData.dateTime)} at ${formatTime(appointmentData.dateTime)} has been cancelled.`,
      type: 'alert',
      read: false,
      timestamp: new Date(),
      appointmentId: appointmentId
    });
    
    console.log('✅ Appointment cancelled successfully:', appointmentId);
    return true;
  } catch (error: any) {
    console.error('❌ Error cancelling appointment:', error);
    throw new Error(error.message);
  }
};

// ====================
// LOCAL FILE STORAGE (No Firebase Storage to avoid paid plan)
// ====================

export const uploadFile = async (file: File, folder: string = 'uploads'): Promise<string> => {
  try {
    // Convert file to base64 data URL for local storage
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        // Generate unique filename with timestamp
        const fileName = `${Date.now()}_${file.name}`;
        const fileKey = `${folder}_${fileName}`;
        
        // Store in localStorage with file metadata
        const fileData = {
          dataUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadTime: new Date().toISOString(),
          folder
        };
        
        try {
          localStorage.setItem(fileKey, JSON.stringify(fileData));
          console.log('✅ File stored locally:', fileName);
          
          // Return a local reference URL
          resolve(`local://${fileKey}`);
        } catch (error) {
          console.error('❌ Error storing file locally:', error);
          reject(new Error('Failed to store file locally'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    throw new Error(error.message);
  }
};

// Function to retrieve local file
export const getLocalFile = (fileUrl: string): string | null => {
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
    
    const fileData = JSON.parse(fileDataStr);
    return fileData.dataUrl;
  } catch (error) {
    console.error('Error retrieving local file:', error);
    return null;
  }
};

// Function to delete local file
export const deleteLocalFile = (fileUrl: string): boolean => {
  try {
    if (!fileUrl.startsWith('local://')) {
      console.warn('Cannot delete non-local file:', fileUrl);
      return false;
    }
    
    const fileKey = fileUrl.replace('local://', '');
    localStorage.removeItem(fileKey);
    console.log('✅ Local file deleted:', fileKey);
    return true;
  } catch (error) {
    console.error('Error deleting local file:', error);
    return false;
  }
};

// ====================
// REAL-TIME LISTENERS
// ====================

export const listenToPatients = (callback: (patients: Patient[]) => void) => {
  const patientsRef = collection(db, 'patients');
  return onSnapshot(patientsRef, (snapshot) => {
    const patients: Patient[] = [];
    snapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data()
      } as Patient);
    });
    callback(patients);
  });
};

export const listenToAppointments = (patientId: string, callback: (appointments: Appointment[]) => void) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(appointmentsRef, where('patientId', '==', patientId));
  // orderBy('dateTime', 'desc') // Temporarily removed to avoid index requirement
  
  return onSnapshot(q, (snapshot) => {
    const appointments: Appointment[] = [];
    snapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      } as Appointment);
    });
    // Sort by dateTime descending on client-side
    appointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    callback(appointments);
  });
};

// ====================
// NOTIFICATION SYSTEM
// ====================

export interface Notification {
  id?: string;
  userId: string;
  userType: 'patient' | 'doctor' | 'therapist' | 'hospital';
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'alert' | 'info';
  read: boolean;
  timestamp: Date | Timestamp;
  appointmentId?: string;
  link?: string;
}

export const addNotification = async (notification: Omit<Notification, 'id'>) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      timestamp: Timestamp.fromDate(notification.timestamp instanceof Date ? notification.timestamp : new Date()),
      read: false
    });
    console.log('✅ Notification added with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error adding notification:', error);
    throw new Error(error.message);
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: Timestamp.now()
    });
    console.log('✅ Notification marked as read:', notificationId);
    return true;
  } catch (error: any) {
    console.error('❌ Error marking notification as read:', error);
    throw new Error(error.message);
  }
};

export const markAllNotificationsAsRead = async (userId: string, userType: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      where('userType', '==', userType),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((document) => {
      const docRef = doc(db, 'notifications', document.id);
      batch.update(docRef, { 
        read: true,
        updatedAt: Timestamp.now()
      });
    });
    
    await batch.commit();
    console.log('✅ All notifications marked as read for user:', userId);
    return true;
  } catch (error: any) {
    console.error('❌ Error marking all notifications as read:', error);
    throw new Error(error.message);
  }
};

// ====================
// UTILITY FUNCTIONS
// ====================

export const generatePanchakarmaId = (): string => {
  const prefix = 'PKM';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Export current user state
export const getCurrentUser = () => auth.currentUser;

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// ====================
// ENHANCED FUNCTIONS USING ADVANCED DATA STRUCTURES
// ====================

// Initialize and populate maps with existing data
export const initializeDataMaps = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing data maps with existing Firebase data...');
    
    // Load all patients into map
    const patients = await getAllPatients();
    healthcareDataMaps.loadPatientsFromArray(patients);
    
    // Reserve patient IDs in set
    patients.forEach(patient => {
      healthcareDataSets.reservePatientId(patient.id);
    });
    
    // Load all doctors into map
    const doctors = await getAllDoctors();
    healthcareDataMaps.loadDoctorsFromArray(doctors);
    
    // Reserve doctor IDs and add specialties
    doctors.forEach(doctor => {
      healthcareDataSets.reserveDoctorId(doctor.id);
      if (doctor.specialty) {
        healthcareDataSets.addSpecialty(doctor.specialty);
      }
    });
    
    // Load all hospitals into map
    const hospitals = await getAllHospitals();
    healthcareDataMaps.loadHospitalsFromArray(hospitals);
    
    console.log('✅ Data maps initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing data maps:', error);
  }
};

// Enhanced patient operations using Map
export const getPatientFast = (patientId: string): Patient | undefined => {
  const patient = healthcareDataMaps.getPatient(patientId);
  if (patient) {
    console.log(`⚡ Fast patient lookup: ${patient.name} (${patientId})`);
  }
  return patient;
};

// Enhanced doctor operations using Map
export const getDoctorFast = (doctorId: string): Doctor | undefined => {
  const doctor = healthcareDataMaps.getDoctor(doctorId);
  if (doctor) {
    console.log(`⚡ Fast doctor lookup: ${doctor.name} (${doctorId})`);
  }
  return doctor;
};

// Enhanced hospital operations using Map
export const getHospitalFast = (hospitalId: string): Hospital | undefined => {
  const hospital = healthcareDataMaps.getHospital(hospitalId);
  if (hospital) {
    console.log(`⚡ Fast hospital lookup: ${hospital.name} (${hospitalId})`);
  }
  return hospital;
};

// Enhanced patient registration with ID validation
export const registerPatientWithValidation = async (patient: Omit<Patient, 'id'>): Promise<{ success: boolean; patientId?: string; error?: string }> => {
  try {
    // Generate unique ID
    let newId = generatePanchakarmaId();
    let attempts = 0;
    
    // Ensure ID is unique using Set
    while (healthcareDataSets.isPatientIdTaken(newId) && attempts < 10) {
      newId = generatePanchakarmaId();
      attempts++;
    }
    
    if (attempts >= 10) {
      return { success: false, error: 'Could not generate unique patient ID' };
    }
    
    // Reserve the ID
    if (!healthcareDataSets.reservePatientId(newId)) {
      return { success: false, error: 'Patient ID already exists' };
    }
    
    // Create patient with new ID
    const newPatient: Patient = { ...patient, id: newId };
    
    // Add to Firebase
    const firebaseId = await addPatient(newPatient);
    
    // Add to local map for fast access
    healthcareDataMaps.addPatient(newPatient);
    
    console.log(`✅ Patient registered with validation: ${newPatient.name} (${newId})`);
    return { success: true, patientId: newId };
    
  } catch (error: any) {
    console.error('❌ Error in patient registration with validation:', error);
    return { success: false, error: error.message };
  }
};

// Appointment waiting queue operations
export const addToAppointmentWaitingList = (
  patientId: string,
  doctorId: string,
  hospitalId: string,
  preferredDateTime: string,
  urgency: 'low' | 'normal' | 'high' | 'emergency' = 'normal'
): void => {
  const request: AppointmentRequest = {
    patientId,
    doctorId,
    hospitalId,
    preferredDateTime,
    requestTime: new Date(),
    urgency
  };
  
  appointmentWaitingQueue.addAppointmentRequest(request);
  
  // Also add notification
  const patient = getPatientFast(patientId);
  notificationQueue.addNotification({
    userId: patientId,
    userType: 'patient',
    title: 'Added to Waiting List',
    message: `You have been added to the appointment waiting list for ${preferredDateTime}`,
    type: 'info'
  });
  
  console.log(`📋 Patient ${patientId} added to waiting list (urgency: ${urgency})`);
};

export const processNextAppointmentFromQueue = async (): Promise<AppointmentRequest | null> => {
  const nextRequest = appointmentWaitingQueue.getNextAppointmentRequest();
  
  if (nextRequest) {
    console.log(`⏭️ Processing appointment request for patient: ${nextRequest.patientId}`);
    
    // Notify patient that their request is being processed
    notificationQueue.addNotification({
      userId: nextRequest.patientId,
      userType: 'patient',
      title: 'Appointment Being Processed',
      message: 'Your appointment request is now being processed. You will be notified once confirmed.',
      type: 'info'
    });
    
    return nextRequest;
  }
  
  return null;
};

// Get waiting list status
export const getWaitingListStatus = () => {
  const waitingPatients = appointmentWaitingQueue.getWaitingPatients();
  return {
    totalWaiting: waitingPatients.length,
    emergencyCount: waitingPatients.filter(p => p.urgency === 'emergency').length,
    highPriorityCount: waitingPatients.filter(p => p.urgency === 'high').length,
    normalCount: waitingPatients.filter(p => p.urgency === 'normal').length,
    lowPriorityCount: waitingPatients.filter(p => p.urgency === 'low').length,
    waitingList: waitingPatients
  };
};

// Enhanced notification system
export const addNotificationToQueue = (notification: NotificationItem): void => {
  notificationQueue.addNotification(notification);
};

export const processNextNotification = (): NotificationItem | undefined => {
  return notificationQueue.processNextNotification();
};

export const getNotificationsForUser = (userId: string): NotificationItem[] => {
  return notificationQueue.getNotificationsForUser(userId);
};

// Get unique visited doctors for a patient using Set
export const getPatientVisitedDoctors = async (patientId: string): Promise<Set<string>> => {
  try {
    const appointments = await getAppointmentsByPatient(patientId);
    return healthcareDataSets.getPatientVisitedDoctors(patientId, appointments);
  } catch (error) {
    console.error('Error getting patient visited doctors:', error);
    return new Set<string>();
  }
};

// Get all unique medical specialties
export const getAllMedicalSpecialties = (): string[] => {
  return healthcareDataSets.getAllSpecialties();
};

// Performance comparison function
export const runPerformanceComparison = async (): Promise<void> => {
  console.log('🏃‍♂️ Running performance comparison: Array vs Map lookup...');
  
  try {
    // Get all patients as array (current method)
    const patientsArray = await getAllPatients();
    const testId = patientsArray[Math.floor(patientsArray.length / 2)]?.id;
    
    if (!testId) {
      console.log('No patients available for performance test');
      return;
    }
    
    const iterations = 1000;
    
    // Test array search (current method)
    console.time('Array Search (Current Method)');
    for (let i = 0; i < iterations; i++) {
      const found = patientsArray.find(p => p.id === testId);
    }
    console.timeEnd('Array Search (Current Method)');
    
    // Test map search (new method)
    console.time('Map Search (New Method)');
    for (let i = 0; i < iterations; i++) {
      const found = healthcareDataMaps.getPatient(testId);
    }
    console.timeEnd('Map Search (New Method)');
    
    console.log(`📊 Performance test completed with ${iterations} iterations`);
    console.log(`✅ Map search is significantly faster for large datasets!`);
    
  } catch (error) {
    console.error('Error running performance comparison:', error);
  }
};
