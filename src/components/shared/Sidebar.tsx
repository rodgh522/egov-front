"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2, ChevronDown, ChevronRight, Circle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MenuItem } from "@/lib/menu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { menus } = useAuth();

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden fixed left-4 top-4 z-40">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="#"
                            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                        >
                            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                            <span className="sr-only">Acme Inc</span>
                        </Link>
                        {menus.map((menu) => (
                            <MobileMenuItem key={menu.menuNo} menu={menu} currentPath={pathname} onNavigate={() => setIsMobileOpen(false)} />
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-sidebar border-sidebar-border sm:flex">
                <div className="flex h-14 items-center border-b border-sidebar-border px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                        <Package2 className="h-6 w-6 text-sidebar-primary" />
                        <span>Welcome</span>
                    </Link>
                </div>
                <ScrollArea className="flex-1 py-4">
                    <nav className="grid gap-1 px-4">
                        <div className="text-xs font-semibold text-sidebar-foreground/70 mb-2 px-2 uppercase tracking-wider">
                            Menu
                        </div>
                        {menus.map((menu) => (
                            <DesktopMenuItem key={menu.menuNo} menu={menu} currentPath={pathname} />
                        ))}
                    </nav>
                </ScrollArea>
                <div className="mt-auto p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-4 px-2 py-2">
                        <div className="flex flex-col">

                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

function resolveIcon(iconName?: string) {
    if (!iconName) return Circle;
    const icon = LucideIcons[iconName as keyof typeof LucideIcons];
    return (icon as any) || Circle;
}

function DesktopMenuItem({ menu, currentPath }: { menu: MenuItem; currentPath: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = menu.children && menu.children.length > 0;
    const normalizePath = (p?: string) => p?.replace(/\/$/, "") || "";
    const isActive = normalizePath(currentPath) === normalizePath(menu.menuPath);
    const Icon = resolveIcon(menu.iconName);

    if (hasChildren) {
        return (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
                <CollapsibleTrigger asChild>
                    <button
                        className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                            isOpen && "text-sidebar-foreground"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            {menu.menuName}
                        </div>
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    {menu.children!.map((child) => (
                        <DesktopMenuItem key={child.menuNo} menu={child} currentPath={currentPath} />
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Link
            href={menu.menuPath || '#'}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70")} />
            {menu.menuName}
        </Link>
    );
}

function MobileMenuItem({ menu, currentPath, onNavigate }: { menu: MenuItem; currentPath: string; onNavigate: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = menu.children && menu.children.length > 0;
    const Icon = resolveIcon(menu.iconName);
    const isActive = currentPath === menu.menuPath;

    if (hasChildren) {
        return (
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-center justify-between gap-2 text-muted-foreground hover:text-foreground"
                >
                    <div className="flex items-center gap-4 px-2.5">
                        <Icon className="h-5 w-5" />
                        {menu.menuName}
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {isOpen && (
                    <div className="pl-6 flex flex-col gap-2">
                        {menu.children!.map((child) => (
                            <MobileMenuItem key={child.menuNo} menu={child} currentPath={currentPath} onNavigate={onNavigate} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={menu.menuPath || '#'}
            className={cn(
                "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                isActive && "text-foreground font-semibold"
            )}
            onClick={onNavigate}
        >
            <Icon className="h-5 w-5" />
            {menu.menuName}
        </Link>
    );
}
