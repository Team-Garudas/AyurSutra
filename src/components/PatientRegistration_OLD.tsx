import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Download, QrCode, Eye, EyeOff, Upload } from 'lucide-react';
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

  // Simple download function using browser's download capability
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

  // Check camera availability
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      setCameraAvailable(hasCamera);
    } catch (error) {
      console.error('Error checking camera availability:', error);
      setCameraAvailable(false);
    }
  };

  // Start camera
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
      console.error('Error starting camera:', error);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  // Capture photo from camera
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

  // Stop camera
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

  // Handle file upload
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

  // Initialize camera availability check
  React.useEffect(() => {
    checkCameraAvailability();
  }, []);

  // Check camera availability on component mount
  React.useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraAvailable(false);
          return;
        }
        
        // Try to enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setCameraAvailable(hasCamera);
      } catch (error) {
        console.log('Camera check failed:', error);
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
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera is not supported on this device or browser. Please use a file upload instead.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setShowCamera(true);
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Camera access failed. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera is not supported in this browser.';
      } else {
        errorMessage += 'Please try using a file upload instead.';
      }
      
      setError(errorMessage);
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
        setShowCamera(false);
        
        // Stop camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedPhoto(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  const stopCamera = () => {
    setShowCamera(false);
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.dob) {
      setError('Please select your date of birth');
      return false;
    }
    if (!formData.bloodGroup) {
      setError('Please select your blood group');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!formData.abhaPassport.trim()) {
      setError(formData.isResident ? 'Please enter your ABHA number' : 'Please enter your passport number');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!capturedPhoto) {
      setError('Please capture your photo for the ID card');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
        onRegistrationComplete(newPatient);
      } else {
        setError('Registration failed. Patient ID may already exist.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Patient Registration
          </h1>
          <p className="text-gray-600">Register for Panchakarma therapy management</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
                    <Select onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map(group => (
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
                        placeholder="Enter password"
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
                  <div className="flex items-center justify-between">
                    <Label>Patient Photo (Required)</Label>
                    <span className="text-xs text-gray-500">For ID card generation</span>
                  </div>
                  
                  {!capturedPhoto && !showCamera && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          📸 You can either take a photo using your camera or upload an existing photo from your device.
                        </p>
                        {cameraAvailable === false && (
                          <p className="text-sm text-amber-700 mt-1">
                            ⚠️ Camera not available. Please use the upload option below.
                          </p>
                        )}
                      </div>
                      
                      {cameraAvailable !== false && (
                        <Button type="button" onClick={startCamera} className="w-full bg-green-600 hover:bg-green-700">
                          <Camera className="w-4 h-4 mr-2" />
                          Capture Photo with Camera
                          {cameraAvailable === null && <span className="ml-2 text-xs">(Checking...)</span>}
                        </Button>
                      )}
                      
                      <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">
                          {cameraAvailable === false ? 'Use this option' : 'or'}
                        </span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-amber-600 text-amber-600 hover:bg-amber-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo from Device
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
                      <div className="relative">
                        <video ref={videoRef} autoPlay className="w-full rounded-lg bg-gray-100" />
                        {!videoRef.current?.srcObject && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                            <div className="text-center">
                              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                              <p className="text-gray-500">Initializing camera...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={capturePhoto} className="flex-1 bg-amber-600 hover:bg-amber-700">
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={stopCamera}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {capturedPhoto && (
                    <div className="text-center space-y-3">
                      <img src={capturedPhoto} alt="Captured" className="w-32 h-32 rounded-full mx-auto border-4 border-green-300 object-cover" />
                      <div className="flex gap-2 justify-center">
                        <Button type="button" onClick={() => setCapturedPhoto(null)} variant="outline" size="sm">
                          Remove Photo
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline" 
                          size="sm"
                          className="border-amber-600 text-amber-600"
                        >
                          Upload Different Photo
                        </Button>
                      </div>
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

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-amber-600 hover:from-green-700 hover:to-amber-700 text-white"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  Register Patient
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/25 border border-white/18">
              <CardHeader>
                <CardTitle className="text-green-800">Preview ID Card</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.name && formData.dob && formData.bloodGroup && capturedPhoto ? (
                  generateIDCard({
                    id: 'PREVIEW',
                    ...formData,
                    photoUrl: capturedPhoto,
                    registrationTime: new Date().toISOString()
                  } as Patient)
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Fill the form and capture photo to preview ID card
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onBackToHome} className="text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Button>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}