'use client';
import { useState } from 'react';
import { QueryClient, keepPreviousData } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

const DAY = 24 * 60 * 60_000;

const persister = createAsyncStoragePersister({
  key: 'lms-cache',
  // undefined on the server → persister becomes a no-op
  storage:
    typeof window === 'undefined'
      ? undefined
      : { getItem: (k) => get(k), setItem: (k, v) => set(k, v), removeItem: (k) => del(k) },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000, // tab switches render from cache instantly
            gcTime: DAY,
            refetchOnWindowFocus: false,
            retry: 1,
            placeholderData: keepPreviousData,
          },
        },
      }),
  );

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: DAY,
        buster: process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev',
        dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === 'success' && q.queryKey[0] !== 'exam' },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
