// Advanced Data Structures for Healthcare System Optimization
// Implements Map, Set, Queue for better performance and functionality

import { Patient, Doctor, Hospital, Appointment, Therapist } from './mockData';

// ====================
// MAP IMPLEMENTATIONS FOR FAST LOOKUPS
// ====================

export class HealthcareDataMaps {
  private patientMap = new Map<string, Patient>();
  private doctorMap = new Map<string, Doctor>();
  private hospitalMap = new Map<string, Hospital>();
  private therapistMap = new Map<string, Therapist>();
  private appointmentMap = new Map<string, Appointment>();

  // Patient Map Operations - O(1) lookup time
  addPatient(patient: Patient): void {
    this.patientMap.set(patient.id, patient);
    console.log(`✅ Added patient to map: ${patient.name} (${patient.id})`);
  }

  getPatient(id: string): Patient | undefined {
    return this.patientMap.get(id);
  }

  getAllPatients(): Patient[] {
    return Array.from(this.patientMap.values());
  }

  removePatient(id: string): boolean {
    const removed = this.patientMap.delete(id);
    if (removed) {
      console.log(`🗑️ Removed patient from map: ${id}`);
    }
    return removed;
  }

  // Doctor Map Operations
  addDoctor(doctor: Doctor): void {
    this.doctorMap.set(doctor.id, doctor);
    console.log(`✅ Added doctor to map: ${doctor.name} (${doctor.id})`);
  }

  getDoctor(id: string): Doctor | undefined {
    return this.doctorMap.get(id);
  }

  getAllDoctors(): Doctor[] {
    return Array.from(this.doctorMap.values());
  }

  getDoctorsByHospital(hospitalId: string): Doctor[] {
    return this.getAllDoctors().filter(doctor => doctor.hospitalId === hospitalId);
  }

  // Hospital Map Operations
  addHospital(hospital: Hospital): void {
    this.hospitalMap.set(hospital.id, hospital);
    console.log(`✅ Added hospital to map: ${hospital.name} (${hospital.id})`);
  }

  getHospital(id: string): Hospital | undefined {
    return this.hospitalMap.get(id);
  }

  getAllHospitals(): Hospital[] {
    return Array.from(this.hospitalMap.values());
  }

  // Therapist Map Operations
  addTherapist(therapist: Therapist): void {
    this.therapistMap.set(therapist.id, therapist);
    console.log(`✅ Added therapist to map: ${therapist.name} (${therapist.id})`);
  }

  getTherapist(id: string): Therapist | undefined {
    return this.therapistMap.get(id);
  }

  getAllTherapists(): Therapist[] {
    return Array.from(this.therapistMap.values());
  }

  // Appointment Map Operations
  addAppointment(appointment: Appointment): void {
    this.appointmentMap.set(appointment.id, appointment);
    console.log(`✅ Added appointment to map: ${appointment.id}`);
  }

  getAppointment(id: string): Appointment | undefined {
    return this.appointmentMap.get(id);
  }

  getAppointmentsByPatient(patientId: string): Appointment[] {
    return Array.from(this.appointmentMap.values())
      .filter(appointment => appointment.patientId === patientId);
  }

  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return Array.from(this.appointmentMap.values())
      .filter(appointment => appointment.doctorId === doctorId);
  }

  // Bulk load from arrays (for migration from existing system)
  loadPatientsFromArray(patients: Patient[]): void {
    patients.forEach(patient => this.addPatient(patient));
    console.log(`📊 Loaded ${patients.length} patients into map`);
  }

  loadDoctorsFromArray(doctors: Doctor[]): void {
    doctors.forEach(doctor => this.addDoctor(doctor));
    console.log(`📊 Loaded ${doctors.length} doctors into map`);
  }

  loadHospitalsFromArray(hospitals: Hospital[]): void {
    hospitals.forEach(hospital => this.addHospital(hospital));
    console.log(`📊 Loaded ${hospitals.length} hospitals into map`);
  }

  loadAppointmentsFromArray(appointments: Appointment[]): void {
    appointments.forEach(appointment => this.addAppointment(appointment));
    console.log(`📊 Loaded ${appointments.length} appointments into map`);
  }
}

