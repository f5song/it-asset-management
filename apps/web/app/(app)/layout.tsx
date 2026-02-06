// apps/web/app/(app)/layout.tsx
import "../globals.css"; // สำคัญ!
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Providers from "./providers";
import ClientShell from "@/components/layout/ClientShell";

export const metadata: Metadata = {
  title: "BEC IT Software Management",
  description: "BEC IT Software Management",
};

export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}
