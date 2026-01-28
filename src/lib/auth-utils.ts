import { TokenResponse } from '@/api/generated';

const STORAGE_KEYS = {
    AUTH_DATA: 'auth_data', // Complete session JSON
};

// Based on Rules: 2. Authentication Data Schema
export interface AuthSession {
    tenant_id: string;
    branch_id: string;
    group_id: string;
    position_id: string;
    role_id: string[];
    permissions: string[]; // Permissions derived from roles or returned by API
    user_id: string;
    username: string; // Added as it was in previous implementation, useful for UI
    token: string;
    refresh_token: string;
}

// Helper to access LocalStorage safely
export const getStoredSession = (): AuthSession | null => {
    if (typeof window === 'undefined') return null;
    try {
        const data = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to parse auth session', e);
        return null;
    }
};

export const setStoredSession = (session: AuthSession) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(session));
    // Keep legacy keys for compatibility if any other libs use them, 
    // or strictly follow new rule to only use auth_data?
    // The rule says "store all relevant JSON fields in Local Storage". 
    // It doesn't explicitly forbid individual keys, but single object is cleaner.
    // We will ensure api-client reads from this object.
};

export const clearStoredSession = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
    // Clear legacy if they exist
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
};

export const getAccessToken = (): string | null => {
    const session = getStoredSession();
    return session?.token || null;
};

// Raw refresh function avoiding circular dependencies
// Uses fetch directly instead of generated API client
export const refreshSessionToken = async (): Promise<string | null> => {
    const session = getStoredSession();
    if (!session?.refresh_token) return null;

    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}` // Some APIs might need old token, or just refresh token in body
            },
            body: JSON.stringify({ refreshToken: session.refresh_token })
        });

        if (!response.ok) {
            throw new Error(`Refresh failed with status ${response.status}`);
        }

        const json = await response.json();
        const data = json.data as TokenResponse; // Assuming standard structure

        if (data && data.accessToken) {
            // Update session with new tokens
            const newSession = {
                ...session,
                token: data.accessToken,
                refresh_token: data.refreshToken || session.refresh_token // Update refresh token if provided
            };
            setStoredSession(newSession);
            return data.accessToken;
        }

        return null;
    } catch (error) {
        console.error('Token refresh execution failed', error);
        return null;
    }
};
