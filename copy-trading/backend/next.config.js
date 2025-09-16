/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['docs.github.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import node modules on the client side
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    return config;
  },
  // Temporarily exclude API docs from the build to fix deployment
  experimental: {
    serverComponentsExternalPackages: ['swagger-ui-react', 'swagger-jsdoc', 'next-swagger-doc'],
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // Disable static generation for API routes
  output: "standalone",
  generateBuildId: async () => {
    return "build-" + new Date().getTime()
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable eslint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Let middleware handle CORS instead of static headers
  // The headers configuration was causing conflicts with the middleware CORS handling
}

module.exports = nextConfig
