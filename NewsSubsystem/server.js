/**
 * server.js
 * Entry point for the standalone news subsystem server.
 * Sets up an Express server, loads environment variables, and mounts news routes.
 * No authentication is required, making it simple to use.
 */

import express from 'express';
import dotenv from 'dotenv';
import newsRoutes from './newsRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount news routes at /api/v1/news
app.use('/api/v1/news', newsRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'News server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`[Server] News server running on port ${PORT}`);
});