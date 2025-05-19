/**
 * sonarChatService.js
 * Handles communication with the Sonar API for chat and command responses.
 * Contains embedded command configurations and service map for standalone operation.
 * Uses environment variables for API key and URL.
 * Returns raw API responses for commands to showcase structured output.
 */

import axios from 'axios';

// System prompt for crypto-focused chatbot responses
const SYSTEM_PROMPT = `
You are a cryptocurrency expert, highly knowledgeable in the latest blockchain technology, cryptocurrencies (e.g., Bitcoin, Ethereum), decentralized finance (DeFi), NFTs, and market trends. Provide accurate, concise, and up-to-date responses tailored to the user's query. Focus on clarity, avoiding jargon unless necessary. All responses should be crypto, blockchain, or DeFi related.
`;

// Embedded command configurations (from chat_prompts.docx)
export const COMMAND_CONFIGS = {
  DROP: {
    category: 'Drop',
    model: 'sonar',
    description: 'Identifies emerging cryptocurrencies with strong airdrop buzz and wallet growth recently.',
    prompt: 'Search for emerging cryptocurrencies with strong airdrop buzz and wallet growth recently. Respond with a JSON object containing:\n- drop_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s airdrop event or social activity\n  - summary: String, 50-150 words, including coin name, market cap, 24h airdrop mentions on X, 7-day wallet growth (%), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        drop_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['drop_status', 'coins', 'reason', 'sources']
    }
  },
  DYNAMO: {
    category: 'Dynamo',
    model: 'sonar',
    description: 'Identifies emerging DeFi cryptocurrencies with strong on-chain activity recently.',
    prompt: 'Search for emerging DeFi cryptocurrencies with strong on-chain activity recently. Respond with a JSON object containing:\n- dynamo_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s DeFi activity or market movement\n  - summary: String, 50-150 words, including coin name, market cap, TVL, 7-day TVL growth (%), transaction count, and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        dynamo_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['dynamo_status', 'coins', 'reason', 'sources']
    }
  },
  FLASH: {
    category: 'Flash',
    model: 'sonar',
    description: 'Identifies smaller cryptocurrencies that have shown a sharp recovery after a price drop in the last day.',
    prompt: 'Search for smaller cryptocurrencies that have shown a sharp recovery after a price drop in the last 24 hours. Respond with a JSON object containing:\n- flash_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s recovery event or market movement\n  - summary: String, 50-150 words, including coin name, market cap, 12h price drop (%), 2h price recovery (%), X sentiment score (quantitative or qualitative, e.g., positive sentiment), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        flash_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['flash_status', 'coins', 'reason', 'sources']
    }
  },
  GHOST: {
    category: 'Ghost',
    model: 'sonar',
    description: 'Identifies low-cap cryptocurrencies with sudden blockchain activity and price gains in the last day.',
    prompt: 'Search for low-cap cryptocurrencies with sudden blockchain activity and price gains in the last 24 hours. Respond with a JSON object containing:\n- ghost_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s activity surge or market movement\n  - summary: String, 50-150 words, including coin name, market cap, 24h transaction count, 24h price change (%), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        ghost_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['ghost_status', 'coins', 'reason', 'sources']
    }
  },
  GREEN: {
    category: 'Green',
    model: 'sonar',
    description: 'Identifies emerging eco-friendly cryptocurrencies with strong adoption recently.',
    prompt: 'Search for emerging eco-friendly cryptocurrencies with strong adoption recently. Respond with a JSON object containing:\n- green_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s adoption or market movement\n  - summary: String, 50-150 words, including coin name, market cap, active addresses, 7-day transaction growth (%), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        green_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['green_status', 'coins', 'reason', 'sources']
    }
  },
  MEME: {
    category: 'Meme',
    model: 'sonar',
    description: 'Identifies emerging meme coins with strong social media hype in the last day.',
    prompt: 'Search for emerging meme coins with strong social media hype in the last 24 hours. Respond with a JSON object containing:\n- meme_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s social hype or market movement\n  - summary: String, 50-150 words, including coin name, market cap, X follower count, 24h hashtag mentions, and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        meme_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['meme_status', 'coins', 'reason', 'sources']
    }
  },
  MOON: {
    category: 'Moon',
    model: 'sonar',
    description: 'Identifies micro-cap cryptocurrencies with strong price spikes and active development recently.',
    prompt: 'Search for micro-cap cryptocurrencies with strong price spikes and active development in the last 48 hours. Respond with a JSON object containing:\n- moon_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s price spike or developer activity\n  - summary: String, 50-150 words, including coin name, market cap, 48h price change (%), GitHub activity (quantitative or qualitative, e.g., notable commits), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        moon_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['moon_status', 'coins', 'reason', 'sources']
    }
  },
  NUGS: {
    category: 'Nugs',
    model: 'sonar',
    description: 'Identifies emerging NFT-related cryptocurrencies with strong marketplace activity recently.',
    prompt: 'Search for emerging NFT-related cryptocurrencies with strong marketplace activity recently. Respond with a JSON object containing:\n- nugs_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s NFT activity or market movement\n  - summary: String, 50-150 words, including coin name, market cap, 7-day NFT sales volume, sales count growth (%), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        nugs_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['nugs_status', 'coins', 'reason', 'sources']
    }
  },
  PUMP: {
    category: 'Pump',
    model: 'sonar',
    description: 'Identifies mid-cap cryptocurrencies with over 15% price surge this week and strong wallet holder retention.',
    prompt: 'Search for mid-cap cryptocurrencies with over 15% price surge this week and strong wallet holder retention. Respond with a JSON object containing:\n- pump_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s price surge or holder activity\n  - summary: String, 50-150 words, including coin name, market cap, 7-day price change (%), wallet retention rate (%), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        pump_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['pump_status', 'coins', 'reason', 'sources']
    }
  },
  STABLE: {
    category: 'Stable',
    model: 'sonar',
    description: 'Identifies lesser-known stablecoins with notable supply growth and high trading volume recently.',
    prompt: 'Search for lesser-known stablecoins with notable supply growth and high trading volume recently. Respond with a JSON object containing:\n- stable_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s circulation or trading activity\n  - summary: String, 50-150 words, including coin name, market cap, 7-day supply growth (%), 24h trading volume, and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        stable_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['stable_status', 'coins', 'reason', 'sources']
    }
  },
  ZOMBIE: {
    category: 'Zombie',
    model: 'sonar',
    description: 'Identifies smaller older cryptocurrencies with strong trading activity and price gains in the last day.',
    prompt: 'Search for smaller older cryptocurrencies with strong trading activity and price gains in the last 24 hours. Respond with a JSON object containing:\n- zombie_status: "Found" or "Not Found"\n- coins: Array of objects, each with:\n  - title: String, descriptive title of the coin’s trading activity or market movement\n  - summary: String, 50-150 words, including coin name, market cap, launch year, 24h volume, 24h price change (%), and context\n  - source: String, valid URL to the source\n  - publish_date: String, publication date (e.g., 05/03/2025)\n- reason: String, explanation if no coins found\n- sources: Array of strings, valid URLs to sources\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        zombie_status: { type: 'string', enum: ['Found', 'Not Found'] },
        coins: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string', minLength: 250, maxLength: 750 },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              publish_date: { type: 'string', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' }
            },
            required: ['title', 'summary', 'source', 'publish_date']
          },
          maxItems: 5
        },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['zombie_status', 'coins', 'reason', 'sources']
    }
  }
};

