'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      const response = await fetch('/api/docs');
      const data = await response.json();
      setSpec(data);
    }
    
    fetchSpec();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">LearnLedger API Documentation</h1>
      
      {spec ? (
        <SwaggerUI 
          spec={spec} 
          docExpansion="list"
          deepLinking={true}
          defaultModelExpandDepth={3}
        />
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
} 