// Firebase Test Component - Add this to test Firebase connection
import React, { useState } from 'react';
import { registerPatient } from '../lib/mockData';
import { Patient } from '../lib/mockData';

const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing Firebase connection...');
    
    try {
      // Test patient registration with Firebase
      const testPatient: Patient = {
        id: '', // Firebase will generate this
        name: 'Test Patient Firebase',
        dob: '1990-01-01',
        bloodGroup: 'A+',
        address: 'Test Address, Firebase City',
        abhaPassport: 'TEST123456789',
        registrationTime: new Date().toISOString(),
        isResident: true,
        password: 'testpass123'
      };

      console.log('🔥 Starting Firebase test...');
      const success = await registerPatient(testPatient);
      
      if (success) {
        setTestResult('✅ SUCCESS! Firebase is connected and working! Patient registered successfully.');
        console.log('✅ Firebase test passed!');
      } else {
        setTestResult('❌ FAILED! Firebase registration failed.');
        console.log('❌ Firebase test failed!');
      }
    } catch (error) {
      setTestResult(`❌ ERROR! ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Firebase test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      background: 'white', 
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔥 Firebase Test</h3>
      
      <button 
        onClick={testFirebaseConnection}
        disabled={isLoading}
        style={{
          background: isLoading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '10px',
          width: '100%'
        }}
      >
        {isLoading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      {testResult && (
        <div style={{ 
          padding: '10px', 
          background: testResult.includes('SUCCESS') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.includes('SUCCESS') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '12px',
          wordWrap: 'break-word'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default FirebaseTest;
