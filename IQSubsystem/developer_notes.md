Developer Notes for IQScore Subsystem
This document provides insights from the development of the standalone IQScore subsystem, a research-centric backend for analyzing blockchain projects across multiple categories using the Sonar API. It outlines design choices, performance, data quality, and future improvements to help users and developers understand and extend the system.
Development Process

AI Assistance: I used AI tools to extract the IQScore subsystem from the original system, ensuring it remains lightweight and focused on the sonarIQService.js functionality, which handles multi-category analysis.
Testing Environment: I tested the subsystem on Windows using PowerShell’s Invoke-RestMethod commands (see invoke_cmds.md). Users on other platforms may need to adjust curl commands (see curl_cmds.md) for compatibility, particularly with quoting or escaping in Windows terminals like Command Prompt or PowerShell.

Performance

Response Times:
Typical responses take 5–6 seconds for most queries, as the system processes multiple API requests concurrently for each category.
For data-heavy queries (e.g., all 13 categories), response times can extend to 10–12 seconds due to the volume of data retrieved.


Response Delay: To simplify client-side usage, I delayed the response until all category data is fully retrieved, ensuring a single, complete response with clear separations for each category.

Design Choices

Multi-API Requests: The subsystem sends multiple API requests simultaneously for each requested category (e.g., Audit, Whitepaper, Sentiment), providing detailed, category-specific results. This approach was chosen over a single deep research prompt with dynamic ranging, which I tested but found less consistent, more prone to rate limits, and slower overall.
Model Selection:
I used Sonar-Pro for most categories because the basic Sonar model returned vague or speculative data, particularly for categories like Audit and Scam. Sonar-Pro delivers more precise and reliable data, though it still occasionally misses desired data.
For the Value category, I opted for Sonar-Reasoning-Pro after finding Sonar-Pro’s results insufficiently detailed. Sonar-Reasoning-Pro provides practical financial insights without the excessive processing time of a full deep reasoning model.


JSON Structure: Responses are structured as raw JSON objects with a results field mapping each category to its raw API response. While terminal output may be dense, the consistent JSON format makes it easy to parse and manipulate for UI/UX integration.
Prompt Tuning: Switching to strict JSON schemas and tightening prompts significantly improved the success rate of data retrieval compared to earlier tests with looser prompts. However, further tuning by domain experts could enhance data quality for niche categories.

Data Quality

Consistency: Sonar-Pro outperforms the basic Sonar model, reducing speculative or ambiguous results. Categories like Audit and Scam now return actionable data more frequently, though some queries still yield “Not Found” due to limited public data.
Challenges: The subsystem relies on Perplexity’s Sonar API, which may miss unpublished or real-time data (e.g., recent X posts for Sentiment). This limitation is most pronounced for newer or less-documented projects.
Success Rate: The JSON schema enforcement and optimized prompts have increased the success rate, but categories like Goal or RegulatoryCompliance may still return partial data for obscure assets.

Future Improvements

Prompt Optimization: Collaborating with blockchain experts could refine prompts, particularly for categories like Goal (where scoring is ambiguous) or Sentiment (where live data is limited).
Alternative APIs: Integrating blockchain data APIs (e.g., CoinGecko, GeckoTerminal) could supplement Sonar-Pro for real-time metrics, especially for Market or Tokenomics.
Sentiment Analysis: Using Grok for live X data would enhance Sentiment analysis, addressing Perplexity’s limitations with real-time social trends.
Caching: Implementing response caching for frequent queries could reduce latency for heavy multi-category requests.
Adaptability: The subsystem’s modular design makes it easily adaptable to other research domains (e.g., AI projects, biotech startups) by modifying the CATEGORY_CONFIGS in sonarIQService.js.

Conclusion
The IQScore subsystem is my most research-intensive Sonar-based tool, delivering comprehensive blockchain project analysis in 5–12 seconds. By consolidating multiple API requests into a single, structured JSON response, it transforms what used to be an hour-long research process into an easy-to-read report. The use of Sonar-Pro and Sonar-Reasoning-Pro ensures precise data, while the flexible category selection allows for deep or shallow analysis. The raw JSON output, though dense, is structured for easy manipulation, making this subsystem a powerful, adaptable tool for blockchain research and beyond.
