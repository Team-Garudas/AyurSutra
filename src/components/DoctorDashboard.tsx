import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import { 
  Search, 
  User, 
  FileText, 
  Plus,
  LogOut,
  Stethoscope,
  Calendar,
  Clock,
  Heart,
  TrendingUp,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Download,
  Eye,
  MoreHorizontal,
  Mic,
  MicOff,
  Save
} from 'lucide-react';
import { Patient, Doctor, Appointment, getPatientById, getAllPatients, formatDate, formatTime } from '@/lib/mockData';

// Enhanced CSS animations for premium micro-interactions
const injectAnimations = () => {
  if (document.getElementById('premium-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'premium-animations';
  style.textContent = `
    @keyframes progress {
      from { stroke-dasharray: 0, 100; }
      to { stroke-dasharray: 75, 100; }
    }
    
    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateX(-20px); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0); 
      }
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: scale(1);
      }
      40%, 43% {
        transform: scale(1.08);
      }
      70% {
        transform: scale(1.05);
      }
      90% {
        transform: scale(1.02);
      }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.6s ease-out both;
    }
    
    .animate-slideIn {
      animation: slideIn 0.6s ease-out both;
    }
  `;
  document.head.appendChild(style);
};
import { 
  getAppointmentsByPatient, 
  addAppointment, 
  addPatientNote, 
  getPatientNotes, 
  getPatientNotesByAppointment,
  getPatientNotesByAppointmentNumber,
  updatePatientNote,
  PatientNote 
} from '@/lib/firebaseService';

interface DoctorDashboardProps {
  doctor: Doctor;
  onLogout: () => void;
}

export default function DoctorDashboard({ doctor, onLogout }: DoctorDashboardProps) {
  const { toast } = useToast();
  // We'll add useEffect hooks after function definitions

  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newNote, setNewNote] = useState('');
  const [dietPlan, setDietPlan] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [showPatientList, setShowPatientList] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [appointmentSymptoms, setAppointmentSymptoms] = useState('');
  const [appointmentInstructions, setAppointmentInstructions] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  
  // Speech-to-text state variables
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [structuredNotes, setStructuredNotes] = useState<{
    medicines: string[];
    cautions: string[];
    preventions: string[];
    generalNotes: string[];
  }>({
    medicines: [],
    cautions: [],
    preventions: [],
    generalNotes: []
  });
  const [appointmentNumber, setAppointmentNumber] = useState('');
  const [processingNotes, setProcessingNotes] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('english');
  const [patientHistory, setPatientHistory] = useState<PatientNote[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPdfOption, setShowPdfOption] = useState(false);
  const [lastSavedNoteId, setLastSavedNoteId] = useState<string>('');
  
  // User authentication state
  const [user, setUser] = useState<any>(null);
  
  // Reference for speech recognition
  const recognitionRef = useRef<any>(null);
  
  // Enhanced Appointment Management State
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [allDoctorAppointments, setAllDoctorAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showScheduleView, setShowScheduleView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [newAppointmentDateTime, setNewAppointmentDateTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [showAppointmentActions, setShowAppointmentActions] = useState<string | null>(null);

  // Helper to get current datetime in the format needed for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper to check if appointment is today
  const isToday = (dateTime: string): boolean => {
    const appointmentDate = new Date(dateTime);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  };

  // Helper to format time for display
  const formatTimeSlot = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Get appointment status color
  const getStatusColor = (status: string, isPending: boolean = false) => {
    if (isPending) return 'bg-amber-100 text-amber-800 border-amber-200';
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'confirmed': 
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Load appointments for selected patient
  const loadAppointments = async (patientId: string) => {
    try {
      setLoadingAppointments(true);
      console.log(`📅 Loading appointments for patient: ${patientId}`);
      const patientAppointments = await getAppointmentsByPatient(patientId);
      setAppointments(patientAppointments);
      console.log(`✅ Loaded ${patientAppointments.length} appointments`);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Load doctor's schedule (all appointments for this doctor)
  const loadDoctorSchedule = async () => {
    try {
      setLoadingSchedule(true);
      console.log(`📅 Loading schedule for doctor: ${doctor.id}`);
      
      // For now, we'll simulate getting all appointments for this doctor
      // In a real implementation, you'd have an API endpoint for this
      const allPatients = await getAllPatients();
      let doctorAppointments: Appointment[] = [];
      
      for (const patient of allPatients) {
        const patientAppointments = await getAppointmentsByPatient(patient.id);
        const doctorPatientAppointments = patientAppointments.filter(apt => apt.doctorId === doctor.id);
        doctorAppointments = [...doctorAppointments, ...doctorPatientAppointments];
      }
      
      // Sort by date/time
      doctorAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      
      setAllDoctorAppointments(doctorAppointments);
      
      // Filter today's appointments
      const today = doctorAppointments.filter(apt => isToday(apt.dateTime));
      setTodayAppointments(today);
      
      console.log(`✅ Loaded ${doctorAppointments.length} total appointments, ${today.length} today`);
    } catch (error) {
      console.error('Error loading doctor schedule:', error);
      setAllDoctorAppointments([]);
      setTodayAppointments([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Accept appointment
  const acceptAppointment = async (appointmentId: string) => {
    try {
      console.log(`✅ Accepting appointment: ${appointmentId}`);
      // In a real implementation, you'd update the appointment status in the backend
      // For now, we'll simulate this by showing a success message
      alert('✅ Appointment accepted successfully!');
      
      // Refresh the schedule
      await loadDoctorSchedule();
      if (selectedPatient) {
        await loadAppointments(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error accepting appointment:', error);
      alert('❌ Failed to accept appointment. Please try again.');
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string, reason?: string) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to cancel this appointment?${reason ? `\n\nReason: ${reason}` : ''}`
      );
      
      if (!confirmed) return;
      
      console.log(`❌ Cancelling appointment: ${appointmentId}`);
      // In a real implementation, you'd update the appointment status to 'cancelled'
      alert('❌ Appointment cancelled successfully. Patient will be notified.');
      
      // Refresh the schedule
      await loadDoctorSchedule();
      if (selectedPatient) {
        await loadAppointments(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('❌ Failed to cancel appointment. Please try again.');
    }
  };

  // Reschedule appointment
  const rescheduleAppointment = async () => {
    try {
      if (!selectedAppointment || !newAppointmentDateTime) {
        alert('Please select a new date and time.');
        return;
      }
      
      console.log(`📅 Rescheduling appointment ${selectedAppointment.id} to ${newAppointmentDateTime}`);
      // In a real implementation, you'd update the appointment dateTime in the backend
      alert('✅ Appointment rescheduled successfully! Patient will be notified.');
      
      // Reset dialog state
      setShowRescheduleDialog(false);
      setSelectedAppointment(null);
      setNewAppointmentDateTime('');
      setRescheduleReason('');
      
      // Refresh the schedule
      await loadDoctorSchedule();
      if (selectedPatient) {
        await loadAppointments(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('❌ Failed to reschedule appointment. Please try again.');
    }
  };

  // Complete appointment
  const completeAppointment = async (appointmentId: string) => {
    try {
      console.log(`✅ Marking appointment as completed: ${appointmentId}`);
      // In a real implementation, you'd update the appointment status to 'completed'
      alert('✅ Appointment marked as completed!');
      
      // Refresh the schedule
      await loadDoctorSchedule();
      if (selectedPatient) {
        await loadAppointments(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('❌ Failed to complete appointment. Please try again.');
    }
  };

  // Load all patients for reference
  const loadAllPatients = async () => {
    try {
      setIsSearching(true);
      console.log('📋 Loading all patients...');
      const patients = await getAllPatients();
      setAllPatients(patients);
      setShowPatientList(true);
      console.log(`✅ Loaded ${patients.length} patients from database`);
      patients.forEach(p => console.log(`   👤 ${p.name} (ID: ${p.id})`));
    } catch (err) {
      console.error('Error loading patients:', err);
      alert('Failed to load patient list');
    } finally {
      setIsSearching(false);
    }
  };

  // Create new appointment
  const createNewAppointment = async () => {
    console.log('🔍 Validating appointment data:');
    console.log('  - selectedPatient:', selectedPatient?.name);
    console.log('  - appointmentSymptoms:', appointmentSymptoms);
    console.log('  - appointmentDate:', appointmentDate);
    console.log('  - appointmentInstructions:', appointmentInstructions);
    
    if (!selectedPatient) {
      alert('No patient selected');
      return;
    }
    
    if (!appointmentSymptoms.trim()) {
      alert('Please enter symptoms');
      return;
    }
    
    if (!appointmentDate) {
      alert('Please select appointment date and time');
      return;
    }

    try {
      const appointmentData = {
        patientId: selectedPatient.id,
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId,
        symptoms: appointmentSymptoms.split(',').map(s => s.trim()).filter(s => s),
        dateTime: appointmentDate,
        preInstructions: appointmentInstructions || 'Follow standard pre-treatment guidelines',
        postInstructions: '',
        status: 'scheduled' as const
      };

      console.log('📅 Creating new appointment:', appointmentData);
      const appointmentId = await addAppointment(appointmentData);
      
      console.log(`✅ Appointment created with ID: ${appointmentId}`);
      alert('Appointment created successfully!');
      
      // Reset form
      setAppointmentSymptoms('');
      setAppointmentDate('');
      setAppointmentInstructions('');
      setShowNewAppointment(false);
      
      // Reload appointments
      await loadAppointments(selectedPatient.id);
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  // Generate ultra-professional SaaS-level PDF report
  const generateReport = async (): Promise<Blob | null> => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return null;
    }

    console.log(`📊 Generating professional SaaS-level PDF report for patient: ${selectedPatient.name}`);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Helper: load image as base64
      const loadImageAsBase64 = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = src;
        });
      };

      // Load logo
      let logoDataUrl = '';
      try {
        logoDataUrl = await loadImageAsBase64('/logo.png');
      } catch {}

      // Ultra-clean white background with subtle texture
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Minimal grid pattern for texture
      pdf.setDrawColor(248, 250, 252);
      pdf.setLineWidth(0.1);
      for (let i = 0; i < pageWidth; i += 10) {
        pdf.line(i, 0, i, pageHeight);
      }
      for (let i = 0; i < pageHeight; i += 10) {
        pdf.line(0, i, pageWidth, i);
      }

      // Premium header with Apple-like gradient
      const createHeaderGradient = () => {
        for (let i = 0; i < 55; i++) {
          const alpha = 1 - (i / 55) * 0.3;
          const baseR = 15, baseG = 23, baseB = 42;
          const r = Math.floor(baseR + (255 - baseR) * (1 - alpha) * 0.05);
          const g = Math.floor(baseG + (255 - baseG) * (1 - alpha) * 0.05);
          const b = Math.floor(baseB + (255 - baseB) * (1 - alpha) * 0.05);
          pdf.setFillColor(r, g, b);
          pdf.rect(0, i, pageWidth, 1, 'F');
        }
      };
      
      createHeaderGradient();
      
      // Premium accent line with gradient
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 4, 'F');
      pdf.setFillColor(147, 197, 253);
      pdf.rect(0, 4, pageWidth, 1, 'F');

      // Logo and branding with better positioning
      if (logoDataUrl) {
        pdf.addImage(logoDataUrl, 'PNG', pageWidth - 50, 12, 38, 32, '', 'FAST');
        // Logo backdrop for premium feel
        pdf.setFillColor(255, 255, 255);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.1}));
        }
        pdf.roundedRect(pageWidth - 52, 10, 42, 36, 8, 8, 'F');
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 1}));
        }
      } else {
        // Premium text logo with hierarchy
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PANCHAKARMA', pageWidth - 65, 26);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(203, 213, 225); // slate-300
        pdf.text('MEDICAL CENTER', pageWidth - 65, 34);
      }

      // Apple-like main title with enhanced typography hierarchy
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(34); // XL Bold like Apple headlines
      pdf.setFont('helvetica', 'bold');
      pdf.text('Medical Report', 22, 35);
      
      // Subtitle with proper weight contrast
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225); // slate-300 for hierarchy
      pdf.text('Comprehensive Patient Assessment', 22, 45);

      // Premium glassmorphism card with neumorphism
      const createCard = (title: string, y: number, height: number, accentColor: number[]) => {
        // Multiple shadow layers for depth (Apple-style)
        // Outer shadow
        pdf.setFillColor(0, 0, 0);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.08}));
        }
        pdf.roundedRect(17, y + 4, pageWidth - 34, height, 20, 20, 'F');
        
        // Middle shadow
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.06}));
        }
        pdf.roundedRect(16, y + 2, pageWidth - 32, height, 18, 18, 'F');
        
        // Inner shadow
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.04}));
        }
        pdf.roundedRect(15, y + 1, pageWidth - 30, height, 16, 16, 'F');
        
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 1}));
        }
        
        // Main glassmorphism card
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(15, y, pageWidth - 30, height, 16, 16, 'F');
        
        // Subtle inner glow for glassmorphism
        pdf.setFillColor(248, 250, 252);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.8}));
        }
        pdf.roundedRect(15, y, pageWidth - 30, height, 16, 16, 'F');
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 1}));
        }
        
        // Elegant border with slight transparency
        pdf.setDrawColor(226, 232, 240);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.6}));
        }
        pdf.setLineWidth(0.3);
        pdf.roundedRect(15, y, pageWidth - 30, height, 16, 16);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 1}));
        }
        
        // Premium accent bar with gradient effect
        pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.roundedRect(15, y, 6, height, 16, 16, 'F');
        
        // Lighter accent for gradient effect
        const lighterR = Math.min(255, accentColor[0] + 40);
        const lighterG = Math.min(255, accentColor[1] + 40);
        const lighterB = Math.min(255, accentColor[2] + 40);
        pdf.setFillColor(lighterR, lighterG, lighterB);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.5}));
        }
        pdf.roundedRect(15, y, 3, height, 16, 16, 'F');
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 1}));
        }
        
        // Premium title section with glassmorphism
        pdf.setFillColor(249, 250, 251);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 0.7}));
        }
        pdf.roundedRect(15, y, pageWidth - 30, 22, 16, 16, 'F');
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: 1}));
        }
        
        // Title with enhanced typography hierarchy
        pdf.setTextColor(15, 23, 42); // slate-900 for maximum contrast
        pdf.setFontSize(15); // Larger, more prominent
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 28, y + 14);
        
        return y + 28;
      };

      // Patient Information Card with enhanced typography
      let y = 65;
      let contentY = createCard('Patient Information', y, 55, [59, 130, 246]);
      
      // Premium typography hierarchy
      const labelColor = [107, 114, 128]; // gray-500 for labels
      const valueColor = [17, 24, 39]; // gray-900 for values
      const accentColor = [59, 130, 246]; // blue-500 for patient name
      
      pdf.setFontSize(11);
      const col1 = 28;
      const col2 = 108;
      const labelWidth = 38;
      
      // Patient name with accent color and larger size
      pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(selectedPatient.name, col1, contentY);
      
      contentY += 12;
      
      // Labels in all-caps, lighter gray, smaller
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PATIENT ID', col1, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedPatient.id, col1 + labelWidth, contentY);
      
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BLOOD GROUP', col2, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedPatient.bloodGroup, col2 + labelWidth, contentY);
      
      contentY += 8;
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATE OF BIRTH', col1, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedPatient.dob, col1 + labelWidth, contentY);
      
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ABHA ID', col2, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(selectedPatient.abhaPassport, col2 + labelWidth, contentY);
      
      contentY += 8;
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REGISTERED', col1, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date(selectedPatient.registrationTime).toLocaleDateString(), col1 + labelWidth, contentY);

      // Attending Physician Card with enhanced typography
      y = contentY + 18;
      contentY = createCard('Attending Physician', y, 40, [34, 197, 94]);
      
      // Doctor name with prominence
      pdf.setTextColor(34, 197, 94); // green accent
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Dr. ${doctor.name}`, col1, contentY);
      
      contentY += 10;
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SPECIALTY', col1, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(doctor.specialty, col1 + labelWidth, contentY);
      
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HOSPITAL ID', col2, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(doctor.hospitalId, col2 + labelWidth, contentY);

      // Medical History Card with enhanced design
      y = contentY + 18;
      const historyHeight = Math.max(65, 45 + appointments.length * 6);
      contentY = createCard('Medical History & Appointments', y, historyHeight, [168, 85, 247]);
      
      if (appointments.length > 0) {
        const scheduled = appointments.filter(a => a.status === 'scheduled').length;
        const completed = appointments.filter(a => a.status === 'completed').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        
        // Premium badges with better spacing
        let badgeX = 28;
        const badgeY = contentY;
        
        // Total badge with glassmorphism
        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(badgeX, badgeY, 30, 10, 5, 5, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Total: ${appointments.length}`, badgeX + 3, badgeY + 6);
        badgeX += 35;
        
        // Scheduled badge
        pdf.setFillColor(34, 197, 94);
        pdf.roundedRect(badgeX, badgeY, 38, 10, 5, 5, 'F');
        pdf.text(`Scheduled: ${scheduled}`, badgeX + 3, badgeY + 6);
        badgeX += 43;
        
        // Completed badge
        pdf.setFillColor(16, 185, 129);
        pdf.roundedRect(badgeX, badgeY, 30, 10, 5, 5, 'F');
        pdf.text(`Done: ${completed}`, badgeX + 3, badgeY + 6);
        badgeX += 35;
        
        // Cancelled badge
        if (cancelled > 0) {
          pdf.setFillColor(239, 68, 68);
          pdf.roundedRect(badgeX, badgeY, 38, 10, 5, 5, 'F');
          pdf.text(`Cancelled: ${cancelled}`, badgeX + 3, badgeY + 6);
        }
        
        contentY += 18;
        
        // Section title with better typography
        pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RECENT APPOINTMENTS', 28, contentY);
        
        contentY += 10;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        appointments.slice(0, 5).forEach((appointment, index) => {
          const date = new Date(appointment.dateTime).toLocaleDateString();
          const symptoms = appointment.symptoms.join(', ').substring(0, 50) + (appointment.symptoms.join(', ').length > 50 ? '...' : '');
          
          // Enhanced status indicator
          const statusColors = {
            completed: [34, 197, 94],
            scheduled: [59, 130, 246],
            cancelled: [239, 68, 68]
          };
          const color = statusColors[appointment.status as keyof typeof statusColors] || [156, 163, 175];
          
          // Status dot with glow effect
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.circle(30, contentY - 1, 2, 'F');
          
          // Lighter glow
          pdf.setFillColor(color[0], color[1], color[2]);
          if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
            pdf.setGState(pdf.GState({opacity: 0.3}));
          }
          pdf.circle(30, contentY - 1, 3, 'F');
          if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
            pdf.setGState(pdf.GState({opacity: 1}));
          }
          
          // Date with emphasis
          pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${date}`, 36, contentY);
          
          // Symptoms in lighter color
          pdf.setTextColor(107, 114, 128); // gray-500
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${symptoms}`, 72, contentY);
          
          contentY += 7;
        });
      } else {
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(156, 163, 175); // gray-400
        pdf.text('No appointments recorded yet.', 28, contentY);
      }

      // Treatment Summary Card with enhanced design
      y = contentY + 18;
      contentY = createCard('Treatment Summary', y, 40, [220, 38, 127]);
      
      pdf.setFontSize(11);
      
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STATUS', col1, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Active Patient', col1 + labelWidth, contentY);
      
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LAST VISIT', col2, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(appointments.length > 0 ? new Date(appointments[0]?.dateTime).toLocaleDateString() : 'N/A', col2 + labelWidth, contentY);
      
      contentY += 10;
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COMPLIANCE', col1, contentY);
      pdf.setTextColor(34, 197, 94); // Green for excellent
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Excellent', col1 + labelWidth, contentY);
      
      pdf.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FOLLOW-UP', col2, contentY);
      pdf.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('As scheduled', col2 + labelWidth, contentY);

      // Premium footer with glassmorphism
      const footerY = pageHeight - 25;
      
      // Footer background with subtle gradient
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, footerY, pageWidth, 25, 'F');
      
      // Subtle gradient overlay
      for (let i = 0; i < 25; i++) {
        const alpha = 0.95 - (i / 25) * 0.1;
        const gray = Math.floor(248 + (255 - 248) * (1 - alpha));
        pdf.setFillColor(gray, gray + 2, gray + 4);
        if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
          pdf.setGState(pdf.GState({opacity: alpha}));
        }
        pdf.rect(0, footerY + i, pageWidth, 1, 'F');
      }
      if (typeof pdf.setGState === 'function' && typeof pdf.GState === 'function') {
        pdf.setGState(pdf.GState({opacity: 1}));
      }
      
      // Elegant divider line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(0, footerY, pageWidth, footerY);
      
      // Footer content with enhanced typography
      pdf.setTextColor(107, 114, 128); // gray-500
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const currentDate = new Date().toLocaleDateString('en-IN');
      const currentTime = new Date().toLocaleTimeString('en-IN');
      
      pdf.text(`Generated on ${currentDate} at ${currentTime}`, 22, footerY + 10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`By Dr. ${doctor.name}`, 22, footerY + 17);
      
      // Right side with branding
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246); // brand color
      pdf.text('Panchakarma Medical Center', pageWidth - 70, footerY + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('Confidential Medical Report', pageWidth - 70, footerY + 17);

      // Save with improved filename
      const fileName = `Medical_Report_${selectedPatient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Return the PDF as a blob
      const pdfBlob = pdf.output('blob');
      console.log('✅ Ultra-professional SaaS-level PDF report generated');
      
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please try again.');
      return null;
    }
  };

  const handlePatientSearch = async () => {
    if (!searchId.trim()) {
      alert('Please enter a Patient ID');
      return;
    }

    setIsSearching(true);
    try {
      console.log(`🔍 Searching for patient: ${searchId}`);
      const patient = await getPatientById(searchId.trim());
      
      if (patient) {
        console.log(`✅ Patient found:`, patient);
        setSelectedPatient(patient);
        // Load appointments for this patient
        await loadAppointments(patient.id);
      } else {
        console.log(`❌ Patient not found: ${searchId}`);
        alert('Patient not found. Please check the ID and try again.');
        setSelectedPatient(null);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      alert('Error searching for patient. Please try again.');
      setSelectedPatient(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Speech recognition setup
  const setupSpeechRecognition = () => {
    try {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setRecognitionError('Speech recognition is not supported in this browser.');
        return;
      }
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Support for multiple languages
      // Default to English, but can be changed based on user selection
      recognition.lang = detectedLanguage === 'kannada' ? 'kn-IN' : 
                         detectedLanguage === 'hindi' ? 'hi-IN' : 'en-US';
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        setRecognitionError('');
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecognitionError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update transcript with final results
        if (finalTranscript) {
          // Store original transcript for reference (especially for non-English languages)
          setOriginalTranscript(prev => prev + finalTranscript);
          
          // For non-English languages, we'll keep the original but also process it with AI
          // The actual translation will happen in processNotesWithAI function
          if (detectedLanguage !== 'english') {
            console.log(`Recorded speech in ${detectedLanguage}: ${finalTranscript}`);
            // Just update the transcript with original for now
            // Translation will happen when user clicks "Process with AI"
          }
          
          setTranscript(prev => prev + finalTranscript);
          setNewNote(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error setting up speech recognition:', error);
      setRecognitionError('Failed to initialize speech recognition.');
    }
  };
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setupSpeechRecognition();
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setRecognitionError('Failed to start speech recognition.');
      }
    }
  };
  
  // Process notes with AI/NLP and handle multilingual support
  const processNotesWithAI = async () => {
    if (!newNote.trim()) {
      toast({
        title: "Empty Notes",
        description: "Please add notes before processing",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingNotes(true);
    
    try {
      console.log('🤖 Processing notes with AI/NLP...');
      
      // Handle multilingual processing
      let processedText = newNote;
      let translatedText = "";
      
      // If language is not English, simulate translation
      // In a real implementation, you would call a translation API like Google Translate
      if (detectedLanguage !== 'english' && originalTranscript) {
        console.log(`Translating from ${detectedLanguage} to English...`);
        
        // Simulate translation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll use the original text but prefix it to show translation happened
        // In a real implementation, this would be the translated text from an API
        translatedText = `[Translated from ${detectedLanguage}] ${originalTranscript}`;
        
        // Update the transcript and note with the "translated" version
        setTranscript(translatedText);
        setNewNote(translatedText);
        processedText = translatedText;
        
        toast({
          title: "Translation Complete",
          description: `Successfully translated from ${detectedLanguage} to English`,
        });
      }
      
      // Process the text (either original English or translated)
      const text = processedText.toLowerCase();
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      const medicines: string[] = [];
      const cautions: string[] = [];
      const preventions: string[] = [];
      const generalNotes: string[] = [];
      
      // Simple rule-based categorization
      sentences.forEach(sentence => {
        const s = sentence.trim();
        
        // Check for medicines
        if (
          s.includes('prescribe') || 
          s.includes('take') || 
          s.includes('medication') || 
          s.includes('medicine') || 
          s.includes('tablet') || 
          s.includes('capsule') || 
          s.includes('syrup') ||
          s.includes('dose') ||
          s.includes('mg') ||
          s.includes('ml')
        ) {
          medicines.push(sentence.trim());
        }
        // Check for cautions
        else if (
          s.includes('caution') || 
          s.includes('warning') || 
          s.includes('avoid') || 
          s.includes('don\'t') || 
          s.includes('do not') || 
          s.includes('be careful') ||
          s.includes('side effect')
        ) {
          cautions.push(sentence.trim());
        }
        // Check for preventions/lifestyle advice
        else if (
          s.includes('prevent') || 
          s.includes('lifestyle') || 
          s.includes('exercise') || 
          s.includes('diet') || 
          s.includes('habit') || 
          s.includes('routine') ||
          s.includes('daily') ||
          s.includes('recommend')
        ) {
          preventions.push(sentence.trim());
        }
        // Everything else goes to general notes
        else {
          generalNotes.push(sentence.trim());
        }
      });
      
      // Update structured notes
      setStructuredNotes({
        medicines,
        cautions,
        preventions,
        generalNotes
      });
      
      console.log('✅ Notes processed successfully');
      toast({
        title: "Notes Processed",
        description: "Notes processed and categorized successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error processing notes:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingNotes(false);
    }
  };
  
  // Find appointment by number
  const findAppointmentByNumber = () => {
    if (!appointmentNumber.trim()) {
      alert('Please enter an appointment number');
      return;
    }
    
    try {
      console.log(`🔍 Searching for appointment: ${appointmentNumber}`);
      
      // In a real implementation, you would search the database
      // For now, we'll simulate finding an appointment
      
      // Check if the appointment number matches any of the loaded appointments
      const appointment = allDoctorAppointments.find(apt => 
        apt.id.substring(0, 8) === appointmentNumber.trim()
      );
      
      if (appointment) {
        console.log('✅ Appointment found:', appointment);
        
        // Find the patient for this appointment
        getPatientById(appointment.patientId)
          .then(patient => {
            if (patient) {
              setSelectedPatient(patient);
              setSearchId(patient.id);
              loadAppointments(patient.id);
              
              // Set the selected appointment
              setSelectedAppointment(appointment);
              
              alert(`Appointment found for patient: ${patient.name}`);
            } else {
              alert('Patient not found for this appointment.');
            }
          })
          .catch(error => {
            console.error('Error finding patient:', error);
            alert('Error finding patient for this appointment.');
          });
      } else {
        console.log(`❌ Appointment not found: ${appointmentNumber}`);
        alert('Appointment not found. Please check the number and try again.');
      }
    } catch (error) {
      console.error('Error finding appointment:', error);
      alert('Error finding appointment. Please try again.');
    }
  };
  
  // Add note to patient record and save to Firebase
  const addNote = async () => {
    if (newNote.trim() && selectedPatient) {
      try {
        // Save the note to Firebase
        const noteData = {
          patientId: selectedPatient.id,
          doctorId: user?.uid || doctor.id || 'unknown-doctor',
          appointmentNumber: appointmentNumber,
          content: newNote,
          structuredContent: structuredNotes,
          language: detectedLanguage,
          originalContent: originalTranscript,
          appointmentDate: new Date().toISOString(),
          doctorName: doctor.name || 'Unknown Doctor'
        };
        
        const savedNoteId = await addPatientNote(noteData);
        
        console.log(`Adding note for patient ${selectedPatient.id}: ${newNote}`);
        setNewNote('');
        
        // Use toast instead of alert for better UX
        toast({
          title: 'Note Saved',
          description: 'Patient note has been saved to database successfully',
        });
        
        // Show success message with PDF generation option
        setShowPdfOption(true);
        setLastSavedNoteId(savedNoteId);
        
        // Reset structured notes
        setStructuredNotes({
          medicines: [],
          cautions: [],
          preventions: [],
          generalNotes: []
        });
        
        // Reset transcript
        setTranscript('');
        setOriginalTranscript('');
        
        // Refresh patient history if we're viewing that patient
        if (selectedPatient) {
          loadPatientHistory(selectedPatient.id);
        }
      } catch (error: any) {
        console.error('Error saving note:', error);
        toast({
          title: 'Error Saving Note',
          description: error.message || 'Failed to save note to database',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Missing Information',
        description: 'Please select a patient and enter a note',
        variant: 'destructive'
      });
    }
  };
  
  // Generate PDF report and save URL to patient note
  const generatePdfReport = async () => {
    if (!selectedPatient || !lastSavedNoteId) {
      toast({
        title: 'Error',
        description: 'Patient or note information missing',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate the PDF using existing function
      const pdfBlob = await generateReport();
      
      if (!pdfBlob) {
        toast({
          title: 'Error',
          description: 'Failed to generate PDF',
          variant: 'destructive'
        });
        return;
      }

      // Create a local URL for the PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Update the patient note with the PDF URL
      await updatePatientNote(lastSavedNoteId, {
        pdfUrl: pdfUrl
      });
      
      // Open the PDF in a new tab
      window.open(pdfUrl, '_blank');
      
      toast({
        title: 'Success',
        description: 'PDF report generated and saved successfully',
      });
    } catch (error: any) {
      console.error('Error generating PDF report:', error);
      toast({
        title: 'Error Generating PDF',
        description: error.message || 'Failed to generate PDF report',
        variant: 'destructive'
      });
    }
  };

  // Load patient history from Firebase
  const loadPatientHistory = async (patientId: string) => {
    try {
      setLoadingHistory(true);
      const notes = await getPatientNotes(patientId);
      setPatientHistory(notes);
      console.log(`Loaded ${notes.length} historical notes for patient ${patientId}`);
    } catch (error: any) {
      console.error('Error loading patient history:', error);
      toast({
        title: 'Error Loading History',
        description: error.message || 'Failed to load patient history',
        variant: 'destructive'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const prescribeDiet = () => {
    if (dietPlan.trim() && selectedPatient) {
      console.log(`Prescribing diet for patient ${selectedPatient.id}: ${dietPlan}`);
      setDietPlan('');
      alert('Diet plan prescribed successfully!');
    }
  };

  // Effect hooks - placed after all function definitions
  // Inject premium animations on component mount
  useEffect(() => {
    injectAnimations();
  }, []);

  // Load doctor's schedule on component mount
  useEffect(() => {
    loadDoctorSchedule();
  }, [doctor.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Premium Header with Typography System */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative w-14 h-14 bg-gradient-to-br from-teal-500 via-blue-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105">
                <Stethoscope className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              </div>
              <div>
                {/* H1: 28-32px Bold */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-violet-900 bg-clip-text text-transparent leading-tight">
                  Doctor Dashboard
                </h1>
                {/* Body: 14-16px Regular */}
                <p className="text-base text-slate-600 font-normal mt-1">Dr. {doctor.name} • {doctor.specialty}</p>
              </div>
            </div>
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md hover:scale-105 px-6 py-2.5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Enhanced Patient Search */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
              <CardHeader className="p-6">
                {/* H2: 20-22px Semibold */}
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  Patient Search
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter Panchakarma ID (e.g., p1)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base h-12 rounded-xl"
                  />
                  <Button 
                    onClick={handlePatientSearch} 
                    disabled={isSearching}
                    className="bg-gradient-to-r from-teal-600 via-blue-600 to-violet-600 hover:from-teal-700 hover:via-blue-700 hover:to-violet-700 text-white px-8 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 h-12 rounded-xl font-medium"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {/* Consistent spacing: 16px gap */}
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={loadAllPatients} 
                    disabled={isSearching}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md hover:scale-105 px-6 h-12 rounded-xl font-medium"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isSearching ? 'Loading...' : 'Show All Patients'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Patient List with Enhanced Cards */}
            {showPatientList && allPatients.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl overflow-hidden">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    All Patients 
                    {/* Small: 12px Medium */}
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {allPatients.length} total
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allPatients.map((patient, index) => (
                      <div 
                        key={patient.id} 
                        className="group flex items-center justify-between p-5 border border-slate-200/60 rounded-2xl hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] transform"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={async () => {
                          setSelectedPatient(patient);
                          setShowPatientList(false);
                          setSearchId(patient.id);
                          await loadAppointments(patient.id);
                        }}
                      >
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img 
                              src={patient.photoUrl} 
                              alt="Patient" 
                              className="w-14 h-14 rounded-full border-3 border-white shadow-md group-hover:shadow-lg group-hover:border-blue-200 transition-all duration-200"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            {/* Body: 14-16px Regular */}
                            <div className="text-base font-semibold text-slate-900">{patient.name}</div>
                            <div className="text-sm text-slate-600 mt-1">ID: {patient.id}</div>
                            <div className="flex items-center gap-2 mt-2">
                              {/* Small: 12px Medium */}
                              <Badge variant="outline" className="text-xs font-medium bg-red-50 text-red-700 border-red-200 px-2 py-0.5">
                                {patient.bloodGroup}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5">
                                {patient.abhaPassport}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                      </div>
                    ))}
                  </div>
                  {/* Consistent spacing: 24px padding */}
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={() => setShowPatientList(false)}
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2 rounded-xl font-medium"
                    >
                      Hide List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Empty State */}
            {showPatientList && allPatients.length === 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60 shadow-xl overflow-hidden">
                <CardContent className="text-center py-20 px-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  {/* H2: 20-22px Semibold */}
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">No Patients Found</h3>
                  {/* Body: 14-16px Regular */}
                  <p className="text-base text-slate-600 mb-2">No patients are registered in the system yet.</p>
                  <p className="text-sm font-medium text-blue-600">Patients can register at the main page.</p>
                </CardContent>
              </Card>
            )}

            {/* Premium Patient Details Hero Card with Glass Depth */}
            {selectedPatient && (
              <Card className="bg-white/20 backdrop-blur-xl border border-transparent shadow-2xl shadow-blue-500/10 overflow-hidden relative">
                {/* Multi-layer gradient borders for premium depth */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-violet-500/20 p-[1px]">
                  <div className="h-full w-full rounded-lg bg-white/80 backdrop-blur-2xl"></div>
                </div>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-600 to-violet-600 shadow-lg shadow-blue-500/40"></div>
                
                {/* Inner glass container */}
                <div className="relative bg-white/30 backdrop-blur-sm m-1 rounded-lg">
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white stroke-[1.5]" />
                      </div>
                      Patient Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-8">
                    {/* Hero Patient Profile */}
                    <div className="relative p-8 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-teal-50/80 rounded-3xl border border-blue-200/40 backdrop-blur-sm overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-xl"></div>
                      
                      <div className="relative flex items-center gap-8">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                          <img 
                            src={selectedPatient.photoUrl} 
                            alt="Patient" 
                            className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          {/* Patient name with proper typography */}
                          <h3 className="text-2xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                            {selectedPatient.name}
                          </h3>
                          <p className="text-base text-slate-600 font-normal mb-4">ID: {selectedPatient.id}</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-full font-medium">
                              <Heart className="w-3 h-3 mr-1.5" />
                              {selectedPatient.bloodGroup}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 rounded-full font-medium">
                              <CalendarDays className="w-3 h-3 mr-1.5" />
                              {selectedPatient.dob}
                            </Badge>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1.5 rounded-full font-medium">
                              <Activity className="w-3 h-3 mr-1.5" />
                              {selectedPatient.abhaPassport}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="history" className="mt-10">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-100/80 rounded-2xl p-1.5 h-14">
                        <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm h-11">
                          <Calendar className="w-4 h-4 mr-2" />
                          History
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm h-11">
                          <FileText className="w-4 h-4 mr-2" />
                          Notes
                        </TabsTrigger>
                        <TabsTrigger value="diet" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm h-11">
                          <Heart className="w-4 h-4 mr-2" />
                          Diet
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="history" className="space-y-8 mt-8">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              Medical Timeline
                            </h4>
                            {loadingAppointments && (
                              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading timeline...
                              </div>
                            )}
                          </div>
                        
                          {loadingAppointments ? (
                            <div className="text-center py-16">
                              <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                              <p className="text-base text-slate-500 font-medium">Loading appointments...</p>
                            </div>
                          ) : appointments.length > 0 ? (
                            <div className="space-y-6 relative">
                              {/* Timeline line */}
                              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-teal-200"></div>
                              
                              {appointments.map((appointment, index) => (
                                <div 
                                  key={appointment.id} 
                                  className="relative pl-16 group animate-fade-in"
                                  style={{ animationDelay: `${index * 150}ms` }}
                                >
                                  {/* Enhanced timeline dot */}
                                  <div className={`absolute left-3 top-4 w-6 h-6 rounded-full border-3 border-white shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                    appointment.status === 'completed' ? 'bg-emerald-500 shadow-emerald-500/30' :
                                    appointment.status === 'scheduled' ? 'bg-blue-500 shadow-blue-500/30' :
                                    'bg-amber-500 shadow-amber-500/30'
                                  }`}>
                                    <div className="absolute inset-1 rounded-full bg-white/30"></div>
                                  </div>
                                  
                                  {/* Floating content card */}
                                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 hover:scale-[1.01] group-hover:border-blue-200">
                                    <div className="flex items-center justify-between mb-4">
                                      <Badge className={`${
                                        appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        'bg-amber-100 text-amber-800 border-amber-200'
                                      } border px-3 py-1.5 rounded-full font-medium text-sm`}>
                                        {appointment.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                        {appointment.status === 'scheduled' && <CalendarDays className="w-3.5 h-3.5 mr-1.5" />}
                                        {appointment.status === 'cancelled' && <AlertCircle className="w-3.5 h-3.5 mr-1.5" />}
                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                      </Badge>
                                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                        {formatDate(appointment.dateTime)}
                                      </span>
                                    </div>
                                    <p className="text-base text-slate-700 mb-2 font-medium">
                                      <span className="text-slate-500">Symptoms:</span> {appointment.symptoms.join(', ')}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      <span className="font-medium text-slate-500">Instructions:</span> {appointment.preInstructions}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-20">
                              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Calendar className="w-10 h-10 text-slate-400" />
                              </div>
                              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Timeline Yet</h3>
                              <p className="text-base text-slate-500 font-normal">No appointments found for this patient.</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="notes" className="space-y-8 mt-8">
                        <div className="space-y-6">
                          {/* Appointment Number Input */}
                          <div className="flex items-center gap-3 mb-6">
                            <Input
                              placeholder="Enter Appointment Number"
                              value={appointmentNumber}
                              onChange={(e) => setAppointmentNumber(e.target.value)}
                              className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 text-base rounded-xl p-4"
                            />
                            <Button 
                              onClick={findAppointmentByNumber}
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2 rounded-xl font-medium h-12"
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Find
                            </Button>
                          </div>
                          
                          {/* Language Selection and Speech Recognition Controls */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={toggleListening}
                                  variant={isListening ? "destructive" : "default"}
                                  className={`rounded-full h-12 w-12 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-md hover:shadow-lg transition-all duration-200`}
                                >
                                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>
                                <span className="text-sm font-medium">
                                  {isListening ? 'Listening...' : 'Click to start listening'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <select 
                                  value={detectedLanguage}
                                  onChange={(e) => setDetectedLanguage(e.target.value)}
                                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                  <option value="english">English</option>
                                  <option value="kannada">Kannada</option>
                                  <option value="hindi">Hindi</option>
                                </select>
                                <span className="text-xs text-slate-500">Language</span>
                              </div>
                            </div>
                            
                            <Button
                              onClick={processNotesWithAI}
                              disabled={!newNote.trim() || processingNotes}
                              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2 rounded-xl font-medium h-10"
                            >
                              {processingNotes ? 'Processing...' : 'Process Notes with AI'}
                            </Button>
                          </div>
                          
                          {recognitionError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                              {recognitionError}
                            </div>
                          )}
                          
                          <Textarea
                            placeholder="Add appointment notes, observations, or recommendations..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={6}
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none text-base rounded-xl p-4"
                          />
                          
                          {/* Structured Notes Display */}
                          {(structuredNotes.medicines.length > 0 || 
                            structuredNotes.cautions.length > 0 || 
                            structuredNotes.preventions.length > 0 || 
                            structuredNotes.generalNotes.length > 0) && (
                            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-slate-900">Structured Notes</h3>
                              
                              {structuredNotes.medicines.length > 0 && (
                                <div>
                                  <h4 className="text-md font-medium text-slate-800 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                    Medicines Prescribed
                                  </h4>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {structuredNotes.medicines.map((medicine, index) => (
                                      <li key={index} className="text-slate-700">{medicine}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {structuredNotes.cautions.length > 0 && (
                                <div>
                                  <h4 className="text-md font-medium text-slate-800 mb-2 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
                                    Cautions
                                  </h4>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {structuredNotes.cautions.map((caution, index) => (
                                      <li key={index} className="text-slate-700">{caution}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {structuredNotes.preventions.length > 0 && (
                                <div>
                                  <h4 className="text-md font-medium text-slate-800 mb-2 flex items-center">
                                    <Heart className="w-4 h-4 mr-2 text-emerald-600" />
                                    Preventions / Lifestyle Advice
                                  </h4>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {structuredNotes.preventions.map((prevention, index) => (
                                      <li key={index} className="text-slate-700">{prevention}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {structuredNotes.generalNotes.length > 0 && (
                                <div>
                                  <h4 className="text-md font-medium text-slate-800 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-purple-600" />
                                    General Notes
                                  </h4>
                                  <ul className="list-disc pl-6 space-y-1">
                                    {structuredNotes.generalNotes.map((note, index) => (
                                      <li key={index} className="text-slate-700">{note}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3">
                            {showPdfOption && (
                              <Button 
                                onClick={generatePdfReport} 
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 px-8 py-3 rounded-xl font-medium h-12"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Generate PDF Report
                              </Button>
                            )}
                            <Button 
                              onClick={addNote} 
                              className="bg-gradient-to-r from-teal-600 via-blue-600 to-violet-600 hover:from-teal-700 hover:via-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 px-8 py-3 rounded-xl font-medium h-12"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="diet" className="space-y-8 mt-8">
                        <div className="space-y-6">
                          <Textarea
                            placeholder="Prescribe diet plan, dietary restrictions, or nutritional recommendations..."
                            value={dietPlan}
                            onChange={(e) => setDietPlan(e.target.value)}
                            rows={4}
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none text-base rounded-xl p-4"
                          />
                          <Button 
                            onClick={prescribeDiet} 
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 px-8 py-3 rounded-xl font-medium h-12"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Prescribe Diet Plan
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>

            {/* Enhanced Sidebar with Glass/Gradient Depth */}
          <div className="space-y-10">
            {/* Practice Overview with Layered Depth */}
            <Card className="bg-white/20 backdrop-blur-xl border border-transparent shadow-2xl shadow-blue-500/10 overflow-hidden relative">
              {/* Multi-layer gradient borders for depth */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-violet-500/20 p-[1px]">
                <div className="h-full w-full rounded-lg bg-white/80 backdrop-blur-2xl"></div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-600 to-violet-600 shadow-lg shadow-purple-500/30"></div>
              
              {/* Inner glass container */}
              <div className="relative">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                      <TrendingUp className="w-5 h-5 text-white stroke-[1.5]" />
                    </div>
                    Practice Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-6">
                  {/* Today's Patients with Enhanced Glass Effect */}
                  <div className="group p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    {/* Inner gradient glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-100/60 rounded-2xl opacity-80"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">TODAY'S PATIENTS</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-slate-900">8</p>
                          <span className="text-sm font-medium text-emerald-600 bg-emerald-100/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-200/50">
                            <TrendingUp className="w-3 h-3 stroke-[1.5]" />
                            +12%
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-normal mt-1">vs yesterday • avg 7.2 patients</p>
                      </div>
                      {/* Animated Progress Ring with Glass Effect */}
                      <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-full"></div>
                        <svg className="w-16 h-16 transform -rotate-90 relative z-10" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#blueGradient)"
                            strokeWidth="2.5"
                            strokeDasharray="75, 100"
                            className="transition-all duration-2000 ease-out animate-[progress_2s_ease-out]"
                            style={{ animationDelay: '0.5s', strokeDasharray: '0, 100', animation: 'progress 2s ease-out 0.5s forwards' }}
                          />
                          <defs>
                            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <span className="text-sm font-bold text-blue-600">75%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Completed Sessions with Sequential Animation */}
                  <div className="group p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 rounded-2xl opacity-80"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">COMPLETED SESSIONS</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-slate-900">5</p>
                          <span className="text-sm font-medium text-emerald-600">of 8</span>
                        </div>
                        <p className="text-sm text-emerald-600 font-medium mt-1">On track • 3 remaining</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white shadow-lg animate-[bounce_1s_ease-in-out_infinite]" 
                              style={{ 
                                animationDelay: `${i * 200}ms`,
                                animationFillMode: 'both'
                              }}
                            ></div>
                          ))}
                        </div>
                        <CheckCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                      </div>
                    </div>
                  </div>

                  {/* Pending Reviews with Glass Urgency */}
                  <div className="group p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-amber-100/60 rounded-2xl opacity-80"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">PENDING REVIEWS</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-slate-900">3</p>
                          <span className="text-sm font-medium text-amber-600 bg-amber-100/80 backdrop-blur-sm px-2 py-1 rounded-full border border-amber-200/50">⚠️ Overdue</span>
                        </div>
                        <p className="text-sm text-amber-600 font-medium mt-1">avg delay: 2.3 days • needs attention</p>
                      </div>
                      <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                    </div>
                  </div>

                  {/* Total Patients with Growth Visualization */}
                  <div className="group p-6 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-violet-100/60 rounded-2xl opacity-80"></div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">TOTAL PATIENTS</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-slate-900">124</p>
                          <span className="text-sm font-medium text-purple-600 bg-purple-100/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 border border-purple-200/50">
                            <TrendingUp className="w-3 h-3 stroke-[1.5]" />
                            +8 this week
                          </span>
                        </div>
                        <p className="text-sm text-purple-600 font-medium mt-1">Growing steadily • 15% month growth</p>
                      </div>
                      <div className="relative">
                        <Users className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Enhanced Schedule Timeline with Glass Depth */}
            <Card className="bg-white/20 backdrop-blur-xl border border-transparent shadow-2xl shadow-indigo-500/10 overflow-hidden relative">
              {/* Multi-layer gradient borders */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-[1px]">
                <div className="h-full w-full rounded-lg bg-white/80 backdrop-blur-2xl"></div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 shadow-lg shadow-indigo-500/30"></div>
              
              <div className="relative">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <CalendarDays className="w-5 h-5 text-white stroke-[1.5]" />
                    </div>
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  {/* Schedule View Toggle */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-lg rounded-xl p-1 border border-white/30">
                      <Button 
                        variant={showScheduleView === 'daily' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setShowScheduleView('daily')}
                        className={`rounded-lg h-8 px-3 text-xs font-medium ${
                          showScheduleView === 'daily' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        Today
                      </Button>
                      <Button 
                        variant={showScheduleView === 'weekly' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setShowScheduleView('weekly')}
                        className={`rounded-lg h-8 px-3 text-xs font-medium ${
                          showScheduleView === 'weekly' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        Week
                      </Button>
                      <Button 
                        variant={showScheduleView === 'monthly' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setShowScheduleView('monthly')}
                        className={`rounded-lg h-8 px-3 text-xs font-medium ${
                          showScheduleView === 'monthly' 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        Month
                      </Button>
                    </div>
                    <Badge variant="outline" className="bg-blue-50/80 text-blue-800 border-blue-200/50">
                      {todayAppointments.length} today
                    </Badge>
                  </div>

                  {/* Daily Schedule View */}
                  {showScheduleView === 'daily' && (
                    <div className="space-y-4">
                      {loadingSchedule ? (
                        <div className="text-center py-12">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-slate-500">Loading schedule...</p>
                        </div>
                      ) : todayAppointments.length > 0 ? (
                        todayAppointments.map((appointment, index) => (
                          <div 
                            key={appointment.id} 
                            className="group relative p-4 bg-white/70 backdrop-blur-lg rounded-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 animate-[slideIn_0.6s_ease-out]"
                            style={{ 
                              animationDelay: `${index * 150}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            {/* Time Badge */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                  {formatTimeSlot(appointment.dateTime)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 text-sm">Patient ID: {appointment.patientId}</p>
                                  <p className="text-xs text-slate-600 mt-1">Appointment: {appointment.id}</p>
                                </div>
                              </div>
                              
                              {/* Status and Actions */}
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                                
                                {/* Action Menu */}
                                <div className="relative">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShowAppointmentActions(showAppointmentActions === appointment.id ? null : appointment.id)}
                                    className="w-8 h-8 p-0 hover:bg-white/60"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* Dropdown Menu */}
                                  {showAppointmentActions === appointment.id && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200/60 z-50 overflow-hidden">
                                      {appointment.status === 'scheduled' && (
                                        <>
                                          <button 
                                            onClick={() => acceptAppointment(appointment.id)}
                                            className="w-full px-4 py-3 text-left text-sm hover:bg-green-50 flex items-center gap-2 text-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                            Accept Appointment
                                          </button>
                                          <button 
                                            onClick={() => {
                                              setSelectedAppointment(appointment);
                                              setShowRescheduleDialog(true);
                                              setShowAppointmentActions(null);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-700"
                                          >
                                            <Clock className="w-4 h-4" />
                                            Reschedule
                                          </button>
                                        </>
                                      )}
                                      {appointment.status === 'scheduled' && (
                                        <button 
                                          onClick={() => completeAppointment(appointment.id)}
                                          className="w-full px-4 py-3 text-left text-sm hover:bg-emerald-50 flex items-center gap-2 text-emerald-700"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          Mark Complete
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => {
                                          cancelAppointment(appointment.id);
                                          setShowAppointmentActions(null);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-700 border-t border-slate-200/60"
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                        Cancel Appointment
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Appointment Details */}
                            <div className="space-y-2">
                              <p className="text-xs text-slate-600">
                                <span className="font-medium">Symptoms:</span> {appointment.symptoms.join(', ')}
                              </p>
                              {appointment.preInstructions && (
                                <p className="text-xs text-slate-600">
                                  <span className="font-medium">Instructions:</span> {appointment.preInstructions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 bg-white/60 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
                            <Calendar className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">Schedule Clear</h3>
                          <p className="text-base text-slate-500 font-normal">No appointments scheduled for today</p>
                          <p className="text-sm text-blue-600 font-medium mt-2">Perfect time for administrative tasks</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weekly Schedule View (Placeholder) */}
                  {showScheduleView === 'weekly' && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Weekly View</h3>
                      <p className="text-sm text-slate-600">Coming soon - Full weekly schedule view</p>
                    </div>
                  )}

                  {/* Monthly Schedule View (Placeholder) */}
                  {showScheduleView === 'monthly' && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Monthly View</h3>
                      <p className="text-sm text-slate-600">Coming soon - Full monthly calendar view</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>

            {/* Floating CTA Buttons with Glass Depth */}
            <Card className="bg-white/20 backdrop-blur-xl border border-transparent shadow-2xl shadow-rose-500/10 overflow-hidden relative">
              {/* Multi-layer gradient borders */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-purple-500/20 p-[1px]">
                <div className="h-full w-full rounded-lg bg-white/80 backdrop-blur-2xl"></div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 shadow-lg shadow-rose-500/30"></div>
              
              <div className="relative">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                      <Activity className="w-5 h-5 text-white stroke-[1.5]" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-600 via-blue-600 to-violet-600 hover:from-teal-700 hover:via-blue-700 hover:to-violet-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-14 rounded-2xl font-medium text-base backdrop-blur-sm border border-white/20"
                    onClick={() => selectedPatient ? setShowNewAppointment(true) : alert('Please select a patient first')}
                  >
                    <Plus className="w-5 h-5 mr-3 stroke-[1.5]" />
                    New Appointment
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/60 backdrop-blur-lg border-2 border-white/40 text-slate-700 hover:bg-white/80 hover:border-white/60 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-14 rounded-2xl font-medium text-base shadow-lg"
                    onClick={generateReport}
                  >
                    <Download className="w-5 h-5 mr-3 stroke-[1.5]" />
                    Generate Report
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/60 backdrop-blur-lg border-2 border-emerald-300/60 text-emerald-700 hover:bg-emerald-50/80 hover:border-emerald-400/60 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-14 rounded-2xl font-medium text-base shadow-lg"
                  >
                    <Clock className="w-5 h-5 mr-3 stroke-[1.5]" />
                    View Full Schedule
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              Create New Appointment
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Schedule a new appointment for the selected patient.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info Card */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/40">
                <img 
                  src={selectedPatient.photoUrl} 
                  alt="Patient" 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                  <p className="font-bold text-slate-900">{selectedPatient.name}</p>
                  <p className="text-sm text-slate-600">ID: {selectedPatient.id}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-slate-700 font-medium">Symptoms (comma-separated)</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Enter patient symptoms..."
                    value={appointmentSymptoms}
                    onChange={(e) => {
                      console.log('💊 Symptoms changed to:', e.target.value);
                      setAppointmentSymptoms(e.target.value);
                    }}
                    rows={3}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appointment-date" className="text-slate-700 font-medium">Appointment Date & Time</Label>
                  <Input
                    id="appointment-date"
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => {
                      console.log('📅 Date changed to:', e.target.value);
                      setAppointmentDate(e.target.value);
                    }}
                    min={getCurrentDateTime()}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-slate-700 font-medium">Pre-treatment Instructions (optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter any pre-treatment instructions..."
                    value={appointmentInstructions}
                    onChange={(e) => setAppointmentInstructions(e.target.value)}
                    rows={2}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={createNewAppointment}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Create Appointment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewAppointment(false)}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Reschedule Appointment
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Select a new date and time for this appointment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Current Appointment Info */}
              <div className="p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-200/40">
                <p className="text-sm font-medium text-amber-800 mb-2">Current Appointment</p>
                <p className="text-sm text-slate-700">
                  <strong>Patient:</strong> {selectedAppointment.patientId}
                </p>
                <p className="text-sm text-slate-700">
                  <strong>Current Time:</strong> {formatDate(selectedAppointment.dateTime)} at {formatTimeSlot(selectedAppointment.dateTime)}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-appointment-date" className="text-slate-700 font-medium">New Date & Time</Label>
                  <Input
                    id="new-appointment-date"
                    type="datetime-local"
                    value={newAppointmentDateTime}
                    onChange={(e) => setNewAppointmentDateTime(e.target.value)}
                    min={getCurrentDateTime()}
                    required
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reschedule-reason" className="text-slate-700 font-medium">Reason for Reschedule (optional)</Label>
                  <Textarea
                    id="reschedule-reason"
                    placeholder="Enter reason for rescheduling..."
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    rows={3}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={rescheduleAppointment}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Reschedule Appointment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRescheduleDialog(false);
                    setSelectedAppointment(null);
                    setNewAppointmentDateTime('');
                    setRescheduleReason('');
                  }}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
