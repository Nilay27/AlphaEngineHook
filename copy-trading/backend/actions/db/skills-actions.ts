// @ts-nocheck
"use server"

import { db } from "@/db/db"
import { skillsTable } from "@/db/schema/skills-schema"
import { userSkillsTable } from "@/db/schema/user-skills-schema"
import { freelancerTable } from "@/db/schema/freelancer-schema"
import { eq, and, sql } from "drizzle-orm"

interface ActionResult<T = any> {
  isSuccess: boolean
  message: string
  data?: T
}

export async function createSkillAction(
  skillName: string,
  skillDescription: string = ""
): Promise<ActionResult> {
  try {
    // First check if exists
    const existingResult = await db
      .select()
      .from(skillsTable)
      .where(
        eq(
          sql`LOWER(${skillsTable.skillName})`, 
          sql`LOWER(${skillName})`
        )
      )
      .limit(1);
    
    const existing = existingResult.length > 0 ? existingResult[0] : null;

    if (existing) {
      return {
        isSuccess: false,
        message: `Skill '${skillName}' already exists`,
        data: existing
      }
    }

    // Fix array destructuring issue
    const insertResult = await db
      .insert(skillsTable)
      .values({
        skillName,
        skillDescription
      })
      .returning();
    
    const newSkill = Array.isArray(insertResult) && insertResult.length > 0 
      ? insertResult[0] 
      : insertResult;

    return {
      isSuccess: true,
      message: `Skill '${skillName}' created`,
      data: newSkill
    }
  } catch (error) {
    console.error("Error in createSkillAction:", error)
    return {
      isSuccess: false,
      message: "Failed to create skill"
    }
  }
}

export async function getSkillByNameAction(skillName: string): Promise<ActionResult> {
  try {
    // Replace ilike with LOWER + like pattern
    const result = await db
      .select()
      .from(skillsTable)
      .where(
        eq(
          sql`LOWER(${skillsTable.skillName})`, 
          sql`LOWER(${skillName})`
        )
      )
      .limit(1);
    
    const skillRecord = result.length > 0 ? result[0] : null;

    if (!skillRecord) {
      return {
        isSuccess: false,
        message: `Skill '${skillName}' not found`
      }
    }

    return {
      isSuccess: true,
      message: `Skill found`,
      data: skillRecord
    }
  } catch (error) {
    console.error("Error in getSkillByNameAction:", error)
    return {
      isSuccess: false,
      message: "Failed to get skill by name"
    }
  }
}

export async function getOrCreateSkillAction(skillName: string, skillDescription?: string): Promise<ActionResult> {
  try {
    if (!skillName || skillName.trim() === '') {
      return {
        isSuccess: false,
        message: "Skill name cannot be empty",
      };
    }
    
    const trimmedSkillName = skillName.trim();
    
    // Use LOWER for case-insensitive comparison
    const existingSkills = await db
      .select()
      .from(skillsTable)
      .where(
        eq(
          sql`LOWER(${skillsTable.skillName})`, 
          sql`LOWER(${trimmedSkillName})`
        )
      )
      .limit(1);
    
    const existingSkill = existingSkills.length > 0 ? existingSkills[0] : null;

    if (existingSkill) {
      console.log(`Found existing skill: ${trimmedSkillName}, ID: ${existingSkill.skillId}`);
      
      // Log all properties to help with debugging
      console.log("Existing skill properties:", Object.keys(existingSkill));
      
      // Make sure we're returning the proper property names
      return {
        isSuccess: true,
        message: "Skill found",
        data: {
          ...existingSkill,
          // Ensure the ID is properly mapped regardless of property names
          skillId: existingSkill.skillId || existingSkill.id
        }
      };
    }

    // Create new skill with proper casing
    const insertResult = await db
      .insert(skillsTable)
      .values({
        skillName: trimmedSkillName,
        skillDescription: skillDescription || ""
      })
      .returning();
      
    const newSkill = Array.isArray(insertResult) && insertResult.length > 0 
      ? insertResult[0] 
      : insertResult;
      
    // Log the new skill to check property names
    console.log(`Created new skill: ${trimmedSkillName}, returned object:`, newSkill);
    console.log("New skill properties:", Object.keys(newSkill));
    
    // Verify the new skill has a valid ID - handle both possible property names
    if (!newSkill?.skillId && !newSkill?.id) {
      console.error("Created skill but it has no ID:", newSkill);
      return {
        isSuccess: false,
        message: "Failed to create skill properly",
      };
    }

    // Return with a consistent skillId property
    return {
      isSuccess: true,
      message: "Skill created",
      data: {
        ...newSkill,
        // Ensure the ID is properly mapped regardless of property names
        skillId: newSkill.skillId || newSkill.id
      }
    };
  } catch (error) {
    console.error("Error in getOrCreateSkillAction:", error);
    return {
      isSuccess: false,
      message: "Failed to get or create skill"
    };
  }
}

