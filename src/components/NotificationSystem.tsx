import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/lib/mockData';
import { formatDate, formatTime } from '@/lib/mockData';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'alert' | 'info';
  read: boolean;
  timestamp: Date;
  appointmentId?: string;
  link?: string;
}

interface NotificationSystemProps {
  userId: string;
  userType: 'patient' | 'doctor' | 'therapist' | 'hospital';
  appointments?: Appointment[];
}

export default function NotificationSystem({ userId, userType, appointments = [] }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for notifications from Firestore
  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId),
      where('userType', '==', userType)
      // orderBy('timestamp', 'desc') // Temporarily removed to avoid index requirement
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationData.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          type: data.type,
          read: data.read,
          timestamp: data.timestamp?.toDate() || new Date(),
          appointmentId: data.appointmentId,
          link: data.link
        });
      });
      // Sort by timestamp descending on client-side
      notificationData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId, userType]);

  // Generate appointment reminders
  useEffect(() => {
    if (!appointments.length) return;

    // Create local notifications for upcoming appointments
    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      const now = new Date();
      const diffTime = aptDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays > 0 && diffDays <= 2 && apt.status !== 'cancelled';
    });

    const reminderNotifications: Notification[] = upcomingAppointments.map(apt => ({
      id: `reminder-${apt.id}`,
      title: 'Upcoming Appointment',
      message: `You have an appointment on ${formatDate(apt.dateTime)} at ${formatTime(apt.dateTime)}`,
      type: 'reminder',
      read: false,
      timestamp: new Date(),
      appointmentId: apt.id
    }));

    // Merge with existing notifications, avoiding duplicates
    const existingIds = notifications.map(n => n.id);
    const newReminders = reminderNotifications.filter(n => !existingIds.includes(n.id));
    
    if (newReminders.length) {
      setNotifications(prev => [...newReminders, ...prev]);
      setUnreadCount(prev => prev + newReminders.length);
    }
  }, [appointments, notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Here you would also update the read status in Firestore
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
    // Here you would also update all read statuses in Firestore
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-green-500" />;
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto shadow-lg z-50 bg-white">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2"
                >
                  Mark all as read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotifications(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="divide-y">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNotificationTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}