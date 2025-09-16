import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

// Check if DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set in .env.local!')
  console.error('Please make sure your .env.local file contains the DATABASE_URL variable')
  process.exit(1)
}

export default {
  schema: './db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config
