// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // ถ้าคุณใช้ containerize/Deploy แบบ standalone
  // ไม่มี rewrites อีกต่อไป เพราะเราจะเรียก API ด้วย base URL จาก env ฝั่ง client
};

export default nextConfig;
