// @ts-nocheck
"use server"

/**
 * @file projects-actions.ts
 *
 * @description
 * Server actions for project creation and awarding logic upon project completion. 
 * 
 * Key points:
 * - createProjectAction: Now accepts both requiredSkills and completionSkills from the user (the project owner).
 * - autoAwardOnPrMergeAction: Called by GitHub webhook if a PR is merged; awards tokens + completionSkills.
 * - approveSubmissionAction: Manual approval that also awards tokens + completionSkills.
 *
 * @dependencies
 * - drizzle-orm for DB queries
 * - balances-actions.ts for awarding user balances
 * - skills-actions.ts for awarding new skills
 * - projectsTable from db/schema/projects-schema
 */

import { eq, and, desc } from "drizzle-orm"

import { updateBalanceAction } from "@/actions/db/balances-actions"
import {
  getOrCreateSkillAction,
  addSkillToUserAction
} from "@/actions/db/skills-actions"
import { db } from "@/db/db"
import { projectsTable } from "@/db/schema/projects-schema"
import { projectSubmissionsTable } from "@/db/schema/project-submissions-schema"


interface ActionResult<T = any> {
  isSuccess: boolean
  message: string
  data?: T
}

/**
 * For the "Create Project" workflow
 */
interface CreateProjectParams {
  walletEns: string
  walletAddress: string
  projectName: string
  projectDescription?: string
  projectRepo?: string
  prizeAmount?: number
  requiredSkills?: string
  completionSkills?: string
  deadline?: string | Date
  onChainProjectId?: string // Blockchain project ID from smart contract
}

/**
 * Validates if a string is in correct ISO 8601 format
 * Accepts various ISO 8601 formats including ones with milliseconds
 */
function isValidISODate(dateString: string): boolean {
  // The existing regex is too restrictive, we need a more flexible approach
  try {
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date';
  } catch (error) {
    return false;
  }
}

/**
 * Create Project from input parameters
 * We don't accept projectId as an input param. It's always auto-generated.
 */
export async function createProjectAction(params: CreateProjectParams): Promise<ActionResult> {
  try {
    console.log("[createProjectAction] params", params)
    
    // Validation: Input has required fields?
    if (!params.walletEns || !params.projectName) {
      return {
        isSuccess: false,
        message: 'Missing required fields (walletEns, projectName)'
      }
    }
    
    // Lower-case address for consistency, even when querying
    const lowerCaseAddress = (params.walletAddress || '').toLowerCase()
    
    // Check prize amount. 
    // undefined => 0
    // null => 0
    // < 0 => 0
    // NaN => 0
    const proposedPrize = ((Number(params.prizeAmount) > 0) && !isNaN(Number(params.prizeAmount))) 
       ? Number(params.prizeAmount) 
       : 0
    
    // Insert into projectsTable
    const insertResult = await db
      .insert(projectsTable)
      .values({
        projectName: params.projectName,
        projectDescription: params.projectDescription ?? '',
        prizeAmount: proposedPrize.toString(),
        projectStatus: 'open',
        projectOwnerWalletEns: params.walletEns,
        projectOwnerWalletAddress: lowerCaseAddress,
        requiredSkills: params.requiredSkills || '',
        completionSkills: params.completionSkills || '',
        projectRepo: params.projectRepo || '',
        onChainProjectId: params.onChainProjectId || null, // Store blockchain project ID
        deadline: params.deadline ? new Date(params.deadline) : null,
      })
      .returning()
    
    if (!insertResult || insertResult.length === 0) {
      return {
        isSuccess: false,
        message: 'Insert failed',
      }
    }
    
    // We can now get the auto-generated ID.
    const projectId = insertResult[0].projectId
    console.log(`[createProjectAction] Created project ID: ${projectId}. onChainProjectId: ${params.onChainProjectId || 'none'}`);
    
    return {
      isSuccess: true,
      message: 'Project created successfully',
      data: insertResult[0]
    }
  } catch (error) {
    console.error('[createProjectAction] error =>', error)
    return {
      isSuccess: false,
      message: `Error creating project: ${(error as Error).message}`
    }
  }
}

/**
 * Auto-award tokens and skills when a PR is merged
 * This function is called by the GitHub webhook handler
 */
