import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Stethoscope, 
  UserCheck, 
  Building2,
  LogIn,
  Eye,
  EyeOff,
  ArrowLeft,
  Flower2,
  Heart,
  Shield,
  Sparkles,
  Leaf
} from 'lucide-react';
import { 
  authenticatePatient,
  authenticateDoctor,
  authenticateTherapist,
  authenticateHospital,
  AuthUser,
  Patient,
  Doctor,
  Therapist,
  Hospital
} from '@/lib/mockData';

interface LoginFormProps {
  onLogin: (user: AuthUser, userData: Patient | Doctor | Therapist | Hospital) => void;
  onBackToHome: () => void;
}

export default function LoginForm({ onLogin, onBackToHome }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [credentials, setCredentials] = useState({
    patient: { id: '', password: '' },
    doctor: { username: '', password: '' },
    therapist: { username: '', password: '' },
    hospital: { username: '', password: '' }
  });

  const handleInputChange = (role: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [role]: { ...prev[role as keyof typeof prev], [field]: value }
    }));
    setError('');
  };

  const handleLogin = async (role: string) => {
    setIsLoading(true);
    setError('');

    try {
      console.log(`🔐 Starting login process for role: ${role}`);
      console.log(`📝 Credentials:`, credentials);
      
      let user: AuthUser | null = null;
      let userData: Patient | Doctor | Therapist | Hospital | null = null;

      switch (role) {
        case 'patient':
          userData = await authenticatePatient(credentials.patient.id, credentials.patient.password);
          if (userData) {
            user = {
              id: userData.id,
              name: userData.name,
              role: 'patient',
              email: userData.abhaPassport
            };
          }
          break;
        
        case 'doctor':
          userData = await authenticateDoctor(credentials.doctor.username, credentials.doctor.password);
          if (userData) {
            user = {
              id: userData.id,
              name: userData.name,
              role: 'doctor',
              username: userData.username,
              email: userData.email
            };
          }
          break;
        
        case 'therapist':
          userData = await authenticateTherapist(credentials.therapist.username, credentials.therapist.password);
          if (userData) {
            user = {
              id: userData.id,
              name: userData.name,
              role: 'therapist',
              username: userData.username,
              email: userData.email
            };
          }
          break;
        
        case 'hospital':
          userData = await authenticateHospital(credentials.hospital.username, credentials.hospital.password);
          if (userData) {
            user = {
              id: userData.id,
              name: userData.name,
              role: 'hospital',
              username: userData.adminUsername,
              email: userData.email
            };
          }
          break;
      }

      if (user && userData) {
        console.log(`✅ Login successful! User:`, user);
        console.log(`✅ User data:`, userData);
        onLogin(user, userData);
      } else {
        console.log(`❌ Login failed. User:`, user, `UserData:`, userData);
        setError('Invalid credentials. Please check your login details.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginTabs = [
    {
      value: 'patient',
      label: 'Patient',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      value: 'therapist',
      label: 'Therapist',
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      value: 'hospital',
      label: 'Hospital',
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 -z-10">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900"></div>
        
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_50%)] animate-pulse-slow"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large Orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '-5s'}}></div>
          
          {/* Medical Icons Floating */}
          <div className="absolute top-20 left-20 opacity-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '6s'}}>
            <Heart className="w-8 h-8 text-emerald-300" />
          </div>
          <div className="absolute top-1/4 right-20 opacity-20 animate-bounce" style={{animationDelay: '4s', animationDuration: '8s'}}>
            <Leaf className="w-6 h-6 text-teal-300" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 opacity-20 animate-bounce" style={{animationDelay: '6s', animationDuration: '7s'}}>
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="absolute bottom-20 right-1/3 opacity-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '9s'}}>
            <Shield className="w-7 h-7 text-emerald-300" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-lg">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Logo Section */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-2xl">
                <Flower2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  AyurSutra
                </h1>
                <p className="text-emerald-200 text-sm font-medium">Healthcare Platform</p>
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Welcome Back
              </h2>
              <p className="text-emerald-200/80 text-lg">
                Sign in to access your healthcare dashboard
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Enhanced Tab List */}
                <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  {loginTabs.map((tab, index) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.value;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className={`
                          relative flex flex-col gap-2 p-4 rounded-lg transition-all duration-300
                          ${isActive 
                            ? 'bg-white text-emerald-600 shadow-lg transform scale-105' 
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-emerald-600' : ''}`}>
                          {tab.label}
                        </span>
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-lg -z-10"></div>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

              {/* Patient Login */}
              <TabsContent value="patient" className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="patient-id" className="text-white font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Panchakarma ID
                    </Label>
                    <Input
                      id="patient-id"
                      placeholder="Enter your Panchakarma ID"
                      value={credentials.patient.id}
                      onChange={(e) => handleInputChange('patient', 'id', e.target.value)}
                      className="
                        h-12 bg-white/10 border border-white/20 backdrop-blur-sm
                        placeholder:text-white/50 text-white
                        focus:bg-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20
                        transition-all duration-200
                      "
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="patient-password" className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="patient-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={credentials.patient.password}
                        onChange={(e) => handleInputChange('patient', 'password', e.target.value)}
                        className="
                          h-12 bg-white/10 border border-white/20 backdrop-blur-sm pr-12
                          placeholder:text-white/50 text-white
                          focus:bg-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20
                          transition-all duration-200
                        "
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleLogin('patient')}
                    disabled={isLoading || !credentials.patient.id || !credentials.patient.password}
                    className="
                      w-full h-12 mt-6
                      bg-gradient-to-r from-emerald-500 to-teal-600
                      hover:from-emerald-600 hover:to-teal-700
                      text-white font-semibold
                      shadow-lg hover:shadow-xl
                      transform hover:scale-[1.02]
                      transition-all duration-200
                      disabled:opacity-50 disabled:transform-none
                    "
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-3" />
                        Sign In as Patient
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Doctor Login */}
              <TabsContent value="doctor" className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-username" className="text-white font-medium flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Username
                    </Label>
                    <Input
                      id="doctor-username"
                      placeholder="Enter your username"
                      value={credentials.doctor.username}
                      onChange={(e) => handleInputChange('doctor', 'username', e.target.value)}
                      className="
                        h-12 bg-white/10 border border-white/20 backdrop-blur-sm
                        placeholder:text-white/50 text-white
                        focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                        transition-all duration-200
                      "
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doctor-password" className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="doctor-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={credentials.doctor.password}
                        onChange={(e) => handleInputChange('doctor', 'password', e.target.value)}
                        className="
                          h-12 bg-white/10 border border-white/20 backdrop-blur-sm pr-12
                          placeholder:text-white/50 text-white
                          focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                          transition-all duration-200
                        "
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleLogin('doctor')}
                    disabled={isLoading || !credentials.doctor.username || !credentials.doctor.password}
                    className="
                      w-full h-12 mt-6
                      bg-gradient-to-r from-blue-500 to-indigo-600
                      hover:from-blue-600 hover:to-indigo-700
                      text-white font-semibold
                      shadow-lg hover:shadow-xl
                      transform hover:scale-[1.02]
                      transition-all duration-200
                      disabled:opacity-50 disabled:transform-none
                    "
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-3" />
                        Sign In as Doctor
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Therapist Login */}
              <TabsContent value="therapist" className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="therapist-username" className="text-white font-medium flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Username
                    </Label>
                    <Input
                      id="therapist-username"
                      placeholder="Enter your username"
                      value={credentials.therapist.username}
                      onChange={(e) => handleInputChange('therapist', 'username', e.target.value)}
                      className="
                        h-12 bg-white/10 border border-white/20 backdrop-blur-sm
                        placeholder:text-white/50 text-white
                        focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
                        transition-all duration-200
                      "
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="therapist-password" className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="therapist-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={credentials.therapist.password}
                        onChange={(e) => handleInputChange('therapist', 'password', e.target.value)}
                        className="
                          h-12 bg-white/10 border border-white/20 backdrop-blur-sm pr-12
                          placeholder:text-white/50 text-white
                          focus:bg-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
                          transition-all duration-200
                        "
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleLogin('therapist')}
                    disabled={isLoading || !credentials.therapist.username || !credentials.therapist.password}
                    className="
                      w-full h-12 mt-6
                      bg-gradient-to-r from-purple-500 to-violet-600
                      hover:from-purple-600 hover:to-violet-700
                      text-white font-semibold
                      shadow-lg hover:shadow-xl
                      transform hover:scale-[1.02]
                      transition-all duration-200
                      disabled:opacity-50 disabled:transform-none
                    "
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-3" />
                        Sign In as Therapist
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Hospital Login */}
              <TabsContent value="hospital" className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="hospital-username" className="text-white font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Admin Username
                    </Label>
                    <Input
                      id="hospital-username"
                      placeholder="Enter admin username"
                      value={credentials.hospital.username}
                      onChange={(e) => handleInputChange('hospital', 'username', e.target.value)}
                      className="
                        h-12 bg-white/10 border border-white/20 backdrop-blur-sm
                        placeholder:text-white/50 text-white
                        focus:bg-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                        transition-all duration-200
                      "
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hospital-password" className="text-white font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="hospital-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={credentials.hospital.password}
                        onChange={(e) => handleInputChange('hospital', 'password', e.target.value)}
                        className="
                          h-12 bg-white/10 border border-white/20 backdrop-blur-sm pr-12
                          placeholder:text-white/50 text-white
                          focus:bg-white/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                          transition-all duration-200
                        "
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-4 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleLogin('hospital')}
                    disabled={isLoading || !credentials.hospital.username || !credentials.hospital.password}
                    className="
                      w-full h-12 mt-6
                      bg-gradient-to-r from-amber-500 to-orange-600
                      hover:from-amber-600 hover:to-orange-700
                      text-white font-semibold
                      shadow-lg hover:shadow-xl
                      transform hover:scale-[1.02]
                      transition-all duration-200
                      disabled:opacity-50 disabled:transform-none
                    "
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-3" />
                        Sign In as Hospital Admin
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Enhanced Error Display */}
            {error && (
              <Alert className="mt-6 border border-red-400/30 bg-red-500/10 backdrop-blur-sm">
                <AlertDescription className="text-red-100 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <div className="text-center mt-8 space-y-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={onBackToHome} 
            className="
              text-white/80 hover:text-white hover:bg-white/10
              backdrop-blur-sm border border-white/20
              px-6 py-3 rounded-lg
              transition-all duration-200
              font-medium
            "
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          {/* Help Text */}
          <div className="text-center space-y-2">
            <p className="text-emerald-200/60 text-sm">
              Need help? Contact our support team
            </p>
            <div className="flex items-center justify-center gap-6 text-emerald-200/40 text-xs">
              <span>🔒 Secure Login</span>
              <span>•</span>
              <span>⚡ Fast Access</span>
              <span>•</span>
              <span>🌿 Ayurvedic Care</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
