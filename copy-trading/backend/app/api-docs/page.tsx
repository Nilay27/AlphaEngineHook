"use client"

import { useEffect, useState } from 'react'
import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'

// Import the temporary placeholder component
import TempDisabledDocs from './temp-disabled'

// Only import Swagger UI and schema in development
const SwaggerUI = dynamicImport(
  () => process.env.NODE_ENV === 'development' 
    ? import('swagger-ui-react').then(mod => mod.default)
    : Promise.resolve(() => <TempDisabledDocs />),
  { ssr: false }
)

// Define type for OpenAPI schema
type OpenAPISchema = Record<string, any>

export default function ApiDocsPage() {
  const [apiSchema, setApiSchema] = useState<OpenAPISchema | null>(null)

  // Make sure we're rendering on the client side
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Only import the schema in development
      import('@/lib/openapi').then((mod) => {
        setApiSchema(mod.default)
      })
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return <TempDisabledDocs />
  }

  if (!apiSchema) {
    return <div>Loading API documentation...</div>
  }

  return (
    <div className="swagger-container">
      <SwaggerUI spec={apiSchema} />
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-container {
          margin: 0;
          padding: 0;
          height: 100vh;
          width: 100vw;
        }
        .swagger-ui {
          margin-top: 0;
        }
      `}</style>
    </div>
  )
} 