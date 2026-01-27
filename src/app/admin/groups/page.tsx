"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GroupList } from "@/components/admin/groups/group-list";
import { GroupSheet } from "@/components/admin/groups/group-sheet";
import { GroupResponse } from "@/api/generated";
import { groupControllerApi } from "@/lib/api-client";

export default function GroupManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // URL Params
    const editId = searchParams.get("edit");
    const isCreate = searchParams.get("view") === "create";

    const isSheetOpen = !!editId || isCreate;

    useEffect(() => {
        const fetchGroup = async (id: string) => {
            try {
                const response = await groupControllerApi.getGroup({ groupId: id });
                setSelectedGroup(response);
            } catch (error) {
                console.error("Failed to fetch group for edit:", error);
            }
        };

        if (editId) {
            fetchGroup(editId);
        } else if (isCreate) {
            setSelectedGroup(null);
        } else {
            setSelectedGroup(null);
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

    const handleEdit = (group: GroupResponse) => {
        if (group.groupId) {
            updateRoute({ edit: group.groupId, view: null });
        }
    };

    const handleClose = () => {
        updateRoute({ edit: null, view: null });
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
        handleClose();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Group Management</h1>
                    <p className="text-muted-foreground">
                        Manage user groups and organizations.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Group
                </Button>
            </div>

            <GroupList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

            <GroupSheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                group={selectedGroup}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
