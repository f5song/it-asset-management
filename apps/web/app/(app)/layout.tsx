import "../globals.css";
import type { Metadata } from "next";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Prompt } from "next/font/google";

import { getServerSession } from "next-auth/next";

import Providers from "./providers";
import ClientShell from "@/components/layout/ClientShell";
import { authOptions } from "../api/auth/[...nextauth]";

export const metadata: Metadata = {
  title: "BEC IT Software Management",
  description: "BEC IT Software Management",
};

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-prompt",
});

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⬇️ ดึง session (v4)
  const session = await getServerSession(authOptions);

  return (
    <html lang="th" className={`${GeistSans.variable} ${GeistMono.variable} ${prompt.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <Providers session={session}>
          <ClientShell>{children}</ClientShell>
        </Providers>
      </body>
    </html>
  );
}