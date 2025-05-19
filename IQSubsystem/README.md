Standalone IQScore Subsystem

A lightweight, standalone server-side system for generating IQ scores for blockchain projects using the Sonar API. It analyzes projects across multiple categories (e.g., audit, whitepaper, team) and returns raw, structured JSON responses, requiring no authentication for public access.

Features





Multi-Category Analysis: Generate scores for one or all categories (e.g., Audit, CodeQuality, Sentiment).



Raw Responses: Returns unparsed Sonar API responses, including choices, usage, and citations.



Simple Setup: Run with Node.js, a .env file, and a single Invoke-RestMethod or curl command.



No Authentication: Publicly accessible API endpoint.



Embedded Configurations: All category prompts and schemas are included in the code.

Prerequisites





Node.js: Version 18 or higher.



Sonar API Key: Obtain from Perplexity AI or your Sonar API provider.



npm: For installing dependencies.

Setup





Clone the Repository:

git clone <repository-url>
cd iqscore-subsystem



Install Dependencies:

npm install



Configure Environment Variables:





Copy .env.example to .env:

cp .env.example .env



Edit .env and add your Sonar API key:

SONAR_API_KEY=your_sonar_api_key_here



Start the Server:

npm start

The server will run on http://localhost:3000 (or the port specified in .env).

Usage

The server exposes a single endpoint: POST /api/v1/iqscore. Send a JSON body with asset (project name), network (blockchain), and categories (optional, defaults to all).

Example: Single Category (Windows PowerShell)

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/iqscore" -Method Post -ContentType "application/json" -Body '{"asset": "Uniswap", "network": "Ethereum", "categories": ["audit"]}' | ConvertTo-Json -Depth 10

Response:

{
  "results": {
    "audit": {
      "status": "success",
      "response": {
        "id": "chatcmpl-xyz789",
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

Example: Multiple Categories (curl)

curl -X POST "http://localhost:3000/api/v1/iqscore" -H "Content-Type: application/json" -d "{\"asset\": \"Uniswap\", \"network\": \"Ethereum\", \"categories\": [\"audit\", \"whitepaper\"]}"

Supported Categories





audit



code_quality



ecosystem_adoption



goal



governance



market



regulatory_compliance



scam



sentiment



team



tokenomics



value



whitepaper

Project Structure

iqscore-subsystem/
├── server.js              # Entry point for the Express server
├── sonarIQService.js      # Handles Sonar API calls with embedded configs
├── iqScoreController.js   # Processes IQScore requests
├── iqScoreRoutes.js       # Defines API routes
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



Empty Response Content: If choices[0].message.content is empty, check server logs for [SonarIQService] errors and verify SONAR_API_KEY.



Rate Limits: A 429 error indicates Sonar API rate limits; wait and retry.



Server Not Starting: Check for port conflicts or missing dependencies (npm install).



PowerShell Truncation: Pipe responses to ConvertTo-Json -Depth 10.

Contributing

Submit issues or pull requests to the repository, ensuring changes align with the original system’s functionality.

License

MIT License. See LICENSE file for details.