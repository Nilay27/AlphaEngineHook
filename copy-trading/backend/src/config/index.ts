import { config as dotenvConfig } from 'dotenv'
import path from 'path'

// Load environment variables
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') })

// Export all configurations
export * from './database'
export * from './api'

// Application configuration
export const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'alphaengine-secret-key',
  bcryptRounds: 10,

  // Frontend URL
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',

  // Blockchain configuration
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK || 'testnet',
    rpcUrl: process.env.RPC_URL || 'https://bsc-testnet.public.blastapi.io',
    chainId: parseInt(process.env.CHAIN_ID || '97', 10),
  },

  // WebSocket configuration for SSE
  sse: {
    heartbeatInterval: 30000, // 30 seconds
    clientTimeout: 60000, // 60 seconds
  },

  // Feature flags
  features: {
    enableSSE: process.env.ENABLE_SSE !== 'false',
    enableWebSockets: process.env.ENABLE_WEBSOCKETS === 'true',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  }
}

// Validate required environment variables
export function validateConfig(): void {
  const required = [
    'DATABASE_URL',
    'PORT',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  console.log('✅ Configuration validated successfully')
}

// Get configuration based on environment
export function getConfig() {
  return {
    app: appConfig,
    isDevelopment: appConfig.env === 'development',
    isProduction: appConfig.env === 'production',
    isTest: appConfig.env === 'test',
  }
}