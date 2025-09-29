import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Patient, Doctor, Hospital, addAppointment } from '@/lib/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

interface RazorpayPaymentGatewayProps {
  patient: Patient;
  doctor?: Doctor;
  hospital?: Hospital;
  amount: number;
  appointmentDateTime?: string;
  onSuccess: (appointmentId: string) => void;
  onCancel: () => void;
  bookingData?: {
    patientId: string;
    doctorId: string;
    hospitalId: string;
    symptoms: string[];
    dateTime: string;
    preInstructions: string;
    postInstructions: string;
    status: 'scheduled';
  };
}

// Bank icons for payment methods
const bankIcons = {
  hdfc: 'https://cdn.razorpay.com/bank-logos/HDFC.svg',
  sbi: 'https://cdn.razorpay.com/bank-logos/SBIN.svg',
  icici: 'https://cdn.razorpay.com/bank-logos/ICIC.svg',
  axis: 'https://cdn.razorpay.com/bank-logos/UTIB.svg',
  kotak: 'https://cdn.razorpay.com/bank-logos/KKBK.svg',
  yes: 'https://cdn.razorpay.com/bank-logos/YESB.svg',
};

// UPI icons
const upiIcons = {
  gpay: 'https://cdn.razorpay.com/app/googlepay.svg',
  phonepe: 'https://cdn.razorpay.com/app/phonepe.svg',
  paytm: 'https://cdn.razorpay.com/app/paytm.svg',
  bhim: 'https://cdn.razorpay.com/app/bhim.svg',
};

