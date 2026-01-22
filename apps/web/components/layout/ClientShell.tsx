
"use client";

import { useEffect, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // (ออปชัน) ปิด scroll ของ body ตอนเปิด sidebar
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // cleanup
    return () => document.body.classList.remove("overflow-hidden");
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header: มีปุ่มเปิด sidebar */}
      <header
        className="
          flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-30
          shadow-[0_2px_12px_-6px_rgba(0,0,0,0.20)]
        "
      >
        <button
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => setIsSidebarOpen((v) => !v)}
        >
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>

        {/* ... ตำแหน่งโลโก้/ชื่อเพจ/แอคชันอื่น ... */}
        {/* <div className="font-semibold text-gray-800">Your App</div> */}
      </header>

      {/* Main content (ไม่โดนดันแล้ว เพราะ sidebar จะเป็น fixed overlay) */}
      <main className="px-4 py-6">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      {/* ===== Overlay Sidebar + Backdrop ===== */}
      {/* Backdrop */}
      {isSidebarOpen && (
        <button
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-[60] bg-black/30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (fixed overlay) */}
      <Sidebar
        variant="overlay"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath={pathname}
        onNavigate={(path) => {
          router.push(path);
          setIsSidebarOpen(false);
        }}
      />
    </div>
  );
}
