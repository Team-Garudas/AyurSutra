// Enhanced authentication service for patient login after registration
import { addPatient, getPatient } from './firebaseService';
import { Patient } from './mockData';

export interface PatientAuthResult {
  success: boolean;
  patient?: Patient;
  firebaseId?: string;
  error?: string;
}

export const registerAndAuthenticatePatient = async (patientData: Patient): Promise<PatientAuthResult> => {
  try {
    console.log('🔐 Starting patient registration and authentication process...');
    
    // Step 1: Register patient in Firebase
    const firebaseId = await addPatient(patientData);
    
    if (!firebaseId) {
      return {
        success: false,
        error: 'Failed to register patient in Firebase'
      };
    }

    console.log('✅ Patient registered successfully:', firebaseId);
    
    // Step 2: Verify registration by fetching the patient
    const registeredPatient = await getPatient(firebaseId);
    
    if (!registeredPatient) {
      return {
        success: false,
        error: 'Registration verification failed'
      };
    }

    console.log('✅ Patient registration verified');
    
    // Step 3: Return success with patient data
    return {
      success: true,
      patient: registeredPatient,
      firebaseId
    };

  } catch (error: any) {
    console.error('❌ Registration and authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Registration failed'
    };
  }
};

// Authenticate existing patient by Panchakarma ID and password
export const authenticatePatientById = async (patientId: string, password: string): Promise<PatientAuthResult> => {
  try {
    console.log('🔐 Authenticating patient:', patientId);
    
    // For now, we'll use a simple query approach
    // In production, this should use proper authentication
    const patient = await getPatient(patientId);
    
    if (!patient) {
      return {
        success: false,
        error: 'Patient not found'
      };
    }

    if (patient.password !== password) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    console.log('✅ Patient authenticated successfully:', patient.name);
    
    return {
      success: true,
      patient
    };

  } catch (error: any) {
    console.error('❌ Authentication failed:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};