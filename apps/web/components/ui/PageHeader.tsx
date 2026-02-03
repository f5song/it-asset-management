
// src/components/ui/PageHeader.tsx
import { BreadcrumbItem } from "@/types";
import React from "react";

export const PageHeader: React.FC<{
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}> = ({ title, breadcrumbs }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <nav className="mt-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs?.map((bc, idx) => (
            <li key={idx} className="flex items-center">
              {bc.href ? (
                <a
                  href={bc.href}
                  className="hover:text-gray-700 underline-offset-2 hover:underline"
                >
                  {bc.label}
                </a>
              ) : (
                <span>{bc.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">›</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
