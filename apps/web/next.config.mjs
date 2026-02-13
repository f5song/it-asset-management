/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    if (!isDev) {
      // ไม่เปิด proxy ใน production ตามที่คุณต้องการ
      return [];
    }

    const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/backend';
    const target = process.env.BACKEND_BASE_URL;

    if (!target) {
      console.warn('BACKEND_BASE_URL not set – dev proxy rewrites disabled.');
      return [];
    }

    return [
      // /backend/* → http://localhost:8000/*
      {
        source: `${prefix}/:path*`,
        destination: `${target}/:path*`,
      },
    ];
  },

  async headers() {
    // หากต้องการ CORS header ใน dev (ส่วนใหญ่ไม่จำเป็นเพราะใช้ proxy)
    // คุณสามารถเปิดด้านล่างได้
    // const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/backend';
    // return [
    //   {
    //     source: `${prefix}/:path*`,
    //     headers: [
    //       { key: 'Access-Control-Allow-Origin', value: '*' },
    //       { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
    //       { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
    //     ],
    //   },
    // ];
    return [];
  },
};

module.exports = nextConfig;