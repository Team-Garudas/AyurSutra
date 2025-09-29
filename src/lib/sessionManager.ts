// Session Management Utilities
// Handles user session persistence, timeout, and automatic logout

import { AuthUser, Patient, Doctor, Therapist, Hospital } from './mockData';

const SESSION_STORAGE_KEY = 'panchakarma_session';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface SessionData {
  user: AuthUser;
  userData: Patient | Doctor | Therapist | Hospital;
  loginTime: number;
  lastActivity: number;
}

// Save session to localStorage
export const saveSession = (user: AuthUser, userData: Patient | Doctor | Therapist | Hospital): void => {
  const sessionData: SessionData = {
    user,
    userData,
    loginTime: Date.now(),
    lastActivity: Date.now()
  };
  
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    console.log('🔐 Session saved successfully');
  } catch (error) {
    console.error('❌ Failed to save session:', error);
  }
};

// Load session from localStorage
export const loadSession = (): SessionData | null => {
  try {
    const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionString) {
      console.log('🔍 No session found in localStorage');
      return null;
    }

    const sessionData: SessionData = JSON.parse(sessionString);
    
    // Check if session has expired
    const now = Date.now();
    const timeSinceLastActivity = now - sessionData.lastActivity;
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      console.log('⏰ Session expired, clearing...');
      clearSession();
      return null;
    }

    // Update last activity time
    sessionData.lastActivity = now;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    
    console.log('✅ Valid session loaded for user:', sessionData.user.name);
    return sessionData;
  } catch (error) {
    console.error('❌ Failed to load session:', error);
    clearSession();
    return null;
  }
};

// Update session activity timestamp
export const updateSessionActivity = (): void => {
  try {
    const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionString) return;

    const sessionData: SessionData = JSON.parse(sessionString);
    sessionData.lastActivity = Date.now();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('❌ Failed to update session activity:', error);
  }
};

// Clear session from localStorage
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    console.log('🗑️ Session cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear session:', error);
  }
};

// Check if session is still valid
export const isSessionValid = (): boolean => {
  const session = loadSession();
  return session !== null;
};

// Get remaining session time in milliseconds
export const getRemainingSessionTime = (): number => {
  const session = loadSession();
  if (!session) return 0;
  
  const timeSinceLastActivity = Date.now() - session.lastActivity;
  const remainingTime = SESSION_TIMEOUT - timeSinceLastActivity;
  
  return Math.max(0, remainingTime);
};

// Format remaining time for display
export const formatRemainingTime = (): string => {
  const remaining = getRemainingSessionTime();
  if (remaining === 0) return 'Session expired';
  
  const minutes = Math.floor(remaining / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Session timeout handler type
export type SessionTimeoutHandler = () => void;

// Create a session timeout manager
export class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private onTimeout: SessionTimeoutHandler;

  constructor(onTimeout: SessionTimeoutHandler) {
    this.onTimeout = onTimeout;
  }

  // Start monitoring session timeout
  start(): void {
    this.stop(); // Clear any existing timeout
    
    const remainingTime = getRemainingSessionTime();
    if (remainingTime === 0) {
      this.onTimeout();
      return;
    }

    this.timeoutId = setTimeout(() => {
      console.log('⏰ Session timeout reached, logging out...');
      this.onTimeout();
    }, remainingTime);

    console.log(`⏱️ Session timeout set for ${Math.round(remainingTime / 1000)} seconds`);
  }

  // Stop monitoring session timeout
  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Reset the timeout (call when user is active)
  reset(): void {
    updateSessionActivity();
    this.start();
  }
}

// Auto-activity tracker to reset session timeout on user interaction
export class ActivityTracker {
  private sessionManager: SessionTimeoutManager;
  private events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  private isActive = false;

  constructor(sessionManager: SessionTimeoutManager) {
    this.sessionManager = sessionManager;
  }

  // Start tracking user activity
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
    
    console.log('👀 Activity tracking started');
  }

  // Stop tracking user activity
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    console.log('👀 Activity tracking stopped');
  }

  private handleActivity = (): void => {
    this.sessionManager.reset();
  };
}
