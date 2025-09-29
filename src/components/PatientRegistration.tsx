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
  generatePanchakarmaId, 
  generateQRCodeSync
} from '@/lib/mockData';
import { registerAndAuthenticatePatient } from '@/lib/patientAuthService';
import { storePatientPhoto, storeQRCode } from '@/lib/localStorageService';
import IDCard from './IDCard';

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
        // Set smaller dimensions for the photo
        const maxWidth = 400;
        const maxHeight = 400;
        
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        
        // Calculate aspect ratio and new dimensions
        let newWidth = videoWidth;
        let newHeight = videoHeight;
        
        if (videoWidth > videoHeight) {
          if (newWidth > maxWidth) {
            newHeight = (newHeight * maxWidth) / newWidth;
            newWidth = maxWidth;
          }
        } else {
          if (newHeight > maxHeight) {
            newWidth = (newWidth * maxHeight) / newHeight;
            newHeight = maxHeight;
          }
        }
        
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
        
        context.drawImage(videoRef.current, 0, 0, newWidth, newHeight);
        
        // Compress the image more aggressively (0.3 quality, JPEG format)
        const photoData = canvasRef.current.toDataURL('image/jpeg', 0.3);
        
        console.log(`📸 Photo captured - Size: ${Math.round(photoData.length / 1024)}KB`);
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

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Set maximum dimensions
        const maxWidth = 400;
        const maxHeight = 400;
        
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
        
        console.log(`📸 Image compressed - Original: ${Math.round(file.size / 1024)}KB, Compressed: ${Math.round(compressedDataUrl.length / 1024)}KB`);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedPhoto = await compressImage(file);
        setCapturedPhoto(compressedPhoto);
      } catch (error) {
        setError('Failed to process image. Please try again.');
      }
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
        photoUrl: '', // Will store SQLite reference instead
        registrationTime: new Date().toISOString()
      };

      console.log('📝 Attempting to register patient:', newPatient.name);
      
      // Store photo in SQLite3
      let photoId = '';
      if (capturedPhoto) {
        photoId = await storePatientPhoto(newPatient.id, capturedPhoto, {
          fileName: `patient_${newPatient.id}_photo.jpg`,
          uploadedAt: new Date().toISOString()
        });
        console.log(`📸 Photo stored in SQLite with ID: ${photoId}`);
        newPatient.photoUrl = `sqlite://${photoId}`; // Reference to SQLite record
      }

      // Generate and store QR code in SQLite3
      const qrCodeData = generateQRCodeSync(newPatient.id);
      const qrId = await storeQRCode(newPatient.id, qrCodeData, {
        patientUrl: `${window.location.origin}/patient-card/${newPatient.id}`,
        generatedAt: new Date().toISOString()
      });
      console.log(`🔗 QR code stored in SQLite with ID: ${qrId}`);
      
      // Store patient data in Firebase and authenticate
      const authResult = await registerAndAuthenticatePatient(newPatient);
      console.log('🔐 Registration and auth result:', authResult);
      
      if (authResult.success && authResult.patient) {
        console.log('✅ Registration and authentication successful');
        // For display purposes, use the actual photo data
        const patientForDisplay = { ...authResult.patient, photoUrl: capturedPhoto || '' };
        setRegisteredPatient(patientForDisplay);
      } else {
        console.log('❌ Registration failed:', authResult.error);
        setError(authResult.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-gray-600">Your Panchakarma ID card has been generated and you are now logged in</p>
          </div>

          <div className="flex justify-center mb-8">
            <IDCard patient={registeredPatient} showDownloadButton={true} />
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
          <p className="text-gray-600">Register for Panchakarma therapy management with automatic login</p>
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
                  Register Patient & Login
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