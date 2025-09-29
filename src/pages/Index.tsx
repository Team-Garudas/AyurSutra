import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  Building2, 
  Flower2,
  Heart,
  Leaf,
  Sparkles,
  UserPlus,
  LogIn,
  Star,
  Zap,
  Shield,
  Award,
  Globe,
  CheckCircle,
  Brain,
  Lock
} from 'lucide-react';
import PatientRegistration from '@/components/PatientRegistration';
import PatientDashboard from '@/components/PatientDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';
import TherapistDashboard from '@/components/TherapistDashboard';
import HospitalDashboard from '@/components/HospitalDashboard_clean';
import LoginForm from '@/components/auth/LoginForm';
import StaffRegistration from '@/components/auth/StaffRegistration';
import ChatbotWidget from '@/components/ChatbotWidget';
import { 
  Patient, 
  Doctor, 
  Therapist, 
  Hospital, 
  AuthUser,
  initializeStorage,
  startFresh
} from '@/lib/mockData';
import {
  saveSession,
  loadSession,
  clearSession
} from '@/lib/sessionManager';
import { signOutUser } from '@/lib/firebaseService';

type ViewState = 'home' | 'patient-registration' | 'staff-registration' | 'login' | 'patient-dashboard' | 'doctor-dashboard' | 'therapist-dashboard' | 'hospital-dashboard';

