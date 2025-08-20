
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/dashboard');
            } else {
                router.replace('/signin');
            }
        }
    }, [user, loading, router]);
    
    // Render a full-page loading skeleton while checking auth state
    return (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="space-y-4 w-full max-w-md p-8">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
          </div>
        </div>
    );
}
