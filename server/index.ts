// server/index.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import roundRoutes from './routes/rounds';
import goalRoutes from './routes/goals';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI must be defined in environment variables');
}

// Configure CORS - allow connections from any origin while developing
app.use(cors({
  origin: [
    'http://localhost:19006', 
    'http://localhost:19000', 
    'exp://localhost:19000',
    'http://localhost:8081',
    'exp://192.168.1.1:19000',
    'exp://192.168.1.1:19001',
    'http://192.168.1.80:19000',
    'http://192.168.1.80:19006',
    'exp://192.168.1.80:19000',
    'exp://192.168.1.80:19001',
    'http://192.168.1.142:19000',
    'http://192.168.1.142:19006',
    'exp://192.168.1.142:19000',
    'exp://192.168.1.142:19001',
    'http://192.168.1.242:19000',
    'http://192.168.1.242:19006',
    'exp://192.168.1.242:19000',
    'exp://192.168.1.242:19001',
    /^exp:\/\/.*$/,       // All Expo URLs
    /^http:\/\/localhost:.*/, // All localhost URLs
    /^http:\/\/192\.168\..*/, // All 192.168 local network IPs
    /^http:\/\/10\..*/, // All 10.x.x.x local network IPs
    /^http:\/\/172\..*/ // All 172.x.x.x local network IPs
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/goals', goalRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Root API endpoint for connection testing
app.get('/api', (req, res) => {
  res.json({
    status: 'API is working',
    timestamp: new Date().toISOString(),
    message: 'HandiMan API is running correctly',
    endpoints: ['/api/auth', '/api/courses', '/api/rounds', '/api/goals']
  });
});

// API debug endpoint
app.get('/api/debug', (req, res) => {
  console.log('Debug route accessed');
  console.log('Headers:', req.headers);
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    routes: [
      { path: '/api/auth', methods: ['GET', 'POST'] },
      { path: '/api/courses', methods: ['GET', 'POST'] },
      { path: '/api/rounds', methods: ['GET', 'POST', 'DELETE'] },
      { path: '/api/goals', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      { path: '/api/goals/test', methods: ['GET'] }
    ]
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server - Listen on all interfaces to make it accessible over the network
const server = app.listen(PORT, '0.0.0.0', () => {
  // Get the local IP address to help with connections
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = Object.create(null);
  
  // Find all network interfaces
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  console.log(`Server running on port ${PORT}`);
  console.log('Available on:');
  console.log(`- http://localhost:${PORT} (local only)`);
  
  // List all available IP addresses for easy connection
  for (const name of Object.keys(results)) {
    for (const ip of results[name]) {
      console.log(`- http://${ip}:${PORT} (for network access)`);
    }
  }
  
  console.log('\nTo use with Expo Go, update your .env file:');
  console.log('EXPO_PUBLIC_API_URL="http://YOUR_IP_ADDRESS:3000/api"\n');
  console.log('Make sure your phone and laptop are on the same WiFi network');
});