'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, fetchCurrentUser, logout } from '@/lib/auth';
import { MenuItem, fetchUserMenus } from '@/lib/menu';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    menus: MenuItem[];
    loading: boolean;
    hasPermission: (permission: string) => boolean;
    hasMenuAccess: (menuCode: string, action?: string) => boolean;
    refreshUser: () => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadUser = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const userData = await fetchCurrentUser();
                setUser(userData);
                try {
                    const userMenus = await fetchUserMenus();
                    setMenus(userMenus);
                } catch (menuError) {
                    console.error("Failed to fetch menus", menuError);
                    setMenus([]);
                }
            } else {
                setUser(null);
                setMenus([]);
            }
        } catch (error) {
            console.error("Failed to load user session", error);
            // If fetching user fails (e.g. 401), we might want to clear token
            // But fetchCurrentUser in lib/auth throws, so we catch it here.
            // We can try to refresh token here if we implement auto-refresh logic
            setUser(null);
            setMenus([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const hasPermission = (permission: string): boolean => {
        return user?.permissions?.includes(permission) ?? false;
    };

    const hasMenuAccess = (menuCode: string, action: string = 'READ'): boolean => {
        // Adjust permission string format as per project convention, e.g. "MENU:menuCode:action"
        return hasPermission(`MENU:${menuCode}:${action}`);
    };

    const signOut = () => {
        logout();
        setUser(null);
        setMenus([]);
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
