import { Middleware, ResponseContext, FetchParams } from '@/api/generated';
import { refreshSessionToken, getAccessToken, clearStoredSession } from './auth-utils';

export const authMiddleware: Middleware = {
    post: async (context: ResponseContext): Promise<Response | void> => {
        const { response, url, init, fetch } = context;

        if (response.status === 401) {
            console.warn('Access token expired, attempting refresh...');

            // Attempt to refresh the token
            const newToken = await refreshSessionToken();

            if (newToken) {
                console.log('Token refresh successful, retrying request...');

                // Clone the init headers to avoid mutating the original object if used elsewhere
                const newHeaders = new Headers(init.headers);
                newHeaders.set('Authorization', `Bearer ${newToken}`);

                // Create new init object with updated headers
                const newInit: RequestInit = {
                    ...init,
                    headers: newHeaders
                };

                // Retry the original request with the new token
                return fetch(url, newInit);
            } else {
                console.error('Token refresh failed, logging out...');
                // Refresh failed, clear session
                // We don't direct redirect here to avoid context coupling, 
                // but clearing session allows UI to react (e.g. AuthContext)
                clearStoredSession();

                // Optionally we could redirect here if we had access to router,
                // but usually better to let the 401 propagate and let UI handle it.
                // However, without a clean redirect, the user might see an error.
                // For now, we return the original 401 response.
                return response;
            }
        }

        return response;
    }
};
