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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { MenuTree } from "@/components/admin/menu/MenuTree";
import { buildMenuTree, MenuItem } from "@/lib/menu";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { EditMenuSheet } from "@/components/admin/menu/EditMenuSheet";

export default function MenuManagementPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const editMenuId = searchParams.get("edit");
    const isEditSheetOpen = !!editMenuId;
    const selectedMenuNo = editMenuId ? parseInt(editMenuId) : null;

    // Create sheet state
    // Create sheet state
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [createInitialValues, setCreateInitialValues] = useState<{ upperMenuNo?: number; menuOrder?: number }>({});

    // Delete state
    const [menuToDelete, setMenuToDelete] = useState<number | null>(null);

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
        const params = new URLSearchParams(searchParams);
        if (menu.menuNo) {
            params.set("edit", menu.menuNo.toString());
        }
        router.push(`${pathname}?${params.toString()}`);
    }

    const handleSheetClose = (open: boolean) => {
        if (!open) {
            const params = new URLSearchParams(searchParams);
            params.delete("edit");
            router.push(`${pathname}?${params.toString()}`);
        }
    }

    const handleSheetSuccess = () => {
        loadMenus(); // Refresh list to show updates
        handleSheetClose(false); // Close sheet
    }

    const handleCreate = () => {
        setCreateInitialValues({
            menuOrder: calculateNextOrder(menus) // Default for root
        });
        setIsCreateSheetOpen(true);
    }

    const handleCreateChild = (parent: MenuItem) => {
        setCreateInitialValues({
            upperMenuNo: parent.menuNo,
            menuOrder: calculateNextOrder(parent.children)
        });
        setIsCreateSheetOpen(true);
    }

    const calculateNextOrder = (items: MenuItem[] | undefined): number => {
        if (!items || items.length === 0) return 0;
        const maxOrder = Math.max(...items.map(i => i.menuOrder || 0));
        return maxOrder + 10; // Increment by 10 for spacing
    }

    const handleCreateSuccess = () => {
        loadMenus();
        setIsCreateSheetOpen(false);
    }

    const handleDelete = async (menuNo: number) => {
        setMenuToDelete(menuNo);
    }

    const confirmDelete = async () => {
        if (!menuToDelete) return;

        try {
            await api.deleteMenu({ menuNo: menuToDelete });
            loadMenus(); // Reload after delete
        } catch (error) {
            console.error("Failed to delete menu:", error);
        } finally {
            setMenuToDelete(null);
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
                    <Button onClick={handleCreate}>
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
                            onCreateChild={handleCreateChild}
                            onDelete={handleDelete}
                        />
                    )}
                </CardContent>
            </Card>

            <EditMenuSheet
                open={isEditSheetOpen}
                onOpenChange={handleSheetClose}
                menuNo={selectedMenuNo}
                onSuccess={handleSheetSuccess}
            />

            <EditMenuSheet
                open={isCreateSheetOpen}
                onOpenChange={setIsCreateSheetOpen}
                menuNo={null}
                initialValues={createInitialValues}
                onSuccess={handleCreateSuccess}
            />

            <AlertDialog open={!!menuToDelete} onOpenChange={(open) => !open && setMenuToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the menu and all its sub-menus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
