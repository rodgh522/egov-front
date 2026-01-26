'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        const isLoginPage = pathname === '/login';

        if (!user && !isLoginPage) {
            router.push('/login');
        } else if (user && isLoginPage) {
            router.push('/dashboard');
        }
    }, [user, loading, pathname, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Prevent unauthenticated access to protected routes
    const isLoginPage = pathname === '/login';
    if (!user && !isLoginPage) {
        return null;
    }

    // Prevent authenticated access to login page
    if (user && isLoginPage) {
        return null;
    }

    return <>{children}</>;
}
