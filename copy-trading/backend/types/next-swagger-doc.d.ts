// Type definitions for next-swagger-doc
declare module 'next-swagger-doc' {
  export interface SwaggerDocOptions {
    definition: Record<string, any>;
    apiFolder?: string;
    schemaFolders?: string[];
  }

  export function createSwaggerSpec(options: SwaggerDocOptions): Record<string, any>;
}

declare module 'swagger-ui-react' {
  import React from 'react';
  
  export interface SwaggerUIProps {
    spec?: Record<string, any>;
    url?: string;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    deepLinking?: boolean;
    defaultModelExpandDepth?: number;
    displayOperationId?: boolean;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
  }
  
  const SwaggerUI: React.FC<SwaggerUIProps>;
  export default SwaggerUI;
} 