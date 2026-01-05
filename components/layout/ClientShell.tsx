"use client";

import { useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen md:flex md:items-stretch">
      {/* ⭐ เรนเดอร์ Sidebar เสมอให้เป็น flex item; คุมกว้างด้วย prop */}
      <Sidebar
        isDesktopOpen={desktopOpen}
        currentPath={pathname}
        onNavigate={(path) => router.push(path)}
      />

      {/* Content column: เป็นตัวกำหนดความสูงรวม (ยาวเท่าไหร่ก็ได้) */}
      <div className="flex-1 flex flex-col">
        {/* Header เฉพาะ Desktop */}

        <header
          className="
    hidden md:flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-30
    shadow-[-10px_0_24px_-12px_rgba(0,0,0,0.20)]
  "
        >
          <button
            aria-label={desktopOpen ? "Close sidebar" : "Open sidebar"}
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setDesktopOpen((v) => !v)}
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
        </header>

        {/* Main content: ยาวได้ → ทำให้ทั้ง flex line สูงขึ้น และ Sidebar ยืดตาม */}
        <main className="px-4 py-6">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
