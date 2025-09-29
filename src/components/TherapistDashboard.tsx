import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  CheckCircle, 
  Camera,
  LogOut,
  UserCheck,
  Clock,
  FileText,
  Upload
} from 'lucide-react';
import { TherapyStep, standardTherapySteps, updateTherapyProgress } from '@/lib/mockData';

interface TherapistDashboardProps {
  onLogout: () => void;
}

interface CurrentTherapy {
  appointmentId: string;
  patientId: string;
  patientName: string;
  therapyType: string;
  startTime: string;
}

export default function TherapistDashboard({ onLogout }: TherapistDashboardProps) {
  const [searchAppointment, setSearchAppointment] = useState('');
  const [searchPatientId, setSearchPatientId] = useState('');
  const [currentTherapy, setCurrentTherapy] = useState<CurrentTherapy | null>(null);
  const [therapySteps, setTherapySteps] = useState(standardTherapySteps);
  const [sessionNotes, setSessionNotes] = useState('');

  const handleSearch = () => {
    if (searchAppointment && searchPatientId) {
      // TODO: Replace with actual data lookup
      // For now, requires actual appointment and patient data to be registered
      console.log(`Searching for appointment: ${searchAppointment}, patient: ${searchPatientId}`);
      alert('Please ensure patient and appointment are registered in the system first.');
    } else {
      alert('Please enter both Appointment Number and Patient ID');
    }
  };

  const toggleStep = (stepId: string) => {
    setTherapySteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: !step.completed }
          : step
      )
    );
    updateTherapyProgress('therapy1', stepId, !therapySteps.find(s => s.id === stepId)?.completed);
  };

  const uploadPhoto = (stepId: string) => {
    // Photo upload functionality
    console.log(`Photo upload requested for step ${stepId}`);
    // TODO: Implement actual photo upload to server/storage
    alert('Photo upload feature - implementation needed');
  };

  const completeTherapy = () => {
    const completedSteps = therapySteps.filter(step => step.completed).length;
    const totalSteps = therapySteps.length;
    
    if (completedSteps === totalSteps) {
      console.log(`Therapy completed for patient ${currentTherapy?.patientId}`);
      console.log(`Session notes: ${sessionNotes}`);
      alert('Therapy session completed successfully!');
      setCurrentTherapy(null);
      setSessionNotes('');
      setTherapySteps(standardTherapySteps.map(step => ({ ...step, completed: false })));
    } else {
      alert(`Please complete all therapy steps. ${completedSteps}/${totalSteps} completed.`);
    }
  };

  const todaySessions = [
    // No hardcoded sessions - will be fetched from localStorage/API
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-800">Therapist Dashboard</h1>
                <p className="text-gray-600">Therapist Anita - Panchakarma Specialist</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="border-purple-600 text-purple-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Search */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Start Therapy Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Appointment Number (e.g., A001)"
                    value={searchAppointment}
                    onChange={(e) => setSearchAppointment(e.target.value)}
                  />
                  <Input
                    placeholder="Patient ID (e.g., p1)"
                    value={searchPatientId}
                    onChange={(e) => setSearchPatientId(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Search className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              </CardContent>
            </Card>

            {/* Therapy Checklist */}
            {currentTherapy && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Therapy Checklist - {currentTherapy.patientName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Appointment: {currentTherapy.appointmentId}
                    </Badge>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                      Patient: {currentTherapy.patientId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {therapySteps.map((step) => (
                      <div key={step.id} className="p-4 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={step.completed}
                            onCheckedChange={() => toggleStep(step.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold ${step.completed ? 'text-green-600 line-through' : 'text-purple-800'}`}>
                              {step.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => uploadPhoto(step.id)}
                                className="border-purple-600 text-purple-600"
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Photo
                              </Button>
                              {step.completed && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  ✓ Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-800 mb-2">
                        Session Notes
                      </label>
                      <Textarea
                        placeholder="Add notes about the therapy session, patient response, observations..."
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={completeTherapy}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Therapy
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-purple-600 text-purple-600"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Save Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Sessions */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todaySessions.map((session, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-purple-800">{session.time}</span>
                      <Badge 
                        variant={session.status === 'in-progress' ? 'default' : 'secondary'}
                        className={session.status === 'in-progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{session.patient}</p>
                    <p className="text-xs text-gray-600">ID: {session.appointmentId}</p>
                    <p className="text-xs text-gray-600">{session.therapy}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Progress Stats */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-purple-800">Session Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Steps</span>
                  <span className="font-bold text-green-600">
                    {therapySteps.filter(s => s.completed).length}/{therapySteps.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(therapySteps.filter(s => s.completed).length / therapySteps.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today's Completed</span>
                  <span className="font-bold text-purple-800">2/3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Photos Uploaded</span>
                  <span className="font-bold text-blue-600">8</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-purple-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full border-purple-600 text-purple-600">
                  <FileText className="w-4 h-4 mr-2" />
                  View Guidelines
                </Button>
                <Button variant="outline" className="w-full border-indigo-600 text-indigo-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Break Time
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}