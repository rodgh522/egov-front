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
import { Plus, Settings, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MenuManagementPage() {
    const [menus, setMenus] = useState<MenuResponse[]>([]);
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
            const sorted = data.sort((a, b) => (a.menuNo || 0) - (b.menuNo || 0));
            setMenus(sorted);
        } catch (error) {
            console.error("Failed to load menus:", error);
        } finally {
            setLoading(false);
        }
    };

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
                        A list of all registered menus in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Path</TableHead>
                                <TableHead className="w-[80px]">Order</TableHead>
                                <TableHead>Icon</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        Loading menus...
                                    </TableCell>
                                </TableRow>
                            ) : menus.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        No menus found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                menus.map((menu) => (
                                    <TableRow key={menu.menuNo}>
                                        <TableCell className="font-medium">{menu.menuNo}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {/* Indent based on hierarchy if we flatten tree, for now simple list */}
                                                <span>{menu.menuName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {menu.menuCode}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-sm max-w-[200px] truncate">
                                            {menu.menuPath || '-'}
                                        </TableCell>
                                        <TableCell>{menu.menuOrder}</TableCell>
                                        <TableCell>
                                            {menu.iconName && (
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    {menu.iconName}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {/* Using badges for read-only view, could be Switch for toggle if API supported quick update */}
                                            <div className="flex gap-1">
                                                {menu.useAt === 'Y' && <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>}
                                                {menu.isVisible === 'Y' && <Badge variant="secondary">Visible</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
