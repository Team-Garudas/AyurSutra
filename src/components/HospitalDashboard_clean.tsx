import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  UserCheck
} from 'lucide-react';
import { getFromLocalStorage, Doctor, Therapist } from '@/lib/mockData';
import DoctorDashboard from './DoctorDashboard';

interface HospitalDashboardProps {
  onLogout: () => void;
}

export default function HospitalDashboard({ onLogout }: HospitalDashboardProps) {
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorDashboard, setShowDoctorDashboard] = useState(false);

  // State for doctors and therapists data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  // Load doctors and therapists from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const doctorsData = await getFromLocalStorage('doctors') as Doctor[] || [];
        const therapistsData = await getFromLocalStorage('therapists') as Therapist[] || [];
        setDoctors(doctorsData);
        setTherapists(therapistsData);
      } catch (error) {
        console.error('Error loading staff data:', error);
        setDoctors([]);
        setTherapists([]);
      }
    };
    loadData();
  }, []);

  const addStaff = () => {
    if (newStaffName.trim()) {
      console.log(`Adding new ${newStaffRole}: ${newStaffName}`);
      setNewStaffName('');
      alert(`${newStaffRole} added successfully!`);
    }
  };

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report`);
    alert(`${type} report generated successfully!`);
  };

  const openDoctorDashboard = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDashboard(true);
  };

  const closeDoctorDashboard = () => {
    setSelectedDoctor(null);
    setShowDoctorDashboard(false);
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

  // Show DoctorDashboard if a doctor is selected
  if (showDoctorDashboard && selectedDoctor) {
    return (
      <div className="relative">
        {/* Header with Back Button */}
        <div className="bg-white shadow-sm border-b border-amber-100 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={closeDoctorDashboard}
                  variant="outline" 
                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  ← Back to Hospital Dashboard
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-amber-800">Dr. {selectedDoctor.name} - Dashboard</h1>
                  <p className="text-gray-600 text-sm">{selectedDoctor.specialty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* DoctorDashboard Component */}
        <DoctorDashboard 
          doctor={selectedDoctor} 
          onLogout={() => {
            closeDoctorDashboard();
            onLogout();
          }}
        />
      </div>
    );
  }

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
                  <Button onClick={addStaff} className="w-full bg-amber-600 hover:bg-amber-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff Member
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
                        <div key={doctor.id} className="flex items-center justify-between p-3 bg-white rounded border border-blue-100 hover:border-blue-200 transition-all">
                          <div className="flex-1">
                            <p className="font-medium text-blue-900">{doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            <p className="text-xs text-gray-500">ID: {doctor.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Active
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => openDoctorDashboard(doctor)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                            >
                              <Stethoscope className="w-3 h-3 mr-1" />
                              Dashboard
                            </Button>
                          </div>
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
