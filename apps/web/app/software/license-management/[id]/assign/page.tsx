
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { LicenseAssignWizard } from "components/license-assign/LicenseAssignWizard";

export default function AssignLicensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <main className="px-4 py-6">
      <LicenseAssignWizard
        licenseId={id}
        onCancel={() => router.back()}
        onSuccess={() => router.push(`/software/license-management/${id}`)}
      />
    </main>
  );
}
