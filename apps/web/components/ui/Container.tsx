
// src/components/ui/Card.tsx
import React from "react";

export const Container: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
    {title && (
      <header className="px-6 pt-5">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </header>
    )}
    <div className="px-6 pb-6 pt-4">{children}</div>
  </section>
);
``
