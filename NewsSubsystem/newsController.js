/**
 * newsController.js
 * Handles news requests, interfacing with sonarNewsService.
 * Validates inputs and returns raw Sonar API responses.
 */

import * as sonarNewsService from './sonarNewsService.js';

/**
 * Processes a news request and returns the raw Sonar API response.
 * @param {Object} req - Express request object, containing interests and days in body.
 * @param {Object} res - Express response object for sending the response.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} Resolves with the raw response or passes errors to next middleware.
 */
export const processNewsRequest = async (req, res, next) => {
  const LOG_PREFIX = '[NewsController]';
  const { interests, days } = req.body;

  // Validate input
  if (!interests && !days) {
    console.error(`${LOG_PREFIX} Invalid input: Either interests or days must be provided`);
    return res.status(400).json({ message: 'Either interests or days must be provided.', errorCode: 'INVALID_INPUT' });
  }

  try {
    // Validate interests
    let interestArray = Array.isArray(interests) ? interests : interests ? [interests] : ['cryptocurrency market trends'];
    if (interestArray.length === 0) {
      interestArray = ['cryptocurrency market trends'];
    }

    // Validate days
    const targetDays = parseInt(days, 10) || 7;
    if (targetDays < 1 || targetDays > 30) {
      console.error(`${LOG_PREFIX} Invalid days: ${days}`);
      return res.status(400).json({ message: 'Days must be between 1 and 30.', errorCode: 'INVALID_DAYS' });
    }

    console.log(`${LOG_PREFIX} Processing news request for interests: ${interestArray.join(', ')}, days: ${targetDays}`);
    const rawResponse = await sonarNewsService.fetchNewsRaw(interestArray, targetDays);
    console.log(`${LOG_PREFIX} Returning raw response, keys: ${Object.keys(rawResponse).join(', ')}`);
    res.status(200).json(rawResponse);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error processing request: ${error.message}`, { stack: error.stack });
    const statusCode = error.message.includes('API key') ? 401 : error.message.includes('rate limit') ? 429 : 500;
    const errorCode = error.message.includes('API key') ? 'AUTH_FAILED' : error.message.includes('rate limit') ? 'RATE_LIMIT_EXCEEDED' : 'PROCESS_NEWS_ERROR';
    res.status(statusCode).json({ message: error.message, errorCode });
  }
};