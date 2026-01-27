import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash2 } from "lucide-react";
import { GroupResponse } from "@/api/generated";
import { groupControllerApi } from "@/lib/api-client";
import { format } from "date-fns";

interface GroupListProps {
    onEdit: (group: GroupResponse) => void;
    refreshTrigger: number;
}

export function GroupList({ onEdit, refreshTrigger }: GroupListProps) {
    const [data, setData] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Deletion state
    const [deleteTarget, setDeleteTarget] = useState<GroupResponse | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await groupControllerApi.getAllGroups();
            setData(response);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const confirmDelete = async () => {
        if (!deleteTarget?.groupId) return;

        try {
            await groupControllerApi.deleteGroup({ groupId: deleteTarget.groupId });
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete group:", error);
            alert("Failed to delete group");
        }
    };

    if (loading && data.length === 0) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((group) => (
                            <TableRow key={group.groupId} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{group.groupName}</TableCell>
                                <TableCell>{group.groupCode}</TableCell>
                                <TableCell>{group.branchName || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={group.useAt === 'Y' ? 'default' : 'secondary'}>
                                        {group.useAt === 'Y' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {group.createdDate ? format(new Date(group.createdDate), "yyyy-MM-dd") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(group)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteTarget(group)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No groups found.
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
                            This action cannot be undone. This will permanently delete the group
                            <span className="font-semibold"> {deleteTarget?.groupName} </span>
                            and remove its data from the server.
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
