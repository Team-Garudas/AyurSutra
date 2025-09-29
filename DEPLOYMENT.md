# AyurSutra Deployment Guide for Render

This guide will help you deploy your AyurSutra Patient Management System to Render.

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Firebase Project** - Ensure your Firebase project is set up and configured

## Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

## Step 2: Deploy to Render

### Option A: GitHub Integration (Recommended)

1. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - **Name**: `ayursutra`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: Yes (optional)

### Option B: Direct Git Repository

1. Provide your GitHub repository URL
2. Select the branch to deploy (usually `main`)
3. Configure the same build and start commands

## Step 3: Environment Variables

Add these environment variables in Render Dashboard:

```
VITE_OPENROUTER_API_KEY=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
VITE_OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
VITE_FIREBASE_API_KEY=AIzaSyAzQvaxYJe2qGW_p9Zfq16smTl8eXcd94o
VITE_FIREBASE_AUTH_DOMAIN=ayursutra-b95c1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ayursutra-b95c1
VITE_FIREBASE_STORAGE_BUCKET=ayursutra-b95c1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=603253246853
VITE_FIREBASE_APP_ID=1:603253246853:web:d86eb4a47eb092143a52ec
NODE_ENV=production
```

## Step 4: Deployment Process

1. **Initial Deploy:**
   - Render will automatically start building your app
   - Build process takes 5-10 minutes
   - Monitor logs for any errors

2. **Build Steps:**
   - Install dependencies (`npm install`)
   - TypeScript compilation (`tsc`)
   - Vite build (`vite build`)
   - Start Express server (`npm start`)

## Step 5: Post-Deployment

1. **Custom Domain (Optional):**
   - Go to Settings → Custom Domains
   - Add your domain and configure DNS

2. **SSL Certificate:**
   - Automatically provided by Render
   - Available at `https://ayursutra.onrender.com`

3. **Monitoring:**
   - Check logs in Render dashboard
   - Monitor performance and errors

## Features Included in Deployment

✅ **Frontend**: React with Vite build optimization  
✅ **Backend**: Express.js server for routing  
✅ **Database**: Firebase Firestore for data storage  
✅ **Images**: localStorage for patient photos and QR codes  
✅ **Authentication**: Custom patient authentication  
✅ **API Integration**: OpenRouter AI for appointment booking  
✅ **SSL**: Automatic HTTPS certificate  
✅ **Auto-deploy**: Automatic deployment on git push  

## Architecture Overview

```
Browser
   ↓
Render Web Service (Express.js)
   ↓
React App (Vite Build)
   ↓
┌─────────────────┬─────────────────┐
│   Firebase      │   localStorage  │
│   (Patient Data)│   (Photos/QR)   │
└─────────────────┴─────────────────┘
```

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check TypeScript errors
   - Verify all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Environment Variables:**
   - Ensure all VITE_ prefixed variables are set
   - Verify Firebase configuration
   - Check OpenRouter API key

3. **Runtime Errors:**
   - Check application logs
   - Verify Firebase rules and permissions
   - Test API endpoints

### Logs Access:
- Render Dashboard → Your Service → Logs
- Real-time log monitoring available

## Performance Optimization

The deployment includes:
- **Code Splitting**: Separate chunks for vendor, Firebase, and UI components
- **Asset Optimization**: Compressed builds with Vite
- **Caching**: Browser caching for static assets
- **CDN**: Automatic CDN distribution via Render

## Cost

- **Render Free Tier**: 750 hours/month of usage
- **Firebase**: Spark plan (free with quotas)
- **OpenRouter**: Pay-per-use API calls

## Support

For deployment issues:
1. Check Render documentation
2. Review Firebase console for errors
3. Monitor application logs
4. Test in local development environment first

Your AyurSutra application will be live at: `https://ayursutra.onrender.com`

## Next Steps

After successful deployment:
1. Test all patient registration flows
2. Verify Firebase data synchronization
3. Test photo upload and display functionality
4. Validate appointment booking system
5. Configure custom domain (optional)
6. Set up monitoring and alerts