import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Hospital, Doctor, Patient } from '@/lib/mockData';
import { getDoctorsByHospital, getAllDoctorsGlobal } from '@/lib/firebaseService';
import { 
  Bot, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  MapPin, 
  Star, 
  ArrowRight,
  Sparkles,
  Heart,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { RazorpayPaymentGateway } from './RazorpayPaymentGateway';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  options?: Option[];
  timestamp: Date;
}

interface Option {
  id: string;
  text: string;
  value: string;
  type: 'hospital' | 'doctor' | 'date' | 'time' | 'confirm';
}

interface AIAppointmentBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  hospitals: Hospital[];
  doctors: Doctor[];
  onSuccess: (appointmentId: string) => void;
}

export function AIAppointmentBooking({
  open,
  onOpenChange,
  patient,
  hospitals,
  doctors,
  onSuccess
}: AIAppointmentBookingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'hospital' | 'doctor' | 'datetime' | 'confirm' | 'payment'>('hospital');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Time slots for appointment
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when dialog opens
  useEffect(() => {
    if (open) {
      // Reset state
      setMessages([]);
      setCurrentStep('hospital');
      setSelectedHospital(null);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime('');
      setShowPayment(false);
      
      // Add initial welcome message
      setTimeout(() => {
        setMessages([{
          id: '1',
          text: `Namaste ${patient.name}! 🙏 I'm your appointment booking assistant. Let's book your Ayurvedic consultation. First, please select a hospital from the options below:`,
          sender: 'bot',
          options: hospitals.map(hospital => ({
            id: hospital.id,
            text: hospital.name,
            value: hospital.id,
            type: 'hospital'
          })),
          timestamp: new Date()
        }]);
      }, 500);
    }
  }, [open, hospitals, patient.name]);

  // Handle option selection
  const handleOptionSelect = async (option: Option) => {
    // Add user selection to messages
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option.text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Process based on option type
    switch (option.type) {
      case 'hospital':
        const hospital = hospitals.find(h => h.id === option.value) || null;
        setSelectedHospital(hospital);
        
        try {
          // Get all doctors - they are now available to all hospitals
          const allDoctors = await getAllDoctorsGlobal();
          console.log(`👨‍⚕️ Found ${allDoctors.length} doctors available globally`);
          
          setTimeout(() => {
            setIsLoading(false);
            if (allDoctors.length === 0) {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `I apologize, but there are currently no available doctors. Please try again later.`,
                sender: 'bot',
                options: hospitals.map(h => ({
                  id: h.id,
                  text: h.name,
                  value: h.id,
                  type: 'hospital'
                })),
                timestamp: new Date()
              }]);
              setCurrentStep('hospital');
              setSelectedHospital(null);
            } else {
              // Automatically select the first available doctor
              const firstDoctor = allDoctors[0];
              setSelectedDoctor(firstDoctor);
              setCurrentStep('datetime');
              
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: `Great choice! ${hospital?.name} is an excellent facility. I've automatically selected Dr. ${firstDoctor.name} (${firstDoctor.specialty}) for your consultation. Please select a date for your appointment:`,
                sender: 'bot',
                timestamp: new Date()
              }]);
            }
          }, 1000);
        } catch (error) {
          console.error('❌ Error fetching doctors for hospital:', error);
          setTimeout(() => {
            setIsLoading(false);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `Sorry, there was an error loading doctors for ${hospital?.name}. Please try selecting another hospital.`,
              sender: 'bot',
              options: hospitals.map(h => ({
                id: h.id,
                text: h.name,
                value: h.id,
                type: 'hospital'
              })),
              timestamp: new Date()
            }]);
            setCurrentStep('hospital');
            setSelectedHospital(null);
          }, 1000);
        }
        break;

      case 'doctor':
        const doctor = doctors.find(d => d.id === option.value) || null;
        setSelectedDoctor(doctor);
        setCurrentStep('datetime');
        
        setTimeout(() => {
          setIsLoading(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `Excellent! Dr. ${doctor?.name} is available for consultation. Please select a date for your appointment:`,
            sender: 'bot',
            timestamp: new Date()
          }]);
        }, 1000);
        break;

      case 'date':
        // This is handled by the calendar component
        break;

      case 'time':
        setSelectedTime(option.value);
        setCurrentStep('confirm');
        
        setTimeout(() => {
          setIsLoading(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `Perfect! Let me confirm your appointment details:\n\nHospital: ${selectedHospital?.name}\nDoctor: Dr. ${selectedDoctor?.name}\nDate: ${selectedDate ? format(selectedDate, 'PPP') : ''}\nTime: ${option.value}\n\nWould you like to proceed with booking this appointment?`,
            sender: 'bot',
            options: [{
              id: 'confirm-yes',
              text: 'Yes, proceed to payment',
              value: 'yes',
              type: 'confirm'
            }, {
              id: 'confirm-no',
              text: 'No, I want to change something',
              value: 'no',
              type: 'confirm'
            }],
            timestamp: new Date()
          }]);
        }, 1000);
        break;

      case 'confirm':
        if (option.value === 'yes') {
          setCurrentStep('payment');
          
          setTimeout(() => {
            setIsLoading(false);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `Great! Let's proceed with the payment to confirm your appointment.`,
              sender: 'bot',
              timestamp: new Date()
            }]);
            setShowPayment(true);
          }, 1000);
        } else {
          // Reset to hospital selection
          setCurrentStep('hospital');
          setSelectedHospital(null);
          setSelectedDoctor(null);
          setSelectedDate(null);
          setSelectedTime('');
          
          setTimeout(() => {
            setIsLoading(false);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `No problem! Let's start over. Please select a hospital from the options below:`,
              sender: 'bot',
              options: hospitals.map(hospital => ({
                id: hospital.id,
                text: hospital.name,
                value: hospital.id,
                type: 'hospital'
              })),
              timestamp: new Date()
            }]);
          }, 1000);
        }
        break;
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | null) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Add user selection to messages
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Date: ${format(date, 'PPP')}`,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Show time selection options
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `Good choice! Now, please select a preferred time for your appointment on ${format(date, 'PPP')}:`,
        sender: 'bot',
        options: timeSlots.map(time => ({
          id: `time-${time}`,
          text: time,
          value: time,
          type: 'time'
        })),
        timestamp: new Date()
      }]);
    }, 500);
  };

  // Handle payment success
  const handlePaymentSuccess = (appointmentId: string) => {
    // Add success message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: `Your appointment has been successfully booked! Your appointment ID is: ${appointmentId}. You will receive a confirmation email shortly.`,
      sender: 'bot',
      timestamp: new Date()
    }]);
    
    // Notify parent component
    onSuccess(appointmentId);
    
    // Close dialog after a delay
    setTimeout(() => {
      onOpenChange(false);
    }, 5000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-1 font-['Inter']">
                  AI Health Assistant
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-lg font-medium">
                  Personalized Ayurvedic appointment booking
                </DialogDescription>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-3">
              {['Hospital', 'Doctor', 'Schedule', 'Confirm'].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    (currentStep === 'hospital' && index === 0) ||
                    (currentStep === 'doctor' && index === 1) ||
                    (currentStep === 'datetime' && index === 2) ||
                    (currentStep === 'confirm' && index >= 3)
                      ? 'bg-white text-emerald-600 shadow-lg'
                      : 'bg-white/20 text-white/70'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-white/90 hidden lg:block">{step}</span>
                  {index < 3 && <ArrowRight className="w-4 h-4 text-white/60" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        
        {/* Modern Content Area */}
        <div className="flex-1 bg-gray-50/50 p-8 min-h-[500px] flex flex-col gap-6">
          
          {/* Chat Messages with Premium Design */}
          <div className="flex-1 space-y-6 max-h-[400px] overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
              <div className={`flex items-start gap-4 max-w-[85%] ${message.sender === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
                
                {/* Avatar */}
                <div className={`rounded-2xl p-3 shadow-lg backdrop-blur-sm ${
                  message.sender === 'bot' 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                }`}>
                  {message.sender === 'bot' ? 
                    <Sparkles className="w-5 h-5" /> : 
                    <User className="w-5 h-5" />
                  }
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-2xl px-6 py-4 shadow-sm backdrop-blur-sm border ${
                  message.sender === 'bot' 
                    ? 'bg-white/90 border-emerald-100 text-gray-800' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 text-blue-900'
                }`}>
                  <div className="whitespace-pre-line font-medium leading-relaxed text-[15px]">{message.text}</div>
                  
                  {/* Modern Option Buttons */}
                  {message.options && message.options.length > 0 && (
                    <div className={`mt-6 ${message.options[0]?.type === 'time' ? 'grid grid-cols-3 gap-2' : 'grid gap-3'}`}>
                      {message.options.map(option => {
                        // Different styling based on option type
                        if (option.type === 'hospital') {
                          return (
                            <Button 
                              key={option.id} 
                              variant="outline"
                              className="w-full justify-between h-auto p-4 bg-white/80 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 text-left group transition-all duration-200 hover:shadow-md"
                              onClick={() => handleOptionSelect(option)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                  <MapPin className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{option.text}</div>
                                  <div className="text-sm text-gray-500">Ayurvedic Wellness Center</div>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            </Button>
                          );
                        } else if (option.type === 'doctor') {
                          return (
                            <Button 
                              key={option.id} 
                              variant="outline"
                              className="w-full justify-between h-auto p-4 bg-white/80 hover:bg-teal-50 border-teal-200 hover:border-teal-300 text-left group transition-all duration-200 hover:shadow-md"
                              onClick={() => handleOptionSelect(option)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-teal-100 text-teal-600 font-semibold">
                                    {option.text.split(' ')[1]?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900">{option.text.split(' - ')[0]}</div>
                                  <div className="text-sm text-gray-500">{option.text.split(' - ')[1]}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium text-gray-600">4.8</span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                              </div>
                            </Button>
                          );
                        } else if (option.type === 'time') {
                          return (
                            <Button 
                              key={option.id} 
                              variant="outline"
                              className="h-10 bg-white/90 hover:bg-blue-50 border-blue-200 hover:border-blue-300 font-medium transition-all duration-200 hover:shadow-sm text-sm"
                              onClick={() => handleOptionSelect(option)}
                            >
                              <Clock className="w-3 h-3 mr-1 text-blue-600" />
                              {option.text}
                            </Button>
                          );
                        } else {
                          return (
                            <Button 
                              key={option.id} 
                              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                              onClick={() => handleOptionSelect(option)}
                            >
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              {option.text}
                            </Button>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Premium Loading Animation */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start gap-4 max-w-[85%]">
                <div className="rounded-2xl p-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="rounded-2xl px-6 py-4 bg-white/90 border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm font-medium text-emerald-600 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Date Selection - Grid Style */}
          {currentStep === 'datetime' && selectedHospital && selectedDoctor && !selectedDate && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start gap-4 max-w-[90%] w-full">
                <div className="rounded-2xl p-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <Card className="rounded-2xl border-0 shadow-lg bg-white/90 backdrop-blur-sm flex-1">
                  <CardHeader className="pb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Select Your Preferred Date</h3>
                    <p className="text-gray-600">Choose a convenient date for your consultation</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Quick Date Selection */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Quick selection:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(() => {
                          const today = new Date();
                          const dates = [];
                          for (let i = 0; i < 8; i++) {
                            const date = new Date(today);
                            date.setDate(today.getDate() + i);
                            dates.push(date);
                          }
                          return dates.map((date, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="h-auto p-3 flex flex-col bg-white/80 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                              onClick={() => handleDateSelect(date)}
                            >
                              <span className="text-xs text-gray-500 uppercase">
                                {format(date, 'EEE')}
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {format(date, 'd')}
                              </span>
                              <span className="text-xs text-gray-600">
                                {format(date, 'MMM')}
                              </span>
                            </Button>
                          ));
                        })()}
                      </div>
                    </div>
                    
                    {/* Full Calendar */}
                    <div className="calendar-container">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="border-0 bg-transparent rounded-xl w-full"
                        classNames={{
                          months: "flex flex-col space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-base font-semibold text-gray-900",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-8 w-8 bg-emerald-100 hover:bg-emerald-200 p-0 rounded-lg transition-colors",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex justify-between",
                          head_cell: "text-gray-600 rounded-md w-10 font-medium text-sm",
                          row: "flex w-full justify-between mt-1",
                          cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                          day: "h-10 w-10 p-0 font-medium hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors flex items-center justify-center",
                          day_selected: "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white font-bold",
                          day_today: "bg-emerald-50 text-emerald-900 font-bold border-2 border-emerald-300",
                          day_outside: "text-gray-300 opacity-50",
                          day_disabled: "text-gray-300 opacity-30 cursor-not-allowed hover:bg-transparent",
                        }}
                      />
                    </div>
                    
                    {/* Alternative Date Input */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-3">Or enter date manually:</p>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDateValue = new Date(e.target.value + 'T12:00:00');
                            handleDateSelect(selectedDateValue);
                          }
                        }}
                        className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        </div>
        
        {/* Premium Payment Section */}
        {showPayment && selectedHospital && selectedDoctor && selectedDate && selectedTime && (
          <Card className="rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm mx-8 mb-8">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Complete Your Booking</h3>
                  <p className="text-gray-600">Secure payment for your consultation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <RazorpayPaymentGateway
                patient={patient}
                doctor={selectedDoctor}
                hospital={selectedHospital}
                amount={1500} // Standard consultation fee
                appointmentDateTime={`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime.replace(/\s(AM|PM)/, '')}`}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
                bookingData={{
                  patientId: patient.id,
                  doctorId: selectedDoctor.id,
                  hospitalId: selectedHospital.id,
                  symptoms: [],
                  dateTime: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime.replace(/\s(AM|PM)/, '')}`,
                  preInstructions: 'Please arrive 15 minutes before your appointment time.',
                  postInstructions: 'Follow the doctor\'s advice for best results.',
                  status: 'scheduled'
                }}
              />
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}