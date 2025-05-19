/**
 * iqScoreRoutes.js
 * Defines the API routes for the standalone IQScore subsystem.
 * Exposes a single POST /iqscore endpoint for score requests.
 */

import express from 'express';
import { processIQScoreRequest } from './iqScoreController.js';

const router = express.Router();

/**
 * @route POST /api/v1/iqscore
 * @desc Processes an IQScore request and returns raw Sonar API responses for specified categories
 * @access Public (no authentication required)
 * @param {Function} processIQScoreRequest - Controller to process the IQScore request
 * @body {Object} {
 *          asset: string, // Blockchain project name (required)
 *          network: string, // Blockchain network name (required)
 *          categories?: string[] // Array of categories (optional, defaults to all)
 *        }
 * @returns {Object} Object with raw responses for each category
 */
router.post('/', processIQScoreRequest);

export default router;