import { apiClient } from '@/utils/api-client'
import { handleApiError, withRetry } from '@/utils/api-error-handler'
import { Strategy, Subscriber, CreateStrategyInput } from '@/types/alphaengine'

/**
 * Strategy Performance Service
 * Handles all API interactions related to strategies and their performance
 */

/**
 * List all available strategies
 */
export const listStrategies = async (): Promise<Strategy[]> => {
  try {
    return await withRetry(() => 
      apiClient.get<Strategy[]>('/api/v1/strategies')
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get a specific strategy by ID
 */
export const getStrategy = async (id: string): Promise<Strategy> => {
  try {
    return await withRetry(() => 
      apiClient.get<Strategy>(`/api/v1/strategies/${id}`)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get subscribers for a specific strategy
 */
export const getSubscribers = async (id: string): Promise<Subscriber[]> => {
  try {
    return await withRetry(() => 
      apiClient.get<Subscriber[]>(`/api/v1/strategies/${id}/subscribers`)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new strategy
 */
export const createStrategy = async (
  strategyData: CreateStrategyInput
): Promise<Strategy> => {
  try {
    return await apiClient.post<Strategy>('/api/v1/strategies', strategyData);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing strategy
 */
export const updateStrategy = async (
  id: string,
  strategyData: Partial<CreateStrategyInput>
): Promise<Strategy> => {
  try {
    return await apiClient.put<Strategy>(`/api/v1/strategies/${id}`, strategyData);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a strategy
 */
export const deleteStrategy = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/strategies/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Export the service as a namespace for better organization
 */
export const strategyService = {
  listStrategies,
  getStrategy,
  getSubscribers,
  createStrategy,
  updateStrategy,
  deleteStrategy,
};