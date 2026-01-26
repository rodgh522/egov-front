import { MenuControllerApi, MenuResponse } from "@/api/generated";
import { apiConfig } from "./api-client";

export type MenuItem = MenuResponse & {
    children?: MenuItem[];
};

export async function fetchUserMenus(): Promise<MenuItem[]> {
    const api = new MenuControllerApi(apiConfig);
    const menus = await api.getVisibleMenus();
    return buildMenuTree(menus);
}

function buildMenuTree(menus: MenuResponse[]): MenuItem[] {
    const menuMap = new Map<number, MenuItem>();
    const roots: MenuItem[] = [];

    // 1. Create map
    menus.forEach(menu => {
        if (menu.menuNo !== undefined) {
            menuMap.set(menu.menuNo, { ...menu, children: [] });
        }
    });

    // 2. Build tree
    menus.forEach(menu => {
        if (menu.menuNo !== undefined) {
            const node = menuMap.get(menu.menuNo);
            if (node) {
                // Check if it has a parent
                if (menu.upperMenuNo && menuMap.has(menu.upperMenuNo)) {
                    const parent = menuMap.get(menu.upperMenuNo);
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(node);
                    }
                } else {
                    // No parent or parent not found -> Root
                    roots.push(node);
                }
            }
        }
    });

    // 3. Sort
    const sortMenus = (items: MenuItem[]) => {
        items.sort((a, b) => (a.menuOrder || 0) - (b.menuOrder || 0));
        items.forEach(item => {
            if (item.children && item.children.length > 0) {
                sortMenus(item.children);
            }
        });
    };
    sortMenus(roots);

    return roots;
}
