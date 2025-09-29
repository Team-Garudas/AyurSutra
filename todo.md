# Panchakarma Patient Management Platform - MVP Todo

## Core Files to Create/Modify (Max 8 files):

### 1. **src/pages/Index.tsx** - Main Dashboard Router
- Landing page with role selection
- Route to different dashboards based on user role
- Ayurveda-inspired hero section with 3D elements

### 2. **src/components/PatientDashboard.tsx** - Patient Dashboard
- View appointments and therapy history
- Book new appointments
- Access knowledge library
- Digital ID card display with QR code

### 3. **src/components/DoctorDashboard.tsx** - Doctor Dashboard  
- Search patients by Panchakarma ID
- View patient therapy history
- Add appointment notes and prescriptions
- Patient management interface

### 4. **src/components/TherapistDashboard.tsx** - Therapist Dashboard
- Search by appointment number + Panchakarma ID
- Step-by-step therapy checklist
- Photo upload for therapy steps
- Mark therapy completion

### 5. **src/components/HospitalDashboard.tsx** - Hospital Admin Dashboard
- Manage doctors and therapists
- View daily appointments
- Generate reports and analytics
- Staff management interface

### 6. **src/components/PatientRegistration.tsx** - Registration Component
- Indian vs Non-Resident registration flows
- Webcam photo capture using WebRTC
- Generate digital ID card with QR code
- Form validation and data collection

### 7. **src/lib/mockData.ts** - Mock Database & API Functions
- Sample patients, doctors, therapists, hospitals data
- Mock API functions for CRUD operations
- QR code generation utilities
- PDF generation functions

### 8. **index.html** - Update title and meta tags
- Update title to "Panchakarma Management Platform"
- Add Ayurveda-themed meta descriptions

## Key Features to Implement:
- ✅ Ayurveda-inspired theme (cream, green, gold)
- ✅ Role-based dashboard routing
- ✅ QR code generation for patient IDs
- ✅ Webcam photo capture (WebRTC simulation)
- ✅ Responsive design with animations
- ✅ 3D UI elements (CSS-based lotus animations)
- ✅ Mock therapy scheduling
- ✅ Downloadable forms (PDF simulation)
- ✅ Patient search functionality
- ✅ Therapy progress tracking

## Implementation Strategy:
1. Create Ayurveda-themed design system
2. Build role-based dashboard components
3. Implement patient registration with photo capture
4. Add QR code generation and scanning
5. Create therapy management workflows
6. Add mock data and API simulation
7. Implement responsive animations
8. Test all user flows

## Simplified for MVP:
- Use localStorage instead of SQLite3 for data persistence
- Mock WebRTC with file upload simulation
- CSS-based 3D effects instead of Three.js for initial version
- Simulated notifications and PDF downloads
- Basic analytics with Chart.js-like visualizations