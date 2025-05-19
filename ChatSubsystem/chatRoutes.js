/**
 * chatRoutes.js
 * Defines the API routes for the standalone chat subsystem.
 * Exposes a single POST /chat endpoint for chat and command requests.
 */

import express from 'express';
import { processChatRequest } from './chatController.js';

const router = express.Router();

/**
 * @route POST /api/v1/chat
 * @desc Processes a chat message or command and returns a response
 * @access Public (no authentication required)
 * @param {Function} processChatRequest - Controller to process the chat or command request
 * @body {Object} {
 *          message?: string, // General chat message (optional)
 *          command?: string  // Command name (e.g., 'FLASH', 'MOON') (optional)
 *        }
 * @returns {Object} Response with sender and text (for chat) or raw JSON (for commands)
 */
router.post('/', processChatRequest);

export default router;