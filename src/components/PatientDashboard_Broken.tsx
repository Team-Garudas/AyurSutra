import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Download, 
  QrCode, 
  BookOpen, 
  Heart,
  LogOut,
  User,
  FileText,
  Wrench,
  Video,
  Pill,
  Zap,
  AlertTriangle,
  Shield,
  Menu,
  Bell,
  Search,
  BarChart3,
  Plus,
  MessageCircle,
  Activity,
  TrendingUp,
  X,
  ClipboardList
} from 'lucide-react';
import NotificationSystem from './NotificationSystem';
import VideoConsultation from './VideoConsultation';
import { 
  Patient, 
  formatDate, 
  formatTime, 
  Appointment, 
  getAllHospitals, 
  getAllDoctors, 
  addAppointment, 
  Doctor, 
  Hospital, 
  getAppointmentsByPatient,
  // Enhanced functions using data structures
  getPatientFast,
  getDoctorFast,
  getHospitalFast,
  bookAppointmentWithQueue,
  getWaitingListStatus,
  getPatientStatistics,
  initializeEnhancedSystem,
  createSamplePatientNotes
} from '@/lib/mockData';
import { cancelAppointment, listenToAppointments, getPatientNotes, listenToPatientNotes, PatientNote } from '@/lib/firebaseService';
import { getHealthMetrics, formatHealthMetricsForChart, generateMockHealthMetrics } from '@/lib/healthMetricsService';
import { generateMockPrescriptions, getPrescriptions } from '@/services/prescriptionService';
import { generateMockMedicalRecords } from '@/services/medicalRecordsService';
import HealthMetricsChart from './HealthMetricsChart';
import PrescriptionManagement from './PrescriptionManagement';
import MedicalRecordsManagement from './MedicalRecordsManagement';
import jsPDF from 'jspdf';
import IDCard from './IDCard';
import PatientPhoto from './PatientPhoto';
import { RazorpayPaymentGateway } from './RazorpayPaymentGateway';
import { AIAppointmentBooking } from './AIAppointmentBooking';

// Chart data for dashboard analytics
const generateHealthChartData = () => ({
  bloodPressure: [
    { date: '2024-01', systolic: 120, diastolic: 80 },
    { date: '2024-02', systolic: 118, diastolic: 78 },
    { date: '2024-03', systolic: 115, diastolic: 76 },
    { date: '2024-04', systolic: 112, diastolic: 75 },
    { date: '2024-05', systolic: 110, diastolic: 74 },
    { date: '2024-06', systolic: 108, diastolic: 72 }
  ],
  weight: [
    { date: '2024-01', weight: 75 },
    { date: '2024-02', weight: 74.5 },
    { date: '2024-03', weight: 73.8 },
    { date: '2024-04', weight: 73.2 },
    { date: '2024-05', weight: 72.8 },
    { date: '2024-06', weight: 72.5 }
  ],
  treatmentProgress: [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 35 },
    { month: 'Mar', progress: 52 },
    { month: 'Apr', progress: 68 },
    { month: 'May', progress: 82 },
    { month: 'Jun', progress: 95 }
  ],
  appointmentStats: [
    { type: 'Completed', count: 12, color: '#10B981' },
    { type: 'Upcoming', count: 3, color: '#3B82F6' },
    { type: 'Cancelled', count: 1, color: '#EF4444' }
  ]
});

interface PatientDashboardProps {
  patient: Patient;
  onLogout: () => void;
}

