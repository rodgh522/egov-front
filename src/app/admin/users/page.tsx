"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserList } from "@/components/admin/users/user-list";
import { UserSheet } from "@/components/admin/users/user-sheet";
import { UserResponse } from "@/api/generated";
import { userManagementApi } from "@/lib/api-client";

export default function UserManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // URL Params
    const editId = searchParams.get("edit");
    const isCreate = searchParams.get("view") === "create";

    const isSheetOpen = !!editId || isCreate;

    useEffect(() => {
        const fetchUser = async (id: string) => {
            try {
                const response = await userManagementApi.getUser({ esntlId: id });
                if (response.data) {
                    setSelectedUser(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch user for edit:", error);
                // Optionally redirect back to list if not found
                // router.push(pathname); 
            }
        };

        if (editId) {
            fetchUser(editId);
        } else if (isCreate) {
            setSelectedUser(null);
        } else {
            setSelectedUser(null);
        }
    }, [editId, isCreate, pathname, router]);

    const updateRoute = (params: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleCreate = () => {
        updateRoute({ view: "create", edit: null });
    };

    const handleEdit = (user: UserResponse) => {
        if (user.esntlId) {
            updateRoute({ edit: user.esntlId, view: null });
        }
    };

    const handleClose = () => {
        updateRoute({ edit: null, view: null });
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
        handleClose(); // Close sheet on success
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage system users, roles, and permissions.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <UserList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

            <UserSheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                user={selectedUser}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
