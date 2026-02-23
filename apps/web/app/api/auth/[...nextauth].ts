import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const hasAzure =
  !!process.env.AZURE_AD_CLIENT_ID &&
  !!process.env.AZURE_AD_CLIENT_SECRET &&
  !!process.env.AZURE_AD_TENANT_ID;

export const authOptions: NextAuthOptions = {
  providers: [
    // ---- MOCK (Credentials) ----
    CredentialsProvider({
      name: "Mock",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null; // ต้องมีอีเมลอย่างน้อย
        return { id: "mock-" + Date.now(), name: email, email };
      },
    }),

    // ---- Azure AD (เปิดเมื่อมี ENV จริง) ----
    ...(hasAzure
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!, // 'common' หรือ Tenant GUID
          }),
        ]
      : []),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login", // ให้ /login เป็นหน้าล็อกอิน
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = {
          ...(session.user || {}),
          email: token.email as string,
          name: token.name as string,
        } as any;
      }
      return session;
    },
  },

  // แนะนำตั้งใน .env เสมอ โดยเฉพาะโปรดักชัน
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);