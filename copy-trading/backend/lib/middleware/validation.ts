import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/api-utils';

// Define validation rule types
type ValidationRule<T> = {
  validate: (value: any, context?: any) => boolean;
  message: string;
};

// Validation schema type for a request
export type ValidationSchema = {
  body?: Record<string, ValidationRule<any>[]>;
  query?: Record<string, ValidationRule<any>[]>;
  params?: Record<string, ValidationRule<any>[]>;
};

// Predefined validation rules
export const rules = {
  // String validations
  required: (fieldName: string): ValidationRule<string> => ({
    validate: (value) => value !== undefined && value !== null && value !== '',
    message: `${fieldName} is required`,
  }),
  
  minLength: (fieldName: string, min: number): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: `${fieldName} must be at least ${min} characters`,
  }),
  
  maxLength: (fieldName: string, max: number): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: `${fieldName} must not exceed ${max} characters`,
  }),
  
  pattern: (fieldName: string, regex: RegExp, customMessage?: string): ValidationRule<string> => ({
    validate: (value) => !value || regex.test(value),
    message: customMessage || `${fieldName} has an invalid format`,
  }),
  
  // Wallet address validation
  isWalletAddress: (fieldName: string): ValidationRule<string> => ({
    validate: (value) => !value || /^0x[a-fA-F0-9]{40}$/.test(value),
    message: `${fieldName} must be a valid wallet address`,
  }),
  
  // Role validation
  isValidRole: (fieldName: string): ValidationRule<string> => ({
    validate: (value) => !value || ['company', 'freelancer'].includes(value),
    message: `${fieldName} must be either 'company' or 'freelancer'`,
  }),
  
  // Number validations
  isNumber: (fieldName: string): ValidationRule<number> => ({
    validate: (value) => !value || !isNaN(Number(value)),
    message: `${fieldName} must be a number`,
  }),
  
  min: (fieldName: string, min: number): ValidationRule<number> => ({
    validate: (value) => !value || Number(value) >= min,
    message: `${fieldName} must be at least ${min}`,
  }),
  
  max: (fieldName: string, max: number): ValidationRule<number> => ({
    validate: (value) => !value || Number(value) <= max,
    message: `${fieldName} must not exceed ${max}`,
  }),
  
  // Custom validation
  custom: (fieldName: string, validatorFn: (value: any, context?: any) => boolean, message: string): ValidationRule<any> => ({
    validate: validatorFn,
    message,
  }),
};

// Validation middleware factory
export function createValidationMiddleware(schema: ValidationSchema) {
  return async (req: NextRequest, parsedBody?: any) => {
    const errors: Record<string, string[]> = {};
    
    // Validate query parameters
    if (schema.query) {
      const url = new URL(req.url);
      for (const [field, rules] of Object.entries(schema.query)) {
        const value = url.searchParams.get(field);
        for (const rule of rules) {
          if (!rule.validate(value)) {
            if (!errors[field]) errors[field] = [];
            errors[field].push(rule.message);
          }
        }
      }
    }
    
    // Validate body content
    if (schema.body) {
      let body = parsedBody;
      
      // Only parse the body if it wasn't provided and the method has a body
      if (!body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        try {
          const contentType = req.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            // Clone the request to read the body
            const clonedReq = req.clone();
            body = await clonedReq.json();
          }
        } catch (error) {
          return errorResponse('Invalid JSON in request body', 400);
        }
      }
      
      // Validate each field against its rules
      if (body) {
        for (const [field, rules] of Object.entries(schema.body)) {
          const value = body[field];
          for (const rule of rules) {
            if (!rule.validate(value, body)) {
              if (!errors[field]) errors[field] = [];
              errors[field].push(rule.message);
            }
          }
        }
      }
    }
    
    // If validation failed, return error response
    if (Object.keys(errors).length > 0) {
      return errorResponse('Validation failed', 400, errors);
    }
    
    // If validation passed, return the parsed body to avoid re-parsing
    return null;
  };
}

// Create a higher-order function to apply validation to a route handler
export function withValidation(
  handler: (req: NextRequest, parsedBody?: any) => Promise<NextResponse>,
  schema: ValidationSchema
) {
  const validateRequest = createValidationMiddleware(schema);
  
  return async function validatedRouteHandler(req: NextRequest) {
    try {
      // Parse the body once if it's a method with a body
      let parsedBody: any = undefined;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const contentType = req.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Clone the request to read the body
          const clonedReq = req.clone();
          parsedBody = await clonedReq.json();
        }
      }
      
      // Run validation with the parsed body
      const validationResult = await validateRequest(req, parsedBody);
      
      // If validation failed, return the error response
      if (validationResult) {
        return validationResult;
      }
      
      // If validation passed, call the original handler with the parsed body
      return handler(req, parsedBody);
    } catch (error) {
      console.error('Validation error:', error);
      return errorResponse('Request processing error', 400);
    }
  };
} 