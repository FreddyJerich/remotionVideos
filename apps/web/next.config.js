/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/webhook/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
  serverExternalPackages: ['msedge-tts', 'ws'],
}

module.exports = nextConfig
