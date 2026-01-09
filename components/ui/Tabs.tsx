
// src/components/ui/Tabs.tsx
"use client";
import React from "react";
import { cn } from ".";

export function TabTrigger({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "border-b-2 px-1.5 py-2 text-sm font-semibold",
        active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <nav className="mt-4 flex gap-4 border-b border-slate-200">{children}</nav>;
}

export function TabPanel({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}
