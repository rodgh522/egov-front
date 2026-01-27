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
import { PositionResponse } from "@/api/generated";
import { positionControllerApi } from "@/lib/api-client";
import { PositionActions } from "./position-actions";
import { format } from "date-fns";

interface PositionListProps {
    onEdit: (position: PositionResponse) => void;
    refreshTrigger: number;
}

export function PositionList({ onEdit, refreshTrigger }: PositionListProps) {
    const [data, setData] = useState<PositionResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Note: The position API returns a list, not a page object in getAllPositions/getActivePositions usually.
    // Based on PositionControllerApi.ts, getAllPositions returns Array<PositionResponse>.
    // So simple list for now.

    const [deleteTarget, setDeleteTarget] = useState<PositionResponse | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await positionControllerApi.getAllPositions();
            setData(response);
        } catch (error) {
            console.error("Failed to fetch positions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const confirmDelete = async () => {
        if (!deleteTarget?.positionId) return;

        try {
            await positionControllerApi.deletePosition({ positionId: deleteTarget.positionId });
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete position:", error);
            alert("Failed to delete position");
        }
    };

    if (loading && data.length === 0) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((position) => (
                            <TableRow key={position.positionId} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{position.positionCode}</TableCell>
                                <TableCell>{position.positionName}</TableCell>
                                <TableCell>{position.positionLevel}</TableCell>
                                <TableCell>{position.positionDescription}</TableCell>
                                <TableCell>
                                    <Badge variant={position.useAt === 'Y' ? 'default' : 'secondary'}>
                                        {position.useAt === 'Y' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {position.createdDate ? format(new Date(position.createdDate), "yyyy-MM-dd") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <PositionActions
                                        position={position}
                                        onEdit={onEdit}
                                        onDelete={setDeleteTarget}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No positions found.
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
                            This action cannot be undone. This will permanently delete the position
                            <span className="font-semibold"> {deleteTarget?.positionName} </span>
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