// Embedded command service map (from commandServiceMap.json)
const COMMAND_SERVICE_MAP = {
  FLASH: {
    serviceFailedErrorCode: 'FLASH_SERVICE_FAILED',
    invalidResponseErrorCode: 'FLASH_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_FLASH_INPUT',
    invalidCommandErrorCode: 'INVALID_FLASH_COMMAND',
    processErrorCode: 'PROCESS_FLASH_ERROR'
  },
  GHOST: {
    serviceFailedErrorCode: 'GHOST_SERVICE_FAILED',
    invalidResponseErrorCode: 'GHOST_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_GHOST_INPUT',
    invalidCommandErrorCode: 'INVALID_GHOST_COMMAND',
    processErrorCode: 'PROCESS_GHOST_ERROR'
  },
  ZOMBIE: {
    serviceFailedErrorCode: 'ZOMBIE_SERVICE_FAILED',
    invalidResponseErrorCode: 'ZOMBIE_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_ZOMBIE_INPUT',
    invalidCommandErrorCode: 'INVALID_ZOMBIE_COMMAND',
    processErrorCode: 'PROCESS_ZOMBIE_ERROR'
  },
  DROP: {
    serviceFailedErrorCode: 'DROP_SERVICE_FAILED',
    invalidResponseErrorCode: 'DROP_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_DROP_INPUT',
    invalidCommandErrorCode: 'INVALID_DROP_COMMAND',
    processErrorCode: 'PROCESS_DROP_ERROR'
  },
  MOON: {
    serviceFailedErrorCode: 'MOON_SERVICE_FAILED',
    invalidResponseErrorCode: 'MOON_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_MOON_INPUT',
    invalidCommandErrorCode: 'INVALID_MOON_COMMAND',
    processErrorCode: 'PROCESS_MOON_ERROR'
  },
  DYNAMO: {
    serviceFailedErrorCode: 'DYNAMO_SERVICE_FAILED',
    invalidResponseErrorCode: 'DYNAMO_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_DYNAMO_INPUT',
    invalidCommandErrorCode: 'INVALID_DYNAMO_COMMAND',
    processErrorCode: 'PROCESS_DYNAMO_ERROR'
  },
  NUGS: {
    serviceFailedErrorCode: 'NUGS_SERVICE_FAILED',
    invalidResponseErrorCode: 'NUGS_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_NUGS_INPUT',
    invalidCommandErrorCode: 'INVALID_NUGS_COMMAND',
    processErrorCode: 'PROCESS_NUGS_ERROR'
  },
  GREEN: {
    serviceFailedErrorCode: 'GREEN_SERVICE_FAILED',
    invalidResponseErrorCode: 'GREEN_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_GREEN_API',
    invalidCommandErrorCode: 'INVALID_GREEN_COMMAND',
    processErrorCode: 'PROCESS_GREEN_ERROR'
  },
  MEME: {
    serviceFailedErrorCode: 'MEME_SERVICE_FAILED',
    invalidResponseErrorCode: 'MEME_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_MEME_INPUT',
    invalidCommandErrorCode: 'INVALID_MEME_COMMAND',
    processErrorCode: 'PROCESS_MEME_ERROR'
  },
  STABLE: {
    serviceFailedErrorCode: 'STABLE_SERVICE_FAILED',
    invalidResponseErrorCode: 'STABLE_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_STABLE_INPUT',
    invalidCommandErrorCode: 'INVALID_STABLE_COMMAND',
    processErrorCode: 'PROCESS_STABLE_ERROR'
  },
  PUMP: {
    serviceFailedErrorCode: 'PUMP_SERVICE_FAILED',
    invalidResponseErrorCode: 'PUMP_SERVICE_INVALID_RESPONSE',
    invalidInputErrorCode: 'INVALID_PUMP_INPUT',
    invalidCommandErrorCode: 'INVALID_PUMP_COMMAND',
    processErrorCode: 'PROCESS_PUMP_ERROR'
  }
};

