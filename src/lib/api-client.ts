import { Configuration, UserManagementApi, TenantControllerApi } from '@/api/generated';

const BASE_PATH = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiConfig = new Configuration({
    basePath: BASE_PATH,
    accessToken: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        return token || '';
    },
});

export const userManagementApi = new UserManagementApi(apiConfig);
export const tenantControllerApi = new TenantControllerApi(apiConfig);

