import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Download, QrCode, Eye, EyeOff, Upload, ArrowLeft } from 'lucide-react';
import { 
  Patient, 
  registerPatient, 
  generatePanchakarmaId, 
  generateQRCodeSync
} from '@/lib/mockData';

interface PatientRegistrationProps {
  onRegistrationComplete: (patient: Patient) => void;
  onBackToHome: () => void;
}

export default function PatientRegistration({ onRegistrationComplete, onBackToHome }: PatientRegistrationProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    bloodGroup: '',
    address: '',
    abhaPassport: '',
    password: '',
    confirmPassword: '',
    isResident: true
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Check camera availability
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraAvailable(false);
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setCameraAvailable(hasCamera);
      } catch (error) {
        setCameraAvailable(false);
      }
    };
    checkCameraAvailability();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setShowCamera(true);
    } catch (error) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.dob || !formData.bloodGroup || !formData.address || !formData.abhaPassport || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!capturedPhoto) {
      setError('Please capture or upload a photo.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const newPatient: Patient = {
        id: generatePanchakarmaId(),
        name: formData.name,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
        abhaPassport: formData.abhaPassport,
        password: formData.password,
        isResident: formData.isResident,
        photoUrl: capturedPhoto || '',
        registrationTime: new Date().toISOString()
      };

      const registered = registerPatient(newPatient);
      
      if (registered) {
        setRegisteredPatient(newPatient);
      } else {
        setError('Registration failed. Patient ID may already exist.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadIDCard = (patient: Patient) => {
    const cardData = {
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
      abhaPassport: patient.abhaPassport,
      registrationTime: patient.registrationTime,
      qrCodeUrl: generateQRCodeSync(patient.id)
    };
    
    const dataStr = JSON.stringify(cardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `panchakarma-id-card-${patient.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateIDCard = (patient: Patient) => {
    const qrCodeUrl = generateQRCodeSync(patient.id);
    
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 via-white to-amber-50 border-2 border-green-300 shadow-xl">
        <CardHeader className="text-center pb-3 bg-gradient-to-r from-green-600 to-amber-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-lg font-bold">🕉</span>
            </div>
            <h3 className="text-xl font-bold">Panchakarma Medical ID</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            ID: {patient.id}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <img 
                src={patient.photoUrl} 
                alt="Patient Photo" 
                className="w-20 h-20 rounded-lg border-3 border-green-300 object-cover shadow-md"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-lg font-bold text-green-800">{patient.name}</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div>
                  <span className="text-gray-500">DOB:</span>
                  <p className="font-medium text-gray-700">{new Date(patient.dob).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Blood:</span>
                  <p className="font-medium text-red-600">{patient.bloodGroup}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Address:</span>
              <p className="font-medium text-gray-700">{patient.address}</p>
            </div>
            <div>
              <span className="text-gray-500">{patient.isResident ? 'ABHA Number' : 'Passport'}:</span>
              <p className="font-medium text-blue-600">{patient.abhaPassport}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-green-200">
            <div className="flex flex-col items-center">
              <img 
                src={qrCodeUrl} 
                alt="Patient QR Code - Scan to view details" 
                className="w-16 h-16 border-2 border-green-300 rounded-lg shadow-md"
                title={`QR Code for ${patient.name} - ID: ${patient.id}`}
              />
              <span className="text-xs text-gray-500 mt-1 font-medium">Scan to View</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Registered:</p>
              <p className="text-xs font-medium text-gray-700">
                {new Date(patient.registrationTime).toLocaleDateString('en-IN')}
              </p>
              <p className="text-xs text-green-600 font-medium">✓ Verified</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-amber-100 p-2 rounded-lg">
            <p className="text-xs text-center text-gray-700">
              🌿 Authorized for Panchakarma Treatment 🌿
            </p>
          </div>
          
          <Button 
            onClick={() => downloadIDCard(patient)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download ID Card Data
          </Button>
        </CardContent>
      </Card>
    );
  };

  // If patient is registered, show success and ID card
  if (registeredPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
              Registration Successful!
            </h1>
            <p className="text-gray-600">Your Panchakarma ID card has been generated</p>
          </div>

          <div className="flex justify-center mb-8">
            {generateIDCard(registeredPatient)}
          </div>

          <div className="text-center space-x-4">
            <Button 
              onClick={() => onRegistrationComplete(registeredPatient)}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Dashboard
            </Button>
            <Button variant="outline" onClick={onBackToHome}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Patient Registration
          </h1>
          <p className="text-gray-600">Register for Panchakarma therapy management</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
          <CardHeader>
            <CardTitle className="text-green-800">Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="indian" onValueChange={(value) => handleInputChange('isResident', value === 'indian')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="indian">Indian Resident</TabsTrigger>
                  <TabsTrigger value="nonresident">Non-Resident</TabsTrigger>
                </TabsList>
                
                <TabsContent value="indian" className="space-y-4">
                  <div>
                    <Label htmlFor="abha">ABHA Number</Label>
                    <Input
                      id="abha"
                      placeholder="Enter ABHA number"
                      value={formData.abhaPassport}
                      onChange={(e) => handleInputChange('abhaPassport', e.target.value)}
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="nonresident" className="space-y-4">
                  <div>
                    <Label htmlFor="passport">Passport Number</Label>
                    <Input
                      id="passport"
                      placeholder="Enter passport number"
                      value={formData.abhaPassport}
                      onChange={(e) => handleInputChange('abhaPassport', e.target.value)}
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select 
                    value={formData.bloodGroup} 
                    onValueChange={(value) => handleInputChange('bloodGroup', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pr-10"
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
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Photo Capture</Label>
                
                {!capturedPhoto && (
                  <div className="space-y-4">
                    {cameraAvailable !== false && (
                      <Button
                        type="button"
                        onClick={startCamera}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Use Camera
                        {cameraAvailable === null && <span className="ml-2 text-xs">(Checking...)</span>}
                      </Button>
                    )}
                    
                    <div className="text-center text-gray-500 text-sm">
                      {cameraAvailable === false ? 'Use this option' : 'or'}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {showCamera && (
                  <div className="space-y-4">
                    <video ref={videoRef} autoPlay className="w-full rounded-lg bg-gray-100" />
                    <div className="flex gap-2">
                      <Button type="button" onClick={capturePhoto} className="flex-1">
                        Capture Photo
                      </Button>
                      <Button type="button" variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {capturedPhoto && (
                  <div className="space-y-4">
                    <img src={capturedPhoto} alt="Captured" className="w-32 h-32 rounded-lg border-2 border-green-300 object-cover mx-auto" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCapturedPhoto(null)}
                      className="w-full"
                    >
                      Retake Photo
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  Register Patient
                </Button>
                <Button type="button" variant="outline" onClick={onBackToHome}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
