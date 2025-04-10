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
    /^exp:\/\/.*$/,       // All Expo URLs
    /^http:\/\/localhost:.*/, // All localhost URLs
    /^http:\/\/192\.168\.1\..*/ // All local network IPs
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
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
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT} or http://192.168.1.80:${PORT}`);
});