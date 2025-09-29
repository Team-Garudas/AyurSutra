import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import { 
  Users, 
  UserPlus, 
  BarChart3,
  Calendar,
  LogOut,
  Building2,
  TrendingUp,
  Clock,
  FileText,
  Download,
  Stethoscope,
  UserCheck,
  Trash2,
  Award,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { getFromLocalStorage, registerDoctor, registerTherapist, Doctor, Therapist, Hospital } from '@/lib/mockData';

interface HospitalDashboardProps {
  hospital: Hospital;
  onLogout: () => void;
}

export default function HospitalDashboard({ hospital, onLogout }: HospitalDashboardProps) {
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('doctor');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced Doctor Registration State
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [doctorFormData, setDoctorFormData] = useState({
    name: '',
    specialization: '',
    age: '',
    experience: '',
    phone: '',
    email: '',
    qualifications: '',
    address: '',
    emergencyContact: '',
    licenseNumber: ''
  });
  
  // Doctor Removal State
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedDoctorForRemoval, setSelectedDoctorForRemoval] = useState<Doctor | null>(null);
  const [removalReason, setRemovalReason] = useState('');
  
  // Certificate Generation State
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  // Load doctors and therapists from Firebase
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const { getDoctorsByHospital } = await import('@/lib/firebaseService');
        const doctorData = await getDoctorsByHospital(hospital.id);
        setDoctors(doctorData || []);
        console.log(`🏥 Loaded ${doctorData.length} doctors for hospital ${hospital.name}`);
        
        // Load therapists from localStorage for now (can be updated to Firebase later)
        const therapistData = await getFromLocalStorage('therapists');
        setTherapists(therapistData as Therapist[] || []);
      } catch (error) {
        console.error('Error loading staff:', error);
      }
    };
    
    loadStaff();
  }, [hospital.id, hospital.name]);

  const generateCredentials = () => {
    const username = `${newStaffRole.toLowerCase()}_${newStaffName.toLowerCase().replace(/\s+/g, '')}_${Date.now().toString().slice(-4)}`;
    const password = `${newStaffName.charAt(0).toUpperCase()}${newStaffName.slice(1).toLowerCase()}@${Date.now().toString().slice(-3)}`;
    return { username, password };
  };

  const generateDoctorCredentials = (doctorName: string) => {
    const username = `dr_${doctorName.toLowerCase().replace(/\s+/g, '')}_${Date.now().toString().slice(-4)}`;
    const password = `${doctorName.charAt(0).toUpperCase()}${doctorName.slice(1).toLowerCase()}@${Date.now().toString().slice(-3)}`;
    return { username, password };
  };

  // Generate Professional Doctor Certificate
  const generateDoctorCertificate = async (doctor: Doctor) => {
    setGeneratingCertificate(true);
    try {
      console.log(`🏆 Generating certificate for Dr. ${doctor.name}`);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Premium Certificate Background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Certificate Border - Multiple layers for elegance
      // Outer border - Gold
      pdf.setDrawColor(218, 165, 32); // Gold
      pdf.setLineWidth(3);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Inner border - Darker gold
      pdf.setDrawColor(184, 134, 11); // Darker gold
      pdf.setLineWidth(1.5);
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);
      
      // Decorative corner elements
      const drawCornerDecoration = (x: number, y: number, flip: boolean = false) => {
        pdf.setDrawColor(218, 165, 32);
        pdf.setLineWidth(2);
        const size = 15;
        const offset = flip ? -size : size;
        pdf.line(x, y, x + offset, y);
        pdf.line(x, y, x, y + offset);
        pdf.line(x + offset/2, y, x + offset/2, y + offset/2);
        pdf.line(x, y + offset/2, x + offset/2, y + offset/2);
      };
      
      drawCornerDecoration(25, 25);
      drawCornerDecoration(pageWidth - 25, 25, true);
      drawCornerDecoration(25, pageHeight - 25);
      drawCornerDecoration(pageWidth - 25, pageHeight - 25, true);
      
      // Hospital Logo Area (Placeholder)
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.circle(pageWidth/2, 50, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PH', pageWidth/2 - 8, 55);
      
      // Certificate Title
      pdf.setTextColor(218, 165, 32); // Gold
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CERTIFICATE OF EMPLOYMENT', pageWidth/2, 85, { align: 'center' });
      
      // Subtitle
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('This is to certify that', pageWidth/2, 105, { align: 'center' });
      
      // Doctor Name - Prominent
      pdf.setTextColor(34, 34, 34);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Dr. ${doctor.name}`, pageWidth/2, 125, { align: 'center' });
      
      // Main Certificate Text
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const mainText = [
        'is hereby appointed as a medical practitioner at',
        `${hospital.name}`,
        '',
        `Specialization: ${doctor.specialty}`,
        `License Number: ${doctor.id}-LIC-${new Date().getFullYear()}`,
        `Employee ID: ${doctor.id}`,
        `Email: ${doctor.email}`,
        `Phone: ${doctor.phone}`,
        '',
        'This certificate is valid as long as the doctor remains',
        'in active employment with our medical facility.'
      ];
      
      let yPosition = 145;
      mainText.forEach((line, index) => {
        if (line === `${hospital.name}`) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.setTextColor(59, 130, 246); // Blue
        } else if (line.includes('Specialization:') || line.includes('License Number:') || line.includes('Employee ID:')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(34, 34, 34);
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(60, 60, 60);
        }
        
        pdf.text(line, pageWidth/2, yPosition, { align: 'center' });
        yPosition += line === '' ? 8 : 12;
      });
      
      // Date and Authority Signatures
      const today = new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      yPosition += 20;
      
      // Date
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${today}`, 40, yPosition);
      
      // Authority Signature Area
      pdf.text('Authorized Signatory', pageWidth - 60, yPosition, { align: 'center' });
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.5);
      pdf.line(pageWidth - 100, yPosition - 15, pageWidth - 20, yPosition - 15);
      
      // Hospital Name and Address
      pdf.setTextColor(59, 130, 246);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${hospital.name}`, 40, yPosition + 15);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(hospital.address, 40, yPosition + 25);
      pdf.text(`Email: ${hospital.email} | Phone: ${hospital.phone}`, 40, yPosition + 35);
      
      // Certificate Footer
      pdf.setTextColor(218, 165, 32);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('This is a digitally generated certificate', pageWidth/2, pageHeight - 25, { align: 'center' });
      
      // QR Code Area (Placeholder)
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(1);
      pdf.rect(pageWidth - 50, pageHeight - 60, 30, 30);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text('QR Code', pageWidth - 35, pageHeight - 40, { align: 'center' });
      
      // Save Certificate
      const fileName = `Dr_${doctor.name.replace(/\s+/g, '_')}_Certificate_${hospital.name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ Professional certificate generated successfully!');
      alert(`✅ Certificate generated for Dr. ${doctor.name}!\n\nThe certificate has been downloaded to your device.`);
      
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingCertificate(false);
    }
  };

  // Enhanced Doctor Registration with Comprehensive Details
  const addComprehensiveDoctor = async () => {
    // Validate required fields
    const requiredFields = ['name', 'specialization', 'age', 'experience', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !doctorFormData[field].trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doctorFormData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Validate phone format
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(doctorFormData.phone.replace(/[\s-]/g, ''))) {
      alert('Please enter a valid phone number.');
      return;
    }
    
    setIsLoading(true);
    try {
      const credentials = generateDoctorCredentials(doctorFormData.name);
      console.log(`👨‍⚕️ Adding comprehensive doctor: ${doctorFormData.name}`);
      console.log(`🔑 Generated credentials - Username: ${credentials.username}, Password: ${credentials.password}`);
      
      const newDoctor: Doctor = {
        id: `DOC${Date.now()}`,
        hospitalId: hospital.id, // Keep for backward compatibility
        hospitals: [hospital.id], // Add to hospitals array
        name: doctorFormData.name.trim(),
        specialty: doctorFormData.specialization.trim(),
        username: credentials.username,
        password: credentials.password,
        email: doctorFormData.email.trim(),
        phone: doctorFormData.phone.trim(),
        isGlobal: true // Make doctor available to all hospitals
      };
      
      const success = await registerDoctor(newDoctor);
      console.log(`🔍 Registration result: ${success}`);
      
      if (success) {
        console.log('✅ Doctor registration successful, reloading doctors list...');
        // Reload doctors list from Firebase
        const { getDoctorsByHospital } = await import('@/lib/firebaseService');
        const updatedDoctors = await getDoctorsByHospital(hospital.id);
        console.log(`📋 Found ${updatedDoctors?.length || 0} doctors for hospital ${hospital.id}`);
        setDoctors(updatedDoctors || []);
        
        // Generate certificate immediately
        await generateDoctorCertificate(newDoctor);
        
        // Show success message with credentials
        alert(`✅ Dr. ${doctorFormData.name} added successfully!\n\n📋 Login Credentials:\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\n� This doctor is now available to ALL hospitals for appointments!\n\n�🏆 Professional certificate has been generated and downloaded!\n\nPlease share the credentials and certificate with the doctor.`);
        
        // Reset form
        setDoctorFormData({
          name: '',
          specialization: '',
          age: '',
          experience: '',
          phone: '',
          email: '',
          qualifications: '',
          address: '',
          emergencyContact: '',
          licenseNumber: ''
        });
        setShowDoctorForm(false);
      } else {
        alert('❌ Failed to add doctor. Please try again.');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('❌ Error adding doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove Doctor Function
  const removeDoctor = async () => {
    if (!selectedDoctorForRemoval) return;
    
    try {
      setIsLoading(true);
      console.log(`❌ Removing doctor: ${selectedDoctorForRemoval.name}`);
      
      // In a real implementation, you would call an API to remove the doctor
      // For now, we'll simulate the removal by filtering the local state
      const updatedDoctors = doctors.filter(d => d.id !== selectedDoctorForRemoval.id);
      setDoctors(updatedDoctors);
      
      // Log removal with reason
      console.log(`Doctor ${selectedDoctorForRemoval.name} removed. Reason: ${removalReason || 'No reason provided'}`);
      
      alert(`✅ Dr. ${selectedDoctorForRemoval.name} has been removed from the hospital system.${removalReason ? `\n\nReason: ${removalReason}` : ''}`);
      
      // Reset removal dialog
      setShowRemoveDialog(false);
      setSelectedDoctorForRemoval(null);
      setRemovalReason('');
      
    } catch (error) {
      console.error('Error removing doctor:', error);
      alert('❌ Failed to remove doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addStaff = async () => {
    if (!newStaffName.trim()) {
      alert('Please enter staff name');
      return;
    }

    setIsLoading(true);
    try {
      const credentials = generateCredentials();
      console.log(`Adding new ${newStaffRole}: ${newStaffName}`);
      console.log(`Generated credentials - Username: ${credentials.username}, Password: ${credentials.password}`);

      if (newStaffRole === 'doctor') {
        const newDoctor: Doctor = {
          id: `DOC${Date.now()}`,
          hospitalId: hospital.id, // Keep for backward compatibility
          hospitals: [hospital.id], // Add to hospitals array
          name: newStaffName.trim(),
          specialty: 'General Medicine', // Default specialty
          username: credentials.username,
          password: credentials.password,
          email: `${credentials.username}@${hospital.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: `+91-9${Math.floor(Math.random() * 900000000 + 100000000)}`,
          isGlobal: true // Make doctor available to all hospitals
        };

        const success = await registerDoctor(newDoctor);
        if (success) {
          // Reload doctors list from Firebase
          const { getDoctorsByHospital } = await import('@/lib/firebaseService');
          const updatedDoctors = await getDoctorsByHospital(hospital.id);
          setDoctors(updatedDoctors || []);
          
          alert(`✅ Doctor added successfully!\n\n📋 Login Credentials:\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\n🌐 This doctor is now available to ALL hospitals!\n\nPlease share these credentials with the doctor.`);
        } else {
          alert('❌ Failed to add doctor. Please try again.');
        }
      } else if (newStaffRole === 'therapist') {
        const newTherapist: Therapist = {
          id: `THR${Date.now()}`,
          hospitalId: hospital.id,
          name: newStaffName.trim(),
          username: credentials.username,
          password: credentials.password,
          email: `${credentials.username}@${hospital.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: `+91-9${Math.floor(Math.random() * 900000000 + 100000000)}`
        };

        const success = await registerTherapist(newTherapist);
        if (success) {
          // Reload therapists list
          const updatedTherapists = await getFromLocalStorage('therapists') as Therapist[];
          setTherapists(updatedTherapists || []);
          
          alert(`✅ Therapist added successfully!\n\n📋 Login Credentials:\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\nPlease share these credentials with the therapist.`);
        } else {
          alert('❌ Failed to add therapist. Please try again.');
        }
      }

      setNewStaffName('');
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('❌ Error adding staff. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report`);
    alert(`${type} report generated successfully!`);
  };

  const todayStats = {
    totalAppointments: 0,
    completedSessions: 0,
    activeDoctors: doctors.length,
    activeTherapists: therapists.length,
    patientSatisfaction: 0,
    revenue: 0
  };

  const recentAppointments = [
    // No hardcoded appointments - will be fetched from localStorage/API
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-800">Hospital Admin Dashboard</h1>
                <p className="text-gray-600">Manage your healthcare facility</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="border-amber-600 text-amber-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-800">{todayStats.totalAppointments}</p>
              <p className="text-sm text-gray-600">Today's Appointments</p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{todayStats.completedSessions}</p>
              <p className="text-sm text-gray-600">Completed Sessions</p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
            <CardContent className="p-4 text-center">
              <Stethoscope className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{todayStats.activeDoctors}</p>
              <p className="text-sm text-gray-600">Active Doctors</p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
            <CardContent className="p-4 text-center">
              <UserCheck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-800">{todayStats.activeTherapists}</p>
              <p className="text-sm text-gray-600">Active Therapists</p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-800">{todayStats.patientSatisfaction}</p>
              <p className="text-sm text-gray-600">Satisfaction</p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">₹{todayStats.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Today's Revenue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="staff" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Users className="w-4 h-4 mr-2" />
              Staff Management
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Add New Staff */}
              <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
                <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add New Staff
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Staff member name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                  />
                  <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={addStaff} 
                    disabled={isLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Staff Member'}
                  </Button>
                </CardContent>
              </Card>

              {/* Current Staff */}
              <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
                <CardHeader>
                  <CardTitle className="text-amber-800">Current Staff</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Doctors ({doctors.length})</h4>
                    <div className="space-y-2">
                      {doctors.length > 0 ? doctors.map((doctor) => (
                        <div key={doctor.id} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Active
                          </Badge>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">No doctors registered</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Therapists ({therapists.length})</h4>
                    <div className="space-y-2">
                      {therapists.length > 0 ? therapists.map((therapist) => (
                        <div key={therapist.id} className="flex items-center justify-between p-2 bg-white rounded border border-purple-100">
                          <div>
                            <p className="font-medium">{therapist.name}</p>
                            <p className="text-sm text-gray-600">Panchakarma Therapist</p>
                          </div>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            Active
                          </Badge>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">No therapists registered</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
              <CardHeader>
                <CardTitle className="text-amber-800">Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {recentAppointments.map((appointment, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-amber-100">
                        {/* Appointment content will be populated when appointments exist */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
                <CardHeader>
                  <CardTitle className="text-amber-800">Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Analytics data will be displayed here</p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
                <CardHeader>
                  <CardTitle className="text-amber-800">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Performance metrics will be displayed here</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
                <CardHeader>
                  <CardTitle className="text-amber-800">Generate Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => generateReport('Daily Summary')}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Daily Summary Report
                  </Button>
                  <Button 
                    onClick={() => generateReport('Monthly Analytics')}
                    variant="outline" 
                    className="w-full border-amber-600 text-amber-600"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Monthly Analytics
                  </Button>
                  <Button 
                    onClick={() => generateReport('Staff Performance')}
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Staff Performance
                  </Button>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
                <CardHeader>
                  <CardTitle className="text-amber-800">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">No reports generated yet</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
