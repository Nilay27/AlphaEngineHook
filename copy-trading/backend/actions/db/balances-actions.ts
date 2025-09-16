// @ts-nocheck
/**
 * @file balances-actions.ts
 *
 * @description
 * This file contains server-side actions to manage user balances in LearnLedger.
 * Specifically, it implements the `updateBalanceAction` function to increment or
 * decrement a user's off-chain token balance.
 *
 * New Feature:
 * - "preventNegativeBalance" param to block updates leading to negative final balances
 *
 * Key features:
 * - updateBalanceAction: Looks up the user's balance record in the database. If it does not exist,
 *   it inserts a new one. Otherwise, it updates the existing balance by adding the specified amount.
 * - Simple error handling with try/catch. Returns an object indicating success or failure.
 *
 * @dependencies
 * - "@/db/db": Drizzle ORM instance for Postgres
 * - "@/db/schema/user-balances-schema": The userBalancesTable definition
 * - "drizzle-orm": eq function
 */

"use server"

import { eq } from "drizzle-orm"

import { db } from "@/db/db"
import { userBalancesTable } from "@/db/schema/user-balances-schema"

/**
 * @interface UpdateBalanceParams
 * Describes the input parameters for the updateBalanceAction function.
 */
interface UpdateBalanceParams {
  /**
   * The user's ENS name 
   */
  walletEns: string
  walletAddress: string

  /**
   * The amount to increment (or decrement if negative) the user's balance by.
   */
  amount: number

  /**
   * If true, block any final balance that would be negative.
   * Defaults to true for safety. If your use case allows negative balances,
   * explicitly set this to false.
   */
  preventNegativeBalance?: boolean
}

/**
 * @interface UpdateBalanceResult
 * Common return type for action responses, indicating success or failure.
 */
interface UpdateBalanceResult<T = any> {
  isSuccess: boolean
  message?: string
  data?: T
}

/**
 * @function updateBalanceAction
 * @description
 * Updates a user's off-chain token balance in the `user_balances` table by
 * adding the specified `amount`. If the user has no balance record yet,
 * this function creates it (with `preventNegativeBalance` check).
 *
 * @param {UpdateBalanceParams} params - The user ID, the amount to add, and a negative balance prevention flag.
 * @returns {Promise<UpdateBalanceResult>} An object indicating success or failure of the update operation.
 */
export async function updateBalanceAction(
  params: UpdateBalanceParams
): Promise<UpdateBalanceResult> {
  const {
    walletEns,
    walletAddress,
    amount,
    preventNegativeBalance = true // default to not allowing negative
  } = params

  try {
    const lowerWalletEns = walletEns.toLowerCase();
    const lowerWalletAddress = walletAddress.toLowerCase();
    
    // Attempt to find an existing user balance record
    const [existingBalance] = await db
      .select()
      .from(userBalancesTable)
      .where(eq(userBalancesTable.walletEns, lowerWalletEns))

    if (!existingBalance) {
      // No record yet: create a new balance row for this user
      const newBalance = amount

      if (preventNegativeBalance && newBalance < 0) {
        return {
          isSuccess: false,
          message: "Operation would cause negative balance, aborted."
        }
      }

      // Use a separate variable and type assertion to fix the TypeScript error
      const result = await db
        .insert(userBalancesTable)
        .values({
          walletEns: lowerWalletEns,
          walletAddress: lowerWalletAddress,
          balance: newBalance.toString()
        })
        .returning();
        
      const newRecord = Array.isArray(result) && result.length > 0 ? result[0] : result;

      return {
        isSuccess: true,
        data: newRecord,
        message: `Balance record created. WalletEns: ${lowerWalletEns}, Amount: ${amount}`
      }
    } else {
      // Record found: increment existing balance
      const current = parseFloat(existingBalance.balance?.toString() ?? "0")
      const newBalance = current + amount

      if (preventNegativeBalance && newBalance < 0) {
        return {
          isSuccess: false,
          message: "Operation would cause negative balance, aborted."
        }
      }

      const [updated] = await db
        .update(userBalancesTable)
        .set({ 
          balance: newBalance.toString(),
        })
        .where(eq(userBalancesTable.walletEns, lowerWalletEns))
        .returning()

      return {
        isSuccess: true,
        data: updated,
        message: `Balance updated successfully. WalletEns: ${lowerWalletEns}, Added: ${amount}`
      }
    }
  } catch (error) {
    console.error("Error updating user balance:", error)
    return {
      isSuccess: false,
      message: "Failed to update user balance"
    }
  }
}

