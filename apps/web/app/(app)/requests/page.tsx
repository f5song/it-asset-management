import React from 'react';
import { FILTER_OPTIONS } from '@/mock/requests.mock';
import { PageHeader } from '@/components/ui/PageHeader';
import RequestsView from '@/components/requests/RequestsView';

export const metadata = { title: 'Requests' };

export default function Page() {
  const title = 'Request';
  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Requests' },
  ];

  return (
    <div>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      <div className="mt-4">
        <RequestsView
          statusOptions={FILTER_OPTIONS.sites}
          typeOptions={FILTER_OPTIONS.risks}
          manufacturerOptions={FILTER_OPTIONS.exceptions}
          allStatusLabel="All Site"
          allTypeLabel="All Risk"
          allManufacturerLabel="All Exceptions"
        />
      </div>
    </div>
  );
}