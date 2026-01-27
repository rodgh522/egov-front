"use client";

import { useEffect, useState } from "react";
import { MenuControllerApi, MenuResponse } from "@/api/generated";
import { apiConfig } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { MenuTree } from "@/components/admin/menu/MenuTree";
import { buildMenuTree, MenuItem } from "@/lib/menu"; // Ensure this import path is correct

export default function MenuManagementPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const api = new MenuControllerApi(apiConfig);

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        try {
            setLoading(true);
            const data = await api.getAllMenus();
            // Sort by menuNo or Order if available
            // Build tree structure
            const tree = buildMenuTree(data);
            setMenus(tree);
        } catch (error) {
            console.error("Failed to load menus:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (newMenus: MenuItem[]) => {
        // Optimistic update
        setMenus(newMenus);

        // TODO: Call API to save order
        // Current API might not support bulk update of order. 
        // We might need to iterate and update changed items or usage a hypothetical bulk endpoint.
        // For now, we just update local state to demonstrate UI.

        console.log("New order:", newMenus);
    };

    const handleEdit = (menu: MenuItem) => {
        console.log("Edit menu:", menu);
        // Implement edit modal/drawer here
    }

    const handleDelete = async (menuNo: number) => {
        if (!confirm("Are you sure you want to delete this menu?")) return;

        try {
            await api.deleteMenu({ menuNo });
            loadMenus(); // Reload after delete
        } catch (error) {
            console.error("Failed to delete menu:", error);
        }
    }

    return (
        <div className="grid gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
                    <p className="text-muted-foreground">
                        Manage system menus, their hierarchy, and permissions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Menu
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Menus</CardTitle>
                    <CardDescription>
                        Drag and drop to reorder menu items.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center h-24 text-muted-foreground flex items-center justify-center">
                            Loading menus...
                        </div>
                    ) : menus.length === 0 ? (
                        <div className="text-center h-24 text-muted-foreground flex items-center justify-center">
                            No menus found. Create one to get started.
                        </div>
                    ) : (
                        <MenuTree
                            items={menus}
                            onReorder={handleReorder}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
