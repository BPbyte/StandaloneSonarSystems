/**
 * sonarNewsService.js
 * Handles communication with the Sonar API for news curation.
 * Contains embedded interest configurations for standalone operation.
 * Returns raw API responses to showcase structured output.
 */

import axios from 'axios';

const LOG_PREFIX = '[SonarNewsService]';

// System prompt for structured news curation
const SYSTEM_PROMPT = `
You are an expert curator tasked with fetching recent, specific content for specified topics using comprehensive web searches. Respond with a valid JSON object matching the provided schema, containing:
- news_status: String, "Content Found" or "No Content Found"
- articles: Array of objects, each with:
  - title: String, article title
  - summary: String, detailed summary (50-150 words)
  - url: String, direct URL to the source (must be a valid HTTP/HTTPS URL)
  - publish_date: String, publication date (MM/DD/YYYY)
  - source: String, source name or hostname
- reason: String, explanation if no content found
- sources: Array of strings, URLs of all sources (must be a valid HTTP/HTTPS URLs)
Sources must be from distinct domains, cover varied subtopics within the specified topics, and prioritize open-access content from reputable websites, forums, or platforms, excluding paywalled sources. Avoid generic news roundups or vague headlines. Content must be specific, published within the specified date range, and provide clear, event-focused details.
`;

// JSON schema for news response validation
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    news_status: { type: 'string', enum: ['Content Found', 'No Content Found'] },
    articles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          url: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
          publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' },
          source: { type: 'string' }
        },
        required: ['title', 'summary', 'url', 'publish_date', 'source']
      }
    },
    reason: { type: 'string' },
    sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
  },
  required: ['news_status', 'articles', 'reason', 'sources']
};

// Embedded allowed interests (from allowedInterests.json)
const ALLOWED_INTERESTS = [
  "Web3", "Blockchain", "DeFi", "NFT", "Hybrid DeFi Products", "Blockchain-based KYC Solutions",
  "AI-Powered Smart Contracts", "Crypto Tax Reporting Tools", "Tokenized Money Market Funds",
  "Digital Gold Tokens", "Decentralized Crypto Accounting", "Cross-Border Crypto Payments",
  "Blockchain IoT Security", "Immutable Medical Records", "Smart Contract Formal Verification",
  "Decentralized Autonomous Supply Chains", "Blockchain-based Voting Systems",
  "Permissioned Blockchain Networks", "Fair Value Crypto Accounting",
  "Crypto Asset Management Platforms", "On-Chain Derivatives Trading",
  "Privacy-Preserving DeFi Protocols", "Blockchain Regulatory Compliance Tools",
  "Real-World Asset Tokenization (RWA)", "Decentralized Identity", "DAO Governance Tools",
  "Cross-Chain Yield Aggregator", "Layer 2 Scaling Solutions", "On-Chain Social Feeds",
  "DeFi Lending Protocols", "NFT Utility Platforms", "Play-to-Earn Blockchain Games",
  "Decentralized Autonomous Organizations (DAOs)", "Crypto Staking Pools",
  "Liquidity Mining Strategies", "Decentralized Insurance", "Web3 Creator Economy",
  "Interoperable NFTs", "Privacy Coins", "Decentralized Exchanges (DEXs)",
  "Smart Contract Security Audits", "Blockchain Oracles", "Digital Asset Management Platforms",
  "Institutional Crypto Custody Solutions"
];

/**
 * Fetches raw news articles from the Sonar API for cryptocurrency topics.
 * Returns the unparsed API response.
 * @param {string[]} interests - Array of topics (e.g., ['DeFi', 'NFT']).
 * @param {number} days - Number of days to look back (1-30).
 * @returns {Promise<Object>} Raw JSON response from the API.
 * @throws {Error} If inputs are invalid, API key is missing, or request fails after retries.
 */
export const fetchNewsRaw = async (interests, days) => {
  const niche = Array.isArray(interests) && interests.length > 0 ? interests.join(', ') : 'cryptocurrency market trends';
  const targetDays = parseInt(days, 10);
  if (isNaN(targetDays) || targetDays < 1 || targetDays > 30) {
    console.error(`${LOG_PREFIX} Invalid days: ${days}`);
    throw new Error('Days must be between 1 and 30');
  }

  // Validate interests
  if (Array.isArray(interests)) {
    for (const interest of interests) {
      if (!ALLOWED_INTERESTS.includes(interest)) {
        console.error(`${LOG_PREFIX} Invalid interest: ${interest}`);
        throw new Error(`Invalid interest: ${interest}. Must be one of ${ALLOWED_INTERESTS.join(', ')}`);
      }
    }
  }

  const logId = `fetchNews-${niche}-${targetDays}`;
  console.log(`${LOG_PREFIX} Calling Sonar API for: ${logId}`);

  const apiKey = process.env.SONAR_API_KEY;
  if (!apiKey) {
    console.error(`${LOG_PREFIX}[${logId}] Missing SONAR_API_KEY environment variable`);
    throw new Error('Sonar API key is not configured');
  }
  const apiUrl = process.env.SONAR_API_URL || 'https://api.perplexity.ai/chat/completions';
  const model = 'sonar';

  const userPrompt = `
  Fetch up to 8 recent, specific items (articles, discussions, or reports) for "${niche}" published within the last ${targetDays} days. Ensure diverse domains and subtopics, avoiding generic news roundups, paywalled content, or repetitive sources. Respond with a JSON object matching the provided schema.
  `;

  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - targetDays);

  const payload = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0,
    response_format: {
      type: 'json_schema',
      json_schema: { schema: RESPONSE_SCHEMA }
    },
    max_tokens: 1000,
    search_after_date_filter: pastDate.toLocaleDateString('en-US'),
    search_before_date_filter: today.toLocaleDateString('en-US'),
    max_results: 8,
    web_search_options: {
      search_context_size: 'high'
    }
  };

  const retries = 3;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`${LOG_PREFIX} Attempt ${attempt} for ${logId}`);
      const response = await axios.post(apiUrl, payload, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 120000
      });

      console.log(`${LOG_PREFIX} Success for ${logId}. Response keys: ${Object.keys(response.data).join(', ')}, Content length: ${response.data.choices?.[0]?.message?.content?.length || 0} chars`);
      return response.data;
    } catch (error) {
      console.error(`${LOG_PREFIX} Attempt ${attempt} failed for ${logId}: ${error.message}`);
      if (error.response?.status === 429) {
        throw new Error('Sonar API rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('Sonar API authentication failed: Invalid or missing API key');
      }
      if (attempt === retries) {
        console.warn(`${LOG_PREFIX} All retries failed for ${logId}. Returning fallback response.`);
        return {
          choices: [],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          error: 'News service temporarily unavailable.'
        };
      }
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
};