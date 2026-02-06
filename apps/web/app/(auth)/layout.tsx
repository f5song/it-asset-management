import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | BEC IT Software Management",
  description: "ลงชื่อเข้าใช้ระบบ",
};

export default function AuthRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}