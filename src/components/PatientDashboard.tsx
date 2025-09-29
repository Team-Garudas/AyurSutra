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
  ClipboardList,
  ArrowRight,
  Sparkles
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
  getPatientFast,
  getDoctorFast,
  getHospitalFast,
  bookAppointmentWithQueue,
  getWaitingListStatus,
  getPatientStatistics,
  initializeEnhancedSystem,
  createSamplePatientNotes
} from '@/lib/mockData';
import { cancelAppointment, listenToAppointments, getPatientNotes, listenToPatientNotes, PatientNote, addDoctor, addHospital } from '@/lib/firebaseService';
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

interface PatientDashboardProps {
  patient: Patient;
  onLogout: () => void;
}

export default function PatientDashboard({ patient, onLogout }: PatientDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(true);
  const [appointmentsError, setAppointmentsError] = useState<string>('');

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patientNotes, setPatientNotes] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showAIBooking, setShowAIBooking] = useState(false);

  // Initialize sample data
  const initializeSampleData = async () => {
    try {
      console.log('🏥 Initializing sample hospitals and doctors...');
      
      // Check if hospitals exist
      const existingHospitals = await getAllHospitals();
      
      if (existingHospitals.length === 0) {
        console.log('📝 Creating sample hospitals...');
        
        // Create sample hospitals
        const hospitals = [
          {
            id: 'hospital-1',
            name: 'Serenity Ayurvedic Center',
            address: '123 Wellness Street, Mumbai, Maharashtra 400001',
            email: 'info@serenityayurveda.com',
            phone: '+91-9876543210',
            adminUsername: 'serenity_admin',
            adminPassword: 'serenity123',
            numDoctors: 5,
            numTherapists: 3
          },
          {
            id: 'hospital-2', 
            name: 'Harmony Holistic Hospital',
            address: '456 Natural Healing Avenue, Delhi 110001',
            email: 'contact@harmonyholistic.com',
            phone: '+91-9876543211',
            adminUsername: 'harmony_admin',
            adminPassword: 'harmony123',
            numDoctors: 4,
            numTherapists: 2
          },
          {
            id: 'hospital-3',
            name: 'Vedic Wellness Institute',
            address: '789 Traditional Medicine Road, Bangalore 560001',
            email: 'help@vedicwellness.com',
            phone: '+91-9876543212',
            adminUsername: 'vedic_admin',
            adminPassword: 'vedic123',
            numDoctors: 6,
            numTherapists: 4
          }
        ];

        for (const hospital of hospitals) {
          await addHospital(hospital);
        }

        // Create sample doctors for each hospital
        const doctors = [
          // Hospital 1 - Serenity Ayurvedic Center
          {
            id: 'doctor-1-1',
            hospitalId: 'hospital-1',
            name: 'Dr. Priya Sharma',
            specialty: 'Panchakarma Specialist',
            username: 'priya_sharma',
            password: 'priya123',
            email: 'priya.sharma@serenityayurveda.com',
            phone: '+91-9876543213'
          },
          {
            id: 'doctor-1-2',
            hospitalId: 'hospital-1',
            name: 'Dr. Rajesh Kumar',
            specialty: 'Ayurvedic Physician',
            username: 'rajesh_kumar',
            password: 'rajesh123',
            email: 'rajesh.kumar@serenityayurveda.com',
            phone: '+91-9876543214'
          },
          {
            id: 'doctor-1-3',
            hospitalId: 'hospital-1',
            name: 'Dr. Meera Patel',
            specialty: 'Herbal Medicine Expert',
            username: 'meera_patel',
            password: 'meera123',
            email: 'meera.patel@serenityayurveda.com',
            phone: '+91-9876543215'
          },
          
          // Hospital 2 - Harmony Holistic Hospital
          {
            id: 'doctor-2-1',
            hospitalId: 'hospital-2',
            name: 'Dr. Amit Singh',
            specialty: 'Ayurvedic Cardiologist',
            username: 'amit_singh',
            password: 'amit123',
            email: 'amit.singh@harmonyholistic.com',
            phone: '+91-9876543216'
          },
          {
            id: 'doctor-2-2',
            hospitalId: 'hospital-2',
            name: 'Dr. Sunita Gupta',
            specialty: 'Women\'s Health Specialist',
            username: 'sunita_gupta',
            password: 'sunita123',
            email: 'sunita.gupta@harmonyholistic.com',
            phone: '+91-9876543217'
          },
          
          // Hospital 3 - Vedic Wellness Institute
          {
            id: 'doctor-3-1',
            hospitalId: 'hospital-3',
            name: 'Dr. Vikram Acharya',
            specialty: 'Ayurvedic Neurologist',
            username: 'vikram_acharya',
            password: 'vikram123',
            email: 'vikram.acharya@vedicwellness.com',
            phone: '+91-9876543218'
          },
          {
            id: 'doctor-3-2',
            hospitalId: 'hospital-3',
            name: 'Dr. Kavya Nair',
            specialty: 'Pediatric Ayurveda',
            username: 'kavya_nair',
            password: 'kavya123',
            email: 'kavya.nair@vedicwellness.com',
            phone: '+91-9876543219'
          },
          {
            id: 'doctor-3-3',
            hospitalId: 'hospital-3',
            name: 'Dr. Arjun Reddy',
            specialty: 'Ayurvedic Orthopedics',
            username: 'arjun_reddy',
            password: 'arjun123',
            email: 'arjun.reddy@vedicwellness.com',
            phone: '+91-9876543220'
          }
        ];

        for (const doctor of doctors) {
          await addDoctor(doctor);
        }
        
        console.log('✅ Sample hospitals and doctors created successfully!');
      } else {
        console.log(`✅ Found ${existingHospitals.length} existing hospitals`);
      }
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingAppointments(true);
        
        // Set up real-time listener for appointments
        const unsubscribeAppointments = listenToAppointments(patient.id, (data) => {
          if (Array.isArray(data)) {
            setAppointments(data);
            setIsLoadingAppointments(false);
          }
        });

        // Load other data
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData);

        const hospitalsData = await getAllHospitals();
        setHospitals(hospitalsData);

        // Load prescriptions with proper parameters
        try {
          await generateMockPrescriptions(patient.id, 'doctor-1', 'Hospital-1', 'appointment-1');
          // Get prescriptions after generation
          const prescriptionData = await getPrescriptions(patient.id);
          setPrescriptions(prescriptionData || []);
        } catch (error) {
          console.error('Error loading prescriptions:', error);
          setPrescriptions([]);
        }

        const mockMedicalRecords = await generateMockMedicalRecords(patient.id);
        setMedicalRecords(mockMedicalRecords);

        // Clean up function
        return () => {
          unsubscribeAppointments();
        };
      } catch (error) {
        console.error('Error loading data:', error);
        setAppointmentsError('Failed to load data');
        setIsLoadingAppointments(false);
      }
    };

    loadData();
  }, [patient.id]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      // Refresh appointments will happen via real-time listener
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between h-20 px-8">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-12 h-12 rounded-2xl bg-white/60 hover:bg-white shadow-lg backdrop-blur-sm border border-white/50"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-slate-900">AyurSutra</h1>
                <p className="text-sm text-slate-500">Patient Portal</p>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search appointments, doctors, prescriptions..."
                className="w-full h-12 pl-12 pr-6 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-12 h-12 rounded-2xl bg-white/60 hover:bg-white shadow-lg backdrop-blur-sm border border-white/50 relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-3 border-white shadow-xl">
                <PatientPhoto 
                  photoUrl={patient.photoUrl} 
                  alt={patient.name}
                  className="w-full h-full rounded-full object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-semibold text-slate-900">{patient.name}</p>
                <p className="text-sm text-emerald-600">ID: {patient.id.slice(-6)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Premium Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} transition-all duration-500 bg-white/60 backdrop-blur-xl border-r border-white/20 shadow-2xl min-h-screen relative z-40`}>
          <div className="p-6">
            {/* Patient Profile Card */}
            {!sidebarCollapsed && (
              <Card className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-white/50 shadow-xl backdrop-blur-sm rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                        <PatientPhoto 
                          photoUrl={patient.photoUrl} 
                          alt={patient.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xl font-bold">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{patient.name}</h3>
                      <p className="text-emerald-600 font-medium text-sm">Patient ID: {patient.id.slice(-6)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200">
                          Premium Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Menu */}
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
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl scale-105` 
                        : 'text-slate-600 hover:bg-white/60 hover:shadow-lg hover:scale-105 backdrop-blur-sm'
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

            {/* AI Wisdom Card */}
            {!sidebarCollapsed && (
              <Card className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-xl rounded-3xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h4 className="font-bold text-amber-800 mb-2">Ayurvedic Wisdom</h4>
                  <p className="text-amber-700 text-sm mb-4">Discover personalized wellness insights</p>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg rounded-xl">
                    Explore
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 relative z-10">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                    Welcome back, {patient.name.split(' ')[0]}
                  </h2>
                  <p className="text-slate-600 text-lg">Here's your wellness journey overview</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-bold text-lg rounded-2xl border border-emerald-200">
                    Health Score: 85%
                  </Badge>
                  <Button 
                    onClick={onLogout}
                    variant="outline"
                    className="px-4 py-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 rounded-xl font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Appointments', value: appointments.length, icon: Calendar, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
                  { title: 'Doctor Notes', value: patientNotes.length, icon: FileText, gradient: 'from-purple-500 to-indigo-500', bgGradient: 'from-purple-50 to-indigo-50' },
                  { title: 'Active Prescriptions', value: prescriptions.length, icon: Pill, gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-50 to-red-50' },
                  { title: 'Wellness Score', value: '85%', icon: Heart, gradient: 'from-pink-500 to-rose-500', bgGradient: 'from-pink-50 to-rose-50' }
                ].map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl rounded-3xl`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full -translate-y-6 translate-x-6"></div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium text-sm">{stat.title}</p>
                          <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Activity & AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Appointments */}
                <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      Recent Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.slice(0, 3).map((appointment, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{doctors.find(d => d.id === appointment.doctorId)?.name || 'Dr. Unknown'}</p>
                          <p className="text-sm text-slate-600">{formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}</p>
                        </div>
                        <Badge className={`${appointment.status === 'scheduled' ? 'bg-green-100 text-green-700' : appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Therapy Progress Graph */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl rounded-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      Therapy Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress Overview */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-900">12</div>
                          <div className="text-xs text-blue-600">Sessions Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-900">85%</div>
                          <div className="text-xs text-indigo-600">Progress Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-900">4</div>
                          <div className="text-xs text-purple-600">Weeks Active</div>
                        </div>
                      </div>

                      {/* Therapy Types Progress */}
                      <div className="space-y-4">
                        {/* Panchakarma Therapy */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-slate-800">Panchakarma</span>
                            </div>
                            <span className="text-xs text-slate-600 bg-emerald-100 px-2 py-1 rounded-full">8/10 sessions</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out" style={{width: '80%'}}></div>
                          </div>
                        </div>

                        {/* Abhyanga Massage */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-slate-800">Abhyanga Massage</span>
                            </div>
                            <span className="text-xs text-slate-600 bg-blue-100 px-2 py-1 rounded-full">6/8 sessions</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{width: '75%'}}></div>
                          </div>
                        </div>

                        {/* Herbal Steam */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-slate-800">Herbal Steam</span>
                            </div>
                            <span className="text-xs text-slate-600 bg-orange-100 px-2 py-1 rounded-full">4/6 sessions</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out" style={{width: '67%'}}></div>
                          </div>
                        </div>

                        {/* Yoga Therapy */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-slate-800">Yoga Therapy</span>
                            </div>
                            <span className="text-xs text-slate-600 bg-purple-100 px-2 py-1 rounded-full">5/6 sessions</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-1000 ease-out" style={{width: '83%'}}></div>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Progress Chart */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-3">Weekly Progress</h4>
                        <div className="h-24 bg-white/60 rounded-xl p-3 relative">
                          <svg viewBox="0 0 280 80" className="w-full h-full">
                            <defs>
                              <linearGradient id="therapyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8"/>
                                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8"/>
                              </linearGradient>
                              <linearGradient id="therapyAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                              </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            {[...Array(4)].map((_, i) => (
                              <line key={i} x1="0" y1={20 * i} x2="280" y2={20 * i} stroke="#E5E7EB" strokeWidth="0.5" opacity="0.5"/>
                            ))}
                            
                            {/* Progress area */}
                            <polygon
                              fill="url(#therapyAreaGradient)"
                              points="0,60 40,55 80,45 120,40 160,35 200,30 240,25 280,20 280,80 0,80"
                            />
                            
                            {/* Progress line */}
                            <polyline
                              fill="none"
                              stroke="url(#therapyGradient)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points="0,60 40,55 80,45 120,40 160,35 200,30 240,25 280,20"
                            />
                            
                            {/* Data points */}
                            {[0, 40, 80, 120, 160, 200, 240, 280].map((x, i) => {
                              const y = [60, 55, 45, 40, 35, 30, 25, 20][i];
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="4" fill="#3B82F6" className="hover:r-5 transition-all duration-200"/>
                                  <circle cx={x} cy={y} r="2" fill="white"/>
                                </g>
                              );
                            })}
                          </svg>
                          
                          {/* Week labels */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 px-3">
                            {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'].map((week, i) => (
                              <span key={i} className={`${i % 2 === 0 ? 'block' : 'hidden sm:block'}`}>{week}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Next Session Info */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-blue-900">Next Session</h5>
                            <p className="text-sm text-blue-700">Panchakarma Therapy - Tomorrow at 10:00 AM</p>
                          </div>
                          <div className="ml-auto">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-purple-50 backdrop-blur-xl rounded-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      AI Health Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-2xl border border-white/50">
                      <h4 className="font-semibold text-purple-900 mb-2">🌟 Wellness Recommendation</h4>
                      <p className="text-purple-700 text-sm">Based on your recent appointments, consider adding meditation to your daily routine for better stress management.</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl border border-white/50">
                      <h4 className="font-semibold text-purple-900 mb-2">📊 Health Trend</h4>
                      <p className="text-purple-700 text-sm">Your consistency with appointments has improved by 23% this month. Keep up the great work!</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl border border-white/50">
                      <h4 className="font-semibold text-purple-900 mb-2">🎯 Next Goal</h4>
                      <p className="text-purple-700 text-sm">Complete your upcoming follow-up appointment to maintain your wellness journey momentum.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Health Metrics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weight & BMI Progress */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl rounded-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Weight Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-900">72.5 kg</span>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-semibold">-2.5kg</span>
                        </div>
                      </div>
                      
                      {/* Mini weight chart */}
                      <div className="h-12 bg-white/60 rounded-xl p-2">
                        <svg viewBox="0 0 200 32" className="w-full h-full">
                          <defs>
                            <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981"/>
                              <stop offset="100%" stopColor="#059669"/>
                            </linearGradient>
                          </defs>
                          <polyline
                            fill="none"
                            stroke="url(#weightGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            points="0,20 40,18 80,16 120,14 160,12 200,10"
                          />
                          {[0, 40, 80, 120, 160, 200].map((x, i) => {
                            const y = [20, 18, 16, 14, 12, 10][i];
                            return (
                              <circle key={i} cx={x} cy={y} r="2" fill="#059669"/>
                            );
                          })}
                        </svg>
                      </div>
                      
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>6mo ago</span>
                        <span>3mo ago</span>
                        <span>Now</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sleep & Energy Levels */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 backdrop-blur-xl rounded-3xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      Sleep & Energy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sleep Quality */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-amber-900">Sleep Quality</span>
                          <span className="text-xs text-amber-600">8.2/10</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{width: '82%'}}></div>
                        </div>
                      </div>

                      {/* Energy Level */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-amber-900">Energy Level</span>
                          <span className="text-xs text-amber-600">7.8/10</span>
                        </div>
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>

                      {/* Weekly Overview */}
                      <div className="flex justify-between items-end h-16 bg-white/60 rounded-xl p-3">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                          <div key={day} className="flex flex-col items-center gap-1">
                            <div 
                              className="w-2 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full"
                              style={{height: `${[60, 80, 70, 90, 85, 95, 75][i]}%`}}
                            ></div>
                            <span className="text-xs text-amber-700">{day[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl h-11 px-6 hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
              
              {/* Appointment Cards */}
              <div className="space-y-4">
                {!isLoadingAppointments && !appointmentsError && appointments.length === 0 && (
                  <Card className="border-dashed border-2 border-slate-200 rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">No appointments yet</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">Schedule your first Ayurvedic consultation to begin your wellness journey</p>
                      <Button 
                        onClick={() => setShowAIBooking(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-3 hover:scale-105 transition-all duration-300"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Your First Appointment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {appointments.map((appointment) => {
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  return (
                    <Card key={appointment.id} className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <Avatar className="w-16 h-16 border-4 border-white shadow-xl">
                              <AvatarImage src={doctor?.email} alt={doctor?.name} />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xl font-bold">
                                {doctor?.name?.split(' ').map(n => n[0]).join('') || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900">{doctor?.name || 'Dr. Unknown'}</h3>
                                <p className="text-emerald-600 font-medium">{doctor?.specialty || 'General Medicine'}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">{formatDate(appointment.dateTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">{formatTime(appointment.dateTime)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <Badge className={`px-4 py-2 rounded-xl font-semibold ${
                                  appointment.status === 'scheduled' 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : appointment.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Badge>
                                
                                {appointment.status === 'scheduled' && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2"
                                    >
                                      <Video className="w-4 h-4 mr-1" />
                                      Join
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="rounded-xl px-4 py-2 border-red-200 text-red-600 hover:bg-red-50"
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Views Placeholder */}
          {activeView === 'notes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Doctor Notes</h2>
              <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-xl rounded-3xl">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">No notes available</h3>
                  <p className="text-slate-600">Your doctor notes will appear here after your consultations.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'prescriptions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Prescriptions</h2>
              <PrescriptionManagement 
                prescriptions={prescriptions}
                patientId={patient.id}
              />
            </div>
          )}

          {activeView === 'health' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Health Tracking</h2>
              <HealthMetricsChart 
                bloodPressure={{
                  systolic: [{ date: '2024-01', value: 120 }],
                  diastolic: [{ date: '2024-01', value: 80 }]
                }}
                heartRate={[{ date: '2024-01', value: 75 }]}
                bloodSugar={[{ date: '2024-01', value: 95 }]}
                weight={[{ date: '2024-01', value: 70 }]}
              />
            </div>
          )}

          {activeView === 'medical-records' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
              <MedicalRecordsManagement 
                patientId={patient.id}
              />
            </div>
          )}

          {activeView === 'id-card' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Patient ID Card</h2>
              <IDCard patient={patient} />
            </div>
          )}

          {activeView === 'knowledge' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    Ayurvedic Knowledge
                  </h2>
                  <p className="text-slate-600 text-lg">Discover ancient wisdom for modern wellness</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-bold text-lg rounded-2xl border border-amber-200">
                    ✨ Premium Content
                  </Badge>
                </div>
              </div>

              {/* Featured Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    id: 1,
                    image: '1.jpg',
                    title: 'Understanding Your Dosha',
                    subtitle: 'Vata, Pitta & Kapha Constitution',
                    description: 'Learn about the three fundamental energies that govern your physical and mental processes according to Ayurveda.',
                    category: 'Fundamentals',
                    readTime: '8 min read',
                    gradient: 'from-emerald-500 to-teal-500',
                    bgGradient: 'from-emerald-50 to-teal-50'
                  },
                  {
                    id: 2,
                    image: '2.jpg',
                    title: 'Ayurvedic Nutrition',
                    subtitle: 'Eating for Your Body Type',
                    description: 'Discover how to choose foods that balance your dosha and support optimal health and digestion.',
                    category: 'Nutrition',
                    readTime: '12 min read',
                    gradient: 'from-orange-500 to-red-500',
                    bgGradient: 'from-orange-50 to-red-50'
                  },
                  {
                    id: 3,
                    image: '3.jpg',
                    title: 'Herbal Medicine Guide',
                    subtitle: 'Nature\'s Pharmacy',
                    description: 'Explore the therapeutic properties of traditional Ayurvedic herbs and their modern applications.',
                    category: 'Herbs',
                    readTime: '15 min read',
                    gradient: 'from-green-500 to-emerald-500',
                    bgGradient: 'from-green-50 to-emerald-50'
                  },
                  {
                    id: 4,
                    image: '4.jpg',
                    title: 'Yoga & Meditation',
                    subtitle: 'Mind-Body Harmony',
                    description: 'Learn how yoga and meditation practices complement Ayurvedic treatments for holistic wellness.',
                    category: 'Practices',
                    readTime: '10 min read',
                    gradient: 'from-purple-500 to-violet-500',
                    bgGradient: 'from-purple-50 to-violet-50'
                  }
                ].map((article) => (
                  <Card key={article.id} className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br ${article.bgGradient} backdrop-blur-xl rounded-3xl cursor-pointer`}>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
                    
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className={`bg-gradient-to-r ${article.gradient} text-white border-0 shadow-lg`}>
                          {article.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <CardContent className="p-6 relative z-10">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-300">
                            {article.title}
                          </h3>
                          <p className="text-amber-600 font-semibold text-sm mt-1">{article.subtitle}</p>
                        </div>
                        
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {article.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4">
                          <Button 
                            className={`bg-gradient-to-r ${article.gradient} hover:shadow-lg text-white rounded-xl px-6 py-2 group-hover:scale-105 transition-all duration-300`}
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r ${article.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                                  {i}
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-slate-500 ml-2">+124 readers</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Tips Section */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50 backdrop-blur-xl rounded-3xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    Daily Wellness Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: "🌅",
                        title: "Morning Routine",
                        tip: "Start your day with warm water and lemon to kindle your digestive fire (Agni)."
                      },
                      {
                        icon: "🧘‍♀️",
                        title: "Mindful Eating",
                        tip: "Eat your largest meal at midday when your digestive power is strongest."
                      },
                      {
                        icon: "🌙",
                        title: "Evening Wind-down",
                        tip: "Practice gentle yoga or meditation before bed to prepare for restful sleep."
                      }
                    ].map((tip, index) => (
                      <div key={index} className="p-6 bg-white/60 rounded-2xl border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="text-3xl mb-3">{tip.icon}</div>
                        <h4 className="font-bold text-indigo-900 mb-2">{tip.title}</h4>
                        <p className="text-indigo-700 text-sm">{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Guided Meditations */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-50 to-pink-50 backdrop-blur-xl rounded-3xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-rose-900 mb-2">Guided Meditations</h3>
                    <p className="text-rose-700 text-sm mb-4">Access our collection of Ayurvedic meditation practices</p>
                    <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg rounded-xl">
                      Explore
                    </Button>
                  </CardContent>
                </Card>

                {/* Recipe Library */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl rounded-3xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Recipe Library</h3>
                    <p className="text-green-700 text-sm mb-4">Discover dosha-balancing recipes for optimal health</p>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg rounded-xl">
                      Browse
                    </Button>
                  </CardContent>
                </Card>

                {/* Expert Consultations */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50 backdrop-blur-xl rounded-3xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">Expert Sessions</h3>
                    <p className="text-amber-700 text-sm mb-4">Book one-on-one consultations with Ayurvedic experts</p>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg rounded-xl">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Appointment Booking Modal */}
      {showAIBooking && (
        <AIAppointmentBooking
          open={showAIBooking}
          onOpenChange={setShowAIBooking}
          patient={patient}
          hospitals={hospitals}
          doctors={doctors}
          onSuccess={(appointmentId) => {
            console.log('Appointment booked:', appointmentId);
            setShowAIBooking(false);
          }}
        />
      )}
    </div>
  );
}