export default function Index() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<Patient | Doctor | Therapist | Hospital | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    // Try to restore session from localStorage
    const existingSession = loadSession();
    if (existingSession) {
      console.log('🔄 Restoring existing session for:', existingSession.user.name);
      setCurrentUser(existingSession.user);
      setCurrentUserData(existingSession.userData);
      
      // Navigate to appropriate dashboard
      switch (existingSession.user.role) {
        case 'patient':
          setCurrentView('patient-dashboard');
          break;
        case 'doctor':
          setCurrentView('doctor-dashboard');
          break;
        case 'therapist':
          setCurrentView('therapist-dashboard');
          break;
        case 'hospital':
          setCurrentView('hospital-dashboard');
          break;
      }
    } else {
      // Clear all dummy data and start fresh
      startFresh();
    }
    
    setIsSessionLoading(false);
    
    // Cleanup on unmount
    return () => {
      // No cleanup needed
    };
  }, []);

  const handleLogin = (user: AuthUser, userData: Patient | Doctor | Therapist | Hospital) => {
    console.log(`🎯 handleLogin called with user:`, user);
    console.log(`🎯 handleLogin called with userData:`, userData);
    
    // Save session to localStorage
    saveSession(user, userData);
    
    setCurrentUser(user);
    setCurrentUserData(userData);
    switch (user.role) {
      case 'patient':
        console.log(`➡️ Redirecting to patient dashboard`);
        setCurrentView('patient-dashboard');
        break;
      case 'doctor':
        setCurrentView('doctor-dashboard');
        break;
      case 'therapist':
        setCurrentView('therapist-dashboard');
        break;
      case 'hospital':
        setCurrentView('hospital-dashboard');
        break;
    }
  };

    const handleLogout = async () => {
    console.log('� Logging out user');
    
    try {
      // Sign out from Firebase
      await signOutUser();
      
      // Clear session data
      clearSession();
      
      // Reset state
      setCurrentUser(null);
      setCurrentUserData(null);
      setCurrentView('home');
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  const handlePatientRegistrationComplete = (patient: Patient) => {
    const user: AuthUser = {
      id: patient.id,
      name: patient.name,
      role: 'patient',
      email: patient.abhaPassport
    };
    
    // Save session to localStorage
    saveSession(user, patient);
    
    setCurrentUser(user);
    setCurrentUserData(patient);
    setCurrentView('patient-dashboard');
  };

  // Show loading while checking session
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-amber-50 flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-800">Loading your session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render different views based on current state
  if (currentView === 'patient-registration') {
    return (
      <PatientRegistration 
        onRegistrationComplete={handlePatientRegistrationComplete}
        onBackToHome={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'staff-registration') {
    return (
      <StaffRegistration 
        onRegistrationComplete={() => setCurrentView('home')}
        onBackToHome={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginForm 
        onLogin={handleLogin}
        onBackToHome={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'patient-dashboard' && currentUser && currentUserData) {
    console.log(`🏥 Rendering PatientDashboard with:`, currentUserData);
    return (
      <PatientDashboard patient={currentUserData as Patient} onLogout={handleLogout} />
    );
  }

  if (currentView === 'doctor-dashboard' && currentUser && currentUserData) {
    console.log(`👨‍⚕️ Rendering DoctorDashboard with:`, currentUserData);
    return (
      <DoctorDashboard doctor={currentUserData as Doctor} onLogout={handleLogout} />
    );
  }

  if (currentView === 'therapist-dashboard' && currentUser) {
    return (
      <TherapistDashboard onLogout={handleLogout} />
    );
  }

  if (currentView === 'hospital-dashboard' && currentUser && currentUserData) {
    console.log(`🏥 Rendering HospitalDashboard with:`, currentUserData);
    return (
      <HospitalDashboard onLogout={handleLogout} />
    );
  }

  // Home page
  const roleCards = [
    {
      role: 'patient',
      title: 'Patient Portal',
      description: 'Access your therapy schedule, view progress, and manage appointments',
      icon: Users,
      color: 'from-emerald-500 via-green-500 to-teal-600',
      bgPattern: 'from-emerald-50/80 via-green-50/60 to-teal-50/80',
      features: ['Smart Appointments', 'Progress Analytics', 'Digital ID Card', 'Knowledge Hub']
    },
    {
      role: 'doctor',
      title: 'Doctor Dashboard',
      description: 'Manage patients, review therapy progress, and prescribe treatments',
      icon: Stethoscope,
      color: 'from-blue-500 via-cyan-500 to-indigo-600',
      bgPattern: 'from-blue-50/80 via-cyan-50/60 to-indigo-50/80',
      features: ['Patient Insights', 'Treatment Plans', 'AI Prescriptions', 'Health Analytics']
    },
    {
      role: 'therapist',
      title: 'Therapist Portal',
      description: 'Conduct therapy sessions, track progress, and update patient records',
      icon: UserCheck,
      color: 'from-purple-500 via-violet-500 to-fuchsia-600',
      bgPattern: 'from-purple-50/80 via-violet-50/60 to-fuchsia-50/80',
      features: ['Smart Checklists', 'Photo Documentation', 'Session AI', 'Progress Tracking']
    },
    {
      role: 'hospital',
      title: 'Hospital Admin',
      description: 'Manage staff, view analytics, and oversee hospital operations',
      icon: Building2,
      color: 'from-amber-500 via-orange-500 to-red-600',
      bgPattern: 'from-amber-50/80 via-orange-50/60 to-red-50/80',
      features: ['Smart Analytics', 'Staff AI', 'Resource Optimization', 'Predictive Reports']
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'AI-Powered Patient Management',
      description: 'Intelligent patient records with predictive analytics, personalized treatment recommendations, and automated health insights.',
      gradient: 'from-emerald-500 to-emerald-600',
      stats: '99.9% Accuracy'
    },
    {
      icon: Stethoscope,
      title: 'Smart Therapy Tracking',
      description: 'Real-time progress monitoring with machine learning insights, automated scheduling, and personalized therapy optimization.',
      gradient: 'from-emerald-500 to-emerald-600',
      stats: '24/7 Monitoring'
    },
    {
      icon: Building2,
      title: 'Advanced Hospital Analytics',
      description: 'Comprehensive reporting with predictive analytics, intelligent resource management, and automated operational insights.',
      gradient: 'from-emerald-500 to-emerald-600',
      stats: 'Live Insights'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background Video */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            animation: 'backgroundFloat 15s ease-in-out infinite'
          }}
        >
          <source src="/backgroundv.mp4" type="video/mp4" />
          {/* Fallback background image if video fails to load */}
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/background1.png)'
            }}
          ></div>
        </video>
      </div>
      
      {/* Enhanced dark gradient overlay for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 -z-10"></div>
      
      {/* Additional gradient overlays for text readability */}
      <div className="fixed inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 -z-10"></div>
      <div className="fixed inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent -z-10"></div>
      
      {/* Subtle floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Gentle floating orbs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-200/20 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-amber-200/20 rounded-full blur-2xl animate-float-medium" style={{animationDelay: '-5s'}}></div>
        <div className="absolute -bottom-20 left-1/4 w-60 h-60 bg-blue-200/20 rounded-full blur-2xl animate-float-fast" style={{animationDelay: '-10s'}}></div>
        
        {/* Simple sparkles */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-white/60 rounded-full animate-twinkle"></div>
        <div className="absolute top-40 left-40 w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 right-32 w-2 h-2 bg-emerald-400/60 rounded-full animate-twinkle" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Animated Mesh Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-tr from-green-100/30 via-transparent via-amber-100/20 to-emerald-100/40 animate-gradient-shift -z-10"></div>
      
      {/* Enhanced Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Large Orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-r from-emerald-300/20 via-green-400/30 to-teal-300/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-amber-300/20 via-orange-400/30 to-yellow-300/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '-2s'}}></div>
        <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-300/20 via-purple-400/30 to-indigo-300/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '-4s'}}></div>
        
        {/* Medium Floating Elements */}
        <div className="absolute top-1/3 left-1/5 w-32 h-32 bg-gradient-to-r from-green-200/40 to-emerald-300/50 rounded-full animate-pulse-slow blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-r from-amber-200/40 to-orange-300/50 rounded-full animate-bounce-gentle blur-xl" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/6 w-20 h-20 bg-gradient-to-r from-blue-200/40 to-cyan-300/50 rounded-full animate-pulse-slow blur-lg" style={{animationDelay: '2s'}}></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-1/2 w-16 h-16 bg-gradient-to-r from-purple-200/30 to-violet-300/40 rotate-45 animate-spin-ultra-slow blur-sm"></div>
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-r from-pink-200/30 to-rose-300/40 rotate-12 animate-pulse-slow blur-sm" style={{animationDelay: '3s'}}></div>
        
        {/* Sparkle Elements */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-white/60 rounded-full animate-twinkle"></div>
        <div className="absolute top-1/2 left-10 w-1.5 h-1.5 bg-white/50 rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2.5 h-2.5 bg-white/40 rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation Bar - Clean and Modern */}
      <nav className="relative z-50 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo (left) */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/30 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
                <img 
                  src="/logo.png" 
                  alt="AyurSutra Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl hidden items-center justify-center">
                  <Flower2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span 
                  className="text-white font-bold text-2xl"
                  style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  AyurSutra
                </span>
                <div className="text-emerald-300/90 text-xs font-medium tracking-wide" style={{textShadow: '0 1px 5px rgba(0,0,0,0.3)'}}>
                  Healthcare Platform
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setCurrentView('staff-registration')}
                variant="ghost"
                className="text-white/90 hover:text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Hospital Registration
              </Button>
              
              <Button 
                onClick={() => setCurrentView('login')}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/30"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="relative z-10">
        {/* Hero Section - Stripe-style with generous whitespace */}
        <section className="py-20 px-6 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-12 items-center h-full">
              {/* Left Side - Text Content */}
              <div className="col-span-12 lg:col-span-6 xl:col-span-7">
                <div className="max-w-2xl">
                  {/* Main Headline - XXL, Bold White */}
                  <h1 
                    className="text-white mb-4"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontSize: 'clamp(48px, 8vw, 72px)',
                      fontWeight: '800',
                      letterSpacing: '-0.03em',
                      lineHeight: '1.1',
                      textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                  >
                    AyurSutra
                  </h1>
                  
                  {/* Tagline */}
                  <h3 
                    className="mb-6"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontSize: 'clamp(16px, 2.5vw, 20px)',
                      color: '#A7F3D0',
                      fontWeight: '600',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.3',
                      textShadow: '0 2px 10px rgba(0,0,0,0.4)'
                    }}
                  >
                    Where Ayurveda meets modern technology for holistic healing.
                  </h3>
                  
                  {/* Subheading */}
                  <h2 
                    className="mb-8"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontSize: 'clamp(22px, 3.5vw, 28px)',
                      color: '#F3F4F6',
                      fontWeight: '700',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.3',
                      textShadow: '0 2px 15px rgba(0,0,0,0.5)'
                    }}
                  >
                    Panchakarma Patient Management and Therapy Scheduling Software
                  </h2>
                  
                  {/* Body Text */}
                  <p 
                    className="mb-12"
                    style={{
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      fontSize: '20px',
                      color: '#E5E7EB',
                      fontWeight: '400',
                      lineHeight: '1.8',
                      maxWidth: '90%',
                      textShadow: '0 1px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    Advanced Ayurvedic healthcare management system powered by modern technology. 
                    Featuring comprehensive patient care, treatment planning, and data-driven insights 
                    for optimal health outcomes.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => setCurrentView('patient-registration')}
                      className="h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 border border-emerald-500/30 backdrop-blur-sm"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        minWidth: '180px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }}
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Patient Registration
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentView('staff-registration')}
                      className="h-14 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 px-10 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        minWidth: '180px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Building2 className="w-5 h-5 mr-2" />
                      Hospital Registration
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentView('login')}
                      className="h-14 bg-transparent border border-white/40 text-white/90 hover:bg-white/10 hover:text-white px-8 rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        minWidth: '140px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }}
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Login
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Abstract Animation Area */}
              <div className="col-span-12 lg:col-span-6 xl:col-span-5 relative">
                <div className="relative h-96 lg:h-full min-h-[400px]">
                  {/* Abstract herbal + data fusion animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Animated Elements Container */}
                    <div className="relative w-80 h-80">
                      {/* Central herbal icon */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-emerald-400/30">
                        <Leaf className="w-10 h-10 text-emerald-300 animate-pulse" />
                      </div>
                      
                      {/* Orbiting data elements */}
                      <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                          <Brain className="w-6 h-6 text-blue-300" />
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 animate-spin-slow" style={{animationDelay: '-2s'}}>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-400/30">
                          <Stethoscope className="w-6 h-6 text-purple-300" />
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 animate-spin-slow" style={{animationDelay: '-4s'}}>
                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-amber-400/30">
                          <Heart className="w-6 h-6 text-amber-300" />
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 animate-spin-slow" style={{animationDelay: '-6s'}}>
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-green-400/30">
                          <Sparkles className="w-6 h-6 text-green-300" />
                        </div>
                      </div>
                      
                      {/* Connecting lines */}
                      <div className="absolute inset-0">
                        <svg className="w-full h-full opacity-30" viewBox="0 0 320 320">
                          <circle 
                            cx="160" 
                            cy="160" 
                            r="120" 
                            fill="none" 
                            stroke="url(#gradient)" 
                            strokeWidth="1" 
                            strokeDasharray="5,5"
                            className="animate-pulse"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5"/>
                              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5"/>
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.5"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of Ayurvedic healthcare with our comprehensive platform designed for modern medical practices.
              </p>
            </div>
            
            {/* Registration Options */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Patient Registration Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-800">Patient Registration</h3>
                </div>
                <p className="text-emerald-700 mb-4">Register as a patient to access therapy schedules, view progress, and manage appointments.</p>
                <Button 
                  onClick={() => setCurrentView('patient-registration')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Register as Patient
                </Button>
              </div>

              {/* Staff Registration Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800">Staff Registration</h3>
                </div>
                <p className="text-blue-700 mb-4">Register hospitals, doctors, and therapists to manage patient care and operations.</p>
                <Button 
                  onClick={() => setCurrentView('staff-registration')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Register Staff/Hospital
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Patient Management</h3>
                <p className="text-gray-600">Comprehensive patient records, treatment history, and personalized care plans.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
                <p className="text-gray-600">Advanced analytics and AI recommendations for optimal treatment outcomes.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Compliant</h3>
                <p className="text-gray-600">HIPAA compliant platform with enterprise-grade security and data protection.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">About AyurSutra</h2>
                <p className="text-lg text-gray-600 mb-6">
                  AyurSutra represents the perfect fusion of ancient Ayurvedic wisdom and cutting-edge modern technology. 
                  Our platform is designed to empower healthcare professionals with intelligent tools for patient management, 
                  treatment planning, and operational excellence.
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  With over 10,000+ patients served and 99.9% system uptime, we're trusted by healthcare leaders worldwide 
                  to deliver reliable, secure, and effective healthcare management solutions.
                </p>
                <Button 
                  onClick={() => setCurrentView('patient-registration')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium"
                >
                  Get Started Today
                </Button>
              </div>
              <div className="bg-emerald-50 rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">10,000+</div>
                    <div className="text-gray-600">Patients Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">99.9%</div>
                    <div className="text-gray-600">System Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
                    <div className="text-gray-600">Support Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">4.9/5</div>
                    <div className="text-gray-600">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Chatbot Widget - Only on home page */}
      {currentView === 'home' && <ChatbotWidget />}
    </div>
  );
}