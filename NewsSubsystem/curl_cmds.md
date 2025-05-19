News Subsystem Test Commands (curl)
This file provides curl commands to test the standalone news subsystem for cryptocurrency news curation. The subsystem fetches raw Sonar API responses for specified topics. Commands assume the server is running locally on http://localhost:3000. Ensure SONAR_API_KEY is set in your .env file.
Prerequisites

Server Running: Start the server in the project directory:cd /path/to/news-subsystem
npm start

On Windows:cd C:\dir
npm start


curl: Ensure curl is installed (pre-installed on Unix-like systems; on Windows, use Git Bash, WSL, or PowerShell).
.env: Ensure SONAR_API_KEY is set in .env:SONAR_API_KEY=your_sonar_api_key_here
PORT=3000



Running Commands

Open a terminal (e.g., Git Bash, WSL, or PowerShell on Windows; terminal on macOS/Linux).
Navigate to the project directory (optional):

cd /path/to/news-subsystem

  On Windows:
cd C:\dir


Ensure the server is running (check for [Server] News server running on port 3000).
Copy and paste each curl command below into the terminal and press Enter.
On Windows, use double quotes for -d payloads and run in Git Bash for best results.

Health Check
Test the server’s health check endpoint.
curl -X GET "http://localhost:3000/health"

Expected Response:
{
  "status": "OK",
  "message": "News server is running"
}

News Queries
Test news curation with different interests and days. The interests field is optional (defaults to ["cryptocurrency market trends"]), and days is optional (defaults to 7). Interests must match the allowed list in sonarNewsService.js (e.g., DeFi, NFT, Blockchain). Responses may be long; redirect to a file or use a JSON viewer.
Single Interest (DeFi, 7 days)
Fetch news for a single topic.
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"DeFi\"], \"days\": 7}"

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

Multiple Interests (DeFi, NFT, 14 days)
Fetch news for multiple topics.
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"DeFi\", \"NFT\"], \"days\": 14}"

Expected Response: Similar to above, with articles covering DeFi and NFT topics.
Default Interests (7 days)
Fetch news with the default topic (cryptocurrency market trends).
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"days\": 7}"

Expected Response: Similar to above, with articles on cryptocurrency market trends.
Invalid Input Tests
Test error handling for invalid inputs.
Missing Interests and Days
Test with an empty body (expects error).
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{}"

Expected Response:
{
  "message": "Either interests or days must be provided.",
  "errorCode": "INVALID_INPUT"
}

Invalid Days (e.g., 31)
Test with an out-of-range days value.
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"DeFi\"], \"days\": 31}"

Expected Response:
{
  "message": "Days must be between 1 and 30.",
  "errorCode": "INVALID_DAYS"
}

Invalid Interest
Test with an invalid interest not in ALLOWED_INTERESTS.
curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"InvalidTopic\"], \"days\": 7}"

Expected Response:
{
  "message": "Invalid interest: InvalidTopic. Must be one of Web3, Blockchain, DeFi, ...",
  "errorCode": "PROCESS_NEWS_ERROR"
}

Notes

API Key: Ensure SONAR_API_KEY is valid in .env. A 401 error indicates an invalid key.
Response Structure: Responses include id, object, created, model, choices, usage, citations. The choices[0].message.content field contains JSON with news_status, articles, reason, sources.
Case Sensitivity: Interests must match ALLOWED_INTERESTS exactly (case-sensitive, e.g., DeFi, not defi).
Windows Compatibility: Use double quotes for -d payloads. Run in Git Bash, WSL, or PowerShell.

Troubleshooting

Empty Message Content: If choices[0].message.content is empty, check logs for [SonarNewsService] errors (e.g., [SonarNewsService] Attempt X failed). Verify SONAR_API_KEY and try another interest (e.g., Blockchain). Share logs with the full response.
Server Not Running: Ensure npm start is running. Check logs for errors (e.g., missing SONAR_API_KEY).
Connection Issues: Verify port 3000 is open:netstat -an | grep 3000

On Windows:netstat -an | findstr 3000


Invalid API Key: A 401 response indicates an invalid SONAR_API_KEY. Check .env.
Rate Limits: A 429 response means the rate limit is exceeded; wait and retry.
JSON Errors: Ensure proper quoting in -d. For Windows PowerShell:curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d '{"interests": ["DeFi"], "days": 7}'


Verbose Output: Add -v for detailed errors:curl -v -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"DeFi\"], \"days\": 7}"


Response Truncation: Redirect to a file:curl -X POST "http://localhost:3000/api/v1/news" -H "Content-Type: application/json" -d "{\"interests\": [\"DeFi\"], \"days\": 7}" > response.json