export async function addSkillToUserAction(params: { walletEns: string; walletAddress: string; skillId: string }): Promise<ActionResult> {
  try {
    if (!params.walletEns || !params.walletAddress) {
      return {
        isSuccess: false,
        message: "Wallet ENS and address are required"
      }
    }
    
    if (!params.skillId) {
      return {
        isSuccess: false,
        message: "Skill ID is required"
      }
    }
    
    const lowerWalletEns = params.walletEns.toLowerCase()
    const lowerWalletAddress = params.walletAddress.toLowerCase()
    
    // first check if user already has this skill
    const userSkillResults = await db
      .select()
      .from(userSkillsTable)
      .where(
        and(
          eq(userSkillsTable.walletEns, lowerWalletEns),
          eq(userSkillsTable.walletAddress, lowerWalletAddress),
          eq(userSkillsTable.skillId, params.skillId)
        )
      )
      .limit(1)
      
    const userSkill = userSkillResults.length > 0 ? userSkillResults[0] : null
    
    if (userSkill) {
      return {
        isSuccess: false,
        message: "User already has this skill",
        data: userSkill
      }
    }
    
    // otherwise insert
    const result = await db
      .insert(userSkillsTable)
      .values({ 
        walletEns: lowerWalletEns, 
        walletAddress: lowerWalletAddress, 
        skillId: params.skillId 
      })
      .returning()
      
    const inserted = Array.isArray(result) && result.length > 0 ? result[0] : result
    
    return {
      isSuccess: true,
      message: "Skill added to user profile",
      data: inserted
    }
  } catch (error) {
    console.error("Error in addSkillToUserAction:", error)
    return {
      isSuccess: false,
      message: "Failed to add skill to user"
    }
  }
}

/**
 * @function fetchUserSkillsAction
 * 
 * Returns all the skill rows for a given walletAddress user, **either** from:
 *  - bridging table user_skills (if that has data),
 *  - or fallback to the freelancer's .skills column if bridging is empty.
 */
export async function fetchUserSkillsAction(walletEns: string): Promise<ActionResult> {
  if (!walletEns) {
    return { isSuccess: false, message: "Wallet ENS is required" }
  }
  try {
    const lowerWalletEns = walletEns.toLowerCase();

   /*  // 1) Attempt bridging table first
    const rows = await db
      .select({
        userSkillId: userSkillsTable.id,
        userId: userSkillsTable.userId,
        skillId: userSkillsTable.skillId,
        addedAt: userSkillsTable.addedAt,
        skillName: skillsTable.skillName,
        skillDescription: skillsTable.skillDescription,
      })
      .from(userSkillsTable)
      .leftJoin(skillsTable, eq(userSkillsTable.skillId, skillsTable.skillId))
      .where(eq(userSkillsTable.userId, lowerUserId))

    // If bridging is not empty, return that
    if (rows.length > 0) {
      return {
        isSuccess: true,
        message: `Fetched skills for userId: ${lowerUserId} from bridging`,
        data: rows
      }
    } */

    // 2) If bridging is empty, fallback to reading the freelancer table .skills
    const [freelancer] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.walletEns, lowerWalletEns))
      .limit(1)

    if (!freelancer) {
      // No bridging + no freelancer found => empty result
      return {
        isSuccess: true,
        message: `No freelancer row for ${lowerWalletEns}`,
        data: []
      }
    }

    const fallbackRaw = freelancer.skills?.trim() || ''
    if (!fallbackRaw) {
      // They just have no skill string
      return {
        isSuccess: true,
        message: `Fallback: freelancer has an empty .skills column`,
        data: []
      }
    }

    // parse the raw "react, solidity" => create a pseudo array of skill objects
    const skillNames = fallbackRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    // Convert them to the same shape as bridging
    const fallbackRows = skillNames.map((sn) => ({
      userSkillId: '', // no bridging ID
      userId: lowerWalletEns,
      skillId: '', // we don't have a skill row ID, not bridging
      addedAt: new Date(),
      skillName: sn.toLowerCase(),
      skillDescription: ''
    }))

    return {
      isSuccess: true,
      message: `Fallback: returning .skills column for freelancer ${lowerWalletEns}`,
      data: fallbackRows
    }
  } catch (error) {
    console.error("Error fetching user skills:", error)
    return { isSuccess: false, message: "Failed to fetch user skills" }
  }
}