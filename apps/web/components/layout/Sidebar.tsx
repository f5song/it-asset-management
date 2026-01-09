
"use client";

import React from "react";
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
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
      { key: "license-management", name: "License Management", path: "/software/license" },
    ],
  },
  { key: "devices", name: "Devices", icon: RectangleGroupIcon, path: "/devices" },
  { key: "employee", name: "Employee", icon: UsersIcon, path: "/employee" },
  { key: "requests", name: "Requests", icon: IdentificationIcon, path: "/requests" },
  { key: "audit-logs", name: "Audit Logs", icon: BellAlertIcon, path: "/audit-logs" },
  { key: "reports", name: "Reports", icon: ChartBarSquareIcon, path: "/reports" },
  { key: "settings", name: "Settings", icon: Cog6ToothIcon, path: "/settings" },
];

export default function Sidebar({
  currentPath = "/dashboard",
  onNavigate = (path: string) => console.log("navigate:", path),
  isDesktopOpen = true,
}: {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  isDesktopOpen?: boolean;
}) {
  const [openGroup, setOpenGroup] = React.useState<string>("software");
  const isActive = (path?: string) => !!path && currentPath === path;

  return (
    <aside
      className={cn(
        "self-stretch bg-white shrink-0",
        "transition-[width] duration-300 ease-in-out overflow-hidden",
        isDesktopOpen ? "md:w-64" : "md:w-0",
        "w-0 md:block",
        "shadow-[4px_0_20px_-12px_rgba(0,0,0,0.25)]"
      )}
      aria-label="Sidebar"
    >
      <nav className="flex flex-col h-full gap-1 p-2 md:p-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const isParentActive =
            hasChildren && item.children!.some((c) => isActive(c.path));
          const showChildren = hasChildren && openGroup === item.key;

          return (
            <div key={item.key}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition",
                  "text-gray-800 hover:bg-gray-100",
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
                        "text-gray-700 hover:bg-gray-100",
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
