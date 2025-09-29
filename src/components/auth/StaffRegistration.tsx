import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2,
  UserPlus,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  registerHospital,
  generatePanchakarmaId,
  getFromLocalStorage,
  Hospital
} from '@/lib/mockData';
import { getStateNames, getCitiesByState } from '@/lib/indianLocations';

interface StaffRegistrationProps {
  onRegistrationComplete: () => void;
  onBackToHome: () => void;
}

export default function StaffRegistration({ onRegistrationComplete, onBackToHome }: StaffRegistrationProps) {
  const [activeTab, setActiveTab] = useState('hospital'); // Only hospital registration available
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    address: '',
    state: '',
    city: '',
    email: '',
    phone: '',
    adminUsername: '',
    adminPassword: '',
    numDoctors: 0,
    numTherapists: 0
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Load hospitals on component mount
  useEffect(() => {
    const loadHospitals = async () => {
      const hospitalData = await getFromLocalStorage('hospitals') as Hospital[] || [];
      setHospitals(hospitalData);
    };
    loadHospitals();
  }, []);

  // Only hospital registration available - staff registration moved to hospital dashboard

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!hospitalForm.name.trim()) {
      setError('Please enter hospital name');
      setIsLoading(false);
      return;
    }
    if (!hospitalForm.address.trim()) {
      setError('Please enter hospital address');
      setIsLoading(false);
      return;
    }
    if (!hospitalForm.email.includes('@')) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }
    if (!hospitalForm.phone.trim()) {
      setError('Please enter phone number');
      setIsLoading(false);
      return;
    }
    if (!hospitalForm.adminUsername.trim()) {
      setError('Please enter admin username');
      setIsLoading(false);
      return;
    }
    if (hospitalForm.adminPassword.length < 6) {
      setError('Admin password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    if (hospitalForm.numDoctors < 0) {
      setError('Number of doctors cannot be negative');
      setIsLoading(false);
      return;
    }
    if (hospitalForm.numTherapists < 0) {
      setError('Number of therapists cannot be negative');
      setIsLoading(false);
      return;
    }

    try {
      const hospital: Hospital = {
        id: generatePanchakarmaId(),
        ...hospitalForm
      };

      const registered = registerHospital(hospital);
      if (registered) {
        setSuccess(`✅ Hospital registered successfully! 
        Hospital ID: ${hospital.id}
        Admin Login: ${hospital.adminUsername}`);
        setHospitalForm({
          name: '',
          address: '',
          state: '',
          city: '',
          email: '',
          phone: '',
          adminUsername: '',
          adminPassword: '',
          numDoctors: 0,
          numTherapists: 0
        });
        setTimeout(() => setSuccess(''), 8000);
      } else {
        setError('❌ Registration failed. Admin username may already exist.');
      }
    } catch (error) {
      setError('❌ Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registrationTabs = [
    {
      value: 'hospital',
      label: 'Hospital Registration',
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-amber-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Staff Registration
          </h1>
          <p className="text-gray-600">Register hospitals and independent therapists</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
          <CardContent className="p-6">
            {/* Registration Guide */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🏥 Hospital Registration System</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Step 1:</strong> Register your hospital/clinic here</p>
                <p><strong>Step 2:</strong> Hospital admins will receive login credentials</p>
                <p><strong>Step 3:</strong> Admin can register doctors and therapists through hospital dashboard</p>
                <p><strong>Step 4:</strong> All staff will receive auto-generated credentials</p>
                <p className="text-red-700">� <strong>Important:</strong> Doctors and therapists cannot self-register</p>
                <p className="text-emerald-700">✅ <strong>Only available here:</strong> Hospital registration by authorized administrators</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-1 gap-2 h-auto p-1 bg-white/50">
                {registrationTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex flex-col gap-2 p-3 rounded-lg transition-all duration-200 data-[state=active]:${tab.bgColor} data-[state=active]:${tab.borderColor} data-[state=active]:border`}
                    >
                      <IconComponent className={`w-5 h-5 ${tab.color}`} />
                      <span className={`text-sm font-medium ${tab.color}`}>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Only Hospital Registration Available - Staff registration moved to hospital dashboard */}

              {/* Hospital Registration */}
              <TabsContent value="hospital">
                <form onSubmit={handleHospitalSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hospital-name" className="text-amber-800">Hospital Name</Label>
                      <Input
                        id="hospital-name"
                        placeholder="Ayurveda Wellness Center"
                        value={hospitalForm.name}
                        onChange={(e) => setHospitalForm(prev => ({...prev, name: e.target.value}))}
                        className="border-amber-200 focus:border-amber-400"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hospital-state" className="text-amber-800">State</Label>
                      <Select 
                        value={hospitalForm.state} 
                        onValueChange={(value) => {
                          setHospitalForm(prev => ({...prev, state: value, city: ''}));
                        }}
                      >
                        <SelectTrigger className="border-amber-200 focus:border-amber-400">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {getStateNames().map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="hospital-city" className="text-amber-800">City</Label>
                      <Select 
                        value={hospitalForm.city} 
                        onValueChange={(value) => setHospitalForm(prev => ({...prev, city: value}))}
                        disabled={!hospitalForm.state}
                      >
                        <SelectTrigger className="border-amber-200 focus:border-amber-400">
                          <SelectValue placeholder={hospitalForm.state ? "Select city" : "Select state first"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {hospitalForm.state && getCitiesByState(hospitalForm.state).map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hospital-address" className="text-amber-800">Full Address</Label>
                    <Input
                      id="hospital-address"
                      placeholder="Street address, landmark, etc."
                      value={hospitalForm.address}
                      onChange={(e) => setHospitalForm(prev => ({...prev, address: e.target.value}))}
                      className="border-amber-200 focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hospital-email" className="text-amber-800">Email</Label>
                      <Input
                        id="hospital-email"
                        type="email"
                        placeholder="admin@hospital.com"
                        value={hospitalForm.email}
                        onChange={(e) => setHospitalForm(prev => ({...prev, email: e.target.value}))}
                        className="border-amber-200 focus:border-amber-400"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hospital-phone" className="text-amber-800">Phone</Label>
                      <Input
                        id="hospital-phone"
                        placeholder="+91 9876543210"
                        value={hospitalForm.phone}
                        onChange={(e) => setHospitalForm(prev => ({...prev, phone: e.target.value}))}
                        className="border-amber-200 focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hospital-doctors" className="text-amber-800">Number of Doctors</Label>
                      <Input
                        id="hospital-doctors"
                        type="number"
                        min="0"
                        placeholder="5"
                        value={hospitalForm.numDoctors}
                        onChange={(e) => setHospitalForm(prev => ({...prev, numDoctors: parseInt(e.target.value) || 0}))}
                        className="border-amber-200 focus:border-amber-400"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hospital-therapists" className="text-amber-800">Number of Therapists</Label>
                      <Input
                        id="hospital-therapists"
                        type="number"
                        min="0"
                        placeholder="8"
                        value={hospitalForm.numTherapists}
                        onChange={(e) => setHospitalForm(prev => ({...prev, numTherapists: parseInt(e.target.value) || 0}))}
                        className="border-amber-200 focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hospital-username" className="text-amber-800">Admin Username</Label>
                      <Input
                        id="hospital-username"
                        placeholder="admin.hospital"
                        value={hospitalForm.adminUsername}
                        onChange={(e) => setHospitalForm(prev => ({...prev, adminUsername: e.target.value}))}
                        className="border-amber-200 focus:border-amber-400"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hospital-password" className="text-amber-800">Admin Password</Label>
                      <div className="relative">
                        <Input
                          id="hospital-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          value={hospitalForm.adminPassword}
                          onChange={(e) => setHospitalForm(prev => ({...prev, adminPassword: e.target.value}))}
                          className="border-amber-200 focus:border-amber-400 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-amber-600 hover:bg-amber-700">
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Register Hospital
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 whitespace-pre-line">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-x-4">
          <Button variant="ghost" onClick={onBackToHome} className="text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Button>
          <Button variant="outline" onClick={onRegistrationComplete} className="border-green-600 text-green-600">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}