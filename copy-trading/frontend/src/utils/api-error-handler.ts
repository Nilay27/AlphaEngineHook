/**
 * API Error Handling Utilities
 */

/**
 * Custom API Error class with additional context
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle API errors and throw structured ApiError
 */
export const handleApiError = (error: unknown): never => {
  // Already an ApiError, re-throw
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle Axios-like errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      const responseData = response.data as Record<string, unknown> | undefined;

      const message = responseData?.message ||
                     responseData?.error ||
                     `Request failed with status ${response.status}`;

      throw new ApiError(
        String(message),
        Number(response.status) || 500,
        String(responseData?.code || 'SERVER_ERROR'),
        responseData
      );
    } else if (err.request) {
      // Request was made but no response received
      throw new ApiError(
        'No response from server. Please check your connection.',
        0,
        'NETWORK_ERROR',
        err.request
      );
    } else if (err.code === 'ECONNABORTED') {
      // Request timeout
      throw new ApiError(
        'Request timeout. Please try again.',
        408,
        'TIMEOUT_ERROR'
      );
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    throw new ApiError(
      error.message,
      500,
      'UNKNOWN_ERROR',
      error
    );
  }

  // Fallback for unknown error types
  throw new ApiError(
    'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR',
    error
  );
};

/**
 * Retry logic for API calls with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Type guard for ApiError-like objects
      const apiError = error as { statusCode?: number; message?: string };

      // Don't retry on client errors (4xx) except for 429 (rate limit)
      if (apiError.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500 && apiError.statusCode !== 429) {
        throw error;
      }

      // Don't retry if it's the last attempt
      if (i === retries - 1) {
        throw error;
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, i);
      const message = apiError.message || 'Unknown error';
      console.warn(`Retry attempt ${i + 1}/${retries} after ${backoffDelay}ms`, message);
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError || new ApiError('Retry failed', 500, 'RETRY_EXHAUSTED');
};

/**
 * Transform API errors into user-friendly messages
 */
export const getUserFriendlyError = (error: ApiError): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your internet connection.';
    case 'TIMEOUT_ERROR':
      return 'The request took too long. Please try again.';
    case 'UNAUTHORIZED':
      return 'Please connect your wallet to continue.';
    case 'FORBIDDEN':
      return 'You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'VALIDATION_ERROR':
      return error.message || 'Please check your input and try again.';
    case 'INSUFFICIENT_FUNDS':
      return 'Insufficient funds in your wallet.';
    case 'CONTRACT_ERROR':
      return 'Smart contract transaction failed. Please try again.';
    default:
      return error.message || 'Something went wrong. Please try again later.';
  }
};