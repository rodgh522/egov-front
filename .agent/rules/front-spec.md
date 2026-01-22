---
trigger: always_on
---

# CRM Project - Front-end Specification

## 1. Frontend Integration - React 19.2 + shadcn/ui

### 1.1 Authentication & User Context

#### 1.1.1 Authentication API Integration

```typescript
// src/lib/auth.ts
export interface User {
  userId: string;
  username: string;
  tenantId: string;
  permissions: string[]; // e.g., ["MENU:business-list:READ", "API:business-list:READ"]
  roles: string[];
}

export async function login(username: string, password: string): Promise<User> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) throw new Error('Login failed');

  const data = await response.json();

  // Store token
  localStorage.setItem('authToken', data.token);

  return data.user;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch('/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
  });

  if (!response.ok) throw new Error('Failed to fetch user');

  return response.json();
}
```

#### 1.1.2 React Context for User & Permissions

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, fetchCurrentUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasMenuAccess: (menuCode: string, action?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  const hasMenuAccess = (menuCode: string, action: string = 'READ'): boolean => {
    return hasPermission(`MENU:${menuCode}:${action}`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasPermission, hasMenuAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 1.2 Dynamic Sidebar with Menu Permissions

#### 1.2.1 Fetch Menu Structure from Backend

```typescript
// src/lib/menu.ts
export interface MenuItem {
  menuNo: number;
  menuCode: string;
  menuName: string;
  menuPath?: string;
  iconName?: string;
  upperMenuNo?: number;
  menuOrder: number;
  children?: MenuItem[];
}

export async function fetchUserMenus(): Promise<MenuItem[]> {
  const response = await fetch('/api/v1/menus/user-menus', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
  });

  if (!response.ok) throw new Error('Failed to fetch menus');

  const menus: MenuItem[] = await response.json();

  // Build tree structure
  return buildMenuTree(menus);
}

function buildMenuTree(menus: MenuItem[]): MenuItem[] {
  const menuMap = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];

  // First pass: create map
  menus.forEach(menu => {
    menuMap.set(menu.menuNo, { ...menu, children: [] });
  });

  // Second pass: build tree
  menus.forEach(menu => {
    const node = menuMap.get(menu.menuNo)!;
    if (menu.upperMenuNo) {
      const parent = menuMap.get(menu.upperMenuNo);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort by menuOrder
  const sortMenus = (items: MenuItem[]) => {
    items.sort((a, b) => a.menuOrder - b.menuOrder);
    items.forEach(item => item.children && sortMenus(item.children));
  };
  sortMenus(roots);

  return roots;
}
```

#### 1.2.2 Backend API for User Menus (Reference)

```java
@RestController
@RequestMapping("/api/v1/menus")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/user-menus")
    public ResponseEntity<List<MenuDTO>> getUserMenus(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        // Get all menus user has READ permission for
        List<Menu> accessibleMenus = menuService.getAccessibleMenusForUser(
            userDetails.getUsername(),
            userDetails.getTenantId()
        );

        return ResponseEntity.ok(
            accessibleMenus.stream()
                .map(MenuDTO::from)
                .collect(Collectors.toList())
        );
    }
}
```

#### 1.2.3 Sidebar Component with shadcn/ui

```typescript
// src/components/Sidebar.tsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { fetchUserMenus, MenuItem } from '@/lib/menu';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const { hasMenuAccess } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchUserMenus().then(setMenus);
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {menus.map(menu => (
              <SidebarMenuItem key={menu.menuNo}>
                <MenuItemRecursive menu={menu} currentPath={location.pathname} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function MenuItemRecursive({ menu, currentPath }: { menu: MenuItem; currentPath: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = menu.children && menu.children.length > 0;
  const isActive = currentPath === menu.menuPath;

  if (hasChildren) {
    return (
      <>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          className={cn(isActive && 'bg-accent')}
        >
          {menu.iconName && <span className="mr-2">{menu.iconName}</span>}
          <span>{menu.menuName}</span>
          {isOpen ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
        </SidebarMenuButton>

        {isOpen && (
          <SidebarMenuSub>
            {menu.children.map(child => (
              <SidebarMenuItem key={child.menuNo}>
                <MenuItemRecursive menu={child} currentPath={currentPath} />
              </SidebarMenuItem>
            ))}
          </SidebarMenuSub>
        )}
      </>
    );
  }

  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link to={menu.menuPath || '#'}>
        {menu.iconName && <span className="mr-2">{menu.iconName}</span>}
        <span>{menu.menuName}</span>
      </Link>
    </SidebarMenuButton>
  );
}
```

#### 1.2.4 Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  menuCode?: string;
  requiredPermission?: string;
}

export function ProtectedRoute({
  children,
  menuCode,
  requiredPermission
}: ProtectedRouteProps) {
  const { user, loading, hasMenuAccess, hasPermission } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check menu access
  if (menuCode && !hasMenuAccess(menuCode)) {
    return <Navigate to="/403" replace />;
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

// Usage in routes
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/business/list" element={
            <ProtectedRoute menuCode="business-list">
              <BusinessListPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/roles" element={
            <ProtectedRoute requiredPermission="MENU:admin-roles:READ">
              <RolesManagementPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### 1.3 Action-Level UI Control

Hide/disable buttons based on permissions:

```typescript
// src/pages/BusinessListPage.tsx
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function BusinessListPage() {
  const { hasPermission } = useAuth();

  const canWrite = hasPermission('MENU:business-list:WRITE');
  const canDownload = hasPermission('MENU:business-list:DOWNLOAD');

  return (
    <div>
      <h1>Business List</h1>

      {canWrite && (
        <Button onClick={handleCreate}>Create New</Button>
      )}

      {canDownload && (
        <Button onClick={handleDownload}>Download CSV</Button>
      )}

      {/* List table */}
    </div>
  );
}
```

## API Integration & Code Generation
* **Strategy:** Use OpenAPI Specification (OAS) to auto-generate TypeScript API clients.
* **Tooling:** `@openapitools/openapi-generator-cli` (or Orval if using TanStack Query).
* **Source of Truth:** The API schema file should be located at `/api-spec/openapi.yaml`.
* **Output Directory:** All generated code must reside in `src/api/generated/`.
* **Automation:** * Add a script `npm run api:gen` to trigger code generation.
    * The generated client must use the `Fetch API` or `Axios` and be fully typed.
* **Usage Rule:** * Never manually edit files in `src/api/generated/`.
    * Use a wrapper or an API instance in `src/lib/api-client.ts` to handle base URLs, headers (Firebase Auth tokens), and interceptors.
