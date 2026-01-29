"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PipelineList } from "@/components/sales/pipelines/pipeline-list";
import { PipelineSheet } from "@/components/sales/pipelines/pipeline-sheet";
import { PipelineStageResponse } from "@/api/generated";
import { pipelineStageControllerApi } from "@/lib/api-client";

export default function PipelineManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedStage, setSelectedStage] = useState<PipelineStageResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // URL Params
    const editId = searchParams.get("detail");
    const isCreate = searchParams.get("view") === "create";

    const isSheetOpen = !!editId || isCreate;

    useEffect(() => {
        const fetchStage = async (id: string) => {
            try {
                const response = await pipelineStageControllerApi.getStage({ stageId: id });
                if (response) {
                    setSelectedStage(response);
                }
            } catch (error) {
                console.error("Failed to fetch pipeline stage for edit:", error);
                // Optionally redirect back to list if not found
            }
        };

        if (editId) {
            fetchStage(editId);
        } else if (isCreate) {
            setSelectedStage(null);
        } else {
            setSelectedStage(null);
        }
    }, [editId, isCreate]);

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

    const handleEdit = (stage: PipelineStageResponse) => {
        if (stage.stageId) {
            updateRoute({ detail: stage.stageId, view: null });
        }
    };

    const handleClose = () => {
        updateRoute({ detail: null, view: null });
    };

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
        handleClose();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pipeline Stages</h1>
                    <p className="text-muted-foreground">
                        Manage sales pipeline stages and probabilities.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stage
                </Button>
            </div>

            <PipelineList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

            <PipelineSheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                stage={selectedStage}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
