/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Ignore ESLint errors during builds (optional)
      ignoreDuringBuilds: true,
    },
    experimental: {
      typedRoutes: true,
    },
  }
  
  export default nextConfig;
  