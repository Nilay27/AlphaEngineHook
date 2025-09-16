// @ts-nocheck
import { sql } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'
// Alternatively, you could import from '@/db/schema' if all schemas are properly exported there

// Force this API route to be dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/search
 * Search API using SQL template literals to avoid type issues
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get search parameters
    const searchTerm = searchParams.get('q') || ''
    const status = searchParams.get('status')
    
    // Build the query conditions
    let conditions = []
    
    if (searchTerm) {
      conditions.push(sql`(project_name ILIKE ${`%${searchTerm}%`} OR project_description ILIKE ${`%${searchTerm}%`})`)
    }
    
    if (status) {
      conditions.push(sql`project_status = ${status}`)
    }
    
    // Join conditions with AND if there are any
    const whereClause = conditions.length 
      ? sql`WHERE ${sql.join(conditions, sql` AND `)}` 
      : sql``
    
    // Final query with sorting
    const query = sql`
      SELECT * FROM projects
      ${whereClause}
      ORDER BY created_at DESC
    `
    
    const projects = await db.execute(query)
    
    return NextResponse.json({ data: projects }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/projects/search] Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 