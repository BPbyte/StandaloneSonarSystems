Chat Subsystem Test Commands (curl)
This file provides curl commands to test the standalone chat subsystem for cryptocurrency queries and commands. The subsystem matches the original system’s functionality, with authentication removed and raw Sonar API responses for commands. Commands assume the server is running locally on http://localhost:3000. Ensure SONAR_API_KEY is set in your .env file.
Prerequisites

Server Running: Start the server in the project directory:cd /path/to/chat-subsystem
npm start

On Windows:cd C:\dir
npm start


curl: Ensure curl is installed (pre-installed on most Unix-like systems; on Windows, use Git Bash, WSL, or PowerShell).
.env: Ensure SONAR_API_KEY is set in .env:SONAR_API_KEY=your_sonar_api_key_here
PORT=3000



Running Commands

Open a terminal (e.g., Git Bash, WSL, or PowerShell on Windows; terminal on macOS/Linux).
Navigate to the project directory (optional if running commands from anywhere):

cd /path/to/chat-subsystem

  On Windows:
cd C:\dir


Ensure the server is running (check for [Server] Chat server running on port 3000).
Copy and paste each curl command below into the terminal and press Enter.
On Windows, use double quotes and ensure curl is accessible (e.g., via Git Bash).

Health Check
Test the server’s health check endpoint.
curl -X GET "http://localhost:3000/health"

Expected Response:
{
  "status": "OK",
  "message": "Chat server is running"
}

General Chat
Test general chat with a crypto-related question.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"message\": \"What are the latest trends in decentralized finance?\"}"

Expected Response:
{
  "sender": "bot",
  "text": "[Varies based on Sonar API, e.g., cross-chain protocols, tokenized assets]"
}

Command Tests
Test commands to retrieve raw Sonar API responses, including choices[0].message.content with schema-compliant JSON (e.g., [command]_status, coins, reason, sources). Responses may be long; redirect to a file or use a JSON viewer for clarity.
FLASH
Identifies smaller cryptocurrencies with sharp recovery after a price drop.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"FLASH\"}"

Expected Response (example):
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1747351425,
  "model": "sonar",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"flash_status\":\"Not Found\",\"coins\":[],\"reason\":\"No coins found matching criteria\",\"sources\":[]}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 50,
    "total_tokens": 200,
    "search_context_size": "low"
  },
  "citations": []
}

Or, if coins are found:
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
        "content": "{\"flash_status\":\"Found\",\"coins\":[{\"title\":\"XYZ Coin Recovery Surge\",\"summary\":\"XYZ Coin, with a market cap of $10M, saw a 15% price drop in the last 12 hours but recovered 8% in the past 2 hours. Positive sentiment on X, with a sentiment score of 0.75, indicates growing community support. The recovery is linked to a recent partnership announcement with a DeFi protocol, boosting investor confidence. Active addresses increased by 20% in the last day, reflecting heightened interest.\",\"source\":\"https://example.com/news/xyz-coin\",\"publish_date\":\"05/03/2025\"}],\"reason\":\"\",\"sources\":[\"https://example.com/source1\",\"https://example.com/source2\"]}"
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
  "citations": ["https://example.com/source1", "https://example.com/source2"]
}

GHOST
Identifies low-cap cryptocurrencies with sudden blockchain activity and price gains.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"GHOST\"}"

Expected Response: Similar to FLASH, with ghost_status, coins, reason, sources in content.
ZOMBIE
Identifies smaller older cryptocurrencies with strong trading activity and price gains.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"ZOMBIE\"}"

Expected Response: Similar to FLASH, with zombie_status, coins, reason, sources.
DROP
Identifies emerging cryptocurrencies with strong airdrop buzz and wallet growth.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"DROP\"}"

Expected Response: Similar to FLASH, with drop_status, coins, reason, sources.
MOON
Identifies micro-cap cryptocurrencies with strong price spikes and active development.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"MOON\"}"

Expected Response: Similar to FLASH, with moon_status, coins, reason, sources.
DYNAMO
Identifies emerging DeFi cryptocurrencies with strong on-chain activity.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"DYNAMO\"}"

Expected Response: Similar to FLASH, with dynamo_status, coins, reason, sources.
NUGS
Identifies emerging NFT-related cryptocurrencies with strong marketplace activity.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"NUGS\"}"

Expected Response: Similar to FLASH, with nugs_status, coins, reason, sources.
GREEN
Identifies emerging eco-friendly cryptocurrencies with strong adoption.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"GREEN\"}"

Expected Response:
{
  "id": "61e8b633-92ac-449d-86aa-664163085ae5",
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

MEME
Identifies emerging meme coins with strong social media hype.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"MEME\"}"

Expected Response: Similar to FLASH, with meme_status, coins, reason, sources.
STABLE
Identifies lesser-known stablecoins with notable supply growth and high trading volume.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"STABLE\"}"

Expected Response: Similar to FLASH, with stable_status, coins, reason, sources.
PUMP
Identifies mid-cap cryptocurrencies with over 15% price surge and strong wallet holder retention.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"PUMP\"}"

Expected Response: Similar to FLASH, with pump_status, coins, reason, sources.
Invalid Input Test
Test error handling with invalid input.
curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{}"

Expected Response:
{
  "message": "Either message or command must be provided.",
  "errorCode": "INVALID_INPUT"
}

Notes

API Key: Ensure SONAR_API_KEY is valid in .env. A 401/403 error indicates an invalid key.
Response Structure: Commands return raw JSON with id, object, created, model, choices, usage, citations. The choices[0].message.content field contains schema-compliant JSON (e.g., {[command]_status, coins, reason, sources}).
Case Insensitivity: Commands are case-insensitive (e.g., green, GREEN).
Windows Compatibility: Use double quotes for -d payloads. Run in Git Bash, WSL, or PowerShell for best results.

Troubleshooting

Empty Message Content: If choices[0].message.content is empty, check logs for [SonarChatService] errors (e.g., [SonarChatService] Attempt X failed). Verify SONAR_API_KEY and try another command. Share logs with the full response.
Server Not Running: Ensure npm start is running. Check logs for errors.
Connection Issues: Verify port 3000 is open:netstat -an | grep 3000

On Windows:netstat -an | findstr 3000


Invalid API Key: A 401/403 response indicates an invalid SONAR_API_KEY. Check .env.
Rate Limits: A 429 response means the rate limit is exceeded; wait and retry.
JSON Errors: Ensure proper quoting in -d. For Windows PowerShell, try:curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d '{"command": "GREEN"}'


Verbose Output: Add -v for detailed errors:curl -v -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"GREEN\"}"


Response Truncation: Redirect to a file to view full output:curl -X POST "http://localhost:3000/api/v1/chat" -H "Content-Type: application/json" -d "{\"command\": \"GREEN\"}" > response.json



