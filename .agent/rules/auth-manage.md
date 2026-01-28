---
trigger: always_on
---

Frontend JWT Management 

Rules

1. Overview
This document defines the rules for handling JSON Web Tokens (JWT) and session state within the CRM system. It ensures strict data isolation for multi-tenancy and a seamless user experience through automatic token renewal.

2. Authentication Data Schema
Upon successful authentication, the complete JSON response payload must be persisted in Local Storage.

Required Fields:
- tenant_id: Unique identifier for the SaaS tenant.
- branch_id: Current branch identifier.
- group_id: Assigned group identifier.
- position_id: User's job position identifier.
- role_id[]: Array of assigned permission roles.
- user_id: Unique user identifier.
- token: The short-lived Access Token.
- refresh_token: The long-lived Refresh Token.

3. Architecture & File ResponsibilitiesComponent

- API Layer: src/api/generated/apis/AuthenticationApi.ts: Auto-generated API client containing endpoints for login and token refresh.
- Service Layer: src/lib/auth.ts: Business logic for storage management, token parsing, and expiration checks.
- State Layer: src/context/AuthContext.tsx: Global React state provider to synchronize authentication status across the UI.

4. Token Lifecycle Rules

A. Persistence
- Immediately upon receiving the JWT response from the server, store all relevant JSON fields in Local Storage.
- On application initialization, the AuthContext must read from Local Storage to restore the session.

B. Automatic Token Refresh
- Detection: The system must monitor the expiration of the token.
- Execution: If the Access Token expires, the system must automatically invoke the refresh logic using the refresh_token via AuthenticationApi.ts.
- Interception: Use an API interceptor to catch 401 Unauthorized errors and attempt a silent refresh before retrying the original request.

C. Session Termination (Logout)
- Refresh Expiry: If the refresh_token is also expired or the refresh request fails, the system must trigger an automatic logout.
- Cleanup:
  - Clear all data from Local Storage.
  - Reset the AuthContext state.
  - Redirect the user to the login page.

5. Security & Multi-tenancy

- All subsequent API calls must utilize the tenant_id and token retrieved from the local storage to ensure strict multi-tenant data isolation.