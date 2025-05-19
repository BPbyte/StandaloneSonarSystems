/**
 * iqScoreController.js
 * Handles IQScore requests, interfacing with sonarIQService.
 * Validates inputs and returns raw Sonar API responses for multiple categories.
 */

import * as sonarIQService from './sonarIQService.js';

// Valid categories from CATEGORY_CONFIGS
const VALID_CATEGORIES = [
  'audit', 'code_quality', 'ecosystem_adoption', 'goal', 'governance', 'market',
  'regulatory_compliance', 'scam', 'sentiment', 'team', 'tokenomics', 'value', 'whitepaper'
];

/**
 * Processes an IQScore request and returns raw Sonar API responses for specified categories.
 * @param {Object} req - Express request object, containing asset, network, and categories in body.
 * @param {Object} res - Express response object for sending the response.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} Resolves with the raw responses or passes errors to next middleware.
 */
export const processIQScoreRequest = async (req, res, next) => {
  const LOG_PREFIX = '[IQScoreController]';
  const { asset, network, categories } = req.body;

  // Validate input
  if (!asset || !network) {
    console.error(`${LOG_PREFIX} Invalid input: Asset and network are required`);
    return res.status(400).json({ message: 'Asset and network are required.', errorCode: 'INVALID_INPUT' });
  }

  if (typeof asset !== 'string' || asset.trim().length === 0 || asset.trim().length > 100) {
    console.error(`${LOG_PREFIX} Invalid asset: ${asset}`);
    return res.status(400).json({ message: 'Asset must be a string between 1 and 100 characters.', errorCode: 'INVALID_ASSET' });
  }

  if (typeof network !== 'string' || network.trim().length === 0 || network.trim().length > 100) {
    console.error(`${LOG_PREFIX} Invalid network: ${network}`);
    return res.status(400).json({ message: 'Network must be a string between 1 and 100 characters.', errorCode: 'INVALID_NETWORK' });
  }

  // Validate categories
  let selectedCategories = Array.isArray(categories) && categories.length > 0 ? categories : VALID_CATEGORIES;
  selectedCategories = selectedCategories.map(c => c.toLowerCase());
  const invalidCategories = selectedCategories.filter(c => !VALID_CATEGORIES.includes(c));
  if (invalidCategories.length > 0) {
    console.error(`${LOG_PREFIX} Invalid categories: ${invalidCategories.join(', ')}`);
    return res.status(400).json({
      message: `Invalid categories: ${invalidCategories.join(', ')}. Must be one of ${VALID_CATEGORIES.join(', ')}.`,
      errorCode: 'INVALID_CATEGORIES'
    });
  }

  try {
    console.log(`${LOG_PREFIX} Processing IQScore request for asset: ${asset}, network: ${network}, categories: ${selectedCategories.join(', ')}`);

    // Fetch responses for all categories concurrently
    const analysisPromises = selectedCategories.map(category =>
      sonarIQService.fetchCategoryResponse(asset.trim(), network.trim(), category)
        .then(response => ({ category, status: 'success', response }))
        .catch(error => ({ category, status: 'error', response: { error: error.message } }))
    );

    const analysisResults = await Promise.allSettled(analysisPromises);
    const results = {};

    analysisResults.forEach(result => {
      if (result.status === 'fulfilled') {
        const { category, status, response } = result.value;
        results[category] = { status, response };
        console.log(`${LOG_PREFIX} Fetched ${category}: Status=${status}`);
      } else {
        const category = result.reason?.category || 'unknown';
        const error = result.reason?.message || 'Unknown error';
        results[category] = { status: 'error', response: { error } };
        console.error(`${LOG_PREFIX} Failed to fetch ${category}: ${error}`);
      }
    });

    console.log(`${LOG_PREFIX} Returning raw responses for ${selectedCategories.length} categories`);
    res.status(200).json({ results });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error processing request: ${error.message}`, { stack: error.stack });
    const statusCode = error.message.includes('API key') ? 401 : error.message.includes('rate limit') ? 429 : 500;
    const errorCode = error.message.includes('API key') ? 'AUTH_FAILED' : error.message.includes('rate limit') ? 'RATE_LIMIT_EXCEEDED' : 'PROCESS_IQSCORE_ERROR';
    res.status(statusCode).json({ message: error.message, errorCode });
  }
};