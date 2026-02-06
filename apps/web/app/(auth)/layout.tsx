import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | BEC IT Software Management",
  description: "ลงชื่อเข้าใช้ระบบ",
};

export default function AuthRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
