// auth.ts
import NextAuth from "next-auth";
import AzureAd from "next-auth/providers/azure-ad";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    AzureAd({
      authorization: { params: { scope: "openid profile email offline_access" } },
    }),
  ],
  session: { strategy: "jwt" },

  // ถ้าต้องการส่ง access_token ให้ client ใช้เรียก Graph API ต่อ (ไม่จำเป็นสำหรับทุกกรณี)
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        (token as any).accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
});
