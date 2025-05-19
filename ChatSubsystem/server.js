/**
 * server.js
 * Entry point for the standalone chat subsystem server.
 * Sets up an Express server, loads environment variables, and mounts chat routes.
 * No authentication is required, making it simple to use.
 */

import express from 'express';
import dotenv from 'dotenv';
import chatRoutes from './chatRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount chat routes at /api/v1/chat
app.use('/api/v1/chat', chatRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Chat server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`[Server] Chat server running on port ${PORT}`);
});