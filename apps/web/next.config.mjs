// next.config.mjs
const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const nextConfig = {
  output: 'standalone',
  // (แนะนำ) ลองตัดการตั้งค่า turbopack ออกชั่วคราวให้เรียบที่สุดก่อน
  // turbopack: { root: path.resolve(__dirname, '../../') },

  async rewrites() {
    return {
      beforeFiles: [
        { source: '/backend/:path*', destination: `${base}/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;