export async function autoAwardOnPrMergeAction(params: {
  projectId: string
  freelancerWalletEns: string
  freelancerWalletAddress: string
}): Promise<ActionResult> {
  try {
    const freelancerAddress = params.freelancerWalletAddress.toLowerCase();
    
    console.log(`[autoAwardOnPrMergeAction] Starting auto-award process for project ${params.projectId} to freelancer ${freelancerAddress}`);
    console.log(`[autoAwardOnPrMergeAction] Input parameters:`, params);
    
    // Initialize this variable at function scope so it's available throughout the function
    let blockchainResult = { success: false, txHash: null };
    
    // SCHEMA DEBUG: Log table imports to check if they're defined properly
    console.log(`[autoAwardOnPrMergeAction] DEBUG - Schema tables availability:`);
    console.log(`[autoAwardOnPrMergeAction] projectsTable defined:`, !!projectsTable);
    console.log(`[autoAwardOnPrMergeAction] projectsTable columns:`, projectsTable ? Object.keys(projectsTable) : 'UNDEFINED');
    
    try {
      console.log(`[autoAwardOnPrMergeAction] projectSubmissionsTable defined:`, !!projectSubmissionsTable);
      console.log(`[autoAwardOnPrMergeAction] projectSubmissionsTable columns:`, 
        projectSubmissionsTable ? Object.keys(projectSubmissionsTable) : 'UNDEFINED');
      
      // If this is undefined, log what's actually imported
      if (!projectSubmissionsTable) {
        console.error(`[autoAwardOnPrMergeAction] CRITICAL ERROR: projectSubmissionsTable is undefined!`);
        console.log(`[autoAwardOnPrMergeAction] Showing import source:`, require('@/db/schema/project-submissions-schema'));
      }
    } catch (schemaError) {
      console.error(`[autoAwardOnPrMergeAction] ERROR checking schema definitions:`, schemaError);
    }
    
    // First query: Get project details
    console.log(`[autoAwardOnPrMergeAction] Querying project with ID: ${params.projectId}`);
    
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, params.projectId));

    if (!project) {
      console.error(`[autoAwardOnPrMergeAction] Project not found with ID: ${params.projectId}`);
      return { isSuccess: false, message: "Project not found" };
    }
    
    console.log(`[autoAwardOnPrMergeAction] Project found:`, {
      name: project.projectName,
      status: project.projectStatus,
      prizeAmount: project.prizeAmount
    });
    
    if (project.projectStatus !== "open") {
      console.log(`[autoAwardOnPrMergeAction] Project ${params.projectId} is already ${project.projectStatus}, not open`);
      return {
        isSuccess: false,
        message: "Project is already closed. No auto-award applied."
      };
    }

    // Find the submission to get the blockchain submission ID
    console.log(`[autoAwardOnPrMergeAction] Looking for submission for project ${params.projectId} by freelancer ${freelancerAddress}`);
    console.log(`[autoAwardOnPrMergeAction] DEBUG - About to query projectSubmissionsTable`);
    
    let submission = null;
    
    // IMPORTANT: Try each step of the query construction separately to find the exact failure point
    try {
      // Step 1: Check if we can create a basic select query
      console.log(`[autoAwardOnPrMergeAction] Step 1: Testing basic select`);
      const testSelect = db.select();
      console.log(`[autoAwardOnPrMergeAction] Basic select works:`, !!testSelect);
      
      // Step 2: Check if we can reference the table
      console.log(`[autoAwardOnPrMergeAction] Step 2: Testing table reference`);
      
      // This is to fix the potential import issue - just import directly here
      console.log(`[autoAwardOnPrMergeAction] Importing project-submissions-schema directly`);
      const { projectSubmissionsTable: localSubmissionsTable } = await import('@/db/schema/project-submissions-schema');
      
      console.log(`[autoAwardOnPrMergeAction] Local import successful:`, !!localSubmissionsTable);
      console.log(`[autoAwardOnPrMergeAction] Local table columns:`, localSubmissionsTable ? Object.keys(localSubmissionsTable) : 'UNDEFINED');
      
      // Step 3: Test if we can create a simple query with the local import
      console.log(`[autoAwardOnPrMergeAction] Step 3: Testing basic query with local import`);
      const submissionQuery = db
        .select()
        .from(localSubmissionsTable)
        .limit(1);
      
      console.log(`[autoAwardOnPrMergeAction] Basic query works:`, !!submissionQuery);
      
      // Step 4: Test a full query using the local import
      console.log(`[autoAwardOnPrMergeAction] Step 4: Testing full query with local import`);
      const [foundSubmission] = await db
        .select()
        .from(localSubmissionsTable)
        .where(
          and(
            eq(localSubmissionsTable.projectId, params.projectId),
            eq(localSubmissionsTable.freelancerWalletAddress, freelancerAddress)
          )
        )
        .orderBy(desc(localSubmissionsTable.createdAt))
        .limit(1);

      submission = foundSubmission;

      if (!submission) {
        console.log(`[autoAwardOnPrMergeAction] No submission found for project ${params.projectId} by freelancer ${freelancerAddress}`);
      } else {
        console.log(`[autoAwardOnPrMergeAction] Found submission: ${submission.submissionId}, onChainId: ${submission.onChainSubmissionId || 'none'}`);
      }
      
      // Call the blockchain to approve submission and transfer tokens
      if (submission?.onChainSubmissionId) {
        try {
          console.log(`[autoAwardOnPrMergeAction] Calling blockchain approval for submission ${submission.onChainSubmissionId}`);
          
          // Import the blockchain utility for approving submissions
          const { approveSubmissionOnChain } = await import('@/app/api/blockchain-utils');
          
          blockchainResult = await approveSubmissionOnChain(
            freelancerAddress, 
            submission.onChainSubmissionId
          );
          
          if (blockchainResult.success) {
            console.log(`[autoAwardOnPrMergeAction] Blockchain approval successful! Transaction hash: ${blockchainResult.txHash}`);
            
            // Update the submission record with the transaction hash
            await db
              .update(projectSubmissionsTable)
              .set({ 
                blockchainTxHash: blockchainResult.txHash,
                status: "awarded",
                updatedAt: new Date()
              })
              .where(eq(projectSubmissionsTable.submissionId, submission.submissionId));
          } else {
            console.error(`[autoAwardOnPrMergeAction] Blockchain approval failed:`, blockchainResult.error);
          }
        } catch (blockchainError) {
          console.error(`[autoAwardOnPrMergeAction] Error calling blockchain:`, blockchainError);
          // Keep going to handle the database updates regardless of blockchain errors
        }
      } else {
        console.log(`[autoAwardOnPrMergeAction] No blockchain submission ID found, skipping blockchain approval`);
      }
      
    } catch (queryError) {
      console.error(`[autoAwardOnPrMergeAction] ERROR in query construction:`, queryError);
      console.error(`[autoAwardOnPrMergeAction] Error stack:`, queryError.stack);
      // Don't return here, we should still try to update the database
    }

    // Award tokens in our database (backup/mirror of blockchain state)
    const prize = project.prizeAmount ? Number(project.prizeAmount) : 0;
    if (prize > 0) {
      console.log(`[autoAwardOnPrMergeAction] Updating balance in database: +${prize} EDU`);
      
      const awardResult = await updateBalanceAction({
        walletEns: params.freelancerWalletEns,
        walletAddress: params.freelancerWalletAddress,
        amount: prize,
        preventNegativeBalance: false
      });
      
      if (!awardResult.isSuccess) {
        console.error(`[autoAwardOnPrMergeAction] Database balance update failed:`, awardResult.message);
        // We don't return an error here since the blockchain transaction might have succeeded
      } else {
        console.log(`[autoAwardOnPrMergeAction] Database balance updated successfully`);
      }
    }

    // Award completion skills if any
    const compSkillsStr = (project.completionSkills || "").trim();
    if (compSkillsStr) {
      console.log(`[autoAwardOnPrMergeAction] Awarding completion skills: ${compSkillsStr}`);
      
      const skillNames = compSkillsStr.split(",").map((x: string) => x.trim()).filter(Boolean);
      for (const skillName of skillNames) {
        const getOrCreate = await getOrCreateSkillAction(skillName);
        if (!getOrCreate.isSuccess || !getOrCreate.data) {
          console.error(`[autoAwardOnPrMergeAction] Failed to create/find skill '${skillName}':`, getOrCreate.message);
          continue;
        }
        
        // Access the correct property - skillId instead of id
        const skillId = getOrCreate.data.skillId;
        console.log(`[autoAwardOnPrMergeAction] Adding skill '${skillName}' (ID: ${skillId}) to user`);
        
        const addSkill = await addSkillToUserAction({
          walletEns: params.freelancerWalletEns,
          walletAddress: params.freelancerWalletAddress,
          skillId
        });
        
        if (!addSkill.isSuccess) {
          console.error(`[autoAwardOnPrMergeAction] Failed to add skill '${skillName}' to user:`, addSkill.message);
        } else {
          console.log(`[autoAwardOnPrMergeAction] Successfully added skill '${skillName}' to user`);
        }
      }
    }

    // Mark project as closed
    console.log(`[autoAwardOnPrMergeAction] Updating project status to 'closed'`);
    await db
      .update(projectsTable)
      .set({
        projectStatus: "closed",
        assignedFreelancerWalletEns: params.freelancerWalletEns,
        assignedFreelancerWalletAddress: params.freelancerWalletAddress,
        updatedAt: new Date()
      })
      .where(eq(projectsTable.projectId, params.projectId));

    // Prepare result message
    let resultMessage = `Auto-award done. Tokens awarded: ${prize} EDU.`;
    if (blockchainResult.success) {
      resultMessage += ` Blockchain transaction successful: ${blockchainResult.txHash}`;
    }

    return {
      isSuccess: true,
      message: resultMessage,
      data: {
        blockchainSuccess: blockchainResult.success,
        blockchainTxHash: blockchainResult.txHash,
        tokensAwarded: prize
      }
    };
  } catch (error) {
    console.error("[autoAwardOnPrMergeAction] Unhandled error:", error);
    console.error("[autoAwardOnPrMergeAction] Error stack:", error.stack);
    return { isSuccess: false, message: "Failed to auto-award" };
  }
}


