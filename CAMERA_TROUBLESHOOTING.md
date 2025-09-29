# Camera Troubleshooting Guide

## Photo Capture Not Working?

### Common Issues and Solutions:

1. **Browser Permissions**
   - Chrome/Edge: Click the camera icon in the address bar
   - Firefox: Click the shield icon and allow camera access
   - Safari: Go to Safari > Preferences > Websites > Camera

2. **HTTPS Requirement**
   - Modern browsers require HTTPS for camera access (except localhost)
   - For local development: `http://localhost:5174` should work
   - For production: Ensure your domain uses HTTPS

3. **Browser Compatibility**
   - Chrome 53+, Firefox 36+, Safari 11+, Edge 12+
   - Mobile browsers: iOS Safari 11+, Chrome Mobile 53+

4. **Camera Hardware**
   - Ensure camera is not being used by another application
   - Check if camera is properly connected (external webcams)
   - Try refreshing the page

### Fallback Options:

If camera capture doesn't work, you can:
1. Click "Upload Photo from Device" 
2. Select an existing photo from your device
3. The photo will be used for ID card generation

### Testing Steps:

1. Open the application at `http://localhost:5174`
2. Navigate to Patient Registration
3. Fill out the form
4. Click "Capture Photo with Camera"
5. Allow camera permissions when prompted
6. If camera doesn't work, try "Upload Photo from Device"

### Browser Console Errors:

Open Developer Tools (F12) and check for errors like:
- `NotAllowedError`: Camera permission denied
- `NotFoundError`: No camera device found
- `NotSupportedError`: Camera not supported in this browser

### Production Deployment:

For production deployment, ensure:
- Domain uses HTTPS
- SSL certificate is valid
- Camera permissions are requested properly
