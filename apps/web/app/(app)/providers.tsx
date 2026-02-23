//apps\web\app\(app)\providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

type ProvidersProps = {
  children: React.ReactNode;
  session?: Session | null; // รับ session จาก layout (optional)
};

export default function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ปรับให้เหมาะกับงานคุณ
            staleTime: 60_000,              // ข้อมูลสดภายใน 1 นาที
            refetchOnWindowFocus: false,    // ไม่รีเฟรชเมื่อโฟกัสหน้าต่าง
            retry: 1,
          },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}