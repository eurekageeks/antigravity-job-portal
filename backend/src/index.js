const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure all responses have CORS headers + are JSON-parseable
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Always attach Content-Type JSON for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// 404 handler for unknown API routes — always returns JSON
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler — always returns JSON body
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

