
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@it-asset/schema", "@it-asset/utils", "geist"], // ถ้าใช้ geist
  reactStrictMode: true
};

export default nextConfig;
