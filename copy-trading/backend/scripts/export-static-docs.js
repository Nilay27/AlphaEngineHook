const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('Creating static API documentation...');

// Ensure the static directory exists
const staticDir = path.join(__dirname, '../static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Extract the OpenAPI schema from the module
console.log('Running Node.js to extract the OpenAPI schema...');
const extractScriptPath = path.join(__dirname, 'extract-schema.js');

// Create the extract-schema.js file
fs.writeFileSync(extractScriptPath, `
const fs = require('fs');
const path = require('path');
const { createSwaggerSpec } = require('next-swagger-doc');

// Copy of the schema definition
const apiSchema = createSwaggerSpec({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LearnLedger API Documentation',
      version: '1.0.0',
      description: 'API documentation for the LearnLedger platform',
      contact: {
        name: 'API Support',
        email: 'support@LearnLedger.com',
      },
    },
    servers: [
      {
        url: 'https://api.LearnLedger.com/api',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server',
      },
    ],
    tags: [
      {
        name: 'Register',
        description: 'User registration operations',
      },
      {
        name: 'User Profile',
        description: 'User profile operations',
      },
      {
        name: 'Projects',
        description: 'Project management operations',
      },
      {
        name: 'Submissions',
        description: 'Project submission operations',
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
                role: ['Role must be either "company" or "freelancer"'],
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
        Success: {
          type: 'object',
          properties: {
            isSuccess: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
              example: {},
            },
          },
          required: ['isSuccess'],
        },
      },
      parameters: {
        WalletAddress: {
          name: 'walletAddress',
          in: 'query',
          description: 'Ethereum wallet address',
          required: true,
          schema: {
            type: 'string',
            example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          },
        },
        Role: {
          name: 'role',
          in: 'query',
          description: 'User role',
          required: true,
          schema: {
            type: 'string',
            enum: ['company', 'freelancer'],
            example: 'company',
          },
        },
      },
      securitySchemes: {},
    },
    paths: {
      '/api/register': {
        post: {
          tags: ['Register'],
          summary: 'Register a new user profile',
          description: 'Creates a company or freelancer profile with the provided details',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    role: {
                      type: 'string',
                      enum: ['company', 'freelancer'],
                      description: 'Type of account to register'
                    },
                    walletAddress: {
                      type: 'string',
                      description: 'Ethereum wallet address'
                    },
                    companyName: {
                      type: 'string',
                      description: 'Required for company profiles'
                    },
                    shortDescription: {
                      type: 'string',
                      description: 'Brief description about the company'
                    },
                    logoUrl: {
                      type: 'string',
                      description: 'URL to company logo image'
                    },
                    freelancerName: {
                      type: 'string',
                      description: 'Required for freelancer profiles'
                    },
                    skills: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      description: 'Skills for freelancer profiles'
                    },
                    profilePicUrl: {
                      type: 'string',
                      description: 'URL to profile picture for freelancers'
                    }
                  },
                  required: ['role', 'walletAddress'],
                  example: {
                    role: 'company',
                    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                    companyName: 'Acme Corporation',
                    shortDescription: 'Leading provider of blockchain solutions',
                    logoUrl: 'https://example.com/logo.png'
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Registration successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      isSuccess: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Successfully registered profile'
                      },
                      data: {
                        type: 'string',
                        description: 'Profile ID',
                        example: 'f290c15c-a0bf-494a-8df0-05e94aa3b89f'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ValidationError',
                  },
                  examples: {
                    'Missing required fields': {
                      value: {
                        isSuccess: false,
                        message: 'Validation failed',
                        errors: {
                          walletAddress: ['Wallet address is required'],
                          role: ['Role must be specified']
                        }
                      }
                    },
                    'Invalid wallet format': {
                      value: {
                        isSuccess: false,
                        message: 'Validation failed',
                        errors: {
                          walletAddress: ['Invalid Ethereum wallet address format']
                        }
                      }
                    },
                    'Missing role-specific fields': {
                      value: {
                        isSuccess: false,
                        message: 'Validation failed',
                        errors: {
                          companyName: ['Company name is required for company profiles']
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ServerError',
                  },
                  examples: {
                    'Database error': {
                      value: {
                        isSuccess: false,
                        message: 'Failed to create user profile record'
                      }
                    },
                    'Duplicate entry': {
                      value: {
                        isSuccess: false,
                        message: 'Profile with this wallet address already exists'
                      }
                    },
                    'Generic server error': {
                      value: {
                        isSuccess: false,
                        message: 'Internal server error occurred'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    }
  }
});

// Write the schema to a file
const outputPath = path.join(__dirname, '../static/api-spec.json');
fs.writeFileSync(outputPath, JSON.stringify(apiSchema, null, 2));
console.log('OpenAPI schema exported to:', outputPath);
`);

try {
  childProcess.execSync('node ' + extractScriptPath, { stdio: 'inherit' });
  console.log('Successfully exported OpenAPI schema to static/api-spec.json');
  
  // Copy the API documentation markdown
  const docSource = path.join(__dirname, '../API-DOCUMENTATION.md');
  const docDest = path.join(staticDir, 'README.md');
  if (fs.existsSync(docSource)) {
    fs.copyFileSync(docSource, docDest);
    console.log('API documentation copied to static/README.md');
  }
  
  console.log('Static documentation generation complete!');
  console.log('You can now:');
  console.log('1. Deploy the "static" directory to any static hosting service like GitHub Pages, Netlify, or Vercel');
  console.log('2. Access the interactive documentation at index.html');
  console.log('3. Download the API spec at api-spec.json');
} catch (error) {
  console.error('Error exporting OpenAPI schema:', error);
  process.exit(1);
} finally {
  // Clean up the temporary script
  if (fs.existsSync(extractScriptPath)) {
    fs.unlinkSync(extractScriptPath);
  }
} 