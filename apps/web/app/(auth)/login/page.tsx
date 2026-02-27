"use client";

import { Suspense } from "react";
import LoginContent from "./_components/LoginContent";


export default function LoginPage() {
  return (
    <Suspense fallback={<div /> /* หรือ skeleton loading */}>
      <LoginContent />
    </Suspense>
  );
}