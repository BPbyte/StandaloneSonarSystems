Standalone News Subsystem
A lightweight, standalone server-side news system for curating cryptocurrency-related articles using the Sonar API. This system fetches raw, structured JSON responses for specified topics, requiring no authentication for public access.
Features

News Curation: Fetch recent articles for crypto topics (e.g., DeFi, NFTs) with detailed summaries and sources.
Raw Responses: Returns unparsed Sonar API responses, including choices, usage, and citations.
Simple Setup: Run with Node.js, a .env file, and a single Invoke-RestMethod or curl command.
No Authentication: Publicly accessible API endpoint.
Embedded Configurations: All allowed interests are included in the code.

Prerequisites

Node.js: Version 18 or higher.
Sonar API Key: Obtain from Perplexity AI or your Sonar API provider.
npm: For installing dependencies.

Setup

Clone the Repository:
git clone <repository-url>
cd news-subsystem


Install Dependencies:
npm install


Configure Environment Variables:

Copy .env.example to .env:cp .env.example .env


Edit .env and add your Sonar API key:SONAR_API_KEY=your_sonar_api_key_here




Start the Server:
npm start

The server will run on http://localhost:3000 (or the port specified in .env).


Usage
The server exposes a single endpoint: POST /api/v1/news. Send a JSON body with interests (array of topics) and days (lookback period).
Example: News Query (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/news" -Method Post -ContentType "application/json" -Body '{"interests": ["DeFi", "NFT"], "days": 7}' | ConvertTo-Json -Depth 10

Response:
{
  "id": "chatcmpl-xyz789",
  "object": "chat.completion",
  "created": 1747351425,
  "model": "sonar",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"news_status\":\"Content Found\",\"articles\":[{\"title\":\"DeFi Lending Surges in 2025\",\"summary\":\"DeFi lending protocols like Aave and Compound have seen a 40% increase in TVL in the past week, driven by new yield farming opportunities. The trend is fueled by cross-chain integrations, allowing users to leverage assets across Ethereum and Layer 2 solutions. Recent X posts highlight strong community support, with 10,000 mentions in 24 hours.\",\"url\":\"https://example.com/defi-news\",\"publish_date\":\"05/03/2025\",\"source\":\"example.com\"}],\"reason\":\"\",\"sources\":[\"https://example.com/defi-news\"]}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 232,
    "completion_tokens": 739,
    "total_tokens": 971,
    "search_context_size": "low"
  },
  "citations": ["https://example.com/defi-news"]
}

Example: News Query (curl)
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"DeFi\", \"NFT\"], \"days\": 7}"

Supported Interests
See sonarNewsService.js for the full list of allowed interests, including:

Web3
Blockchain
DeFi
NFT
Decentralized Identity
DAO Governance Tools
And more...

Project Structure
news-subsystem/
├── server.js              # Entry point for the Express server
├── sonarNewsService.js    # Handles Sonar API calls with embedded configs
├── newsController.js      # Processes news requests
├── newsRoutes.js          # Defines API routes
├── .env.example           # Template for environment variables
├── package.json           # Project dependencies and scripts
├── README.md              # This file
├── invoke_cmds.md         # PowerShell test commands
├── curl_cmds.md           # curl test commands
├── developer_notes.md     # Developer insights

Dependencies

express: Web framework for Node.js.
axios: HTTP client for Sonar API requests.
dotenv: Loads environment variables from .env.

Troubleshooting

Missing API Key: Ensure SONAR_API_KEY is set in .env.
Empty Response Content: If choices[0].message.content is empty, check server logs for [SonarNewsService] errors and verify SONAR_API_KEY.
Rate Limits: A 429 error indicates Sonar API rate limits; wait and retry.
Server Not Starting: Check for port conflicts or missing dependencies (npm install).
PowerShell Truncation: Pipe responses to ConvertTo-Json -Depth 10.

Contributing
Submit issues or pull requests to the repository, ensuring changes align with the original system’s functionality.
License
MIT License. See LICENSE file for details.
