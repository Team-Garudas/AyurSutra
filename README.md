# 🌿 AyurSutra - Ayurvedic Patient Management System

A comprehensive digital healthcare platform for Ayurvedic treatment centers, featuring patient registration, appointment management, therapy tracking, and integrated payment systems.

## 🌟 Features

### 👥 Patient Management
- **Digital Registration** with ABHA number support
- **Photo Capture & Storage** using camera or file upload
- **QR Code Generation** for patient identification
- **Auto-login** after registration
- **Patient Dashboard** with complete medical history

### 🏥 Hospital Operations
- **Multi-hospital Support** with centralized management
- **Doctor & Therapist Registration** with global availability
- **Appointment Scheduling** with queue management
- **Medical Records Management** with prescription tracking
- **Analytics Dashboard** with performance metrics

### 🤖 AI-Powered Features
- **AI Appointment Booking** with natural language processing
- **Intelligent Symptom Analysis** for treatment recommendations
- **Automated Therapy Suggestions** based on patient history
- **Smart Scheduling** with conflict resolution

### 💳 Integrated Payments
- **Razorpay Integration** for secure payments
- **Multiple Payment Methods** (UPI, Cards, Net Banking)
- **Payment Tracking** with receipt generation
- **Insurance Support** for Ayurvedic treatments

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for responsive design
- **Radix UI** components (shadcn/ui)
- **Vite** for fast development and builds
- **Lucide React** for icons

### Backend
- **Express.js** server for production
- **Firebase Firestore** for database
- **localStorage** for client-side photo storage
- **Node.js 18+** runtime

### AI & Integrations
- **OpenRouter API** for AI capabilities
- **Razorpay** for payment processing
- **QR Code** generation and scanning
- **PDF Generation** for reports and certificates

## 🛠️ Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or pnpm package manager
- Firebase project setup
- OpenRouter API key

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ayursutra.git
   cd ayursutra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup:**
   Copy the `.env` file and update with your credentials:
   ```bash
   # Your .env file should contain:
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   VITE_OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm start
```

## 🚀 Deployment to Render

### Quick Deploy Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Render:**
   - Visit [render.com](https://render.com)
   - Connect your GitHub repository
   - Configure build settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Set Environment Variables:**
   Add all variables from your `.env` file to Render dashboard

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 File Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── PatientRegistration.tsx
│   ├── DoctorDashboard.tsx
│   ├── PatientDashboard.tsx
│   └── ...             # Other feature components
├── lib/                # Utility libraries
│   ├── firebase.ts     # Firebase configuration
│   ├── mockData.ts     # Data management
│   ├── localStorageService.ts  # Photo storage
│   └── patientAuthService.ts   # Authentication
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── styles/             # Global styles
```

## 🔧 Key Commands

**Install Dependencies**
```bash
pnpm install
```

**Development Server**
```bash
pnpm run dev
```

**Production Build**
```bash
pnpm run build
```

**Start Production Server**
```bash
pnpm start
```

**Lint Code**
```bash
pnpm run lint
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Patient registration with photo capture
- [ ] Firebase data synchronization
- [ ] Doctor dashboard patient search
- [ ] AI appointment booking
- [ ] Payment processing
- [ ] Mobile responsiveness

## 🐛 Common Issues

1. **Camera not working:**
   - Check browser permissions
   - Ensure HTTPS in production
   - Fallback to file upload works

2. **Firebase connection errors:**
   - Verify environment variables in `.env`
   - Check Firestore rules
   - Ensure proper project configuration

3. **Build errors:**
   - Run `npm run build` locally first
   - Check TypeScript errors
   - Verify all dependencies are installed

## 📄 Key Features Implementation

### Patient Registration Flow
1. Multi-step form with ABHA/Passport validation
2. Camera/file photo capture with compression
3. Auto-generated QR codes for patient identification
4. Automatic login after successful registration
5. Data stored in Firebase with photos in localStorage

### Doctor Dashboard
1. Patient search by ID or name
2. Appointment management with real-time updates
3. Medical record creation and management
4. Prescription generation with PDF export
5. Performance analytics and reporting

### AI Appointment Booking
1. Natural language chat interface
2. Smart hospital and doctor recommendations
3. Automated conflict resolution
4. Payment integration with Razorpay
5. Confirmation and scheduling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ayursutra/issues)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Live Demo**: [https://ayursutra.onrender.com](https://ayursutra.onrender.com)

---

**Built with ❤️ for the Ayurvedic healthcare community using React, TypeScript, and shadcn/ui**
