/**
 * sonarIQService.js
 * Handles communication with the Sonar API for IQScore generation.
 * Contains embedded category configurations for standalone operation.
 * Returns raw API responses for each category.
 */

import axios from 'axios';

const LOG_PREFIX = '[SonarIQService]';

// System prompt for Sonar API, instructing JSON output
const SYSTEM_PROMPT = `
You are an AI assistant specializing in blockchain project analysis. Provide accurate, detailed, and up-to-date information for the specified cryptocurrency and blockchain network. Respond with a valid JSON object matching the schema described in the user prompt, using comprehensive web searches and reliable sources to evaluate the requested category (e.g., audit, whitepaper). Ensure the response is concise and includes a final_score field calculated as specified.
`;

// Embedded category configurations (from IQPrompts.docx)
const CATEGORY_CONFIGS = {
  audit: {
    category: 'Audit',
    model: 'sonar-pro',
    description: 'For finding audits on the asset. Consistently retrieves audit reports, with occasional empty responses from Sonar, triggering retries.',
    prompt: 'Search for smart contract audit reports for "{{coinName}}" on the "{{chain}}" blockchain, focusing on firms like Certik, OpenZeppelin, Hacken, Trail of Bits, Chainsecurity, Cyberscope, EtherAuthority, Callisto, NCC Group, or Certora. Respond with a JSON object containing:\n- audit_status: "Found" or "Not Found"\n- audits: Array of objects, each with:\n  - firm: String, name of the auditing firm\n  - year: Integer, year conducted (YYYY)\n  - scope: String, technical focus (e.g., "token minting")\n  - findings: Object with keys critical, high, medium, low, informational (integers or "Unspecified"), and resolved (boolean or "Unknown")\n  - source: String, valid URL to the audit report (e.g., https://example.com/report.pdf)\n  - score: Integer, 0-100 based on findings and resolution (Unspecified/Unknown=70, No findings=80, All resolved=100, Unresolved threats=0-50 by severity)\n- final_score: Integer, 0-100, average of audit scores or 50 if no data\n- reason: String, explanation if no audits found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        audit_status: { type: 'string', enum: ['Found', 'Not Found'] },
        audits: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firm: { type: 'string' },
              year: { type: 'integer' },
              scope: { type: 'string' },
              findings: {
                type: 'object',
                properties: {
                  critical: { type: ['integer', 'string'] },
                  high: { type: ['integer', 'string'] },
                  medium: { type: ['integer', 'string'] },
                  low: { type: ['integer', 'string'] },
                  informational: { type: ['integer', 'string'] },
                  resolved: { type: ['boolean', 'string'] }
                },
                required: ['critical', 'high', 'medium', 'low', 'informational', 'resolved']
              },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['firm', 'year', 'scope', 'findings', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['audit_status', 'audits', 'final_score', 'reason', 'sources']
    }
  },
  code_quality: {
    category: 'CodeQuality',
    model: 'sonar-pro',
    description: 'For determining code quality based on public GitHub or other repository data.',
    prompt: 'Analyze the code quality of "{{coinName}}" on the "{{chain}}" blockchain, focusing on GitHub repositories or public codebases. Respond with a JSON object containing:\n- code_quality_status: "High Quality", "Moderate Quality", "Low Quality", or "No Codebase Found"\n- code_quality: Array of objects, each with:\n  - type: String, e.g., "GitHub Activity"\n  - description: String, details of the aspect\n  - strength: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/repository)\n  - score: Integer, 0-100 (High=80-100, Moderate=50-79, Low=0-49)\n- final_score: Integer, 0-100, average of code_quality scores or 50 if no data\n- reason: String, explanation if no codebase found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        code_quality_status: { type: 'string', enum: ['High Quality', 'Moderate Quality', 'Low Quality', 'No Codebase Found'] },
        code_quality: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              strength: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'strength', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['code_quality_status', 'code_quality', 'final_score', 'reason', 'sources']
    }
  },
  ecosystem_adoption: {
    category: 'EcosystemAdoption',
    model: 'sonar-pro',
    description: 'For assessing ecosystem adoption. Works better for major assets like Ethereum or Solana.',
    prompt: 'Analyze the ecosystem adoption of "{{coinName}}" on the "{{chain}}" blockchain. Respond with a JSON object containing:\n- adoption_status: "High Adoption", "Moderate Adoption", "Low Adoption", or "No Adoption Found"\n- adoption: Array of objects, each with:\n  - type: String, e.g., "Partnerships"\n  - description: String, details of the metric\n  - significance: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/report)\n  - score: Integer, 0-100 (High=80-100, Moderate=50-79, Low=0-49)\n- final_score: Integer, 0-100, average of adoption scores or 50 if no data\n- reason: String, explanation if no adoption data found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        adoption_status: { type: 'string', enum: ['High Adoption', 'Moderate Adoption', 'Low Adoption', 'No Adoption Found'] },
        adoption: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              significance: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'significance', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['adoption_status', 'adoption', 'final_score', 'reason', 'sources']
    }
  },
  goal: {
    category: 'Goal',
    model: 'sonar-pro',
    description: 'For identifying the asset’s stated goals. Finds publicly listed goals, though scoring can be ambiguous.',
    prompt: 'Analyze "{{coinName}}" on the "{{chain}}" blockchain for stated project goals. Respond with a JSON object containing:\n- goal_status: " REDUCEGoals Found" or "No Goals Found"\n- goals: Array of objects, each with:\n  - type: String, e.g., "Decentralization"\n  - description: String, details of the goal\n  - feasibility: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/document)\n  - score: Integer, 0-100 (High=80-100, Medium=50-79, Low=20-49, Unclear=0-19)\n- final_score: Integer, 0-100, average of goal scores or 50 if no data\n- reason: String, explanation if no goals found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        goal_status: { type: 'string', enum: ['Goals Found', 'No Goals Found'] },
        goals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              feasibility: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'feasibility', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['goal_status', 'goals', 'final_score', 'reason', 'sources']
    }
  },
  governance: {
    category: 'Governance',
    model: 'sonar-pro',
    description: 'For evaluating how the asset is governed or governs its tokens.',
    prompt: 'Analyze the governance model of "{{coinName}}" on the "{{chain}}" blockchain. Respond with a JSON object containing:\n- governance_status: "Active Governance", "Partial Governance", or "No Governance Found"\n- governance: Array of objects, each with:\n  - type: String, e.g., "On-Chain Voting"\n  - description: String, details of the aspect\n  - strength: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/governance)\n  - score: Integer, 0-100 (Strong=80-100, Moderate=50-79, Weak=0-49)\n- final_score: Integer, 0-100, average of governance scores or 50 if no data\n- reason: String, explanation if no governance found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        governance_status: { type: 'string', enum: ['Active Governance', 'Partial Governance', 'No Governance Found'] },
        governance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              strength: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'strength', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['governance_status', 'governance', 'final_score', 'reason', 'sources']
    }
  },
  market: {
    category: 'Market',
    model: 'sonar-pro',
    description: 'For analyzing market trends. Less detailed than direct market API pulls but generally valid.',
    prompt: 'Analyze "{{coinName}}" on the "{{chain}}" blockchain for market activity metrics like volume, market cap, volatility, moving average, and trend direction. Respond with a JSON object containing:\n- market_status: "Active Market", "Stable Market", "Volatile Market", or "No Market Data Found"\n- market_activities: Array of objects, each with:\n  - type: String, e.g., "Trading Volume"\n  - description: String, details of the metric\n  - significance: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/article)\n  - score: Integer, -100 to 100 based on market health\n- final_score: Integer, -100 to 100, average of market_activities scores or 0 if no data\n- reason: String, explanation if no market data found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        market_status: { type: 'string', enum: ['Active Market', 'Stable Market', 'Volatile Market', 'No Market Data Found'] },
        market_activities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              significance: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: -100, maximum: 100 }
            },
            required: ['type', 'description', 'significance', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: -100, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['market_status', 'market_activities', 'final_score', 'reason', 'sources']
    }
  },
  regulatory_compliance: {
    category: 'RegulatoryCompliance',
    model: 'sonar-pro',
    description: 'For assessing regulatory compliance with bodies like FinCEN or SEC.',
    prompt: 'Analyze the regulatory compliance of "{{coinName}}" on the "{{chain}}" blockchain. Respond with a JSON object containing:\n- compliance_status: "Compliant", "Partially Compliant", "Non-Compliant", or "No Compliance Data Found"\n- compliance: Array of objects, each with:\n  - type: String, e.g., "KYC/AML Policies"\n  - description: String, details of the aspect\n  - significance: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/report)\n  - score: Integer, 0-100 (Compliant=80-100, Partial=50-79, Non-Compliant=0-49)\n- final_score: Integer, 0-100, average of compliance scores or 50 if no data\n- reason: String, explanation if no compliance data found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        compliance_status: { type: 'string', enum: ['Compliant', 'Partially Compliant', 'Non-Compliant', 'No Compliance Data Found'] },
        compliance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              significance: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'significance', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['compliance_status', 'compliance', 'final_score', 'reason', 'sources']
    }
  },
  scam: {
    category: 'Scam',
    model: 'sonar-pro',
    description: 'For detecting scam indicators on the network or asset. Often identifies phishers or scammers across all network/asset pairs.',
    prompt: 'Analyze "{{coinName}}" on the "{{chain}}" blockchain for scam indicators. Respond with a JSON object containing:\n- scam_status: "Indicators Found" or "No Indicators Found"\n- indicators: Array of up to 5 objects, each with:\n  - type: String, e.g., "Fake Team"\n  - description: String, details of the indicator, properly escaped to avoid JSON syntax errors (e.g., escape quotes, ampersands)\n  - severity: String, "Critical", "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/report), properly escaped\n  - score: Integer, 0-100 (Critical=100-80, High=79-60, Medium=59-40, Low=39-20, No issues=19-0)\n- final_score: Integer, 0-100, 100 if no indicators, otherwise 100 minus average of indicator scores plus 25, clamped to 0-100\n- reason: String, explanation if no indicators found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com), properly escaped. If no specific URL is available, use the project’s official website.\nEnsure the JSON is valid, with all strings properly escaped to prevent syntax errors. URLs must start with http:// or https:// and be accessible.',
    schema: {
      type: 'object',
      properties: {
        scam_status: { type: 'string', enum: ['Indicators Found', 'No Indicators Found'] },
        indicators: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'severity', 'source', 'score']
          },
          maxItems: 5
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['scam_status', 'indicators', 'final_score', 'reason', 'sources']
    }
  },
  sentiment: {
    category: 'Sentiment',
    model: 'sonar-pro',
    description: 'For analyzing market sentiment via social trends. Retrieves sentiment data from platforms like X or news sources.',
    prompt: 'Analyze "{{coinName}}" on the "{{chain}}" blockchain for current sentiment and trends. Respond with a JSON object containing:\n- sentiment_status: "Positive Sentiment", "Negative Sentiment", "Neutral Sentiment", or "No Sentiment Found"\n- sentiments: Array of objects, each with:\n  - type: String, e.g., "Community Support"\n  - description: String, details of the sentiment\n  - strength: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/article)\n  - score: Integer, 0-100 (Positive=80-100, Neutral=50-79, Negative=20-49, Unclear=0-19)\n- final_score: Integer, 0-100, average of sentiment scores or 50 if no data\n- reason: String, explanation if no sentiment found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        sentiment_status: { type: 'string', enum: ['Positive Sentiment', 'Negative Sentiment', 'Neutral Sentiment', 'No Sentiment Found'] },
        sentiments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              strength: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'strength', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['sentiment_status', 'sentiments', 'final_score', 'reason', 'sources']
    }
  },
  team: {
    category: 'Team',
    model: 'sonar-pro',
    description: 'For finding team members on asset. Generally reliable, correctly identifying pseudonymous founders or team members.',
    prompt: 'Search for information about the core team or developers of "{{coinName}}" on the "{{chain}}" blockchain, focusing on official project websites, GitHub, LinkedIn, or credible sources like CoinMarketCap or CoinGecko. Respond with a JSON object containing:\n- team_status: "Found" or "Not Found"\n- team: Array of objects, each with:\n  - name: String, individual or team name\n  - role: String, e.g., "Lead Developer"\n  - background: String, professional background\n  - validity: String, "Valid", "Invalid", or "Unverified"\n  - source: String, valid URL to the source (e.g., https://example.com/profile)\n  - score: Integer, 0-100 (Valid=90-100, Unverified=60-80, Invalid=0-49)\n- final_score: Integer, 0-100, average of team scores or 50 if no data\n- reason: String, explanation if no team info found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        team_status: { type: 'string', enum: ['Found', 'Not Found'] },
        team: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              background: { type: 'string' },
              validity: { type: 'string', enum: ['Valid', 'Invalid', 'Unverified'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['name', 'role', 'background', 'validity', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['team_status', 'team', 'final_score', 'reason', 'sources']
    }
  },
  tokenomics: {
    category: 'Tokenomics',
    model: 'sonar-pro',
    description: 'For analyzing how the asset handles its tokens, including supply and distribution.',
    prompt: 'Analyze the tokenomics of "{{coinName}}" on the "{{chain}}" blockchain. Respond with a JSON object containing:\n- tokenomics_status: "Detailed Found", "Partial Found", or "Not Found"\n- tokenomics: Array of objects, each with:\n  - type: String, e.g., "Supply Distribution"\n  - description: String, details of the aspect\n  - significance: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/tokenomics)\n  - score: Integer, 0-100 (Balanced=80-100, Moderate=50-79, Poor=0-49)\n- final_score: Integer, 0-100, average of tokenomics scores or 50 if no data\n- reason: String, explanation if no data found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        tokenomics_status: { type: 'string', enum: ['Detailed Found', 'Partial Found', 'Not Found'] },
        tokenomics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              significance: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['type', 'description', 'significance', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['tokenomics_status', 'tokenomics', 'final_score', 'reason', 'sources']
    }
  },
  value: {
    category: 'Value',
    model: 'sonar-reasoning-pro',
    description: 'For evaluating the overall value of an asset. Uses reasoning to perform multiple checks in one prompt call.',
    prompt: 'Analyze "{{coinName}}" on the "{{chain}}" blockchain for comprehensive value metrics, considering market activity, sentiment, project goals, adoption, technology, and risks. Respond with a JSON object containing:\n- value_status: "High Value", "Moderate Value", "Low Value", or "No Value Data Found"\n- value_metrics: Array of objects, each with:\n  - type: String, e.g., "Market Performance"\n  - description: String, details of the metric\n  - significance: String, "High", "Medium", or "Low"\n  - source: String, valid URL to the source (e.g., https://example.com/analysis)\n  - score: Integer, -100 to 100 (Strong=80-100, Moderate=50-79, Weak=20-49, Negative=-20 to -100)\n- final_score: Integer, -100 to 100, average of value_metrics scores or 0 if no data\n- reason: String, explanation if no value data found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        value_status: { type: 'string', enum: ['High Value', 'Moderate Value', 'Low Value', 'No Value Data Found'] },
        value_metrics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              significance: { type: 'string', enum: ['High', 'Medium', 'Low'] },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: -100, maximum: 100 }
            },
            required: ['type', 'description', 'significance', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: -100, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['value_status', 'value_metrics', 'final_score', 'reason', 'sources']
    }
  },
  whitepaper: {
    category: 'Whitepaper',
    model: 'sonar-pro',
    description: 'For finding whitepaper on asset. More reliable than audit but occasionally returns no data from Sonar.',
    prompt: 'Search for the whitepaper for "{{coinName}}" on the "{{chain}}" blockchain, checking official project websites, blockchain explorers, or repositories like GitHub. Respond with a JSON object containing:\n- whitepaper_status: "Found" or "Not Found"\n- whitepapers: Array of objects, each with:\n  - summary: String, 100-200 word summary of the project’s purpose, technology, and key features\n  - source: String, valid URL to the whitepaper (e.g., https://example.com/whitepaper.pdf)\n  - score: Integer, 100 if found, 0 if not\n- final_score: Integer, 0-100, average of whitepaper scores or 50 if no data\n- reason: String, explanation if no whitepaper found\n- sources: Array of strings, valid URLs to sources (e.g., https://example.com)\nEnsure the JSON is valid and matches the schema.',
    schema: {
      type: 'object',
      properties: {
        whitepaper_status: { type: 'string', enum: ['Found', 'Not Found'] },
        whitepapers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              source: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' },
              score: { type: 'integer', minimum: 0, maximum: 100 }
            },
            required: ['summary', 'source', 'score']
          }
        },
        final_score: { type: 'integer', minimum: 0, maximum: 100 },
        reason: { type: 'string' },
        sources: { type: 'array', items: { type: 'string', pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$' } }
      },
      required: ['whitepaper_status', 'whitepapers', 'final_score', 'reason', 'sources']
    }
  }
};

