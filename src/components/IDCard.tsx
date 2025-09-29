import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Patient, generateQRCodeSync } from '@/lib/mockData';
import PatientPhoto from './PatientPhoto';
import html2canvas from 'html2canvas';

interface IDCardProps {
  patient: Patient;
  showDownloadButton?: boolean;
  className?: string;
}

export const IDCard: React.FC<IDCardProps> = ({ 
  patient, 
  showDownloadButton = true, 
  className = "" 
}) => {
  const qrCodeUrl = generateQRCodeSync(patient.id);

  const downloadIDCard = async () => {
    try {
      const cardElement = document.getElementById(`id-card-${patient.id}`);
      if (!cardElement) {
        alert('ID card element not found');
        return;
      }

      // Temporarily hide the download button during capture
      const downloadBtn = cardElement.querySelector('#download-button');
      if (downloadBtn) {
        (downloadBtn as HTMLElement).style.display = 'none';
      }

      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        background: null
      });

      // Restore download button
      if (downloadBtn) {
        (downloadBtn as HTMLElement).style.display = 'block';
      }

      // Convert to image and download
      const link = document.createElement('a');
      link.download = `ayurvedic-patient-id-${patient.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading ID card:', error);
      alert('Error downloading ID card. Please try again.');
    }
  };

  return (
    <div className={className}>
      <div 
        id={`id-card-${patient.id}`}
        className="w-full max-w-lg mx-auto relative"
        style={{
          background: 'linear-gradient(135deg, #1e3a28 0%, #2d5a3d 40%, #4a7c5a 100%)',
          borderRadius: '16px',
          padding: '2px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glossy shine overlay */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 70%, rgba(255, 255, 255, 0.2) 100%)',
            zIndex: 10
          }}
        ></div>
        
        {/* Animated light reflection */}
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-2xl pointer-events-none animate-pulse"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
            transform: 'rotate(45deg)',
            zIndex: 11,
            animationDuration: '3s'
          }}
        ></div>
        {/* Gold Border */}
        <div 
          className="w-full h-full rounded-2xl p-1 relative"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #e6c200 70%, #d4af37 100%)',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 1
          }}
        >
          {/* Gold border glossy overlay */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(255, 255, 255, 0.2) 100%)',
              zIndex: 2
            }}
          ></div>
          <Card className="w-full h-full bg-transparent border-0 shadow-none rounded-xl overflow-hidden relative">
            {/* Card surface glossy overlay */}
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0.1) 100%)',
                zIndex: 5
              }}
            ></div>
            
            <CardContent className="p-0 relative z-10">
              {/* Main Card Background */}
              <div 
                className="w-full h-full p-6 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 40, 0.95) 0%, rgba(45, 90, 61, 0.90) 40%, rgba(74, 124, 90, 0.85) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Inner glossy highlight */}
                <div 
                  className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                    borderRadius: '12px 12px 0 0'
                  }}
                ></div>
                {/* Header Section */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center relative"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #e6c200 100%)',
                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {/* Golden shine overlay */}
                      <div 
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 60%)'
                        }}
                      ></div>
                      <span className="text-2xl relative z-10">🪷</span>
                    </div>
                  </div>
                  <h2 className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'serif' }}>
                    आयुर्वेदिक रोगी पहचान पत्र
                  </h2>
                  <h3 className="text-white/90 text-sm font-semibold tracking-wider">
                    AYURVEDIC PATIENT ID CARD
                  </h3>
                  {/* Decorative Line */}
                  <div 
                    className="w-20 h-0.5 mx-auto mt-2"
                    style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
                  ></div>
                </div>

                {/* Content Section */}
                <div className="flex items-start gap-6 mb-6">
                  {/* Patient Photo */}
                  <div className="flex-shrink-0">
                    <div 
                      className="w-24 h-24 rounded-full p-1 relative"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #e6c200 100%)',
                        boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {/* Photo frame glossy overlay */}
                      <div 
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)'
                        }}
                      ></div>
                      <PatientPhoto 
                        photoUrl={patient.photoUrl}
                        alt="Patient Photo"
                        className="w-full h-full rounded-full object-cover relative z-10"
                      />
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="flex-1 text-white space-y-3">
                    <div>
                      <span className="text-white/70 text-xs block mb-1">नाम / NAME:</span>
                      <p className="font-bold text-lg leading-tight">{patient.name.toUpperCase()}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-white/70 text-xs block">जन्मतिथि / GENDER:</span>
                        <p className="font-medium">M</p>
                      </div>
                      <div>
                        <span className="text-white/70 text-xs block">DOB:</span>
                        <p className="font-medium">
                          {new Date(patient.dob).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-white/70 text-xs block">जारी तिथि:</span>
                        <p className="font-medium">
                          {new Date(patient.registrationTime).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <span className="text-white/70 text-xs block">PATIENT ID:</span>
                        <p className="font-bold text-yellow-300">{patient.id}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-white/70 text-xs block">ISSUE DATE:</span>
                      <p className="font-medium">
                        {new Date().toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div>
                      <span className="text-white/70 text-xs block">हस्ताक्षर / SIGNATURE:</span>
                      <div className="h-4 border-b border-white/30 mt-1"></div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div 
                      className="bg-white p-2 rounded-lg relative"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {/* QR code glossy overlay */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1/2 rounded-t-lg pointer-events-none"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
                        }}
                      ></div>
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="w-16 h-16 relative z-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="text-white text-xs">
                    <p className="font-semibold">आयुष मंत्रालय, भारत सरकार</p>
                    <p className="opacity-90">AYUSH, GOVT. OF INDIA</p>
                  </div>
                  
                  {/* Authentic Seal */}
                  <div 
                    className="w-16 h-16 rounded-full flex flex-col items-center justify-center text-center relative"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #e6c200 70%, #d4af37 100%)',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#1e3a28',
                      boxShadow: '0 4px 16px rgba(212, 175, 55, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {/* Seal glossy highlight */}
                    <div 
                      className="absolute top-1 left-1 right-3 bottom-3 rounded-full pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 70%)'
                      }}
                    ></div>
                    
                    {/* Seal content */}
                    <div className="relative z-10">
                      <div className="text-lg mb-1">✓</div>
                      <div className="leading-none">
                        <div>VERIFIED</div>
                        <div style={{ fontSize: '6px' }}>AYURVEDA</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Elements with Glossy Effects */}
                <div 
                  className="absolute top-4 left-4 w-6 h-6 opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37, rgba(212, 175, 55, 0.3), transparent)',
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                    filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))'
                  }}
                ></div>
                <div 
                  className="absolute top-4 right-4 w-6 h-6 opacity-30"
                  style={{
                    background: 'linear-gradient(225deg, #d4af37, rgba(212, 175, 55, 0.3), transparent)',
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))'
                  }}
                ></div>
                <div 
                  className="absolute bottom-4 left-4 w-6 h-6 opacity-30"
                  style={{
                    background: 'linear-gradient(45deg, #d4af37, rgba(212, 175, 55, 0.3), transparent)',
                    clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
                    filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))'
                  }}
                ></div>
                <div 
                  className="absolute bottom-4 right-4 w-6 h-6 opacity-30"
                  style={{
                    background: 'linear-gradient(315deg, #d4af37, rgba(212, 175, 55, 0.3), transparent)',
                    clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
                    filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.3))'
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showDownloadButton && (
        <div className="mt-4 flex justify-center">
          <Button 
            id="download-button"
            onClick={downloadIDCard}
            className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white shadow-xl relative overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Button glossy overlay */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)'
              }}
            ></div>
            <Download className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">Download ID Card</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default IDCard;