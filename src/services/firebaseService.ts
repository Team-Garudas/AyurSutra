import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: any;
}

// Add a notification to the database
export const addNotification = async (notification: Notification) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const newNotification = {
      ...notification,
      createdAt: serverTimestamp(),
      read: false
    };
    const docRef = await addDoc(notificationsRef, newNotification);
    return { id: docRef.id, ...newNotification };
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId: string) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};