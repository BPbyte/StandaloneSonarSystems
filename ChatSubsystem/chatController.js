/**
 * chatController.js
 * Handles chat and command requests, interfacing with sonarChatService.
 * Validates inputs and returns responses for the standalone chat subsystem.
 * For commands, returns the raw JSON response from the Sonar API.
 */

import * as sonarChatService from './sonarChatService.js';

/**
 * Processes a chat or command request and returns a response.
 * @param {Object} req - Express request object, containing message or command in body.
 * @param {Object} res - Express response object for sending the response.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Promise<void>} Resolves with the response or passes errors to next middleware.
 */
export const processChatRequest = async (req, res, next) => {
  const LOG_PREFIX = '[ChatController]';
  const { message, command } = req.body;

  // Validate input: either message or command must be provided, but not both
  if (!message && !command) {
    console.error(`${LOG_PREFIX} Invalid input: Either message or command must be provided`);
    return res.status(400).json({ message: 'Either message or command must be provided.', errorCode: 'INVALID_INPUT' });
  }
  if (message && command) {
    console.error(`${LOG_PREFIX} Invalid input: Cannot provide both message and command`);
    return res.status(400).json({ message: 'Cannot provide both message and command.', errorCode: 'INVALID_INPUT' });
  }

  try {
    if (message) {
      // Handle general chat message
      if (typeof message !== 'string' || message.trim().length === 0) {
        console.error(`${LOG_PREFIX} Invalid message: Empty or not a string`);
        return res.status(400).json({ message: 'Message text cannot be empty.', errorCode: 'INVALID_CHAT_INPUT' });
      }
      const trimmedMessage = message.trim();
      if (trimmedMessage.length > 1000) {
        console.error(`${LOG_PREFIX} Message too long: ${trimmedMessage.length} characters`);
        return res.status(400).json({ message: 'Message text exceeds maximum length (1000 characters).', errorCode: 'CHAT_INPUT_TOO_LONG' });
      }

      const responseText = await sonarChatService.fetchChatResponse(trimmedMessage);
      if (!responseText || typeof responseText !== 'string' || responseText.trim().length === 0) {
        console.error(`${LOG_PREFIX} Received empty or invalid response from chat service`);
        const error = new Error('Chatbot service returned an invalid response.');
        error.statusCode = 502;
        error.errorCode = 'CHAT_SERVICE_INVALID_RESPONSE';
        return next(error);
      }

      console.log(`${LOG_PREFIX} Returning chat response, length: ${responseText.trim().length} chars`);
      res.status(200).json({ sender: 'bot', text: responseText.trim() });
    } else {
      // Handle command
      const trimmedCommand = command.trim().toUpperCase();
      const validCommands = Object.keys(sonarChatService.COMMAND_CONFIGS);
      if (!validCommands.includes(trimmedCommand)) {
        console.error(`${LOG_PREFIX} Invalid command: ${trimmedCommand}`);
        return res.status(400).json({
          message: `Invalid command. Expected one of ${validCommands.join(', ')}, got '${command}'.`,
          errorCode: 'INVALID_COMMAND'
        });
      }

      const rawResponse = await sonarChatService.fetchCommandResponse(trimmedCommand);
      console.log(`${LOG_PREFIX} Returning raw command response for ${trimmedCommand}, keys: ${Object.keys(rawResponse).join(', ')}, choices: ${rawResponse.choices?.length || 0}`);
      res.status(200).json(rawResponse);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error processing request: ${error.message}`, { stack: error.stack });
    error.statusCode = error.statusCode || 500;
    error.errorCode = error.errorCode || 'PROCESS_CHAT_ERROR';
    next(error);
  }
};