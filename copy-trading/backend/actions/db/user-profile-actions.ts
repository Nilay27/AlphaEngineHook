/* <content> actions/db/user-profile-actions.ts */

"use server"

/**
 * @file user-profile-actions.ts
 *
 * Provides actions for:
 *  - Getting a user's profile (company or freelancer)
 *  - Registering a user profile (inserting or updating in company/freelancer table)
 *  - If role=freelancer and we get "skills", parse & store them in bridging user_skills, if desired
 *
 * Additional Requirements from the latest updates:
 *  - "walletEns" is mandatory for freelancers (treated as a unique handle).
 *  - If we find a freelancer with that walletEns, we update them (including changing their walletAddress).
 *  - The response must contain all fields: 
 *    {
 *       "id", "walletEns", "walletAddress", 
 *       "freelancerName"/"companyName", "skills", 
 *       "profilePicUrl"/"logoUrl", "githubProfileUsername", 
 *       "createdAt", "updatedAt"
 *    }
 */

import { db } from '@/db/db'
import { companyTable } from '@/db/schema/company-schema'
import { freelancerTable } from '@/db/schema/freelancer-schema'
import { eq, sql } from 'drizzle-orm'

// We need these for bridging skills if you are using them:
import { getOrCreateSkillAction, addSkillToUserAction } from '@/actions/db/skills-actions'

/** 
 * Generic ActionResult interface 
 */
interface ActionResult<T = any> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

/**
 * @function getUserProfileAction
 * Looks up existing profile in either company or freelancer table, by walletAddress
 * or by walletEns (depending on usage).
 */
export async function getUserProfileAction(params: {
  walletAddress?: string;
  walletEns?: string;
  role: 'company' | 'freelancer';
}): Promise<ActionResult> {
  try {
    const { walletAddress = '', walletEns = '', role } = params;
    const lowerWallet = walletAddress.toLowerCase();
    const lowerEns = walletEns.toLowerCase();

    if (role === 'company') {
      // Try walletAddress first, else walletEns
      let companyQuery;
      if (lowerWallet) {
        companyQuery = db.select().from(companyTable).where(eq(companyTable.walletAddress, lowerWallet));
      } else if (lowerEns) {
        companyQuery = db.select().from(companyTable).where(eq(companyTable.walletEns, lowerEns));
      } else {
        companyQuery = db.select().from(companyTable);
      }
      const companies = await companyQuery.limit(1);
      const company = companies.length > 0 ? companies[0] : null;
      return { isSuccess: true, message: 'OK', data: company };
    } else {
      // role = 'freelancer'
      let freelancerQuery;
      if (lowerWallet) {
        freelancerQuery = db.select().from(freelancerTable).where(eq(freelancerTable.walletAddress, lowerWallet));
      } else if (lowerEns) {
        freelancerQuery = db.select().from(freelancerTable).where(eq(freelancerTable.walletEns, lowerEns));
      } else {
        freelancerQuery = db.select().from(freelancerTable);
      }
      const freelancers = await freelancerQuery.limit(1);
      const freelancer = freelancers.length > 0 ? freelancers[0] : null;
      return { isSuccess: true, message: 'OK', data: freelancer };
    }
  } catch (error: any) {
    console.error('[getUserProfileAction] Error:', error);
    return { isSuccess: false, message: error.message || 'Failed to get user profile' };
  }
}

/**
 * @function registerUserProfileAction
 * Creates or updates a row in `company` or `freelancer` table. 
 *
 * Changes for "walletEns" requirement (especially for freelancers):
 *   - If we find an existing freelancer by that `walletEns`, we update.
 *   - Otherwise, we create new.
 *   - Similarly for companies if you want the same approach (below it is mirrored).
 *
 * For freelancers, also handles bridging user_skills if "skills" are provided.
 *
 * Returns a final object including all fields requested in the new "expected" output.
 */