export function RazorpayPaymentGateway({
  patient,
  doctor,
  hospital,
  amount,
  appointmentDateTime,
  onSuccess,
  onCancel,
  bookingData
}: RazorpayPaymentGatewayProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };

  const generateBillPdf = (appointmentId: string) => {
    const pdf = new jsPDF();
    
    // Add logo and header
    pdf.setFillColor(41, 98, 255);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text('Ayurvedic Healing Center', 105, 20, { align: 'center' });
    
    // Reset text color for content
    pdf.setTextColor(0, 0, 0);
    
    // Bill title
    pdf.setFontSize(18);
    pdf.text('PAYMENT RECEIPT', 105, 50, { align: 'center' });
    
    // Add horizontal line
    pdf.setDrawColor(220, 220, 220);
    pdf.line(20, 55, 190, 55);
    
    // Bill details
    pdf.setFontSize(12);
    pdf.text('Receipt Number:', 20, 70);
    pdf.text(appointmentId, 80, 70);
    
    pdf.text('Date:', 20, 80);
    pdf.text(new Date().toLocaleDateString(), 80, 80);
    
    pdf.text('Patient Name:', 20, 90);
    pdf.text(patient.name, 80, 90);
    
    pdf.text('Patient ID:', 20, 100);
    pdf.text(patient.id, 80, 100);
    
    if (doctor) {
      pdf.text('Doctor:', 20, 110);
      pdf.text(doctor.name, 80, 110);
    }
    
    if (hospital) {
      pdf.text('Hospital:', 20, 120);
      pdf.text(hospital.name, 80, 120);
    }
    
    if (appointmentDateTime) {
      pdf.text('Appointment:', 20, 130);
      pdf.text(new Date(appointmentDateTime).toLocaleString(), 80, 130);
    }
    
    // Add horizontal line
    pdf.line(20, 140, 190, 140);
    
    // Payment details
    pdf.setFontSize(14);
    pdf.text('Payment Details', 20, 155);
    
    pdf.setFontSize(12);
    pdf.text('Payment Method:', 20, 170);
    pdf.text(paymentMethod.toUpperCase(), 80, 170);
    
    pdf.text('Amount Paid:', 20, 180);
    pdf.text(`₹${amount.toFixed(2)}`, 80, 180);
    
    pdf.text('Status:', 20, 190);
    pdf.text('PAID', 80, 190);
    
    // Footer
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, 250, 210, 40, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Thank you for your payment. This is a computer generated receipt.', 105, 265, { align: 'center' });
    pdf.text('For any queries, please contact our support team.', 105, 275, { align: 'center' });
    
    // Save the PDF
    pdf.save(`payment-receipt-${appointmentId}.pdf`);
    return appointmentId;
  };

  const handlePayment = () => {
    setPaymentError('');
    setIsProcessing(true);
    
    // Validate based on payment method
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        setPaymentError('Please fill in all card details');
        setIsProcessing(false);
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        setPaymentError('Please enter a valid UPI ID');
        setIsProcessing(false);
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setPaymentError('Please select a bank');
        setIsProcessing(false);
        return;
      }
    }
    
    // Simulate payment processing
    setTimeout(() => {
      // Mock payment processing
      const appointmentId = 'app-' + Math.random().toString(36).substr(2, 9);
      
      // Create appointment in the system
      if (bookingData && doctor && hospital) {
        addAppointment({
          id: appointmentId,
          patientId: patient.id,
          doctorId: doctor.id,
          hospitalId: hospital.id,
          dateTime: bookingData.dateTime,
          status: 'scheduled',
          paymentStatus: 'paid',
          amount: amount,
          paymentMethod: paymentMethod,
          symptoms: bookingData.symptoms || [],
          diagnosis: '',
          prescription: '',
          notes: '',
          followUpDate: ''
        });
      }
      
      // Generate bill PDF
      const receiptId = generateBillPdf(appointmentId);
      
      setIsProcessing(false);
      setShowPaymentDialog(false);
      onSuccess(receiptId);
    }, 2000);
  };

  return (
    <>
      <Button 
        onClick={() => setShowPaymentDialog(true)}
        className="w-full bg-[#2962ff] hover:bg-[#0039cb] text-white font-medium py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
      >
        Pay ₹{amount}
      </Button>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-xl">
          <div className="bg-gradient-to-r from-[#2962ff] to-[#3d5afe] p-6 text-white">
            <DialogTitle className="text-xl font-bold">Secure Payment</DialogTitle>
            <div className="mt-2 text-white/80 text-sm">Complete your payment securely with Razorpay</div>
            
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-80">Amount</div>
                  <div className="text-2xl font-bold">₹{amount}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-80">Order for</div>
                  <div className="font-medium">{patient.name}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {paymentError}
              </div>
            )}
            
            <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as any)}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  Card
                </TabsTrigger>
                <TabsTrigger value="upi" className="flex items-center gap-2">
                  <Smartphone size={16} />
                  UPI
                </TabsTrigger>
                <TabsTrigger value="netbanking" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  Net Banking
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="card" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input 
                      id="cardExpiry" 
                      placeholder="MM/YY" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input 
                      id="cardCvv" 
                      placeholder="123" 
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input 
                    id="cardName" 
                    placeholder="John Doe" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="upi" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input 
                    id="upiId" 
                    placeholder="name@upi" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {Object.entries(upiIcons).map(([key, icon]) => (
                    <div 
                      key={key}
                      className={`border rounded-md p-3 cursor-pointer transition-all hover:border-blue-500 ${upiId.includes(key) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setUpiId(`${key}@upi`)}
                    >
                      <img src={icon} alt={key} className="h-8 mx-auto" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="netbanking" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(bankIcons).map(([key, icon]) => (
                    <div 
                      key={key}
                      className={`border rounded-md p-4 cursor-pointer transition-all hover:border-blue-500 ${selectedBank === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedBank(key)}
                    >
                      <img src={icon} alt={key} className="h-8 mx-auto mb-2" />
                      <div className="text-center text-sm font-medium capitalize">{key} Bank</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                className="bg-[#2962ff] hover:bg-[#0039cb] text-white"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    Pay ₹{amount}
                  </span>
                )}
              </Button>
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Secure Payment
              </div>
              <p>Your payment information is secure with 256-bit encryption</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}