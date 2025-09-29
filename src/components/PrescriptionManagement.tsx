import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { FileText, Calendar, Clock, Pill, Plus, Download, Printer, Search, AlertCircle } from "lucide-react";
import { addPrescription, getPrescriptions, Prescription, updatePrescription } from '../services/prescriptionService';
import { formatDate } from '../lib/mockData';

interface PrescriptionManagementProps {
  prescriptions: any[];
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
}

const PrescriptionManagement: React.FC<PrescriptionManagementProps> = ({
  prescriptions: initialPrescriptions,
  patientId,
  doctorId,
  doctorName,
  appointmentId,
}) => {
  const [activeTab, setActiveTab] = useState<string>('current');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Get patient name from the first prescription or use a default
  const patientName = prescriptions.length > 0 ? prescriptions[0].patientName : 'Patient';
  
  // New prescription form state
  const [newPrescription, setNewPrescription] = useState<Omit<Prescription, 'id'>>({
    patientId,
    patientName,
    doctorId: doctorId || '',
    doctorName: doctorName || '',
    appointmentId: appointmentId || '',
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }],
    notes: '',
    date: new Date().toISOString(),
    status: 'active',
    refillsAllowed: 0,
    refillsUsed: 0,
    isElectronic: true
  });

  useEffect(() => {
    setPrescriptions(initialPrescriptions || []);
  }, [initialPrescriptions]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await getPrescriptions(patientId);
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ]
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleSubmitPrescription = async () => {
    try {
      await addPrescription(newPrescription);
      setIsAddingNew(false);
      loadPrescriptions();
      // Reset form
      setNewPrescription({
        patientId,
        patientName,
        doctorId: doctorId || '',
        doctorName: doctorName || '',
        appointmentId: appointmentId || '',
        medications: [{
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }],
        notes: '',
        date: new Date().toISOString(),
        status: 'active',
        refillsAllowed: 0,
        refillsUsed: 0,
        isElectronic: true
      });
    } catch (error) {
      console.error('Error adding prescription:', error);
    }
  };

  const handleRefill = async (prescription: Prescription) => {
    if (prescription.refillsUsed < prescription.refillsAllowed) {
      try {
        const updatedPrescription = {
          ...prescription,
          refillsUsed: prescription.refillsUsed + 1,
          status: prescription.refillsUsed + 1 >= prescription.refillsAllowed ? 'completed' : 'active'
        };
        await updatePrescription(updatedPrescription);
        loadPrescriptions();
      } catch (error) {
        console.error('Error refilling prescription:', error);
      }
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = searchQuery === '' || 
      prescription.medications.some(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      (activeTab === 'current' && prescription.status === 'active') ||
      (activeTab === 'past' && prescription.status === 'completed') ||
      activeTab === 'all';
    
    return matchesSearch && matchesTab;
  });

  const renderPrescriptionList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (filteredPrescriptions.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium">No prescriptions found</p>
          <p className="text-sm mt-1">
            {searchQuery ? 'Try adjusting your search' : activeTab === 'current' ? 'You have no active prescriptions' : 'No past prescriptions available'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="bg-blue-50 py-3 px-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm font-medium text-blue-800">
                      Prescription #{prescription.id.substring(0, 8)}
                    </CardTitle>
                    <Badge 
                      variant={prescription.status === 'active' ? 'default' : 'secondary'}
                      className={prescription.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    >
                      {prescription.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(new Date(prescription.date))}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Dr. {prescription.doctorName}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Printer className="h-3 w-3 mr-1" /> Print
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                  {prescription.status === 'active' && prescription.refillsUsed < prescription.refillsAllowed && (
                    <Button 
                      size="sm" 
                      className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleRefill(prescription)}
                    >
                      Refill ({prescription.refillsAllowed - prescription.refillsUsed} left)
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Medications</h4>
                  <ul className="space-y-2">
                    {prescription.medications.map((med, index) => (
                      <li key={index} className="text-sm bg-gray-50 p-3 rounded-md">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-xs text-gray-600 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                          <span><span className="font-medium">Dosage:</span> {med.dosage}</span>
                          <span><span className="font-medium">Frequency:</span> {med.frequency}</span>
                          <span><span className="font-medium">Duration:</span> {med.duration}</span>
                          {med.instructions && (
                            <div className="col-span-2 mt-1 flex items-start gap-1">
                              <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5" />
                              <span>{med.instructions}</span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {prescription.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{prescription.notes}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <div>
                    <span className="font-medium">Refills:</span> {prescription.refillsUsed} of {prescription.refillsAllowed} used
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {prescription.isElectronic ? 'Electronic' : 'Paper'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAddPrescriptionForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium">Creating prescription for {patientName}</p>
          <p className="text-xs mt-1">All fields marked with * are required</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Medications *</h3>
        {newPrescription.medications.map((med, index) => (
          <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Medication #{index + 1}</h4>
              {newPrescription.medications.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveMedication(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`med-name-${index}`} className="text-xs">Name *</Label>
                <Input 
                  id={`med-name-${index}`} 
                  value={med.name} 
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  placeholder="Medication name"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`med-dosage-${index}`} className="text-xs">Dosage *</Label>
                <Input 
                  id={`med-dosage-${index}`} 
                  value={med.dosage} 
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  placeholder="e.g., 10mg"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`med-frequency-${index}`} className="text-xs">Frequency *</Label>
                <Input 
                  id={`med-frequency-${index}`} 
                  value={med.frequency} 
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  placeholder="e.g., Twice daily"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`med-duration-${index}`} className="text-xs">Duration *</Label>
                <Input 
                  id={`med-duration-${index}`} 
                  value={med.duration} 
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor={`med-instructions-${index}`} className="text-xs">Special Instructions</Label>
                <Input 
                  id={`med-instructions-${index}`} 
                  value={med.instructions} 
                  onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                  placeholder="e.g., Take with food"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 text-xs h-8"
          onClick={handleAddMedication}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Another Medication
        </Button>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="notes" className="text-xs">Additional Notes</Label>
        <Textarea 
          id="notes" 
          value={newPrescription.notes} 
          onChange={(e) => setNewPrescription(prev => ({...prev, notes: e.target.value}))}
          placeholder="Any additional information or instructions"
          className="text-sm"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="refills" className="text-xs">Refills Allowed</Label>
          <Select 
            value={newPrescription.refillsAllowed.toString()} 
            onValueChange={(value) => setNewPrescription(prev => ({...prev, refillsAllowed: parseInt(value)}))}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select refills" />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs flex items-center justify-between">
            <span>Electronic Prescription</span>
            <Switch 
              checked={newPrescription.isElectronic}
              onCheckedChange={(checked) => setNewPrescription(prev => ({...prev, isElectronic: checked}))}
            />
          </Label>
          <p className="text-xs text-gray-500">
            {newPrescription.isElectronic 
              ? 'Will be sent electronically to pharmacy' 
              : 'Will need to be printed'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {isAddingNew ? (
        <div className="flex-1 overflow-y-auto p-1">
          <ScrollArea className="h-[60vh]">
            {renderAddPrescriptionForm()}
          </ScrollArea>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>Cancel</Button>
            <Button onClick={handleSubmitPrescription}>Save Prescription</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by medication or doctor"
              className="pl-8 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-1">
            <ScrollArea className="h-[50vh]">
              {renderPrescriptionList()}
            </ScrollArea>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Prescription
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PrescriptionManagement;