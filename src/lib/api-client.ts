import { Configuration, UserManagementApi, TenantControllerApi, BranchControllerApi, GroupControllerApi, PositionControllerApi } from '@/api/generated';
import { authMiddleware } from './auth-middleware';
import { getAccessToken } from './auth-utils';

const BASE_PATH = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiConfig = new Configuration({
    basePath: BASE_PATH,
    accessToken: () => {
        return getAccessToken() || '';
    },
    middleware: [authMiddleware],
});

export const userManagementApi = new UserManagementApi(apiConfig);
export const tenantControllerApi = new TenantControllerApi(apiConfig);
export const branchControllerApi = new BranchControllerApi(apiConfig);
export const groupControllerApi = new GroupControllerApi(apiConfig);
export const positionControllerApi = new PositionControllerApi(apiConfig);

