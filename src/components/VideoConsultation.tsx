import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addNotification } from '@/lib/firebaseService';

interface VideoConsultationProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorImage?: string;
  patientId: string;
  patientName: string;
  patientImage?: string;
  currentUserId: string;
  currentUserType: 'doctor' | 'patient';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

const VideoConsultation: React.FC<VideoConsultationProps> = ({
  isOpen,
  onClose,
  appointmentId,
  doctorId,
  doctorName,
  doctorImage,
  patientId,
  patientName,
  patientImage,
  currentUserId,
  currentUserType
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulated peer connection (in a real app, this would use WebRTC)
  useEffect(() => {
    if (isOpen) {
      // Simulate connection process
      setIsConnecting(true);
      
      // Get local video stream
      if (isVideoOn && localVideoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn })
          .then(stream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            
            // Simulate connection delay
            setTimeout(() => {
              setIsConnecting(false);
              setIsConnected(true);
              
              // Create notification for the consultation start
              const otherUserId = currentUserType === 'doctor' ? patientId : doctorId;
              const otherUserType = currentUserType === 'doctor' ? 'patient' : 'doctor';
              
              addNotification({
                userId: otherUserId,
                userType: otherUserType,
                title: 'Video Consultation Started',
                message: `Your video consultation for appointment #${appointmentId.substring(0, 8)} has started.`,
                type: 'video',
                read: false,
                timestamp: new Date(),
                appointmentId: appointmentId
              }).catch(console.error);
              
            }, 2000);
          })
          .catch(err => {
            console.error('Error accessing media devices:', err);
            setIsVideoOn(false);
          });
      }
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        text: 'Video consultation started. You can use the chat for text communication.',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
    
    // Cleanup function
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [isOpen, isVideoOn, isMicOn, appointmentId, currentUserId, currentUserType, doctorId, patientId]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
    }
  };
  
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
  };
  
  const endCall = () => {
    // Stop all tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Create notification for the consultation end
    const otherUserId = currentUserType === 'doctor' ? patientId : doctorId;
    const otherUserType = currentUserType === 'doctor' ? 'patient' : 'doctor';
    
    addNotification({
      userId: otherUserId,
      userType: otherUserType,
      title: 'Video Consultation Ended',
      message: `Your video consultation for appointment #${appointmentId.substring(0, 8)} has ended.`,
      type: 'video',
      read: false,
      timestamp: new Date(),
      appointmentId: appointmentId
    }).catch(console.error);
    
    onClose();
  };
  
  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserType === 'doctor' ? doctorName : patientName,
      text: newMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const otherUserName = currentUserType === 'doctor' ? patientName : doctorName;
  const otherUserImage = currentUserType === 'doctor' ? patientImage : doctorImage;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => !isConnecting && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <span>Video Consultation with {otherUserName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Main video area */}
          <div className={`relative flex-1 bg-gray-900 ${showChat ? 'hidden md:block' : ''}`}>
            {isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Connecting to secure video call...</p>
                </div>
              </div>
            )}
            
            {/* Remote video (full size) */}
            {isConnected && (
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={false}
              />
            )}
            
            {/* Local video (picture-in-picture) */}
            <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover bg-gray-800"
                autoPlay
                playsInline
                muted
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentUserType === 'doctor' ? doctorImage : patientImage} />
                    <AvatarFallback>{(currentUserType === 'doctor' ? doctorName : patientName).charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                variant={isMicOn ? "default" : "destructive"}
                size="icon"
                onClick={toggleMic}
                className="rounded-full h-12 w-12"
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="icon"
                onClick={toggleVideo}
                className="rounded-full h-12 w-12"
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={endCall}
                className="rounded-full h-12 w-12"
              >
                <Phone className="h-5 w-5 rotate-135" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowChat(!showChat)}
                className="rounded-full h-12 w-12 md:hidden bg-white"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Chat area */}
          <Card className={`w-full md:w-80 flex flex-col h-full border-l ${showChat ? '' : 'hidden md:flex'}`}>
            <CardHeader className="p-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 p-3 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`mb-3 ${message.senderId === currentUserId ? 'text-right' : ''} ${message.senderId === 'system' ? 'text-center italic text-gray-500 text-xs' : ''}`}
                  >
                    {message.senderId !== 'system' && message.senderId !== currentUserId && (
                      <div className="text-xs text-gray-500 mb-1">{message.senderName}</div>
                    )}
                    
                    <div 
                      className={`inline-block rounded-lg px-3 py-2 text-sm ${message.senderId === 'system' ? '' : message.senderId === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                      {message.text}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="p-3 pt-0">
              <div className="flex w-full gap-2">
                <Textarea 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="min-h-[60px] resize-none"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={newMessage.trim() === ''}
                  className="self-end"
                >
                  Send
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoConsultation;