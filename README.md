OnChainIQ Server
Overview
OnChainIQ is a backend server built for a hackathon demo, designed to power a cryptocurrency analysis platform. It provides API endpoints for user authentication, cryptocurrency analysis (IQ scores), news curation, advertisement management, chat interactions, and social features like bookmarks and follows. The server is built using Node.js with Express and connects to a MongoDB database using Mongoose. It integrates with the Sonar API for real-time cryptocurrency data and news.
This project is part of a Vite-React / Node-Express stack, optimized for rapid development and deployment in a hackathon setting.
Features

User Authentication: Demo user access with JWT-based authentication.
IQ Scores: Generates cryptocurrency project analysis scores based on categories like audits and whitepapers.
News Curation: Fetches and curates recent cryptocurrency news articles.
Advertisements: Allows users to create, view, and delete ads with token-based pricing.
Chatbot: Provides a conversational interface for users to query cryptocurrency data and execute commands (e.g., FLASH, MOON).
Social Features: Supports bookmarks, follows, likes, and comments for user engagement.
Rate Limiting: Implements API and action rate limits to prevent abuse.
Security: Uses Helmet, CORS, and input sanitization to enhance security.
Health Checks: Provides a /health endpoint to monitor server and database status.

Tech Stack

Node.js: Runtime environment (v18.0.0 or higher).
Express: Web framework for API routing and middleware.
MongoDB/Mongoose: Database for storing users, posts, and interactions.
Axios: For making HTTP requests to the Sonar API.
JWT (jsonwebtoken): For secure user authentication.
Bcrypt: For password hashing.
Sanitize-HTML: For sanitizing user inputs to prevent XSS.
Helmet: For securing HTTP headers.
CORS: For enabling cross-origin requests from the frontend.
Express-Rate-Limit: For API and action rate limiting.
Date-fns: For date manipulation and validation.
Dotenv: For environment variable management.

Project Structure
onchainiq-server/
├── documentation/           # More documentation and expository files like .env/architecture/apiref/etc.
├── data/                    # Static data files (e.g., backupAds.json, commandServiceMap.json, IQSchema)
├── src/
│   ├── config/              # Database configuration
│   │   └── db.js
│   ├── controllers/         # Request handlers for API endpoints
│   │   ├── adController.js
│   │   ├── authController.js
│   │   ├── bookmarkController.js
│   │   ├── chatController.js
│   │   └── userController.js
│   ├── middleware/          # Custom middleware (e.g., rate limiting, error handling)
│   ├── models/              # Mongoose schemas (e.g., User, AdItem, ChatPost)
│   ├── pipelines/           # MongoDB aggregation pipelines
│   ├── routes/              # Express route definitions
│   ├── services/            # External API integrations (e.g., sonarChatService, sonarIQService)
│   ├── utils/               # Utility functions (e.g., sanitization, response formatting)
│   └── server.js            # Main server entry point
├── .env                     # Environment variables (not committed)
├── package.json             # Project dependencies and scripts
└── README.md                # This file

Prerequisites

Node.js: Version 18.0.0 or higher.
MongoDB: A running MongoDB instance (local or cloud, e.g., MongoDB Atlas).
Sonar API Key: Required for fetching cryptocurrency data and news.
Git: For cloning the repository.

Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd onchainiq-server

2. Install Dependencies
Install the required Node.js packages using npm:
npm install

3. Configure Environment Variables
Create a .env file in the project root based on the provided .env copy template. Populate it with the necessary values:
# .env
INITIAL_TOKEN_BALANCE=50
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
PORT=5001
MONGO_URI=<your-mongodb-connection-string>
DB_NAME=<your-database-name>
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRY=300000m
COOKIE_SECRET=<your-cookie-secret>
DEMO_SECRET_KEY=<your-demo-secret-key>
DEMO_USER_PASSWORD=<your-demo-user-password>
SONAR_API_KEY=<your-sonar-api-key>
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX=10000
ACTION_RATE_LIMIT_WINDOW_MS=900000
ACTION_RATE_LIMIT_MAX=400
SONAR_API_URL=https://api.perplexity.ai/chat/completions
NODE_ENCRYPTION_SECRET=<your-32-bit-encryption-secret>

Notes:

Replace placeholders (e.g., <your-mongodb-connection-string>) with actual values.
Ensure MONGO_URI points to a valid MongoDB instance.
SONAR_API_KEY is required for external API calls.
JWT_SECRET, COOKIE_SECRET, and NODE_ENCRYPTION_SECRET should be strong, unique strings.
CORS_ORIGIN should match your frontend URL (e.g., http://localhost:3000 for local development).

4. Start the Server
Run the server in development mode with hot-reloading:
npm run dev

Or start the server in production mode:
npm start

The server will start on http://localhost:5001 (or the port specified in PORT).
5. Verify Server Status
Check the server health by accessing the health check endpoint:
curl http://localhost:5001/api/v1/health

Expected response (if healthy):
{
  "status": "OK",
  "timestamp": "2025-05-10T12:34:56.789Z",
  "database": {
    "status": "connected",
    "message": "Mongoose connection established.",
    "readyState": 1
  },
  "requestId": "req-abc123"
}

API Endpoints
The API is versioned under /api/v1. Key endpoints include:

Auth:
POST /api/v1/auth/demo: Grants demo user access and returns a JWT.
POST /api/v1/auth/logout: Acknowledges logout (client-side JWT removal).


Ads:
GET /api/v1/ads: Fetches ads for the authenticated user.
POST /api/v1/ads: Creates a new ad (costs 1,000 tokens).
DELETE /api/v1/ads/:id: Deletes an ad and its associated data.
GET /api/v1/ads/slots: Checks available ad slots (max 10).


Bookmarks:
GET /api/v1/bookmarks: Fetches user bookmarks.
POST /api/v1/bookmarks: Adds a bookmark (IQScore, NewsItem, or AdItem).
DELETE /api/v1/bookmarks/:reportId: Removes a bookmark.


Chat:
GET /api/v1/chatbot: Returns the chatbot welcome message.
POST /api/v1/chatbot: Sends a user message and gets a bot response.
POST /api/v1/chatbot/command: Processes a command (e.g., FLASH).
POST /api/v1/chatbot/post: Posts a chat command result to the feed.


Health:
GET /api/v1/health: Returns server and database status.



For a full list of endpoints, refer to the route files in src/routes/.
Development Notes

Linting: Run npm run lint to check code style or npm run lint:fix to auto-fix issues.
Logging: Extensive logging is implemented with sanitized outputs to prevent sensitive data leaks.
Error Handling: A global error handler (src/middleware/errorHandler.js) ensures consistent error responses.
Sanitization: Inputs are sanitized using sanitize-html and custom utilities (src/utils/sanitize.js) to prevent XSS and other attacks.
Rate Limiting: API requests are limited to 10,000 per minute per user/IP, and actions (e.g., ad creation) are limited to 400 per 15 minutes.

Troubleshooting

MongoDB Connection Issues:
Verify MONGO_URI and DB_NAME in .env.
Ensure MongoDB is running and accessible.
Check logs for connection errors.


Sonar API Errors:
Ensure SONAR_API_KEY is valid.
Check for rate limit errors (HTTP 429) in logs.
Verify SONAR_API_URL is correct.


Port Conflicts:
If port 5001 is in use, update PORT in .env or free the port.


CORS Issues:
Ensure CORS_ORIGIN matches your frontend URL exactly.



Hackathon Context
This server is designed for a hackathon demo, prioritizing rapid feature delivery and a robust API for a React frontend. It showcases:

Scalability: MongoDB connection pooling and rate limiting for high traffic.
Security: Input sanitization, secure headers, and JWT authentication.
Real-Time Data: Integration with the Sonar API for fresh cryptocurrency insights.
User Engagement: Social features like bookmarks, ads, and chat to drive interaction.

License
ISC License. See package.json for details.


I did not as of yet wrap with Redis for rate limiting, and for this demo, I dont intend to. 
