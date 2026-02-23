// apps/web/app/(auth)/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const hasAzure =
  !!process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID &&
  !!process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const loginMock = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", {
      email,
      redirect: true,
      callbackUrl: next, // เข้าหน้าเดิม/หน้าแรกหลังล็อกอิน
    });
  };

  const loginAzure = async () => {
    await signIn("azure-ad", {
      redirect: true,
      callbackUrl: next,
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel (ของเดิม) */}
      <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-12 text-white">
        <div className="space-y-4">
          <div className="text-2xl font-semibold tracking-tight">IT Software Management</div>
          <h1 className="text-4xl font-bold leading-tight">ระบบจัดการซอฟต์แวร์องค์กร</h1>
          <p className="text-white/90">
            ลงชื่อเข้าใช้ด้วยบัญชี Microsoft บริษัท บีอีซี เวิลด์ จำกัด (มหาชน) เพื่อเข้าสู่ระบบ
          </p>
        </div>
        <p className="text-sm text-white/70">&copy; {new Date().getFullYear()} BEC Studio Co., Ltd</p>
      </div>

      {/* Login panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h2>
            <p className="text-sm text-gray-500">
              ใช้บัญชี Microsoft บริษัท บีอีซี เวิลด์ จำกัด (มหาชน) เพื่อดำเนินการต่อ
            </p>
          </div>

          {hasAzure ? (
            // ปุ่ม Microsoft (Azure AD)
            <button
              onClick={loginAzure}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-black text-white px-4 py-2.5 font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="h-5 w-5">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Sign in with Microsoft
            </button>
          ) : (
            // โหมด Mock (Credentials)
            <form onSubmit={loginMock} className="space-y-3">
              <input
                type="email"
                placeholder="อีเมล (ใส่อะไรก็ได้สำหรับ Mock)"
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-black text-white px-4 py-2.5 font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                เข้าสู่ระบบ (Mock)
              </button>
            </form>
          )}

          <div className="pt-6 border-t">
            <p className="text-xs text-gray-500">
              การยืนยันตัวตนและนโยบาย MFA/Conditional Access จัดการโดย Microsoft Entra ID ขององค์กรคุณ
              {hasAzure ? "" : " — ขณะนี้อยู่ในโหมด Mock สำหรับการพัฒนา"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}