// ====================
// SET IMPLEMENTATIONS FOR UNIQUE DATA
// ====================

export class HealthcareDataSets {
  private usedPatientIds = new Set<string>();
  private usedDoctorIds = new Set<string>();
  private usedHospitalIds = new Set<string>();
  private medicalSpecialties = new Set<string>();

  // Patient ID Management
  isPatientIdTaken(id: string): boolean {
    return this.usedPatientIds.has(id);
  }

  reservePatientId(id: string): boolean {
    if (this.usedPatientIds.has(id)) {
      console.log(`❌ Patient ID already taken: ${id}`);
      return false;
    }
    this.usedPatientIds.add(id);
    console.log(`✅ Patient ID reserved: ${id}`);
    return true;
  }

  releasePatientId(id: string): void {
    this.usedPatientIds.delete(id);
    console.log(`🔓 Patient ID released: ${id}`);
  }

  // Doctor ID Management
  isDoctorIdTaken(id: string): boolean {
    return this.usedDoctorIds.has(id);
  }

  reserveDoctorId(id: string): boolean {
    if (this.usedDoctorIds.has(id)) {
      console.log(`❌ Doctor ID already taken: ${id}`);
      return false;
    }
    this.usedDoctorIds.add(id);
    console.log(`✅ Doctor ID reserved: ${id}`);
    return true;
  }

  // Medical Specialties Management
  addSpecialty(specialty: string): void {
    this.medicalSpecialties.add(specialty.toLowerCase());
  }

  getAllSpecialties(): string[] {
    return Array.from(this.medicalSpecialties);
  }

  hasSpecialty(specialty: string): boolean {
    return this.medicalSpecialties.has(specialty.toLowerCase());
  }

  // Patient-specific Sets
  getPatientAllergies(patientId: string): Set<string> {
    // In real implementation, this would be stored per patient
    return new Set<string>();
  }

  addPatientAllergy(patientId: string, allergy: string): void {
    // In real implementation, this would update patient's allergy set
    console.log(`➕ Added allergy for patient ${patientId}: ${allergy}`);
  }

  getPatientVisitedDoctors(patientId: string, appointments: Appointment[]): Set<string> {
    const doctorIds = new Set<string>();
    appointments
      .filter(apt => apt.patientId === patientId)
      .forEach(apt => doctorIds.add(apt.doctorId));
    return doctorIds;
  }
}

// ====================
// QUEUE IMPLEMENTATIONS FOR APPOINTMENTS & NOTIFICATIONS
// ====================

export interface QueueItem<T> {
  data: T;
  timestamp: Date;
  priority?: number; // Higher number = higher priority
}

export class HealthcareQueue<T> {
  private queue: QueueItem<T>[] = [];

