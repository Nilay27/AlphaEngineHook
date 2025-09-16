export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">AlphaEngine</h1>
        <p className="text-xl text-gray-600 mb-8">Copy Trading Platform - Backend API Server</p>

        <p className="text-lg mb-8">
          Welcome to AlphaEngine, a decentralized copy trading platform. This backend API server
          provides all the necessary endpoints for strategy management, trade confirmations, and real-time data streaming.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
            <p className="mb-4">
              Core trading APIs including strategy management, trade confirmations,
              and real-time data streaming for copy trading functionality.
            </p>
            <div className="text-sm text-gray-600">
              <p>• Strategy Management</p>
              <p>• Trade Confirmations</p>
              <p>• Real-time Streaming</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Platform Features</h2>
            <p className="mb-4">
              AlphaEngine enables traders to create, subscribe to, and execute algorithmic trading strategies
              in a decentralized manner with real-time trade execution and confirmation.
            </p>
            <div className="text-sm text-gray-600">
              <p>• Alpha Generation</p>
              <p>• Strategy Subscription</p>
              <p>• Trade Execution</p>
              <p>• Performance Analytics</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold mb-2">AlphaEngine Backend Status</h2>
          <p className="mb-4">
            This backend server provides the core infrastructure for:
          </p>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Strategy Management API - Create and manage trading strategies</li>
            <li>Trade Confirmation System - Real-time trade validation</li>
            <li>Subscription Management - Handle alpha consumer subscriptions</li>
            <li>Event Streaming - Server-sent events for real-time updates</li>
          </ol>
          <p className="text-sm text-gray-600">
            Frontend application coming soon. This backend is ready for integration.
          </p>
        </div>
      </div>
    </div>
  )
}
