/**
 * newsRoutes.js
 * Defines the API routes for the standalone news subsystem.
 * Exposes a single POST /news endpoint for news requests.
 */

import express from 'express';
import { processNewsRequest } from './newsController.js';

const router = express.Router();

/**
 * @route POST /api/v1/news
 * @desc Processes a news request and returns a raw Sonar API response
 * @access Public (no authentication required)
 * @param {Function} processNewsRequest - Controller to process the news request
 * @body {Object} {
 *          interests?: string[], // Array of topics (optional, defaults to 'cryptocurrency market trends')
 *          days?: number         // Number of days to look back (optional, defaults to 7)
 *        }
 * @returns {Object} Raw JSON response from the Sonar API
 */
router.post('/', processNewsRequest);

export default router;