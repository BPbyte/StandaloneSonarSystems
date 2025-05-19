IQScore Subsystem Test Commands (curl)
This file provides curl commands to test the standalone IQScore subsystem for blockchain project analysis. The subsystem fetches raw Sonar API responses for specified categories. Commands assume the server is running locally on http://localhost:3000. Ensure SONAR_API_KEY is set in your .env file.
Prerequisites

Server Running: Start the server in the project directory:cd /path/to/iqscore-subsystem
npm start

On Windows:cd C:\dir
npm start


curl: Ensure curl is installed (pre-installed on Unix-like systems; on Windows, use Git Bash, WSL, or PowerShell).
.env: Ensure SONAR_API_KEY is set in .env:SONAR_API_KEY=your_sonar_api_key_here
PORT=3000



Running Commands

Open a terminal (e.g., Git Bash, WSL, or PowerShell on Windows; terminal on macOS/Linux).
Navigate to the project directory (optional):cd /path/to/iqscore-subsystem

On Windows:cd C:\dir


Ensure the server is running (check for [Server] IQScore server running on port 3000).
Copy and paste each curl command below into the terminal and press Enter.
On Windows, use double quotes for -d payloads and run in Git Bash for best results. Responses may be long; redirect to a file or use a JSON viewer.

Health Check
Test the server’s health check endpoint.
curl -X GET "http://localhost:3000/health"

Expected Response:
{
  "status": "OK",
  "message": "IQScore server is running"
}

IQScore Queries
Test score generation for different assets, networks, and categories. The asset and network fields are required; categories is optional (defaults to all). Categories must be from: audit, code_quality, ecosystem_adoption, goal, governance, market, regulatory_compliance, scam, sentiment, team, tokenomics, value, whitepaper.
Single Category (Audit)
Fetch score for the Audit category.
curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\", \"categories\": [\"audit\"]}"

Expected Response (example):
{
  "results": {
    "audit": {
      "status": "success",
      "response": {
        "id": "chatcmpl-abc123",
        "object": "chat.completion",
        "created": 1747351425,
        "model": "sonar-pro",
        "choices": [
          {
            "index": 0,
            "message": {
              "role": "assistant",
              "content": "{\"audit_status\":\"Found\",\"audits\":[{\"firm\":\"Certik\",\"year\":2024,\"scope\":\"token minting\",\"findings\":{\"critical\":0,\"high\":1,\"medium\":2,\"low\":3,\"informational\":5,\"resolved\":true},\"source\":\"https://example.com/certik-report.pdf\",\"score\":95}],\"final_score\":95,\"reason\":\"\",\"sources\":[\"https://example.com/certik-report.pdf\"]}"
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
        "citations": ["https://example.com/certik-report.pdf"]
      }
    }
  }
}

Multiple Categories (Audit, Whitepaper)
Fetch scores for multiple categories.
curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\", \"categories\": [\"audit\", \"whitepaper\"]}"

Expected Response: Similar to above, with responses for audit and whitepaper.
All Categories
Fetch scores for all categories (default).
curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\"}"

Expected Response: Similar to above, with responses for all 13 categories.
Invalid Input Tests
Test error handling for invalid inputs.
Missing Asset and Network
Test with missing required fields.
curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{}"

Expected Response:
{
  "message": "Asset and network are required.",
  "errorCode": "INVALID_INPUT"
}

Invalid Category
Test with an invalid category.
curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\", \"categories\": [\"invalid\"]}"

Expected Response:
{
  "message": "Invalid categories: invalid. Must be one of audit, code_quality, ecosystem_adoption, goal, governance, market, regulatory_compliance, scam, sentiment, team, tokenomics, value, whitepaper.",
  "errorCode": "INVALID_CATEGORIES"
}

Notes

API Key: Ensure SONAR_API_KEY is valid in .env. A 401 error indicates an invalid key.
Response Structure: Responses include results with a key for each category, containing status (success or error) and response (raw API data or error message).
Case Sensitivity: Categories are case-insensitive (e.g., Audit, audit).
Windows Compatibility: Use double quotes for -d payloads. Run in Git Bash, WSL, or PowerShell.

Troubleshooting

Empty Message Content: If choices[0].message.content is empty, check logs for [SonarIQService] errors (e.g., [SonarIQService] Attempt X failed). Verify SONAR_API_KEY and try another category (e.g., whitepaper). Share logs with the full response.
Server Not Running: Ensure npm start is running. Check logs for errors (e.g., missing SONAR_API_KEY).
Connection Issues: Verify port 3000 is open:netstat -an | grep 3000

On Windows:netstat -an | findstr 3000


Invalid API Key: A 401 response indicates an invalid SONAR_API_KEY. Check .env.
Rate Limits: A 429 response means the rate limit is exceeded; wait and retry.
JSON Errors: Ensure proper quoting in -d. For Windows PowerShell:curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d '{"asset": "Uniswap", "network": "Ethereum", "categories": ["audit"]}'


Verbose Output: Add -v for detailed errors:curl -v -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\", \"categories\": [\"audit\"]}"


Response Truncation: Redirect to a file:curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\", \"categories\": [\"audit\"]}" > response.json



