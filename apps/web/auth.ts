// auth.ts (NextAuth v5 style)
import NextAuth from "next-auth";
import AzureAd from "next-auth/providers/azure-ad";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    AzureAd({
      clientId: process.env.AUTH_AZURE_AD_CLIENT_ID!,       // หรือ AZURE_AD_CLIENT_ID
      clientSecret: process.env.AUTH_AZURE_AD_CLIENT_SECRET!, // หรือ AZURE_AD_CLIENT_SECRET
      tenantId: process.env.AUTH_AZURE_AD_TENANT_ID ?? "common", // ใส่ tenant เฉพาะถ้าต้องการล็อก
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account }) {
      // แนบ access_token จาก Azure AD ลงใน JWT (ฝั่ง server)
      if (account?.access_token) {
        (token as any).accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // ส่งต่อ access_token ให้ client ใช้งาน (เช่น เรียก Graph API)
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
});