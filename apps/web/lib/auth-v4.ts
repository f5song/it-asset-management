import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/app/(app)/api/auth/[...nextauth]/route";


export async function getSessionOnServer() {
  return await getServerSession(authOptions as NextAuthOptions);
}