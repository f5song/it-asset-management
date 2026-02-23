import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";


export async function getSessionOnServer() {
  return await getServerSession(authOptions as NextAuthOptions);
}