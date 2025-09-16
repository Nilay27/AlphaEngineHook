// API Configuration for AlphaEngine

export const apiConfig = {
  version: 'v1',
  baseUrl: '/api/v1',

  endpoints: {
    // Strategy endpoints
    strategies: {
      base: '/strategies',
      byId: '/strategies/:id',
      byWallet: '/strategies/wallet/:address',
      performance: '/strategies/:id/performance',
    },

    // Subscription endpoints
    subscriptions: {
      base: '/subscriptions',
      subscribe: '/subscriptions/subscribe',
      unsubscribe: '/subscriptions/unsubscribe',
      byStrategy: '/subscriptions/strategy/:id',
      bySubscriber: '/subscriptions/subscriber/:address',
    },

    // Trade endpoints
    trades: {
      base: '/trades',
      byStrategy: '/trades/strategy/:id',
      confirm: '/trades/confirm',
      broadcast: '/trades/broadcast',
      history: '/trades/history',
    },

    // SSE endpoints for real-time updates
    sse: {
      subscribe: '/sse/subscribe',
      trades: '/sse/trades/:strategyId',
    },

    // Health check
    health: '/health',
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address'],
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Response headers
  headers: {
    'X-API-Version': 'v1',
    'X-Powered-By': 'AlphaEngine',
  }
}

// Helper function to build full endpoint URL
export function buildEndpoint(endpoint: string): string {
  return `${apiConfig.baseUrl}${endpoint}`
}

// Helper function to apply parameters to endpoint
export function applyParams(endpoint: string, params: Record<string, string>): string {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}