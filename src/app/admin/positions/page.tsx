"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PositionList } from "@/components/admin/positions/position-list";
import { PositionSheet } from "@/components/admin/positions/position-sheet";
import { PositionResponse } from "@/api/generated";
import { positionControllerApi } from "@/lib/api-client";

export default function PositionManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedPosition, setSelectedPosition] = useState<PositionResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // URL Params
    const editId = searchParams.get("detail");
    const isCreate = searchParams.get("view") === "create";

    const isSheetOpen = !!editId || isCreate;

    useEffect(() => {
        const fetchPosition = async (id: string) => {
            try {
                const response = await positionControllerApi.getPosition({ positionId: id });
                if (response) {
                    setSelectedPosition(response);
                }
            } catch (error) {
                console.error("Failed to fetch position for edit:", error);
                // Optionally redirect back to list if not found
                // router.push(pathname); 
            }
        };

        if (editId) {
            fetchPosition(editId);
        } else if (isCreate) {
            setSelectedPosition(null);
        } else {
            setSelectedPosition(null);
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
        updateRoute({ view: "create", detail: null });
    };

    const handleEdit = (position: PositionResponse) => {
        if (position.positionId) {
            updateRoute({ detail: position.positionId, view: null });
        }
    };

    const handleClose = () => {
        updateRoute({ detail: null, view: null });
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
        handleClose(); // Close sheet on success
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Position Management</h1>
                    <p className="text-muted-foreground">
                        Manage system positions / ranks.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Position
                </Button>
            </div>

            <PositionList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

            <PositionSheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                position={selectedPosition}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
