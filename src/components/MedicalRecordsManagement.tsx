import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { FileText, Upload, Download, File, Trash2, Eye, Plus, Search, Calendar, Clock, Filter } from "lucide-react";
import { addMedicalRecord, getMedicalRecords, deleteMedicalRecord, MedicalRecord } from '../services/medicalRecordsService';
import { formatDate } from '../lib/mockData';

interface MedicalRecordsManagementProps {
  patientId: string;
  patientName?: string;
}

const MedicalRecordsManagement: React.FC<MedicalRecordsManagementProps> = ({
  patientId,
  patientName = 'Patient',
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // New record form state
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    category: 'lab_result',
    fileType: 'pdf',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    uploadedFile: null as File | null,
  });

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getMedicalRecords(patientId);
      setRecords(data);
    } catch (error) {
      console.error('Error loading medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewRecord({
        ...newRecord,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        uploadedFile: file,
      });
    }
  };

  const handleSubmitRecord = async () => {
    if (!newRecord.uploadedFile || !newRecord.title) {
      alert('Please provide a title and upload a file');
      return;
    }

    try {
      // In a real app, you would upload the file to storage and get a URL
      // For this demo, we'll create a fake URL
      const fakeFileUrl = `https://storage.example.com/${patientId}/${Date.now()}-${newRecord.fileName}`;
      
      await addMedicalRecord({
        patientId,
        title: newRecord.title,
        description: newRecord.description,
        category: newRecord.category,
        fileType: newRecord.fileType,
        fileUrl: fakeFileUrl,
        fileName: newRecord.fileName,
        fileSize: newRecord.fileSize,
        date: new Date().toISOString(),
      });
      
      setIsUploadDialogOpen(false);
      loadRecords();
      
      // Reset form
      setNewRecord({
        title: '',
        description: '',
        category: 'lab_result',
        fileType: 'pdf',
        fileUrl: '',
        fileName: '',
        fileSize: 0,
        uploadedFile: null,
      });
    } catch (error) {
      console.error('Error adding medical record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await deleteMedicalRecord(recordId);
        loadRecords();
      } catch (error) {
        console.error('Error deleting medical record:', error);
      }
    }
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setCurrentRecord(record);
    setIsViewDialogOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      lab_result: 'Lab Result',
      imaging: 'Imaging',
      prescription: 'Prescription',
      clinical_note: 'Clinical Note',
      discharge_summary: 'Discharge Summary',
      vaccination: 'Vaccination',
      other: 'Other',
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-4 w-4 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-700" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchQuery === '' || 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort records by date (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderRecordsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (sortedRecords.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium">No medical records found</p>
          <p className="text-sm mt-1">
            {searchQuery || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'Upload your first medical record to get started'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedRecords.map((record) => (
          <Card key={record.id} className="overflow-hidden">
            <CardHeader className="py-3 px-4 flex flex-row items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {getFileIcon(record.fileType)}
                  <CardTitle className="text-sm font-medium">
                    {record.title}
                  </CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {getCategoryLabel(record.category)}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(new Date(record.date))}
                  </span>
                  <span className="flex items-center gap-1">
                    <File className="h-3 w-3" /> {record.fileName} ({formatFileSize(record.fileSize)})
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewRecord(record)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRecord(record.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {record.description && (
              <CardContent className="py-2 px-4 text-sm text-gray-700">
                {record.description}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medical records"
              className="pl-8 h-9 text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-sm w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="lab_result">Lab Results</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="prescription">Prescriptions</SelectItem>
              <SelectItem value="clinical_note">Clinical Notes</SelectItem>
              <SelectItem value="discharge_summary">Discharge Summaries</SelectItem>
              <SelectItem value="vaccination">Vaccinations</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9">
                <Upload className="h-4 w-4 mr-2" /> Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Medical Record</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                    placeholder="e.g., Blood Test Results"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newRecord.category} 
                    onValueChange={(value) => setNewRecord({...newRecord, category: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab_result">Lab Result</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="clinical_note">Clinical Note</SelectItem>
                      <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                    placeholder="Add any additional details about this record"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">File *</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    {newRecord.uploadedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        {getFileIcon(newRecord.fileType)}
                        <span className="text-sm">{newRecord.fileName} ({formatFileSize(newRecord.fileSize)})</span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">Drag and drop or click to upload</p>
                        <p className="text-xs mt-1">Supports PDF, JPEG, PNG, DOC</p>
                      </div>
                    )}
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitRecord} disabled={!newRecord.uploadedFile || !newRecord.title}>
                  Upload Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
        {renderRecordsList()}
      </ScrollArea>
      
      {currentRecord && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(currentRecord.fileType)}
                {currentRecord.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Badge variant="outline">{getCategoryLabel(currentRecord.category)}</Badge>
                  <div className="text-sm text-gray-500 mt-2">
                    Uploaded on {formatDate(new Date(currentRecord.date))}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              {currentRecord.description ? (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-700">{currentRecord.description}</p>
                </div>
              ) : null}
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400" />
                  <p className="text-sm font-medium mt-2">{currentRecord.fileName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(currentRecord.fileSize)}</p>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Preview not available</p>
                  <p className="text-xs text-gray-500 mt-1">Download the file to view its contents</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MedicalRecordsManagement;