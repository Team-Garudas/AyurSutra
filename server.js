import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy for proper IP handling behind Render's proxy
app.set('trust proxy', 1);

// Middleware for JSON parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from public directory with proper MIME types
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    }
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Serve root-level static files (for files in project root like background videos)
app.use('/', express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  },
  // Don't serve sensitive files
  dotfiles: 'deny',
  index: false
}));

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Special route for video streaming with range support
app.get('*.mp4', (req, res) => {
  const videoPath = path.join(__dirname, req.path);
  
  // Check if file exists
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Parse range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'public, max-age=31536000'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Special route for images with proper headers
app.get(['*.png', '*.jpg', '*.jpeg', '*.svg'], (req, res) => {
  const imagePath = path.join(__dirname, req.path);
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Image not found');
  }

  const ext = path.extname(imagePath).toLowerCase();
  let contentType = 'image/jpeg';
  
  switch (ext) {
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.sendFile(imagePath);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AyurSutra Patient Management System',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API endpoint for testing
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'AyurSutra API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint to list available media files (for debugging)
app.get('/api/media', (req, res) => {
  try {
    const mediaFiles = [];
    
    // Check root directory for media files
    const rootFiles = fs.readdirSync(__dirname);
    rootFiles.forEach(file => {
      if (file.match(/\.(mp4|png|jpg|jpeg|svg)$/i)) {
        mediaFiles.push({
          name: file,
          path: `/${file}`,
          location: 'root',
          size: fs.statSync(path.join(__dirname, file)).size
        });
      }
    });
    
    // Check public directory
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
      const publicFiles = fs.readdirSync(publicDir);
      publicFiles.forEach(file => {
        if (file.match(/\.(mp4|png|jpg|jpeg|svg)$/i)) {
          mediaFiles.push({
            name: file,
            path: `/public/${file}`,
            location: 'public',
            size: fs.statSync(path.join(publicDir, file)).size
          });
        }
      });
    }
    
    res.json({
      success: true,
      mediaFiles,
      totalFiles: mediaFiles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle client-side routing - this should be last
app.get('*', (req, res) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api/') || 
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|mp4|webm|ogg|pdf)$/)) {
    return res.status(404).send('Not found');
  }
  
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not built. Please run "npm run build" first.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AyurSutra server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🎥 Video files served with range support`);
  console.log(`🖼️  Image files served with proper MIME types`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID || 'Not configured'}`);
  
  // Log available media files on startup
  try {
    const mediaFiles = [];
    const rootFiles = fs.readdirSync(__dirname);
    rootFiles.forEach(file => {
      if (file.match(/\.(mp4|png|jpg|jpeg|svg)$/i)) {
        mediaFiles.push(`/${file}`);
      }
    });
    
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
      const publicFiles = fs.readdirSync(publicDir);
      publicFiles.forEach(file => {
        if (file.match(/\.(mp4|png|jpg|jpeg|svg)$/i)) {
          mediaFiles.push(`/public/${file}`);
        }
      });
    }
    
    if (mediaFiles.length > 0) {
      console.log(`🎬 Available media files:`);
      mediaFiles.forEach(file => console.log(`   ${file}`));
    }
  } catch (error) {
    console.log('📁 Could not scan for media files:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
