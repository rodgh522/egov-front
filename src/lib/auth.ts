import { AuthenticationApi, LoginRequest, RefreshTokenRequest } from '@/api/generated';
import { apiConfig } from './api-client';

export interface User {
    userId: string;
    username: string;
    tenantId: string;
    permissions: string[];
    roles: string[];
}

const authApi = new AuthenticationApi(apiConfig);

export async function login(username: string, password: string): Promise<User> {
    const loginRequest: LoginRequest = { userId: username, password };

    try {
        const response = await authApi.login({ loginRequest });

        // Check response.data.accessToken
        if (response && response.data && response.data.accessToken) {
            localStorage.setItem('authToken', response.data.accessToken);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            return fetchCurrentUser();
        } else {
            throw new Error('No access token received');
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

export async function fetchCurrentUser(): Promise<User> {
    try {
        const response = await authApi.getCurrentUser();
        // response is ApiResponseMapStringObject, data is map
        if (response && response.data) {
            return response.data as unknown as User;
        }
        throw new Error('User data not found in response');
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw error;
    }
}

export async function refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const refreshTokenRequest: RefreshTokenRequest = { refreshToken };

    try {
        const response = await authApi.refreshToken({ refreshTokenRequest });
        if (response && response.data && response.data.accessToken) {
            localStorage.setItem('authToken', response.data.accessToken);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            return response.data.accessToken;
        }
        return null;
    } catch (error) {
        console.error('Refresh token failed:', error);
        // If refresh fails, clear tokens
        logout();
        return null;
    }
}

export async function logout() {
    try {
        await authApi.logout();
    } catch (error) {
        console.error('Logout API failed:', error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }
}
