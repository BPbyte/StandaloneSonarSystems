
Developer Notes for Chat Subsystem
This document provides insights and observations from the development of the standalone chat subsystem, a simplified backend for cryptocurrency queries and commands using the Sonar API. It outlines the system’s design choices, performance, limitations, and future improvements to help users and developers understand its functionality and adapt it for their needs.
Development Process

AI Assistance: I used AI tools to streamline the creation of this standalone subsystem by extracting relevant components from the original system, ensuring it remains lightweight and focused.
Testing Environment: I tested the subsystem on Windows using PowerShell’s Invoke-RestMethod commands (see invoke_cmds.md). Users on other platforms may need to adjust curl commands (see curl_cmds.md) for compatibility, particularly with quoting or escaping on Windows terminals like Command Prompt or PowerShell.

Performance

Response Times:
For short responses or “Not Found” results, the system typically responds in 3–5 seconds.
For data-heavy responses (e.g., multiple coins with detailed summaries), response times are closer to 6-8 seconds, occasionally as low as 3-5 seconds.


Model Choice:
The subsystem uses the basic Sonar model, which provides reliable performance for a public application.
I tested the Sonar-Pro model, which offered slightly better results (e.g., more precise data or faster responses), but the improvement was not significant enough to justify the cost or access restrictions for a public-facing system.
Using the basic Sonar model allows this subsystem to run alongside my other research queries on Sonar-Pro systems, optimizing API calls by avoiding multiple models simultaneously.



Command Behavior

Data Sensitivity: The commands (e.g., FLASH, DROP, ZOMBIE) can be finicky, as their success depends on real-time market conditions and available data. For example:
During the crypto market surge from May 5, 2025, to May 15, 2025 (the time of writing), commands like FLASH, DROP, and ZOMBIE worked as intended, returning relevant data.
However, some data points could not be validated, likely because the data (e.g., niche metrics or unpublished sources) is not accessible to Perplexity’s Sonar API until publicly available.
Sources like comments, blogs, or articles must be published for Perplexity to retrieve them, limiting real-time data access.


Future Improvements:
To enhance data availability, integrating a blockchain handler API (e.g., GeckoTerminal or CoinGecko) could provide direct access to on-chain metrics, reducing reliance on published sources.
Perplexity struggles with live sentiment data (e.g., real-time X posts). In the future, integrating Grok, which can access live X data, would improve sentiment analysis for commands like MEME or FLASH.



Data Structure and UI/UX

JSON Structure: I designed the response structure in sonarChatService.js to be clear and usable for UI/UX integration. The raw JSON responses (e.g., choices[0].message.content with [command]_status, coins, reason, sources) are straightforward to parse and style with minimal logic.
Flexibility: The subsystem is intentionally simple, acting as a moldable backend. Developers can easily modify the .json structure in sonarChatService.js to suit specific UI needs or add custom formatting.
NLP Consideration: I initially considered a secondary Natural Language Processing (NLP) layer to enhance response formatting. However, during testing, Perplexity’s Sonar model (and Sonar-Pro in trials) consistently returned properly structured JSON responses, even without additional NLP. This reliability eliminated the need for extra processing, keeping the system lightweight.

General Chat Functionality

Purpose: The general chat feature (/api/v1/chat with a message payload) was primarily a container for the command-based functionality (e.g., FLASH, MOON). However, it performs well as a crypto-centric chatbot.
Performance: It provides relevant, sourced responses to crypto-related queries, leveraging the Sonar API’s knowledge base. It’s a functional component for users seeking general insights, complementing the command-driven data retrieval.

Limitations and Future Work

Data Availability: The subsystem’s effectiveness is limited by Perplexity’s access to published data. Commands may return “Not Found” if relevant data isn’t available, particularly for real-time or niche metrics.
Sentiment Analysis: Live sentiment data (e.g., X posts) is a weak point. Integrating Grok for real-time X data would address this.
Blockchain Integration: Direct API access to blockchain data (e.g., via GeckoTerminal) would improve command reliability, especially for on-chain metrics like transaction counts or wallet growth.
Response Optimization: While response times are acceptable (3–8 seconds), optimizing API calls or caching frequent queries could reduce latency for heavy data responses.

Conclusion
This subsystem is a simplified, standalone backend designed for flexibility and ease of use. It retains the core functionality of the original system, with authentication removed and raw Sonar API responses for transparency. The commands provide valuable crypto insights when data is available, and the general chat serves as a reliable crypto chatbot. Developers can adapt the JSON structure and integrate additional APIs to enhance its capabilities, making it a solid foundation for further development.

