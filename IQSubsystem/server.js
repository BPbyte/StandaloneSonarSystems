/**
 * server.js
 * Entry point for the standalone IQScore subsystem server.
 * Sets up an Express server, loads environment variables, and mounts IQScore routes.
 * No authentication is required, making it simple to use.
 */

import express from 'express';
import dotenv from 'dotenv';
import iqScoreRoutes from './iqScoreRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount IQScore routes at /api/v1/iqscore
app.use('/api/v1/iqscore', iqScoreRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'IQScore server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`[Server] IQScore server running on port ${PORT}`);
});