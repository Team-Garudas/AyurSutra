import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  User,
  Heart,
  Zap,
  PhoneCall,
  Mail,
  Navigation,
  CheckCircle,
  X
} from 'lucide-react';

export interface EmergencyAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  location?: string;
  emergencyType: 'medical' | 'urgent' | 'critical';
  symptoms: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedDoctors: string[];
  notes?: string;
}

interface EmergencyNotificationProps {
  doctorId: string;
  onEmergencyResponse: (alertId: string, response: 'acknowledge' | 'reject') => void;
}

export default function EmergencyNotification({ doctorId, onEmergencyResponse }: EmergencyNotificationProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Load emergency alerts from Firebase
  useEffect(() => {
    // Create real-time listener for emergency alerts
    const emergencyQuery = query(
      collection(db, 'emergencyAlerts'),
      where('assignedDoctors', 'array-contains', doctorId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(emergencyQuery, (snapshot) => {
      const emergencyAlerts: EmergencyAlert[] = [];
      snapshot.forEach((doc) => {
        emergencyAlerts.push({ id: doc.id, ...doc.data() } as EmergencyAlert);
      });
      setAlerts(emergencyAlerts);
    }, (error) => {
      console.error('Error loading emergency alerts:', error);
    });

    return () => unsubscribe();
  }, [doctorId]);

  // Play emergency sound
  useEffect(() => {
    if (alerts.length > 0 && isAudioEnabled) {
      playEmergencySound();
    }
  }, [alerts.length, isAudioEnabled]);

  const playEmergencySound = () => {
    try {
      // Create emergency alert sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Repeat 3 times
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.setValueAtTime(1000, audioContext.currentTime);
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.5);
      }, 600);
    } catch (error) {
      console.warn('Could not play emergency sound:', error);
    }
  };

  const handleResponse = async (alertId: string, response: 'acknowledge' | 'reject') => {
    try {
      // Update alert status in Firebase
      const alertRef = doc(db, 'emergencyAlerts', alertId);
      await updateDoc(alertRef, {
        status: response === 'acknowledge' ? 'acknowledged' : 'resolved',
        respondedAt: new Date().toISOString(),
        respondedBy: doctorId
      });
      
      // The onSnapshot listener will automatically update the local state
      onEmergencyResponse(alertId, response);
      setShowDetails(false);
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error updating emergency alert:', error);
    }
  };

  const getEmergencyTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500';
      case 'urgent': return 'bg-orange-500';
      case 'medical': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else {
      return `${diffHours}h ${diffMins % 60}m ago`;
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+91-/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  if (alerts.length === 0) {
    return null; // No emergency alerts to show
  }

  return (
    <>
      {/* Floating Emergency Alerts */}
      <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
        {alerts.map((alert, index) => (
          <Card 
            key={alert.id}
            className={`shadow-2xl border-l-4 ${getEmergencyTypeColor(alert.emergencyType)} animate-bounce cursor-pointer`}
            style={{ animationDelay: `${index * 200}ms` }}
            onClick={() => {
              setSelectedAlert(alert);
              setShowDetails(true);
            }}
          >
            <CardContent className="p-4 bg-white/95 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.emergencyType === 'critical' ? 'text-red-600' :
                    alert.emergencyType === 'urgent' ? 'text-orange-600' : 'text-yellow-600'
                  } animate-pulse`} />
                  <Badge variant="destructive" className={`text-xs ${
                    alert.emergencyType === 'critical' ? 'bg-red-600' :
                    alert.emergencyType === 'urgent' ? 'bg-orange-600' : 'bg-yellow-600'
                  }`}>
                    {alert.emergencyType.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResponse(alert.id, 'reject');
                  }}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-sm">{alert.patientName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">{getTimeAgo(alert.timestamp)}</span>
                </div>
                
                <p className="text-sm text-gray-700 line-clamp-2">
                  {alert.symptoms}
                </p>
                
                {alert.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">{alert.location}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResponse(alert.id, 'acknowledge');
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Respond
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${alert.patientPhone}`, '_self');
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Alert Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${getEmergencyTypeColor(selectedAlert.emergencyType)} rounded-full flex items-center justify-center`}>
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  Emergency Alert Details
                </DialogTitle>
                <DialogDescription>
                  <Badge className={`${
                    selectedAlert.emergencyType === 'critical' ? 'bg-red-100 text-red-800' :
                    selectedAlert.emergencyType === 'urgent' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAlert.emergencyType.toUpperCase()} EMERGENCY
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Patient Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="font-semibold">{selectedAlert.patientName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Patient ID</label>
                        <p className="font-mono text-sm">{selectedAlert.patientId}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center justify-between">
                        <p className="font-mono">{formatPhoneNumber(selectedAlert.patientPhone)}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`tel:${selectedAlert.patientPhone}`, '_self')}
                        >
                          <PhoneCall className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                    
                    {selectedAlert.location && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <div className="flex items-center justify-between">
                          <p>{selectedAlert.location}</p>
                          <Button size="sm" variant="outline">
                            <Navigation className="w-4 h-4 mr-2" />
                            Navigate
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Emergency Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Emergency Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reported Symptoms</label>
                      <p className="bg-red-50 p-3 rounded-lg border border-red-200">
                        {selectedAlert.symptoms}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Time Reported</label>
                      <p>{new Date(selectedAlert.timestamp).toLocaleString('en-IN')}</p>
                      <p className="text-sm text-red-600 font-medium">{getTimeAgo(selectedAlert.timestamp)}</p>
                    </div>
                    
                    {selectedAlert.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Additional Notes</label>
                        <p className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          {selectedAlert.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleResponse(selectedAlert.id, 'acknowledge')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge & Respond
                  </Button>
                  <Button 
                    onClick={() => window.open(`tel:${selectedAlert.patientPhone}`, '_self')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Patient
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleResponse(selectedAlert.id, 'reject')}
                  className="w-full text-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss Alert
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}