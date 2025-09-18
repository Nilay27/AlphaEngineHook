import { createSwaggerSpec } from 'next-swagger-doc';

// Define your OpenAPI schema for AlphaEngine
export const apiSchema = createSwaggerSpec({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlphaEngine API Documentation',
      version: '1.0.0',
      description: 'API documentation for the AlphaEngine copy trading platform',
      contact: {
        name: 'API Support',
        email: 'support@alphaengine.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_API_URL || 'https://alphaengine.app/api'
          : 'http://localhost:3001/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Local development server',
      },
    ],
    tags: [
      {
        name: 'Strategies',
        description: 'Strategy management operations',
      },
      {
        name: 'Subscriptions',
        description: 'Strategy subscription operations',
      },
      {
        name: 'Confirmations',
        description: 'Trade confirmation operations',
      },
      {
        name: 'Consumer',
        description: 'Alpha consumer operations',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            isSuccess: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error occurred',
            },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              example: null,
            },
          },
          required: ['isSuccess'],
        },
        ValidationError: {
          type: 'object',
          properties: {
            isSuccess: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              example: {
                walletAddress: ['Invalid wallet address format'],
                strategyId: ['Strategy ID is required'],
              },
            },
          },
          required: ['isSuccess', 'message', 'errors'],
        },
        ServerError: {
          type: 'object',
          properties: {
            isSuccess: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Internal server error',
            },
          },
          required: ['isSuccess', 'message'],
        },
        Strategy: {
          type: 'object',
          properties: {
            strategyId: {
              type: 'string',
              format: 'uuid',
              example: '7e5452a2-c43b-4ea3-ab9f-93f38442bd0f',
            },
            strategyName: {
              type: 'string',
              example: 'ETH Momentum Strategy',
            },
            strategyDescription: {
              type: 'string',
              example: 'A momentum-based trading strategy for ETH',
            },
            subscriptionFee: {
              type: 'string',
              example: '500000000000000000',
            },
            alphaGeneratorAddress: {
              type: 'string',
              example: '0x6Bf31be6f441F8906544F13DFE10720BC8B98b93',
            },
            subscriberCount: {
              type: 'number',
              example: 0,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
          },
        },
        TradeConfirmation: {
          type: 'object',
          properties: {
            confirmationId: {
              type: 'string',
              format: 'uuid',
            },
            strategyId: {
              type: 'string',
              format: 'uuid',
            },
            tradeData: {
              type: 'object',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'failed'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
});

export default apiSchema;