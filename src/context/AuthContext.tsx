'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, fetchCurrentUser, logout } from '@/lib/auth';
import { MenuItem, fetchUserMenus } from '@/lib/menu';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    menus: MenuItem[];
    loading: boolean;
    hasPermission: (permission: string) => boolean;
    hasMenuAccess: (menuCode: string, action?: string) => boolean;
    refreshUser: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const loadUser = async () => {
        try {
            // Restore session from storage (sync-like operation wrapped in promise)
            const userData = await fetchCurrentUser();
            if (userData) {
                setUser(userData);

                // Fetch menus
                try {
                    const userMenus = await fetchUserMenus();
                    setMenus(userMenus);
                } catch (menuError) {
                    console.error("Failed to fetch menus", menuError);
                    // If fetching menus fails due to 401, middleware handles refresh.
                    // If it still fails, it might be persistent error, but user session is local.
                    // We keep user logged in but maybe empty menus or retry.
                    // For now, empty menus.
                    setMenus([]);
                }
            } else {
                setUser(null);
                setMenus([]);
            }
        } catch (error) {
            console.error("Failed to load user session", error);
            setUser(null);
            setMenus([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Effect to redirect logic if needed? 
    // Usually ProtectedRoute handles this.

    const hasPermission = (permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    };

    const hasMenuAccess = (menuCode: string, action: string = 'READ'): boolean => {
        return hasPermission(`MENU:${menuCode}:${action}`);
    };

    const signOut = async () => {
        // Clear local state immediately for UX
        setUser(null);
        setMenus([]);

        // Call API logout
        await logout();

        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, menus, loading, hasPermission, hasMenuAccess, refreshUser: loadUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