/**
 * Fetches a raw response for a specific IQScore category from the Sonar API.
 * @param {string} coinName - Name of the cryptocurrency or project (e.g., Ethereum).
 * @param {string} chain - Blockchain network name (e.g., Ethereum).
 * @param {string} category - Analysis category (e.g., audit, whitepaper).
 * @returns {Promise<Object>} Raw JSON response from the API.
 * @throws {Error} If input validation fails or API request fails after retries.
 */
export const fetchCategoryResponse = async (coinName, chain, category) => {
  if (!coinName || typeof coinName !== 'string' || coinName.trim().length === 0) {
    console.error(`${LOG_PREFIX} Invalid coin name: ${coinName}`);
    throw new Error('Invalid coin name');
  }
  if (!chain || typeof chain !== 'string' || chain.trim().length === 0) {
    console.error(`${LOG_PREFIX} Invalid chain: ${chain}`);
    throw new Error('Invalid chain');
  }
  if (!category || typeof category !== 'string') {
    console.error(`${LOG_PREFIX} Invalid category: ${category}`);
    throw new Error(`Invalid category: ${category}`);
  }

  const trimmedCoinName = coinName.trim();
  const trimmedChain = chain.trim();
  const categoryLower = category.toLowerCase();
  const retries = 3;

  const config = CATEGORY_CONFIGS[categoryLower];
  if (!config) {
    console.error(`${LOG_PREFIX} Configuration not found for category: ${categoryLower}`);
    throw new Error(`Configuration not found for category: ${categoryLower}`);
  }

  const userPrompt = config.prompt.replace(/{{coinName}}/g, trimmedCoinName).replace(/{{chain}}/g, trimmedChain);

  const apiKey = process.env.SONAR_API_KEY;
  if (!apiKey) {
    console.error(`${LOG_PREFIX} Missing SONAR_API_KEY environment variable`);
    throw new Error('Sonar API key missing');
  }
  const apiUrl = process.env.SONAR_API_URL || 'https://api.perplexity.ai/chat/completions';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`${LOG_PREFIX} Attempt ${attempt} for ${config.category} (Coin: ${trimmedCoinName}, Chain: ${trimmedChain})`);

      const payload = {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: { schema: config.schema }
        },
        max_tokens: 1000
      };

      const response = await axios.post(apiUrl, payload, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 120000
      });

      console.log(`${LOG_PREFIX} Success for ${config.category}. Response keys: ${Object.keys(response.data).join(', ')}, Content length: ${response.data.choices?.[0]?.message?.content?.length || 0} chars`);
      return response.data;
    } catch (error) {
      console.error(`${LOG_PREFIX} Attempt ${attempt} failed for ${config.category}: ${error.message}`);
      if (error.response) {
        console.error(`${LOG_PREFIX} API response details: Status=${error.response.status}, Data=`, error.response.data);
      }
      if (error.response?.status === 429) {
        throw new Error('Sonar API rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('Sonar API authentication failed: Invalid or missing API key');
      }
      if (attempt === retries) {
        console.warn(`${LOG_PREFIX} All retries failed for ${config.category}. Returning fallback response.`);
        return {
          choices: [],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          error: 'Analysis service temporarily unavailable.'
        };
      }
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
};