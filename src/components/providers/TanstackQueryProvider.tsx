'use client';  // Client-side component

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function TanstackQueryProvider({ children}:{children:ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
       <HydrationBoundary >  {children}</HydrationBoundary>
       <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
