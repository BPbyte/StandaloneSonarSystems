Standalone Chat Subsystem
A lightweight, standalone server-side chat system for cryptocurrency-related queries and commands. This system interacts with the Sonar API to provide general chat responses or raw, structured JSON responses for specific commands (e.g., FLASH, MOON). It requires no authentication, making it easy to set up and use.
Features

General Chat: Ask crypto-related questions and receive concise, expert responses.
Commands: Retrieve raw JSON responses for cryptocurrency characteristics (e.g., FLASH for coins with sharp recoveries, MOON for micro-cap price spikes).
Simple Setup: Run with Node.js, a .env file, and a single Invoke-RestMethod command.
No Authentication: Publicly accessible API endpoint.
Embedded Configurations: All command prompts and schemas are included in the code.

Prerequisites

Node.js: Version 18 or higher.
Sonar API Key: Obtain from Perplexity AI or your Sonar API provider.
npm: For installing dependencies.

Setup

Clone the Repository:
git clone <repository-url>
cd chat-subsystem


Install Dependencies:
npm install


Configure Environment Variables:

Copy .env.example to .env:cp .env.example .env


Edit .env and add your Sonar API key:SONAR_API_KEY=your_sonar_api_key_here




Start the Server:
npm start

The server will run on http://localhost:3000 (or the port specified in .env).


Usage
The server exposes a single endpoint: POST /api/v1/chat. Send a JSON body with either a message (for general chat) or a command (for specific data).
Example: General Chat (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/chat" -Method Post -ContentType "application/json" -Body '{"message": "What is the latest trend in DeFi?"}'

Response:
{
  "sender": "bot",
  "text": "[Varies based on Sonar API, e.g., cross-chain protocols, tokenized assets]"
}

Example: Command (e.g., GREEN) (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/chat" -Method Post -ContentType "application/json" -Body '{"command": "GREEN"}' | ConvertTo-Json -Depth 10

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
        "content": "{\"green_status\":\"Found\",\"coins\":[{\"title\":\"EcoCoin Gains Traction in 2025\",\"summary\":\"EcoCoin, with a market cap of $15M, has seen a 25% increase in active addresses over the past week, driven by its energy-efficient Proof-of-Stake consensus. The coin recorded a 30% transaction growth in 7 days, reflecting strong adoption among eco-conscious investors. Partnerships with green tech firms have boosted its visibility, as reported in recent analyses. Its low carbon footprint makes it a top choice for sustainable crypto investments.\",\"source\":\"https://www.b2bnn.com/2025/03/green-cryptocurrencies-in-2025-promising-trends-and-sustainable-investment-opportunities/\",\"publish_date\":\"05/03/2025\"}],\"reason\":\"\",\"sources\":[\"https://101blockchains.com/best-green-cryptocurrencies/\",\"https://www.tribuneindia.com/partner-exclusives/5-crypto-to-buy-now-new-green-projects-in-2025/\",\"https://www.trgdatacenters.com/resource/most-environment-friendly-cryptocurrencies/\",\"https://www.b2bnn.com/2025/03/green-cryptocurrencies-in-2025-promising-trends-and-sustainable-investment-opportunities/\"]}"
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
  "citations": [
    "https://101blockchains.com/best-green-cryptocurrencies/",
    "https://www.tribuneindia.com/partner-exclusives/5-crypto-to-buy-now-new-green-projects-in-2025/",
    "https://www.trgdatacenters.com/resource/most-environment-friendly-cryptocurrencies/",
    "https://www.b2bnn.com/2025/03/green-cryptocurrencies-in-2025-promising-trends-and-sustainable-investment-opportunities/"
  ]
}

Supported Commands

FLASH: Smaller cryptocurrencies with sharp recovery after a price drop.
GHOST: Low-cap cryptocurrencies with sudden blockchain activity and price gains.
ZOMBIE: Smaller older cryptocurrencies with strong trading activity and price gains.
DROP: Emerging cryptocurrencies with strong airdrop buzz and wallet growth.
MOON: Micro-cap cryptocurrencies with strong price spikes and active development.
DYNAMO: Emerging DeFi cryptocurrencies with strong on-chain activity.
NUGS: Emerging NFT-related cryptocurrencies with strong marketplace activity.
GREEN: Emerging eco-friendly cryptocurrencies with strong adoption.
MEME: Emerging meme coins with strong social media hype.
STABLE: Lesser-known stablecoins with notable supply growth and high trading volume.
PUMP: Mid-cap cryptocurrencies with over 15% price surge and strong wallet holder retention.

Project Structure
chat-subsystem/
├── server.js              # Entry point for the Express server
├── sonarChatService.js    # Handles Sonar API calls with embedded configs
├── chatController.js      # Processes chat and command requests
├── chatRoutes.js          # Defines API routes
├── .env.example           # Template for environment variables
├── package.json           # Project dependencies and scripts
├── README.md              # This file
└── cmds.md                # Test commands for PowerShell

Dependencies

express: Web framework for Node.js.
axios: HTTP client for Sonar API requests.
dotenv: Loads environment variables from .env.

Troubleshooting

Missing API Key: Ensure SONAR_API_KEY is set in .env.
Empty Response Content: If choices[0].message.content is empty, check server logs for [SonarChatService] errors and verify SONAR_API_KEY.
Rate Limits: A 429 error indicates Sonar API rate limits; wait and retry.
Server Not Starting: Check for port conflicts or missing dependencies (npm install).
PowerShell Truncation: Pipe responses to ConvertTo-Json -Depth 10 to view full output.


Contributing
Submit issues or pull requests to the repository, ensuring changes align with the original system’s functionality.
License
MIT License. See LICENSE file for details.
