/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // Configure for local network access and custom domain
  async rewrites() {
    return [
      // Allow sproutly.com to work locally (you'll need to add this to your hosts file)
      // 127.0.0.1 sproutly.com
      // Or use localhost for development
    ];
  },
  // Optimize for Raspberry Pi 5 deployment
  output: 'standalone',
  poweredByHeader: false,
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    
    // Fix chunk loading timeout issues
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**'],
      };
    }
    
    // Increase timeout for chunk loading and add retry logic
    config.output = {
      ...config.output,
      chunkLoadTimeout: 120000, // 2 minutes
    };
    
    // Add optimization for chunk loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    return config;
  },
  // Add development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),
};

export default nextConfig;
