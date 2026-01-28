import { AuthenticationApi, LoginRequest, Configuration } from '@/api/generated';
import { apiConfig } from './api-client';
import { setStoredSession, AuthSession, clearStoredSession, getStoredSession } from './auth-utils';

// Re-export types from utils for convenience if needed, 
// or define high-level User type here that matches UI needs.
export type { AuthSession } from './auth-utils';

// This User interface matches the properties expected by the UI (e.g. AuthContext)
// It basically maps to AuthSession but might have helper methods or slightly different structure if needed.
// For now, let's align it with AuthSession from utils.
export interface User {
    userId: string;
    username: string;
    tenantId: string;
    branchId: string;
    groupId: string;
    positionId: string;
    permissions: string[]; // mapped from role_id if roles imply simple permissions, or separate field
    roles: string[];
}

const authApi = new AuthenticationApi(apiConfig);

export async function login(username: string, password: string): Promise<User> {
    const loginRequest: LoginRequest = { userId: username, password };

    try {
        // 1. Perform Login
        const loginResponse = await authApi.login({ loginRequest });

        if (!loginResponse?.data?.accessToken) {
            throw new Error('No access token received');
        }

        const token = loginResponse.data.accessToken;
        const refreshToken = loginResponse.data.refreshToken || '';

        // 2. Fetch User Profile
        // Ensure we create a proper Configuration instance
        const tempConfig = new AuthenticationApi(new Configuration({
            basePath: apiConfig.basePath,
            accessToken: token
        }));

        const userResponse = await tempConfig.getCurrentUser();

        if (!userResponse || !userResponse.data) {
            throw new Error('Failed to fetch user profile');
        }

        const userData = userResponse.data as any; // Cast to access dynamic fields

        // 3. Construct Session
        const session: AuthSession = {
            tenant_id: userData.tenantId || userData.tenant_id || '',
            branch_id: userData.branchId || userData.branch_id || '',
            group_id: userData.groupId || userData.group_id || '',
            position_id: userData.positionId || userData.position_id || '',
            role_id: userData.roles || [],
            permissions: userData.permissions || [], // Store permissions if available
            user_id: userData.userId || userData.user_id || username,
            username: userData.userName || userData.username || username,
            token: token,
            refresh_token: refreshToken
        };

        // 4. Persist
        setStoredSession(session);

        // 5. Return User object for UI
        return mapSessionToUser(session);

    } catch (error) {
        console.error('Login process failed:', error);
        clearStoredSession();
        throw error;
    }
}

export async function fetchCurrentUser(): Promise<User | null> {
    const session = getStoredSession();
    if (!session) return null;
    return mapSessionToUser(session);
}

export async function logout() {
    try {
        await authApi.logout();
    } catch (error) {
        console.error('Logout API failed:', error);
    } finally {
        clearStoredSession();
    }
}

function mapSessionToUser(session: AuthSession): User {
    return {
        userId: session.user_id,
        username: session.username,
        tenantId: session.tenant_id,
        branchId: session.branch_id,
        groupId: session.group_id,
        positionId: session.position_id,
        roles: session.role_id,
        permissions: session.permissions || []
    };
}
