import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './server/config/db.js';
import { seedDatabase } from './server/utils/seed.js';

import classRoutes from './server/routes/classRoutes.js';
import studentRoutes from './server/routes/studentRoutes.js';
import teacherRoutes from './server/routes/teacherRoutes.js';
import subjectRoutes from './server/routes/subjectRoutes.js';
import attendanceRoutes from './server/routes/attendanceRoutes.js';
import settingRoutes from './server/routes/settingRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database and Seed initial data
await connectDB();
await seedDatabase();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend files
app.use(express.static(__dirname));

// API Routes
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Wackha Hajar App Full Stack Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route sends index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
