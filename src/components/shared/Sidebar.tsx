"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package2 } from "lucide-react";
import { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";

export function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
                        {navigationConfig.sidebar.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                                    pathname === item.href && "text-foreground font-semibold"
                                )}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </Link>
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
                            Project Shortcuts
                        </div>
                        {navigationConfig.sidebar.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70")} />
                                    {item.title}
                                </Link>
                            );
                        })}
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
