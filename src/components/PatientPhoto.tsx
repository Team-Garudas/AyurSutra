// PatientPhoto component to handle localStorage and direct image storage
import React, { useState, useEffect } from 'react';
import { getLocalFileData } from '../lib/localFileStorage';
import { getPatientPhoto } from '../lib/localStorageService';

interface PatientPhotoProps {
  photoUrl?: string;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  patientId?: string; // Added to fetch photo by patient ID
}

const PatientPhoto: React.FC<PatientPhotoProps> = ({ 
  photoUrl, 
  alt = "Patient Photo", 
  className = "",
  fallbackIcon,
  patientId
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setImageError(false);
      
      try {
        // Priority 1: Use provided photoUrl
        if (photoUrl) {
          if (photoUrl.startsWith('sqlite://')) {
            // Handle SQLite stored images (legacy - now use localStorage)
            const photoId = photoUrl.replace('sqlite://', '');
            const photoData = await getPatientPhoto(photoId);
            if (photoData) {
              setImageSrc(photoData);
              console.log('📸 Photo loaded from localStorage:', photoId);
            } else {
              console.warn('Photo not found in localStorage:', photoId);
              setImageError(true);
            }
          } else if (photoUrl.startsWith('local://')) {
            // Handle local file storage (legacy)
            const localData = getLocalFileData(photoUrl);
            if (localData) {
              setImageSrc(localData);
            } else {
              console.warn('Local file not found:', photoUrl);
              setImageError(true);
            }
          } else if (photoUrl.startsWith('patient_photo_')) {
            // Handle localStorage references (legacy)
            const photoData = localStorage.getItem(photoUrl);
            if (photoData) {
              setImageSrc(photoData);
            } else {
              console.warn('localStorage photo not found:', photoUrl);
              setImageError(true);
            }
          } else if (photoUrl.startsWith('data:image/') || photoUrl.startsWith('http')) {
            // Handle direct data URLs or HTTP URLs
            setImageSrc(photoUrl);
          } else {
            // Unknown format
            console.warn('Unknown photo URL format:', photoUrl);
            setImageError(true);
          }
        }
        // Priority 2: If no photoUrl but patientId provided, try to fetch by ID
        else if (patientId) {
          const photoData = await getPatientPhoto(patientId);
          if (photoData) {
            setImageSrc(photoData);
            console.log('📸 Photo loaded by patient ID:', patientId);
          } else {
            console.log('📸 No photo found for patient ID:', patientId);
            setImageError(true);
          }
        }
        // No photo source provided
        else {
          setImageError(true);
        }
      } catch (error) {
        console.error('Error loading patient photo:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [photoUrl, patientId]);

  const handleImageError = () => {
    console.warn('Failed to load image:', photoUrl || patientId);
    setImageError(true);
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no photo or error, show fallback
  if (!imageSrc || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}>
        {fallbackIcon || (
          <svg 
            className="w-1/2 h-1/2" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default PatientPhoto;