/**
 * Sanitizes a string for JSON parsing by escaping quotes and removing invalid characters.
 * @param {string} str - The input string to sanitize.
 * @returns {string} Sanitized string safe for JSON parsing.
 */
function sanitizeJsonString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/"/g, '\\"')
    .replace(/[\n\r\t]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '');
}

/**
 * Fetches a general chatbot response from the Sonar API for crypto-related queries.
 * @param {string} userPrompt - User's input message.
 * @returns {Promise<string>} The chatbot's response text.
 * @throws {Error} If the input is invalid or the API request fails after retries.
 */
export const fetchChatResponse = async (userPrompt) => {
  const LOG_PREFIX = '[SonarChatService]';
  const retries = 3;

  console.log(`${LOG_PREFIX} Calling Sonar API for chatbot response`);

  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
    console.error(`${LOG_PREFIX} Invalid input: User prompt is empty or not a string`);
    throw new Error('Invalid user prompt');
  }
  const trimmedPrompt = userPrompt.trim();
  if (trimmedPrompt.length > 1000) {
    console.error(`${LOG_PREFIX} Invalid input: User prompt exceeds 1000 characters`);
    throw new Error('User prompt too long');
  }

  const apiKey = process.env.SONAR_API_KEY;
  const apiUrl = process.env.SONAR_API_URL || 'https://api.perplexity.ai/chat/completions';
  const model = 'sonar';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`${LOG_PREFIX} Attempt ${attempt} for Chat`);
      const payload = {
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmedPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      const response = await axios.post(apiUrl, payload, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 90000
      });

      const chatContent = response.data.choices?.[0]?.message?.content?.trim();
      console.log(`${LOG_PREFIX} Success. Response Length: ${chatContent?.length || 0} chars`);

      if (!chatContent || chatContent.length < 20) {
        throw new Error('Invalid response from Sonar API');
      }

      return chatContent;
    } catch (error) {
      console.error(`${LOG_PREFIX} Attempt ${attempt} failed: ${error.message}`);
      if (error.response?.status === 429) {
        throw new Error('Sonar API rate limit exceeded');
      }
      if (attempt === retries) {
        console.warn(`${LOG_PREFIX} All retries failed. Returning fallback response.`);
        return 'Sorry, our chat service is temporarily unavailable. Please try again later.';
      }
      console.log(`${LOG_PREFIX} Retrying after ${500 * attempt}ms...`);
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
};

