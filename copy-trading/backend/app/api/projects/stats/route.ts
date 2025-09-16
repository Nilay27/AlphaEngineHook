// @ts-nocheck
import { eq, sql, count, sum } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'

// Force this API route to be dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/stats
 * Retrieve statistics about projects
 * Optional query parameter:
 * - owner: Filter stats by project owner
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const owner = searchParams.get('owner')
    
    // Base query with SQL counter and summation 
    let query = db
      .select({
        totalProjects: count(),
        openProjects: count(eq(projectsTable.projectStatus, 'open')),
        closedProjects: count(eq(projectsTable.projectStatus, 'closed')),
        totalPrizeAmount: sql<number>`SUM(CAST(${projectsTable.prizeAmount} AS DECIMAL(10,2)))`,
      })
      .from(projectsTable);
      
    // Filter by owner if provided
    if (owner) {
      query = query.where(eq(projectsTable.projectOwner, owner)) as any;
    }
    
    const results = await query;
    const stats = results[0];
    
    // Get distribution of required skills
    const skillsQuery = `
      SELECT unnest(string_to_array(required_skills, ',')) as skill_name, 
             COUNT(*) as count
      FROM projects
      ${owner ? 'WHERE project_owner = $1' : ''}
      GROUP BY skill_name
      ORDER BY count DESC
      LIMIT 10
    `;
    
    // Option 2: Use explicit parameters array with proper typing
    type SqlParams = string[] & { 0?: string };
    const params: SqlParams = owner ? [owner] : [];

    const skillsResult = await db.execute(sql`${sql.raw(skillsQuery)} ${params[0] || sql``}`);
    
    // Get recent project creation trend (past 6 months)
    const trendQuery = `
      SELECT 
        date_trunc('month', created_at) as month,
        COUNT(*) as count
      FROM projects
      ${owner ? 'WHERE project_owner = $1' : ''}
      WHERE created_at > NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `;
    
    const trendResult = await db.execute(sql`${sql.raw(trendQuery)} ${params[0] || sql``}`);
    
    return NextResponse.json({
      data: {
        summary: {
          totalProjects: Number(stats?.totalProjects || 0),
          openProjects: Number(stats?.openProjects || 0),
          closedProjects: Number(stats?.closedProjects || 0),
          totalPrizeAmount: Number(stats?.totalPrizeAmount || 0)
        },
        skillDistribution: skillsResult.rows,
        monthlyTrend: trendResult.rows
      }
    }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/projects/stats] Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 