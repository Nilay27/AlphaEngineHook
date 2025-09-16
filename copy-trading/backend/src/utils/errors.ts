// Custom error classes for AlphaEngine

export class ApiError extends Error {
  public statusCode: number
  public isOperational: boolean
  public details?: any

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.isOperational = true
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

// Error handler middleware for Next.js API routes
export function errorHandler(error: any) {
  console.error('Error:', error)

  if (error instanceof ApiError) {
    return {
      success: false,
      message: error.message,
      ...(error.details && { details: error.details }),
      statusCode: error.statusCode,
    }
  }

  // Database errors
  if (error.code === '23505') {
    return {
      success: false,
      message: 'Duplicate entry found',
      statusCode: 409,
    }
  }

  if (error.code === '23503') {
    return {
      success: false,
      message: 'Referenced entity not found',
      statusCode: 404,
    }
  }

  // Default error
  return {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    statusCode: 500,
  }
}

// Async error wrapper for API routes
export function asyncHandler(fn: Function) {
  return async (req: any, res: any) => {
    try {
      await fn(req, res)
    } catch (error) {
      const errorResponse = errorHandler(error)
      res.status(errorResponse.statusCode).json(errorResponse)
    }
  }
}

// Validate request body
export function validateBody(schema: any) {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body)
    if (error) {
      const details = error.details.map((d: any) => d.message).join(', ')
      throw new ValidationError(`Invalid request body: ${details}`)
    }
    next()
  }
}