  // Add item to queue (FIFO by default)
  enqueue(data: T, priority: number = 0): void {
    const item: QueueItem<T> = {
      data,
      timestamp: new Date(),
      priority
    };
    
    // Insert based on priority (higher priority first)
    if (priority > 0) {
      let inserted = false;
      for (let i = 0; i < this.queue.length; i++) {
        if ((this.queue[i].priority || 0) < priority) {
          this.queue.splice(i, 0, item);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        this.queue.push(item);
      }
    } else {
      this.queue.push(item);
    }
    
    console.log(`📥 Added to queue (priority: ${priority}):`, data);
  }

  // Remove and return first item (FIFO)
  dequeue(): T | undefined {
    const item = this.queue.shift();
    if (item) {
      console.log(`📤 Removed from queue:`, item.data);
      return item.data;
    }
    return undefined;
  }

  // Look at first item without removing
  peek(): T | undefined {
    return this.queue[0]?.data;
  }

  // Check if queue is empty
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  // Get queue size
  size(): number {
    return this.queue.length;
  }

  // Get all items without removing
  getAllItems(): T[] {
    return this.queue.map(item => item.data);
  }

  // Clear entire queue
  clear(): void {
    this.queue = [];
    console.log(`🧹 Queue cleared`);
  }
}

// ====================
// SPECIALIZED QUEUES FOR HEALTHCARE
// ====================

export interface AppointmentRequest {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  preferredDateTime: string;
  requestTime: Date;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
}

export interface NotificationItem {
  userId: string;
  userType: 'patient' | 'doctor' | 'therapist' | 'hospital';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export class AppointmentWaitingQueue extends HealthcareQueue<AppointmentRequest> {
  constructor() {
    super();
  }

  addAppointmentRequest(request: AppointmentRequest): void {
    // Convert urgency to priority number
    const priorityMap = {
      'emergency': 100,
      'high': 50,
      'normal': 10,
      'low': 1
    };
    
    const priority = priorityMap[request.urgency];
    this.enqueue(request, priority);
    
    console.log(`🏥 Appointment request added - Patient: ${request.patientId}, Urgency: ${request.urgency}`);
  }

  getNextAppointmentRequest(): AppointmentRequest | undefined {
    return this.dequeue();
  }

  getWaitingPatients(): AppointmentRequest[] {
    return this.getAllItems();
  }
}

export class NotificationQueue extends HealthcareQueue<NotificationItem> {
  constructor() {
    super();
  }

  addNotification(notification: NotificationItem): void {
    // Error notifications get highest priority
    const priority = notification.type === 'error' ? 50 : 
                    notification.type === 'warning' ? 25 : 10;
    
    this.enqueue(notification, priority);
    console.log(`🔔 Notification queued for ${notification.userId}: ${notification.title}`);
  }

  processNextNotification(): NotificationItem | undefined {
    return this.dequeue();
  }

  getNotificationsForUser(userId: string): NotificationItem[] {
    return this.getAllItems().filter(notification => notification.userId === userId);
  }
}

// ====================
// SINGLETON INSTANCES FOR GLOBAL USE
// ====================

export const healthcareDataMaps = new HealthcareDataMaps();
export const healthcareDataSets = new HealthcareDataSets();
export const appointmentWaitingQueue = new AppointmentWaitingQueue();
export const notificationQueue = new NotificationQueue();

// ====================
// UTILITY FUNCTIONS
// ====================

export const initializeDataStructures = async () => {
  console.log('🚀 Initializing advanced data structures...');
  
  // Initialize default medical specialties
  const specialties = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics',
    'Neurology', 'Pediatrics', 'Gynecology', 'Psychiatry',
    'Ayurveda', 'Panchakarma', 'Yoga Therapy'
  ];
  
  specialties.forEach(specialty => {
    healthcareDataSets.addSpecialty(specialty);
  });
  
  console.log('✅ Data structures initialized successfully!');
};

// Performance comparison functions
export const performanceTest = () => {
  console.log('🏃‍♂️ Running performance tests...');
  
  // Test array vs Map lookup performance
  const testData = Array.from({ length: 1000 }, (_, i) => ({
    id: `P${i.toString().padStart(4, '0')}`,
    name: `Patient ${i}`,
    dob: '1990-01-01',
    bloodGroup: 'O+',
    address: 'Test Address',
    photoUrl: '',
    abhaPassport: `ABHA${i}`,
    registrationTime: new Date().toISOString(),
    isResident: true,
    password: 'test123'
  }));

  // Array search (slow)
  console.time('Array Search');
  for (let i = 0; i < 100; i++) {
    const found = testData.find(p => p.id === 'P0500');
  }
  console.timeEnd('Array Search');

  // Map search (fast)
  const patientMap = new Map(testData.map(p => [p.id, p]));
  console.time('Map Search');
  for (let i = 0; i < 100; i++) {
    const found = patientMap.get('P0500');
  }
  console.timeEnd('Map Search');
  
  console.log('✅ Performance test completed!');
};