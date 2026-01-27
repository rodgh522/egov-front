"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BranchList } from "@/components/admin/branches/branch-list";
import { BranchSheet } from "@/components/admin/branches/branch-sheet";
import { BranchResponse } from "@/api/generated";
import { branchControllerApi } from "@/lib/api-client";

export default function BranchManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // URL Params
    const editId = searchParams.get("edit");
    const isCreate = searchParams.get("view") === "create";

    const isSheetOpen = !!editId || isCreate;

    useEffect(() => {
        const fetchBranch = async (id: string) => {
            try {
                const response = await branchControllerApi.getBranch({ branchId: id });
                setSelectedBranch(response);
            } catch (error) {
                console.error("Failed to fetch branch for edit:", error);
            }
        };

        if (editId) {
            fetchBranch(editId);
        } else if (isCreate) {
            setSelectedBranch(null);
        } else {
            setSelectedBranch(null);
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

    const handleEdit = (branch: BranchResponse) => {
        if (branch.branchId) {
            updateRoute({ edit: branch.branchId, view: null });
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
                    <h1 className="text-2xl font-bold tracking-tight">Branch Management</h1>
                    <p className="text-muted-foreground">
                        Manage organization branches.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Branch
                </Button>
            </div>

            <BranchList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

            <BranchSheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                branch={selectedBranch}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