export async function registerUserProfileAction(params: {
  role: string;
  walletAddress: string;
  walletEns?: string;
  // Company fields
  companyName?: string;
  shortDescription?: string;
  logoUrl?: string;
  githubProfileUsername?: string;
  // Freelancer fields
  freelancerName?: string;
  skills?: string;
  profilePicUrl?: string;
}): Promise<ActionResult> {
  try {
    // Use consistent lowercase for addresses and ENS names
    const walletAddress = params.walletAddress.toLowerCase().trim();
    const walletEns = params.walletEns ? params.walletEns.toLowerCase().trim() : '';
    const role = params.role.toLowerCase().trim();

    // FREELANCER registration
    if (role === 'freelancer') {
      // Check for required fields
      if (!walletEns) {
        return {
          isSuccess: false,
          message: 'walletEns is required for freelancers'
        };
      }
      if (!params.freelancerName) {
        return {
          isSuccess: false,
          message: 'freelancerName is required for freelancers'
        };
      }

      // Check if already exists
      const existingFreelancer = await checkFreelancerExists(walletEns, walletAddress);
      if (existingFreelancer) {
        // UPDATE existing record
        const updatedRows = await db
          .update(freelancerTable)
          .set({
            walletAddress,
            freelancerName: params.freelancerName,
            skills: params.skills || existingFreelancer.skills || '',
            profilePicUrl: params.profilePicUrl || existingFreelancer.profilePicUrl || '',
            githubProfileUsername: params.githubProfileUsername || existingFreelancer.githubProfileUsername || '',
            updatedAt: new Date()
          })
          .where(eq(freelancerTable.id, existingFreelancer.id))
          .returning();

        const updatedFreelancer = Array.isArray(updatedRows) && updatedRows.length ? updatedRows[0] : null;
        
        // Process skills for the updated freelancer
        if (updatedFreelancer && params.skills) {
          await processFreelancerSkills(walletEns, walletAddress, params.skills);
        }

        return {
          isSuccess: true,
          message: 'Freelancer profile updated',
          data: formatUser(updatedFreelancer, 'freelancer')
        };
      }

      // CREATE new record
      const insertResult = await db
        .insert(freelancerTable)
        .values({
          walletEns,
          walletAddress,
          freelancerName: params.freelancerName,
          skills: params.skills || '',
          profilePicUrl: params.profilePicUrl || '',
          githubProfileUsername: params.githubProfileUsername || ''
        })
        .returning();

      const newFreelancer = Array.isArray(insertResult) && insertResult.length ? insertResult[0] : null;
      
      // Process skills for the new freelancer
      if (newFreelancer && params.skills) {
        await processFreelancerSkills(walletEns, walletAddress, params.skills);
      }

      return {
        isSuccess: true,
        message: 'Freelancer profile created',
        data: formatUser(newFreelancer, 'freelancer')
      };
    }
    
    // Handle company registration...
    if (params.role === 'company') {
      // Check if the company already exists
      const existingCompany = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns))
        .limit(1);

      // UPDATE existing company record
      if (existingCompany.length > 0) {
        const updateResult = await db
          .update(companyTable)
          .set({
            companyName: params.companyName,
            profilePicUrl: params.profilePicUrl || existingCompany[0].profilePicUrl || '',
            githubProfileUsername: params.githubProfileUsername || existingCompany[0].githubProfileUsername || '',
            updatedAt: new Date()
          })
          .where(eq(companyTable.id, existingCompany[0].id))
          .returning();

        const updatedCompany = Array.isArray(updateResult) && updateResult.length ? updateResult[0] : null;

        return {
          isSuccess: true,
          message: 'Company profile updated',
          data: formatUser(updatedCompany, 'company')
        };
      }

      // CREATE new company record
      const insertResult = await db
        .insert(companyTable)
        .values({
          walletEns,
          walletAddress,
          companyName: params.companyName,
          profilePicUrl: params.profilePicUrl || '',
          githubProfileUsername: params.githubProfileUsername || ''
        })
        .returning();

      const newCompany = Array.isArray(insertResult) && insertResult.length ? insertResult[0] : null;

      return {
        isSuccess: true,
        message: 'Company profile created',
        data: formatUser(newCompany, 'company')
      };
    }
    
    // Default return for other roles or unexpected code paths
    return {
      isSuccess: false,
      message: `Unsupported role: ${params.role}`
    };
    
  } catch (error) {
    console.error('[registerUserProfileAction] Error:', error);
    return {
      isSuccess: false,
      message: 'Failed to create/update user profile'
    };
  }
}

/**
 * Process a comma-separated skills string and add each skill to the user_skills table
 */
async function processFreelancerSkills(walletEns: string, walletAddress: string, skillsString: string) {
  try {
    if (!skillsString) return;
    
    // Import required actions
    const { getOrCreateSkillAction, addSkillToUserAction } = await import('@/actions/db/skills-actions');
    
    // Parse the skills string into an array
    const skillNames = skillsString
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    
    console.log(`Processing ${skillNames.length} skills for user ${walletEns}`);
    
    // Process each skill
    for (const skillName of skillNames) {
      // Get or create the skill
      const skillResult = await getOrCreateSkillAction(skillName);
      
      if (!skillResult.isSuccess || !skillResult.data) {
        console.error(`Failed to process skill: ${skillName}`, skillResult.message);
        continue;
      }
      
      // Add the skill to the user
      const addResult = await addSkillToUserAction({
        walletEns,
        walletAddress,
        skillId: skillResult.data.skillId
      });
      
      if (addResult.isSuccess) {
        console.log(`Added skill ${skillName} to user ${walletEns}`);
      } else if (addResult.message !== "User already has this skill") {
        console.error(`Failed to add skill ${skillName} to user ${walletEns}:`, addResult.message);
      }
    }
  } catch (error) {
    console.error('Error processing freelancer skills:', error);
  }
}

// Helper function to check if a freelancer already exists
async function checkFreelancerExists(walletEns: string, walletAddress: string): Promise<any> {
  let existing: any = null;
  
  // Check by ENS first if provided
  if (walletEns) {
    const rowsByEns = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.walletEns, walletEns))
      .limit(1);
    existing = rowsByEns.length > 0 ? rowsByEns[0] : null;
  }
  
  // If not found by ENS, check by wallet address
  if (!existing && walletAddress) {
    const rowsByWallet = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.walletAddress, walletAddress))
      .limit(1);
    existing = rowsByWallet.length > 0 ? rowsByWallet[0] : null;
  }
  
  return existing;
}

// Helper function to format user data for response
function formatUser(userData: any, role: 'freelancer' | 'company'): any {
  if (!userData) return null;
  
  if (role === 'freelancer') {
    return {
      id: userData.id,
      walletEns: userData.walletEns,
      walletAddress: userData.walletAddress,
      freelancerName: userData.freelancerName,
      profilePicUrl: userData.profilePicUrl,
      skills: userData.skills,
      githubProfileUsername: userData.githubProfileUsername,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
  } else {
    return {
      id: userData.id,
      walletEns: userData.walletEns,
      walletAddress: userData.walletAddress,
      companyName: userData.companyName,
      shortDescription: userData.shortDescription,
      logoUrl: userData.logoUrl,
      githubProfileUsername: userData.githubProfileUsername,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
  }
}