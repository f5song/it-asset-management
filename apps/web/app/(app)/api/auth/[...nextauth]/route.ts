import NextAuth from "next-auth";
import type { NextAuthOptions, Session, User, SessionStrategy } from "next-auth";
import type { JWT } from "next-auth/jwt";

import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const hasAzure =
  !!process.env.AZURE_AD_CLIENT_ID &&
  !!process.env.AZURE_AD_CLIENT_SECRET &&
  !!process.env.AZURE_AD_TENANT_ID;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Mock",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        if (!email) return null;
        return { id: "mock-" + Date.now(), name: email, email };
      },
    }),

    ...(hasAzure
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt" as SessionStrategy,
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.email = user.email!;
        token.name = user.name!;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        ...session.user,
        email: token.email,
        name: token.name,
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// สำคัญมากสำหรับ App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
