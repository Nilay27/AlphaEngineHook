"use client"

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/components/utilities/wallet-provider'

export const dynamic = 'force-dynamic'

// Define known endpoints for testing
const API_ENDPOINTS = [
  { name: 'Get All Projects', path: '/api/projects', method: 'GET' },
  { name: 'Get Project Stats', path: '/api/projects/stats', method: 'GET' },
  { name: 'Search Projects', path: '/api/projects/search?q=example', method: 'GET' },
  { name: 'API Documentation', path: '/api', method: 'GET' },
]

export default function ApiTestPage() {
  const { walletAddress } = useWallet()
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0])
  const [customPath, setCustomPath] = useState('')
  const [requestMethod, setRequestMethod] = useState('GET')
  const [requestBody, setRequestBody] = useState('{\n  "key": "value"\n}')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Test the selected API
  const testApi = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      const path = customPath || selectedEndpoint.path
      const options: RequestInit = {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
        }
      }
      
      // Add request body for non-GET requests
      if (requestMethod !== 'GET' && requestBody) {
        try {
          options.body = requestBody
        } catch (e) {
          setError('Invalid JSON in request body')
          setLoading(false)
          return
        }
      }
      
      const response = await fetch(path, options)
      const data = await response.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing the API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Test Console</h1>
      
      {!walletAddress && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
          <p><strong>Warning:</strong> You are not connected with a wallet. Some API endpoints might require authentication.</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Request</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Choose an endpoint:</label>
            <select 
              className="w-full p-2 border rounded"
              value={JSON.stringify(selectedEndpoint)}
              onChange={(e) => {
                setSelectedEndpoint(JSON.parse(e.target.value));
                setCustomPath('');
                setRequestMethod(JSON.parse(e.target.value).method);
              }}
            >
              {API_ENDPOINTS.map((endpoint, i) => (
                <option key={i} value={JSON.stringify(endpoint)}>
                  {endpoint.name} ({endpoint.method} {endpoint.path})
                </option>
              ))}
              <option value='{"name":"Custom","path":"","method":"GET"}'>Custom endpoint</option>
            </select>
          </div>
          
          {selectedEndpoint.name === 'Custom' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Custom path:</label>
              <input
                type="text"
                className="w-full p-2 border rounded" 
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="/api/..."
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">HTTP Method:</label>
            <select 
              className="w-full p-2 border rounded"
              value={requestMethod}
              onChange={(e) => setRequestMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          {requestMethod !== 'GET' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Request Body (JSON):</label>
              <textarea
                className="w-full p-2 border rounded font-mono text-sm"
                rows={8}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}
          
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            onClick={testApi}
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Response</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {response && (
            <div className="bg-gray-100 p-4 rounded overflow-x-auto">
              <pre className="text-sm">{response}</pre>
            </div>
          )}
          
          {!response && !error && !loading && (
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-gray-500 italic">Response will appear here after testing</p>
            </div>
          )}
          
          {loading && (
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-gray-500 italic">Loading response...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-bold mb-4">API Testing Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use <code className="bg-gray-100 px-1 rounded">GET /api</code> to view all available endpoints</li>
          <li>Try <code className="bg-gray-100 px-1 rounded">GET /api/projects</code> to list all projects</li>
          <li>Search projects with <code className="bg-gray-100 px-1 rounded">GET /api/projects/search?q=YOUR_QUERY</code></li>
          <li>Get stats with <code className="bg-gray-100 px-1 rounded">GET /api/projects/stats</code></li>
          <li>Some POST endpoints may require wallet authentication</li>
        </ul>
      </div>
    </div>
  )
} 