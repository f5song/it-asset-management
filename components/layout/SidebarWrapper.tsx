"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar
      currentPath={pathname}
      onNavigate={(path) => router.push(path)}
    />
  );
}
``
