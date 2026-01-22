
"use client";

import React, { ComponentType, SVGProps, useEffect, useRef } from "react";
import {
  GlobeAltIcon,
  ComputerDesktopIcon,
  RectangleGroupIcon,
  UsersIcon,
  IdentificationIcon,
  BellAlertIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { cn } from "../ui";

type MenuItem = {
  key: string;
  name: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  path?: string;
  children?: { key: string; name: string; path: string }[];
};

const MENU: MenuItem[] = [
  { key: "dashboard", name: "Dashboard", icon: GlobeAltIcon, path: "/dashboard" },
  {
    key: "software",
    name: "Software",
    icon: ComputerDesktopIcon,
    children: [
      { key: "software-inventory", name: "Software Inventory", path: "/software/inventory" },
      { key: "license-management", name: "License Management", path: "/software/license-management" },
    ],
  },
  { key: "devices", name: "Devices", icon: RectangleGroupIcon, path: "/devices" },
  { key: "employees", name: "Employees", icon: UsersIcon, path: "/employees" },
  { key: "requests", name: "Requests", icon: IdentificationIcon, path: "/requests" },
  { key: "audit-logs", name: "Audit Logs", icon: BellAlertIcon, path: "/audit-logs" },
  { key: "reports", name: "Reports", icon: ChartBarSquareIcon, path: "/reports" },
  { key: "settings", name: "Settings", icon: Cog6ToothIcon, path: "/settings" },
];

export default function Sidebar({
  currentPath = "/dashboard",
  onNavigate = (path: string) => console.log("navigate:", path),
  // โหมด overlay
  variant = "overlay",
  open = false,
  onClose,
}: {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  variant?: "overlay"; // อนาคตถ้าจะรองรับ "inline" ก็เพิ่มได้
  open?: boolean;
  onClose?: () => void;
}) {
  const [openGroup, setOpenGroup] = React.useState<string>("software");
  const isActive = (path?: string) => !!path && currentPath === path;

  // ปิดด้วย Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // (ออปชัน) โฟกัสแรกเมื่อเปิด
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) {
      firstFocusableRef.current?.focus();
    }
  }, [open]);

  // **Overlay drawer** (fixed) + slide animation
  return (
    <aside
      aria-label="Sidebar"
      aria-hidden={!open}
      className={cn(
        "fixed inset-y-0 left-0 z-[70]",
        "w-64 bg-white shadow-[4px_0_20px_-12px_rgba(0,0,0,0.25)]",
        "transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        // ให้เนื้อหาเลื่อนภายใน ไม่ขยายหน้ากว้าง
        "overflow-y-auto will-change-transform"
      )}
      role="dialog"
    >
      <nav className="flex flex-col h-full gap-1 p-3">
        {MENU.map((item, idx) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isParentActive =
            hasChildren && item.children!.some((c) => isActive(c.path));
          const showChildren = hasChildren && openGroup === item.key;

          const commonBtnProps = idx === 0 ? { ref: firstFocusableRef } : {};

          return (
            <div key={item.key}>
              <button
                {...commonBtnProps}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition",
                  "text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  (isActive(item.path) || isParentActive) && "text-blue-600 bg-blue-50"
                )}
                onClick={() => {
                  if (hasChildren) {
                    setOpenGroup((prev) => (prev === item.key ? "" : item.key));
                  } else if (item.path) {
                    onNavigate(item.path);
                  }
                }}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      (isActive(item.path) || isParentActive)
                        ? "text-blue-600"
                        : "text-gray-700"
                    )}
                  />
                )}
                <span className="text-sm font-medium">{item.name}</span>
                {hasChildren && (
                  <ChevronDownIcon
                    className={cn(
                      "ml-auto w-4 h-4 text-gray-700 transition-transform",
                      showChildren ? "rotate-180" : "rotate-0"
                    )}
                  />
                )}
              </button>

              {hasChildren && (
                <div
                  className={cn(
                    "pl-6 ml-2 border-l border-gray-200 overflow-hidden transition-[max-height] duration-300",
                    showChildren ? "max-h-40" : "max-h-0"
                  )}
                >
                  {item.children!.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => onNavigate(child.path!)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md mt-1",
                        "text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        isActive(child.path) && "text-blue-600 bg-blue-50 font-medium"
                      )}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
