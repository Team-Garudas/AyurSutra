import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { Patient, getPatientById, generateQRCodeSync } from '@/lib/mockData';

export default function PatientCard() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      const patientData = getPatientById(patientId);
      setPatient(patientData);
    }
    setLoading(false);
  }, [patientId]);

  const shareCard = async () => {
    if (patient && navigator.share) {
      try {
        await navigator.share({
          title: `${patient.name} - Panchakarma ID Card`,
          text: `Medical ID Card for ${patient.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Card URL copied to clipboard!');
    }
  };

  const downloadCard = () => {
    if (patient) {
      const cardData = {
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        bloodGroup: patient.bloodGroup,
        address: patient.address,
        abhaPassport: patient.abhaPassport,
        registrationTime: patient.registrationTime,
        isResident: patient.isResident,
        photoUrl: patient.photoUrl
      };
      
      const dataStr = JSON.stringify(cardData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `panchakarma-${patient.id}-details.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
            <p className="text-gray-600 mb-6">
              The patient ID "{patientId}" was not found in our records.
            </p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const qrCodeUrl = generateQRCodeSync(patient.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Panchakarma Medical ID
          </h1>
          <p className="text-gray-600">Digital Patient Identity Card</p>
        </div>

        {/* Patient Card */}
        <Card className="w-full mx-auto bg-gradient-to-br from-green-50 via-white to-amber-50 border-2 border-green-300 shadow-2xl">
          <CardHeader className="text-center pb-3 bg-gradient-to-r from-green-600 to-amber-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-2xl font-bold">🕉</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Panchakarma Medical Center</h3>
                <p className="text-green-100 text-sm">Authentic Ayurvedic Treatment</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-1">
              ID: {patient.id}
            </Badge>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {/* Patient Info */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={patient.photoUrl || '/api/placeholder/120/120'} 
                  alt="Patient Photo" 
                  className="w-28 h-28 rounded-xl border-4 border-green-300 object-cover shadow-lg"
                />
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="text-2xl font-bold text-green-800">{patient.name}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-500 font-medium">Date of Birth:</span>
                    <p className="font-semibold text-gray-700">
                      {new Date(patient.dob).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-medium">Blood Group:</span>
                    <p className="font-semibold text-red-600 text-lg">{patient.bloodGroup}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Details */}
            <div className="space-y-4 border-t border-green-200 pt-4">
              <div>
                <span className="text-gray-500 font-medium">Address:</span>
                <p className="font-medium text-gray-700 mt-1">{patient.address}</p>
              </div>
              <div>
                <span className="text-gray-500 font-medium">
                  {patient.isResident ? 'ABHA Number' : 'Passport Number'}:
                </span>
                <p className="font-semibold text-blue-600 mt-1">{patient.abhaPassport}</p>
              </div>
            </div>
            
            {/* QR Code and Registration Info */}
            <div className="flex items-center justify-between pt-4 border-t border-green-200">
              <div className="flex flex-col items-center">
                <img 
                  src={qrCodeUrl} 
                  alt="Patient QR Code" 
                  className="w-20 h-20 border-2 border-green-300 rounded-lg shadow-md"
                />
                <span className="text-xs text-gray-500 mt-2 font-medium">Digital ID</span>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">VERIFIED</span>
                </div>
                <p className="text-xs text-gray-500">Registered:</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(patient.registrationTime).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            
            {/* Treatment Authorization */}
            <div className="bg-gradient-to-r from-green-100 to-amber-100 p-4 rounded-xl border border-green-200">
              <p className="text-center text-green-800 font-semibold">
                🌿 Authorized for Panchakarma Treatment 🌿
              </p>
              <p className="text-center text-xs text-gray-600 mt-1">
                This digital ID confirms patient eligibility for authentic Ayurvedic treatments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1 max-w-40">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={shareCard} variant="outline" className="flex-1 max-w-40">
            <Share2 className="w-4 h-4 mr-2" />
            Share Card
          </Button>
          <Button onClick={downloadCard} className="flex-1 max-w-40 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2024 Panchakarma Medical Center | Authentic Ayurvedic Healthcare</p>
          <p className="mt-1">This is an official digital medical identification card</p>
        </div>
      </div>
    </div>
  );
}
