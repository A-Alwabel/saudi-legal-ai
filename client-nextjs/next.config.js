/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // ESLint configuration - allow build despite warnings
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false, // We want to see warnings, but not fail
  },
  
  // TypeScript configuration  
  typescript: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false, // Keep strict for now
  },
  
  // Optimize images
  images: {
    domains: ['localhost', 'api.saudilegal.ai'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Enable emotion for Material-UI
    emotion: true,
  },
  
  // Enable modular imports for Material-UI
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize bundle size with correct settings
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          mui: {
            test: /[\\/]node_modules[\\/](@mui)[\\/]/,
            name: 'mui',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Experimental features for performance
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    
    // Optimize package imports
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'framer-motion',
      'axios',
    ],
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'Saudi Legal AI v2.0',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },
  
  // Output configuration
  output: 'standalone',
  
  // Enable source maps in production for debugging
  productionBrowserSourceMaps: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Trailing slash configuration
  trailingSlash: false,
};

module.exports = nextConfig;