export async function approveSubmissionAction(params: {
  projectId: string
  freelancerWalletEns: string
  freelancerWalletAddress: string
  companyWalletEns: string
  companyWalletAddress: string
}): Promise<ActionResult> {
  try {
    // 1) Load project
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.projectId, params.projectId))
    if (!project) {
      return { isSuccess: false, message: 'Project not found' }
    }

    // 2) Must match projectOwner
    if (project.projectOwnerWalletEns.toLowerCase() !== params.companyWalletEns.toLowerCase()) {
      return { isSuccess: false, message: 'Not authorized' }
    }

    // 3) Mark project as closed & assign the freelancer
    await db.update(projectsTable).set({
      projectStatus: 'closed',
      assignedFreelancerWalletEns: params.freelancerWalletEns,
      assignedFreelancerWalletAddress: params.freelancerWalletAddress,
    }).where(eq(projectsTable.projectId, params.projectId))

    // 4) Award tokens
    const prize = parseFloat(project.prizeAmount?.toString() ?? '0')
    if (prize > 0) {
      const award = await updateBalanceAction({ 
        walletEns: params.freelancerWalletEns, 
        walletAddress: params.freelancerWalletAddress,
        amount: prize 
      })
      if (!award.isSuccess) {
        return { isSuccess: false, message: `Failed awarding tokens: ${award.message}` }
      }
    }

    // 5) Award completion skills
    const compSkillsStr = project.completionSkills?.trim() || ''
    if (compSkillsStr) {
      const skillNames = compSkillsStr.split(',').map((s: string) => s.trim()).filter(Boolean)
      for (const skillName of skillNames) {
        const getOrCreate = await getOrCreateSkillAction(skillName)
        if (!getOrCreate.isSuccess || !getOrCreate.data) {
          console.error(`Could not create/fetch skill '${skillName}':`, getOrCreate.message)
          continue
        }
        
        const skillData = getOrCreate.data
        if (!skillData.id) {
          console.error(`Skill '${skillName}' was found but has no ID`, skillData)
          continue
        }
        
        const addSkill = await addSkillToUserAction({ 
          walletEns: params.freelancerWalletEns, 
          walletAddress: params.freelancerWalletAddress,
          skillId: skillData.id 
        })
        
        if (!addSkill.isSuccess) {
          console.error(`Failed to add skill '${skillName}' to user:`, addSkill.message)
        }
      }
    }

    return { isSuccess: true, message: 'Project approved, tokens/skills awarded.' }
  } catch (error) {
    console.error('approveSubmissionAction error:', error)
    return { isSuccess: false, message: 'Internal error approving submission' }
  }
}