export default function PatientDashboard({ patient, onLogout }: PatientDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(true);
  const [appointmentsError, setAppointmentsError] = useState<string>('');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState<boolean>(true);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState<boolean>(true);
  const [patientNotes, setPatientNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(true);

  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [doctorChoiceMode, setDoctorChoiceMode] = useState<'new' | 'previous'>('new');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [bookingStep, setBookingStep] = useState<'select' | 'payment'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Net Banking' | 'Cash' | ''>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  // Emergency state
  const [showEmergency, setShowEmergency] = useState(false);
  
  // AI Appointment Booking state
  const [showAIBooking, setShowAIBooking] = useState(false);
  
  // Enhanced features state
  const [patientStats, setPatientStats] = useState<any>(null);
  const [waitingListStatus, setWaitingListStatus] = useState<any>(null);
  const [isLoadingEnhancedData, setIsLoadingEnhancedData] = useState(false);
  
  // Cancellation confirmation state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isVideoConsultationOpen, setIsVideoConsultationOpen] = useState(false);
  const [currentVideoAppointment, setCurrentVideoAppointment] = useState<Appointment | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [loadingHealthMetrics, setLoadingHealthMetrics] = useState(false);

  // Load enhanced patient statistics
  const loadEnhancedData = async () => {
    try {
      setIsLoadingEnhancedData(true);
      console.log('📊 Loading enhanced patient data...');
      
      // Initialize enhanced system if not already done
      await initializeEnhancedSystem();
      
      // Create sample patient notes for testing if none exist
      await createSamplePatientNotes();
      
      // Get patient statistics
      const stats = await getPatientStatistics(patient.id);
      setPatientStats(stats);
      
      // Get waiting list status
      const waitingStatus = getWaitingListStatus();
      setWaitingListStatus(waitingStatus);
      
      console.log('✅ Enhanced data loaded:', { stats, waitingStatus });
    } catch (error) {
      console.error('❌ Error loading enhanced data:', error);
    } finally {
      setIsLoadingEnhancedData(false);
    }
  };

  useEffect(() => {
    setIsLoadingAppointments(true);
    setAppointmentsError('');
    
    // Set up real-time listener for appointments
    const unsubscribeAppointments = listenToAppointments(patient.id, (data) => {
      if (Array.isArray(data)) {
        setAppointments(data);
        setIsLoadingAppointments(false);
      }
    });
    
    // Set up real-time listener for patient notes
    const unsubscribeNotes = listenToPatientNotes(patient.id, (notes) => {
      setPatientNotes(notes);
      setIsLoadingNotes(false);
      console.log(`📝 Real-time notes update: ${notes.length} notes loaded for patient ${patient.id}`);
    });
    
    // Error handling
    const handleError = () => {
      setAppointmentsError('Failed to load appointments');
      setIsLoadingAppointments(false);
    };
    
    // Clean up listeners on component unmount
    return () => {
      unsubscribeAppointments();
      unsubscribeNotes();
    };
  }, [patient.id]);

  // Load hospitals/doctors for booking and emergency
  useEffect(() => {
    let isMounted = true;
    const loadMeta = async () => {
      try {
        const [hs, ds] = await Promise.all([getAllHospitals(), getAllDoctors()]);
        if (!isMounted) return;
        setHospitals(Array.isArray(hs) ? (hs as Hospital[]) : []);
        setDoctors(Array.isArray(ds) ? (ds as Doctor[]) : []);
      } catch {
        if (!isMounted) return;
        setHospitals([]);
        setDoctors([]);
      }
    };
    loadMeta();
    return () => { isMounted = false; };
  }, []);

  // Fetch health metrics
  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!patient?.id) return;
      
      setLoadingHealthMetrics(true);
      try {
        // Get all health metrics for the patient
        const metrics = await getHealthMetrics(patient.id);
        
        // If no metrics exist, generate mock data
        if (metrics.length === 0) {
          await generateMockHealthMetrics(patient.id);
          const newMetrics = await getHealthMetrics(patient.id);
          const formattedMetrics = formatHealthMetricsForChart(newMetrics);
          setHealthMetrics(formattedMetrics);
        } else {
          const formattedMetrics = formatHealthMetricsForChart(metrics);
          setHealthMetrics(formattedMetrics);
        }
      } catch (error) {
        console.error('Error fetching health metrics:', error);
      } finally {
        setLoadingHealthMetrics(false);
      }
    };
    
    fetchHealthMetrics();
  }, [patient?.id]);
  
  // Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patient?.id) return;
      
      setIsLoadingPrescriptions(true);
      try {
        // Generate mock prescriptions for demo purposes
        // Get a doctor for the mock data
        const doctor = doctors.length > 0 ? doctors[0] : { id: 'mock-doctor-id', name: 'Dr. Mock' };
        await generateMockPrescriptions(patient.id, patient.name, doctor.id, doctor.name);
        // Fetch the prescriptions after generating mock data
        const prescriptionData = await getPrescriptions(patient.id);
        setPrescriptions(prescriptionData);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setIsLoadingPrescriptions(false);
      }
    };
    
    fetchPrescriptions();
  }, [patient?.id, doctors]);

  // Fetch medical records
  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!patient?.id) return;
      
      setIsLoadingMedicalRecords(true);
      try {
        // Generate mock medical records for demo purposes
        const medicalRecordsData = await generateMockMedicalRecords(patient.id);
        setMedicalRecords(medicalRecordsData);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setIsLoadingMedicalRecords(false);
      }
    };
    
    fetchMedicalRecords();
  }, [patient?.id]);

  const previouslyVisitedDoctorIds = Array.from(new Set(appointments.map(a => a.doctorId)));
  const previouslyVisitedDoctors = doctors.filter(d => previouslyVisitedDoctorIds.includes(d.id));

  const handleStartBooking = () => {
    setSelectedHospitalId('');
    setDoctorChoiceMode('new');
    setSelectedDoctorId('');
    setSelectedDateTime('');
    setPaymentMethod('');
    setTransactionId('');
    setBookingStep('select');
    setShowBooking(true);
  };

  const handleProceedToPayment = () => {
    if (!selectedHospitalId) {
      alert('Please select a hospital');
      return;
    }
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }
    if (!selectedDateTime) {
      alert('Please select date and time');
      return;
    }
    setBookingStep('payment');
    setShowRazorpay(true);
  };

  const generateRandomTxn = () => `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`;

  const generateBillPdf = (appointmentId: string) => {
    const hospital = hospitals.find(h => h.id === selectedHospitalId);
    const doctor = doctors.find(d => d.id === selectedDoctorId);
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('Appointment Bill', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Appointment Number: ${appointmentId}`, 20, 35);
    pdf.text(`Hospital: ${hospital?.name || selectedHospitalId}`, 20, 45);
    pdf.text(`Doctor: ${doctor?.name || selectedDoctorId}`, 20, 55);
    pdf.text(`Patient: ${patient.name} (ID: ${patient.id})`, 20, 65);
    pdf.text(`Date & Time: ${formatDate(selectedDateTime)} ${formatTime(selectedDateTime)}`, 20, 75);
    pdf.text(`Payment Method: ${paymentMethod}`, 20, 85);
    if (transactionId) pdf.text(`Transaction ID: ${transactionId}`, 20, 95);
    pdf.save(`appointment-bill-${appointmentId}.pdf`);
  };

  const handleBookingSubmit = async () => {
    setIsSubmittingBooking(true);
    try {
      // Note: When using RazorpayPaymentGateway, the appointment is already created
      // by the component itself. This function is called after successful payment.
      // We just need to update the UI and reset the form.
      
      // Refresh appointments list
      const data = await getAppointmentsByPatient(patient.id);
      setAppointments(Array.isArray(data) ? data : []);
      
      // Reset booking form
      setSelectedHospitalId('');
      setSelectedDoctorId('');
      setSelectedDateTime('');
      setPaymentMethod('');
      setTransactionId('');
      setBookingStep('select');
      setShowBooking(false);
      setShowRazorpay(false);
      alert('Appointment booked successfully');
    } catch (e) {
      console.error('Error finalizing appointment:', e);
      alert('Failed to book appointment');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelConfirm(true);
  };
  
  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    setIsCancelling(true);
    try {
      const success = await cancelAppointment(appointmentToCancel);
      if (success) {
        // Update the local appointments list
        setAppointments(appointments.map(app => 
          app.id === appointmentToCancel 
            ? {...app, status: 'cancelled'} 
            : app
        ));
        alert('Appointment cancelled successfully');
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('An error occurred while cancelling the appointment');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
      setAppointmentToCancel('');
    }
  };
  const handleRescheduleAppointment = async (appointmentId: string) => {
    const newDt = prompt('Enter new date & time (YYYY-MM-DDTHH:mm):');
    if (!newDt) return;
    alert(`Reschedule requested for ${appointmentId} to ${newDt}. Implement backend update if needed.`);
  };

  // No demo data: history and knowledge are populated when real data exists

  const downloadPDF = (type: string) => {
    // Simulate PDF download
    console.log(`Downloading ${type} PDF for patient ${patient.id}`);
    alert(`${type} PDF downloaded successfully!`);
  };

  const handleVideoConsultation = (appointment: Appointment) => {
    // Handle video consultation - placeholder for now
    console.log('Starting video consultation for appointment:', appointment.id);
    alert(`Video consultation feature will be available soon for appointment ${appointment.id}`);
  };

  return (
    <>
      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md glassmorphism border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-xl font-semibold">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelConfirm(false)} 
              disabled={isCancelling}
              className="border-gray-200 hover:bg-gray-50"
            >
              No, Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancelAppointment} 
              disabled={isCancelling}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern SaaS Background */}
      <div className="min-h-screen bg-slate-50 font-['Inter'] antialiased">
        
        {/* Clean SaaS Header */}
        <div className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-11 w-11 border-2 border-emerald-100 shadow-sm">
                    <AvatarImage src={patient.photo} alt={patient.name} />
                    <AvatarFallback className="bg-emerald-500 text-white font-semibold text-sm">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Welcome back, {patient.name}
                  </h1>
                  <p className="text-sm text-slate-600 font-medium">
                    Here's your wellness overview
                  </p>
                </div>
              </div>
              
              {/* Top Navigation */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search health records..."
                    className="pl-10 pr-4 py-2 w-72 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
                <Button variant="outline" size="sm" className="relative h-9 w-9 p-0">
                  <Bell className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                  className="text-slate-600 hover:text-slate-900 h-9 px-3"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        
        {/* Main Layout */}
        <div className="flex">
          {/* Modern Sidebar Navigation */}
          <div className="w-72 bg-white border-r border-slate-200/60 min-h-screen">
            <div className="p-6">
              <div className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'notes', label: 'Doctor Notes', icon: FileText },
                  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
                  { id: 'health', label: 'Health Tracking', icon: Activity }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-slate-50 group ${
                      activeView === item.id 
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      activeView === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Quick Actions
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowAIBooking(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 rounded-xl h-11"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadPDF('Health Summary')}
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-11"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Health Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-8">
            {/* Dashboard Content */}
            {activeView === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-200 hover:shadow-lg group rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Total Appointments</p>
                          <p className="text-2xl font-bold text-slate-900 tracking-tight">
                            {appointments.filter(a => a.status !== 'cancelled').length}
                          </p>
                          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12% this month
                          </p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                          <Calendar className="w-6 h-6 text-emerald-600" />
                        </div>
                  
                  <Card className="bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-200 hover:shadow-lg group rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Health Score</p>
                          <p className="text-2xl font-bold text-slate-900 tracking-tight">85%</p>
                          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            Excellent progress
                          </p>
                        </div>
                        <div className="bg-teal-50 p-3 rounded-xl group-hover:bg-teal-100 transition-colors">
                          <Heart className="w-6 h-6 text-teal-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-200 hover:shadow-lg group rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Active Treatments</p>
                          <p className="text-2xl font-bold text-slate-900 tracking-tight">{prescriptions.length}</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">Ongoing therapies</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-slate-100 transition-colors">
                          <Pill className="w-6 h-6 text-slate-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-slate-200/60 hover:border-slate-300 transition-all duration-200 hover:shadow-lg group rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Next Appointment</p>
                          <p className="text-lg font-bold text-slate-900 tracking-tight">Tomorrow</p>
                          <p className="text-xs text-slate-500 font-medium mt-1">2:30 PM - Dr. Sharma</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                          <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Smart Insights */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <Brain className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-xl tracking-tight mb-3">
                        🌿 AI Health Insights
                      </h3>
                      <p className="text-slate-700 leading-relaxed mb-6 text-[15px]">
                        Your blood pressure trend is improving significantly. Consider incorporating daily pranayama breathing exercises for enhanced cardiovascular health. Your Ayurvedic treatment is showing excellent results with consistent progress.
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium px-3 py-1">
                          ✨ Personalized
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium rounded-lg"
                        >
                          View Full Analysis
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            
            {/* Appointments View */}
            {activeView === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h2>
                    <p className="text-slate-600 mt-1">Manage your healthcare appointments</p>
                  </div>
                  <Button 
                    onClick={() => setShowAIBooking(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl h-11 px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Appointment
                  </Button>
                </div>
                
                {/* Appointment Cards */}
                <div className="space-y-4">
                  {!isLoadingAppointments && !appointmentsError && appointments.length === 0 && (
                    <Card className="border-dashed border-2 border-slate-200 rounded-2xl">
                      <CardContent className="p-8 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments yet</h3>
                        <p className="text-slate-600 mb-4">Schedule your first Ayurvedic consultation</p>
                        <Button 
                          onClick={() => setShowAIBooking(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Your First Appointment
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  </div>
                </div>
              </div>
            )}
            
            <nav className="space-y-3">
              {[
                { id: 'dashboard', icon: BarChart3, label: 'Dashboard', gradient: 'from-blue-500 to-cyan-500' },
                { id: 'appointments', icon: Calendar, label: 'Appointments', gradient: 'from-emerald-500 to-teal-500' },
                { id: 'notes', icon: FileText, label: 'Doctor Notes', gradient: 'from-purple-500 to-indigo-500' },
                { id: 'prescriptions', icon: Pill, label: 'Prescriptions', gradient: 'from-orange-500 to-red-500' },
                { id: 'health', icon: Heart, label: 'Health Tracking', gradient: 'from-pink-500 to-rose-500' },
                { id: 'medical-records', icon: ClipboardList, label: 'Medical Records', gradient: 'from-amber-500 to-yellow-500' },
                { id: 'id-card', icon: QrCode, label: 'ID Card', gradient: 'from-teal-500 to-cyan-500' },
                { id: 'knowledge', icon: BookOpen, label: 'Knowledge', gradient: 'from-violet-500 to-purple-500' }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start gap-4 h-14 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl shadow-${item.gradient.split('-')[1]}-200 scale-105` 
                        : 'text-gray-600 hover:bg-white/60 hover:shadow-lg hover:scale-105 backdrop-blur-sm'
                    } ${sidebarCollapsed ? 'px-4 justify-center' : 'px-6'}`}
                    onClick={() => setActiveView(item.id)}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/40'}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="font-medium text-base">{item.label}</span>
                    )}
                    {!sidebarCollapsed && isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </Button>
                );
              })}
            </nav>

            {!sidebarCollapsed && (
              <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200 shadow-lg">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h4 className="font-bold text-amber-800 mb-2">Ayurvedic Wisdom</h4>
                  <p className="text-amber-700 text-sm mb-4">Discover personalized wellness insights</p>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg rounded-xl">
                    Explore
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Premium Main Content */}
        <div className="flex-1 p-8 relative z-10">
          {/* Render content based on active view */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    Welcome back, {patient.name.split(' ')[0]}
                  </h2>
                  <p className="text-gray-600 text-lg">Here's your wellness journey overview</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl border border-emerald-200">
                    <span className="text-emerald-700 font-bold text-lg">Health Score: 85%</span>
                  </div>
                </div>
              </div>

              {/* Premium Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Appointments', value: appointments.length, icon: Calendar, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
                  { title: 'Doctor Notes', value: patientNotes.length, icon: FileText, gradient: 'from-purple-500 to-indigo-500', bgGradient: 'from-purple-50 to-indigo-50' },
                  { title: 'Active Prescriptions', value: prescriptions.length, icon: Pill, gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-50 to-red-50' },
                  { title: 'Wellness Score', value: '85%', icon: Heart, gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-50 to-rose-50' }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full -translate-y-6 translate-x-6"></div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                          <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-2xl shadow-lg`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {index === 0 && 'This month'}
                          {index === 1 && 'Available'}
                          {index === 2 && 'Current'}
                          {index === 3 && 'Overall rating'}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Premium Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-800">Quick Actions</CardTitle>
                        <p className="text-gray-600">Manage your health journey</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative z-10">
                    <Button 
                      onClick={() => setShowAIBooking(true)}
                      className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Calendar className="w-6 h-6 mr-3" />
                      Book New Appointment
                    </Button>
                    <Button 
                      onClick={() => setShowEmergency(true)}
                      className="w-full h-14 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-xl rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <AlertTriangle className="w-6 h-6 mr-3" />
                      Emergency Consultation
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Health Analytics Dashboard */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Health Analytics</h3>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full">
                    Live Data
                  </Badge>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Blood Pressure Chart */}
                  <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl shadow-lg">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-800">Blood Pressure Trend</CardTitle>
                          <p className="text-sm text-gray-600">Last 6 months</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-64 flex items-end justify-between gap-2">
                        {generateHealthChartData().bloodPressure.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                              <div 
                                className="bg-gradient-to-t from-red-400 to-red-500 rounded-lg flex items-end justify-center text-white text-xs font-bold"
                                style={{ 
                                  height: `${(data.systolic / 140) * 100}%`,
                                  minHeight: '20px'
                                }}
                              >
                                {data.systolic}
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {data.date.split('-')[1]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Systolic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                          <span className="text-sm text-gray-600">Normal: 120/80</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Treatment Progress Chart */}
                  <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-800">Treatment Progress</CardTitle>
                          <p className="text-sm text-gray-600">Recovery journey</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-64 flex items-end justify-between gap-2">
                        {generateHealthChartData().treatmentProgress.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                              <div 
                                className="bg-gradient-to-t from-emerald-400 to-emerald-500 rounded-lg flex items-end justify-center text-white text-xs font-bold transition-all duration-1000 ease-out"
                                style={{ 
                                  height: `${data.progress}%`,
                                  minHeight: '20px'
                                }}
                              >
                                {data.progress}%
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {data.month}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">95% Complete</p>
                        <p className="text-sm text-gray-600">Excellent progress!</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Appointment Statistics */}
                <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-800">Appointment Overview</CardTitle>
                        <p className="text-sm text-gray-600">Your visit summary</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {generateHealthChartData().appointmentStats.map((stat, index) => (
                        <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                          <div 
                            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: stat.color }}
                          >
                            {stat.count}
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-1">{stat.type}</h4>
                          <p className="text-sm text-gray-600">
                            {stat.type === 'Completed' && 'Sessions completed'}
                            {stat.type === 'Upcoming' && 'Scheduled ahead'}
                            {stat.type === 'Cancelled' && 'Rescheduled'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'appointments' && (
            <div className="space-y-8">
              {/* Premium Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    My Appointments
                  </h2>
                  <p className="text-gray-600 text-lg">Manage your healthcare consultations</p>
                </div>
                <Button 
                  onClick={() => setShowAIBooking(true)}
                  className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Book New Appointment
                </Button>
              </div>
              
              {isLoadingAppointments && (
                <div className="flex items-center justify-center p-16">
                  <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your appointments...</p>
                  </div>
                </div>
              )}

              {!isLoadingAppointments && appointments.length === 0 && (
                <Card className="p-16 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-2xl">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-16 h-16 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">No Appointments Yet</h3>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    Start your wellness journey by booking your first consultation with our expert Ayurvedic practitioners.
                  </p>
                  <Button 
                    onClick={() => setShowAIBooking(true)}
                    className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Calendar className="w-6 h-6 mr-3" />
                    Book Your First Appointment
                  </Button>
                </Card>
              )}

              {!isLoadingAppointments && appointments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {appointments.map((appointment, index) => {
                    const doctor = doctors.find(d => d.id === appointment.doctorId);
                    const statusColors = {
                      scheduled: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', badge: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
                      completed: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', badge: 'bg-gradient-to-r from-green-500 to-emerald-500' },
                      cancelled: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', badge: 'bg-gradient-to-r from-gray-500 to-slate-500' }
                    };
                    const colors = statusColors[appointment.status as keyof typeof statusColors] || statusColors.scheduled;
                    
                    return (
                      <Card 
                        key={appointment.id} 
                        className={`p-8 bg-gradient-to-br ${colors.bg} border-0 shadow-2xl hover:shadow-4xl transition-all duration-500 hover:scale-105 relative overflow-hidden`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Animated background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 mb-2">Ayurvedic Consultation</h3>
                              <p className="text-gray-600 font-medium">
                                Dr. {doctor?.name || 'Unknown Practitioner'}
                              </p>
                              <p className="text-gray-500 text-sm">
                                {hospitals.find(h => h.id === appointment.hospitalId)?.name || 'Wellness Center'}
                              </p>
                            </div>
                            <Badge className={`${colors.badge} text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                                <Calendar className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">Appointment Date</p>
                                <p className="text-gray-600">{formatDate(appointment.dateTime)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                                <Clock className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">Consultation Time</p>
                                <p className="text-gray-600">{formatTime(appointment.dateTime)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button 
                              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                              onClick={() => handleVideoConsultation(appointment)}
                            >
                              <Video className="w-5 h-5 mr-2" />
                              Join Video Call
                            </Button>
                            {appointment.status === 'scheduled' && (
                              <Button 
                                variant="outline" 
                                className="h-12 px-6 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeView === 'notes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800">Doctor Notes</h2>
              
              {isLoadingNotes && (
                <div className="p-4 text-center">Loading notes...</div>
              )}

              {!isLoadingNotes && patientNotes.length === 0 && (
                <Card className="p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
                  <p className="text-gray-600">Doctor notes will appear here after consultations.</p>
                </Card>
              )}

              {!isLoadingNotes && patientNotes.length > 0 && (
                <div className="space-y-4">
                  {patientNotes.map((note, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">
                            Dr. {doctors.find(d => d.id === note.doctorId)?.name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {note.createdAt ? formatDate(note.createdAt.toString()) : 'Date unknown'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Notes:</span>
                          <p className="text-gray-700 mt-1">{note.content || note.notes || 'No content'}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'prescriptions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800">My Prescriptions</h2>
              <PrescriptionManagement
                prescriptions={prescriptions}
                patientId={patient.id}
              />
            </div>
          )}

          {activeView === 'health' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800">Health Tracking</h2>
              {healthMetrics && healthMetrics.length > 0 ? (
                <HealthMetricsChart 
                  bloodPressure={{
                    systolic: healthMetrics.filter(m => m.type === 'bloodPressureSystolic').map(m => ({ date: m.date.toISOString(), value: m.value })),
                    diastolic: healthMetrics.filter(m => m.type === 'bloodPressureDiastolic').map(m => ({ date: m.date.toISOString(), value: m.value }))
                  }}
                  heartRate={healthMetrics.filter(m => m.type === 'heartRate').map(m => ({ date: m.date.toISOString(), value: m.value }))}
                  bloodSugar={healthMetrics.filter(m => m.type === 'bloodSugar').map(m => ({ date: m.date.toISOString(), value: m.value }))}
                  weight={healthMetrics.filter(m => m.type === 'weight').map(m => ({ date: m.date.toISOString(), value: m.value }))}
                />
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No health metrics available yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Health data will appear here once recorded.</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'medical-records' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800">Medical Records</h2>
              <MedicalRecordsManagement
                patientId={patient.id}
                patientName={patient.name}
              />
            </div>
          )}

          {activeView === 'id-card' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800">Patient ID Card</h2>
              <div className="flex justify-center">
                <IDCard
                  patient={patient}
                  showDownloadButton={true}
                  className="max-w-md"
                />
              </div>
            </div>
          )}

          {activeView === 'knowledge' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-800">Ayurvedic Knowledge</h2>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Educational Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Educational content about Panchakarma and Ayurvedic practices.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-white shadow-md rounded-lg overflow-hidden">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              <FileText className="w-4 h-4 mr-2" />
              Doctor Notes
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <Pill className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <FileText className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <Heart className="w-4 h-4 mr-2" />
              Health Tracking
            </TabsTrigger>
            <TabsTrigger value="id-card" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <QrCode className="w-4 h-4 mr-2" />
              ID Card
            </TabsTrigger>
            <TabsTrigger value="medical-records" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <FileText className="w-4 h-4 mr-2" />
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setShowAIBooking(true)} 
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-6 h-auto text-lg font-medium rounded-xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      Upcoming Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingAppointments && (
                      <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm text-sm text-gray-600">
                        Loading appointments...
                      </div>
                    )}
                    {appointmentsError && !isLoadingAppointments && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
                        {appointmentsError}
                      </div>
                    )}
                    {!isLoadingAppointments && !appointmentsError && appointments.length === 0 && (
                      <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm text-sm text-gray-600">
                        No upcoming appointments.
                      </div>
                    )}
                    {!isLoadingAppointments && !appointmentsError && appointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className={`
                          relative p-6 rounded-2xl backdrop-blur-lg bg-white/80 border border-white/20 
                          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.5)]
                          transition-all duration-500 mb-6 overflow-hidden group
                          ${appointment.status === 'cancelled' ? 'opacity-60' : 'opacity-100'}
                        `}
                      >
                        {/* Status Indicator Strip */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                          appointment.status === 'scheduled' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                          appointment.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                          appointment.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          'bg-gradient-to-r from-amber-400 to-amber-600'
                        }`} />
                        
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center
                              ${appointment.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'}
                            `}>
                              <Heart className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                Panchakarma Consultation
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={`
                                    px-3 py-1 rounded-full text-xs font-medium border-0 shadow-sm
                                    ${appointment.status === 'scheduled' ? 'bg-emerald-100 text-emerald-800' :
                                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-amber-100 text-amber-800'}
                                  `}
                                >
                                  {appointment.status.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  ID: #{appointment.id.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatTime(appointment.dateTime)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(appointment.dateTime)}
                            </div>
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-5 border border-gray-100">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Symptoms
                              </h6>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {appointment.symptoms.join(', ')}
                              </p>
                            </div>
                            <div>
                              <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Pre-Instructions
                              </h6>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {appointment.preInstructions}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            size="sm" 
                            onClick={() => downloadPDF('Appointment Form')}
                            className="
                              bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800
                              shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-white font-medium
                              px-4 py-2 rounded-lg flex items-center gap-2
                            "
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                          
                          {appointment.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              className="
                                bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-white font-medium
                                px-4 py-2 rounded-lg flex items-center gap-2
                              "
                              onClick={() => {
                                setCurrentVideoAppointment(appointment);
                                setIsVideoConsultationOpen(true);
                              }}
                            >
                              <Video className="w-4 h-4" />
                              Join Call
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="
                              border-amber-300 bg-white/80 text-amber-700 hover:bg-amber-50/80 hover:border-amber-400
                              shadow-md hover:shadow-lg transition-all duration-300 font-medium
                              px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm
                            " 
                            onClick={() => handleRescheduleAppointment(appointment.id)}
                          >
                            <Calendar className="w-4 h-4" />
                            Reschedule
                          </Button>
                          
                          {appointment.status !== 'cancelled' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="
                                border-red-300 bg-white/80 text-red-700 hover:bg-red-50/80 hover:border-red-400
                                shadow-md hover:shadow-lg transition-all duration-300 font-medium
                                px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm
                              " 
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </Button>
                          )}
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Patient Stats Card */}
                <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Patient Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-blue-700">{appointments.filter(a => a.status !== 'cancelled').length}</p>
                        <p className="text-sm text-blue-600">Active Appointments</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-3xl font-bold text-green-700">{appointments.filter(a => a.status === 'completed').length}</p>
                        <p className="text-sm text-green-600">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Actions Card */}
                <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-green-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm hover:shadow transition-all py-5 h-auto" 
                      onClick={() => setShowAIBooking(true)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 py-5 h-auto">
                      <Heart className="w-4 h-4 mr-2" />
                      Health Assessment
                    </Button>
                    <Button variant="outline" className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 py-5 h-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Download Reports
                    </Button>
                    <Button variant="outline" className="w-full border-red-600 text-red-700 hover:bg-red-50 py-5 h-auto" onClick={() => setShowEmergency(true)}>
                      🚨 Emergency
                    </Button>
                  </CardContent>
                </Card>

                {/* Next Appointment Card */}
                <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                    <CardTitle className="text-amber-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      Next Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {appointments.filter(a => a.status === 'scheduled').length > 0 ? (
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="font-medium text-amber-800">
                          {formatDate(appointments.filter(a => a.status === 'scheduled')[0].dateTime)}
                        </p>
                        <p className="text-sm text-amber-700">
                          {formatTime(appointments.filter(a => a.status === 'scheduled')[0].dateTime)}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        No upcoming appointment.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Prescription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingPrescriptions ? (
                  <div className="p-5 bg-blue-50 rounded-lg text-sm text-blue-700 text-center">
                    <p>Loading prescriptions...</p>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="p-5 bg-blue-50 rounded-lg text-sm text-blue-700 text-center">
                    <p className="mb-2 font-medium">No prescriptions available yet</p>
                    <p>Your prescriptions will appear here after your doctor issues them</p>
                  </div>
                ) : (
                  <PrescriptionManagement prescriptions={prescriptions} patientId={patient.id} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medical-records" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Medical Records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingMedicalRecords ? (
                  <div className="p-5 bg-indigo-50 rounded-lg text-sm text-indigo-700 text-center">
                    <p>Loading medical records...</p>
                  </div>
                ) : medicalRecords.length === 0 ? (
                  <div className="p-5 bg-indigo-50 rounded-lg text-sm text-indigo-700 text-center">
                    <p className="mb-2 font-medium">No medical records available yet</p>
                    <p>Your medical records will appear here after your doctor uploads them</p>
                  </div>
                ) : (
                  <MedicalRecordsManagement patientId={patient.id} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Doctor Notes
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => createSamplePatientNotes()}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Create Sample Notes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingNotes ? (
                  <div className="p-5 bg-blue-50 rounded-lg text-sm text-blue-700 text-center">
                    <p>Loading doctor notes...</p>
                  </div>
                ) : patientNotes.length === 0 ? (
                  <div className="p-5 bg-blue-50 rounded-lg text-sm text-blue-700 text-center">
                    <p className="mb-2 font-medium">No notes available yet</p>
                    <p>Your doctor notes will appear here after your consultation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientNotes.map((note: PatientNote, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-lg">{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}</h4>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">Dr. {note.doctorId || 'Unknown'}</Badge>
                        </div>
                        
                        {note.structuredContent && (
                          <div className="space-y-3 mt-3">
                            {note.structuredContent.medicines && note.structuredContent.medicines.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-700 flex items-center"><Pill className="w-4 h-4 mr-2" /> Medicines</h5>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {note.structuredContent.medicines.map((med: string, i: number) => (
                                    <li key={i}>{med}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {note.structuredContent.cautions && note.structuredContent.cautions.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-700 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Cautions</h5>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {note.structuredContent.cautions.map((caution: string, i: number) => (
                                    <li key={i}>{caution}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {note.structuredContent.preventions && note.structuredContent.preventions.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-700 flex items-center"><Shield className="w-4 h-4 mr-2" /> Preventions</h5>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {note.structuredContent.preventions.map((prevention: string, i: number) => (
                                    <li key={i}>{prevention}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {note.structuredContent.generalNotes && note.structuredContent.generalNotes.length > 0 && (
                              <div>
                                <h5 className="font-medium text-gray-700 flex items-center"><FileText className="w-4 h-4 mr-2" /> General Notes</h5>
                                <ul className="list-disc pl-5 text-gray-600">
                                  {note.structuredContent.generalNotes.map((gen: string, i: number) => (
                                    <li key={i}>{gen}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Therapy History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="p-5 bg-purple-50 rounded-lg text-sm text-purple-700 text-center">
                  <p className="mb-2 font-medium">No history available yet</p>
                  <p>Your therapy history will appear here after your first completed appointment</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            {loadingHealthMetrics ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : healthMetrics ? (
              <div className="grid grid-cols-1 gap-6">
                <HealthMetricsChart 
                  bloodPressure={healthMetrics.bloodPressure}
                  heartRate={healthMetrics.heartRate}
                  bloodSugar={healthMetrics.bloodSugar}
                  weight={healthMetrics.weight}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-700 text-white rounded-t-lg pb-2">
                      <CardTitle className="text-sm">Health Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="bg-green-100 p-1 rounded mt-0.5">
                            <Heart className="h-3 w-3 text-green-700" />
                          </div>
                          <span>Maintain a balanced diet rich in fruits and vegetables</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-green-100 p-1 rounded mt-0.5">
                            <Heart className="h-3 w-3 text-green-700" />
                          </div>
                          <span>Aim for 150 minutes of moderate exercise weekly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-green-100 p-1 rounded mt-0.5">
                            <Heart className="h-3 w-3 text-green-700" />
                          </div>
                          <span>Stay hydrated with at least 8 glasses of water daily</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white rounded-t-lg pb-2">
                      <CardTitle className="text-sm">Recent Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Blood Pressure</span>
                            <Badge variant="outline" className="text-green-600 bg-green-50">Improved</Badge>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Heart Rate</span>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50">Stable</Badge>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-700 text-white rounded-t-lg pb-2">
                      <CardTitle className="text-sm">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="bg-purple-100 p-1 rounded mt-0.5">
                            <Calendar className="h-3 w-3 text-purple-700" />
                          </div>
                          <span>Schedule annual physical examination</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-purple-100 p-1 rounded mt-0.5">
                            <FileText className="h-3 w-3 text-purple-700" />
                          </div>
                          <span>Update vaccination records</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-purple-100 p-1 rounded mt-0.5">
                            <Heart className="h-3 w-3 text-purple-700" />
                          </div>
                          <span>Consider cholesterol screening</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p>No health metrics available. Please check back later.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="id-card" className="space-y-6">
            <div className="bg-white p-6 shadow-lg rounded-xl">
              <IDCard patient={patient} showDownloadButton={true} />
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  Ayurvedic Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Panchakarma Basics
                    </h3>
                    <p>Learn about the fundamental principles of Panchakarma therapy and its benefits.</p>
                  </div>
                  <div className="p-5 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800 hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Dietary Guidelines
                    </h3>
                    <p>Discover the recommended diet before and after your Panchakarma treatments.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{bookingStep === 'select' ? 'Book Appointment' : 'Payment'}</DialogTitle>
            <DialogDescription>
              {bookingStep === 'select' ? 'Select hospital, doctor, and date & time' : 'Choose payment method and confirm'}
            </DialogDescription>
          </DialogHeader>
          {bookingStep === 'select' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Hospital</label>
                <select value={selectedHospitalId} onChange={e => setSelectedHospitalId(e.target.value)} className="w-full border rounded p-2">
                  <option value="">-- Choose --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-700">Select Doctor</label>
                <div className="flex gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={doctorChoiceMode==='new'} onChange={() => setDoctorChoiceMode('new')} /> New Doctor
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={doctorChoiceMode==='previous'} onChange={() => setDoctorChoiceMode('previous')} /> Previously Visited
                  </label>
                </div>
                {doctorChoiceMode === 'new' && (
                  <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} className="w-full border rounded p-2">
                    <option value="">-- Choose --</option>
                    {doctors.filter(d => !selectedHospitalId || d.hospitalId === selectedHospitalId).map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                )}
                {doctorChoiceMode === 'previous' && (
                  <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} className="w-full border rounded p-2">
                    <option value="">-- Choose --</option>
                    {previouslyVisitedDoctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Date & Time</label>
                <input type="datetime-local" value={selectedDateTime} onChange={e => setSelectedDateTime(e.target.value)} className="w-full border rounded p-2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBooking(false)}>Cancel</Button>
                <Button onClick={handleProceedToPayment}>Continue</Button>
              </div>
            </div>
          )}
          {bookingStep === 'payment' && (
            <div className="space-y-4">
              {showRazorpay ? (
                <RazorpayPaymentGateway
                  patient={patient}
                  doctor={doctors.find(d => d.id === selectedDoctorId)}
                  hospital={hospitals.find(h => h.id === selectedHospitalId)}
                  amount={1500} // Set appropriate amount based on your business logic
                  appointmentDateTime={selectedDateTime}
                  onSuccess={(appointmentId) => {
                    // Handle successful payment
                    setTransactionId(appointmentId);
                    handleBookingSubmit();
                  }}
                  onCancel={() => {
                    // Handle payment cancellation
                    setShowRazorpay(false);
                  }}
                  bookingData={{
                    patientId: patient.id,
                    doctorId: selectedDoctorId,
                    hospitalId: selectedHospitalId,
                    symptoms: [],
                    dateTime: selectedDateTime,
                    preInstructions: '',
                    postInstructions: '',
                    status: 'scheduled'
                  }}
                />
              ) : (
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setBookingStep('select')}>Back</Button>
                  <Button onClick={() => setShowRazorpay(true)}>Proceed to Payment</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Emergency Dialog */}
      <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>🚨 Emergency - Available Doctors</DialogTitle>
            <DialogDescription>Contact doctors directly</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-auto">
            {doctors.length === 0 && <div className="text-sm text-gray-600">No doctors available.</div>}
            {doctors.map(d => (
              <div key={d.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-gray-600">{d.specialty}</div>
                  <div className="text-xs text-gray-600">Phone: {d.phone} • Email: {d.email}</div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${d.phone}`} className="text-sm text-emerald-700 underline">Call</a>
                  <a href={`mailto:${d.email}`} className="text-sm text-emerald-700 underline">Email</a>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* AI Appointment Booking Dialog */}
       <AIAppointmentBooking 
         open={showAIBooking}
         onOpenChange={setShowAIBooking}
         patient={patient}
         hospitals={hospitals}
         doctors={doctors}
         onSuccess={(appointmentId) => {
           // Refresh appointments after successful booking
           listenToAppointments(patient.id, (data) => {
             if (Array.isArray(data)) {
               setAppointments(data);
             }
           });
           setShowAIBooking(false);
         }}
       />

    {/* Video Consultation Component */}
    {currentVideoAppointment && (
      <VideoConsultation
        isOpen={isVideoConsultationOpen}
        onClose={() => setIsVideoConsultationOpen(false)}
        appointmentId={currentVideoAppointment.id}
        doctorId={currentVideoAppointment.doctorId}
        doctorName={doctors.find(d => d.id === currentVideoAppointment.doctorId)?.name || 'Doctor'}
        doctorImage={undefined}
        patientId={patient.id}
        patientName={patient.name}
        patientImage={patient.photoUrl}
        currentUserId={patient.id}
        currentUserType="patient"
      />
    )}
    </>
  );
}