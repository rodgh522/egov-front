import { Home, Settings, Users, FileText, BarChart3, Bell, Search, Menu } from "lucide-react";

export interface NavItem {
    title: string;
    href: string;
    icon: any; // Lucide icon
    isActive?: boolean;
}

export const navigationConfig: {
    sidebar: NavItem[];
    userMenu: NavItem[];
} = {
    sidebar: [
        {
            title: "Project Overview",
            href: "/dashboard",
            icon: Home,
            isActive: true, // Default active for demo
        },
        {
            title: "Authentication",
            href: "/dashboard/auth",
            icon: Users,
        },
        {
            title: "Firestore Database",
            href: "/dashboard/database",
            icon: FileText,
        },
        {
            title: "Analytics",
            href: "/dashboard/analytics",
            icon: BarChart3,
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
        },
    ],
    userMenu: [
        {
            title: "Profile",
            href: "/profile",
            icon: Users,
        },
        {
            title: "Log out",
            href: "/logout",
            icon: Settings, // Placeholder
        },
    ],
};
