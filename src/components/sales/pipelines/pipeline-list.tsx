import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { PipelineStageResponse } from "@/api/generated";
import { pipelineStageControllerApi } from "@/lib/api-client";
import { PipelineActions } from "./pipeline-actions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PipelineListProps {
    onEdit: (stage: PipelineStageResponse) => void;
    refreshTrigger: number;
}

export function PipelineList({ onEdit, refreshTrigger }: PipelineListProps) {
    const [data, setData] = useState<PipelineStageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<PipelineStageResponse | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Using getAllStages. If order matters, use getActiveStagesOrdered but that implies only active ones. 
            // getAllStages should return all. The controller name suggests getAllStages.
            const response = await pipelineStageControllerApi.getAllStages();
            // Sort by order purely client side for display if API doesn't guarantee it for 'all'
            const sorted = response.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
            setData(sorted);
        } catch (error) {
            console.error("Failed to fetch pipeline stages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const confirmDelete = async () => {
        if (!deleteTarget?.stageId) return;

        try {
            await pipelineStageControllerApi.deleteStage({ stageId: deleteTarget.stageId });
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete stage:", error);
            alert("Failed to delete stage");
        }
    };

    if (loading && data.length === 0) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Order</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Probability</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Attributes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((stage) => (
                            <TableRow key={stage.stageId} className="hover:bg-muted/50">
                                <TableCell>{stage.stageOrder}</TableCell>
                                <TableCell className="font-medium">{stage.stageCode}</TableCell>
                                <TableCell>{stage.stageName}</TableCell>
                                <TableCell>{stage.probability}%</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {stage.stageColor && (
                                            <div
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: stage.stageColor }}
                                            />
                                        )}
                                        <span className="text-xs text-muted-foreground">{stage.stageColor}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {stage.isWon === 'Y' && <Badge variant="outline" className="text-green-600 border-green-600">Won</Badge>}
                                        {stage.isLost === 'Y' && <Badge variant="outline" className="text-red-600 border-red-600">Lost</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={stage.useAt === 'Y' ? 'default' : 'secondary'}>
                                        {stage.useAt === 'Y' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {stage.createdDate ? format(new Date(stage.createdDate), "yyyy-MM-dd") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <PipelineActions
                                        stage={stage}
                                        onEdit={onEdit}
                                        onDelete={setDeleteTarget}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No pipeline stages found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the stage
                            <span className="font-semibold"> {deleteTarget?.stageName} </span>
                            and remove it from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