/**
 * Fetches a raw JSON response for a command (e.g., 'MOON') from the Sonar API.
 * Returns the full, unparsed API response with schema-compliant content.
 * @param {string} command - Command name (e.g., 'MOON').
 * @returns {Promise<Object>} Raw JSON response from the API.
 * @throws {Error} If the command is invalid or API request fails after retries.
 */
export const fetchCommandResponse = async (command) => {
  const LOG_PREFIX = '[SonarChatService]';
  const retries = 3;

  console.log(`${LOG_PREFIX} Calling Sonar API for ${command} command`);

  if (!command || typeof command !== 'string' || command.trim().length === 0) {
    console.error(`${LOG_PREFIX} Invalid input: Command is empty or not a string`);
    throw new Error('Invalid command');
  }

  const trimmedCommand = command.trim().toUpperCase();
  const config = COMMAND_CONFIGS[trimmedCommand];

  if (!config) {
    console.error(`${LOG_PREFIX} Invalid command: ${trimmedCommand}`);
    throw new Error(`Invalid command: ${trimmedCommand}`);
  }

  if (trimmedCommand !== config.category.toUpperCase()) {
    console.error(`${LOG_PREFIX} Invalid command: ${trimmedCommand}`);
    throw new Error(`Invalid ${trimmedCommand} command`);
  }

  const category = config.category;
  const userPrompt = config.prompt;
  const schema = config.schema;

  const apiKey = process.env.SONAR_API_KEY;
  const apiUrl = process.env.SONAR_API_URL || 'https://api.perplexity.ai/chat/completions';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`${LOG_PREFIX} Attempt ${attempt} for ${category}`);
      const payload = {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: { schema }
        }
      };

      const response = await axios.post(apiUrl, payload, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 90000
      });

      console.log(`${LOG_PREFIX} Success. Response keys: ${Object.keys(response.data).join(', ')}, Content length: ${response.data.choices?.[0]?.message?.content?.length || 0} chars`);
      return response.data;
    } catch (error) {
      console.error(`${LOG_PREFIX} Attempt ${attempt} failed: ${error.message}`);
      if (error.response?.status === 429) {
        throw new Error('Sonar API rate limit exceeded');
      }
      if (attempt === retries) {
        console.warn(`${LOG_PREFIX} All retries failed for ${category}. Returning fallback response.`);
        return {
          choices: [],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          error: 'Chat command service is temporarily unavailable.'
        };
      }
      console.log(`${LOG_PREFIX} Retrying after ${500 * attempt}ms...`);
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
};