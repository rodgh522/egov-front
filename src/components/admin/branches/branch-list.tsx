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
import { BranchResponse } from "@/api/generated";
import { branchControllerApi } from "@/lib/api-client";
import { format } from "date-fns";

interface BranchListProps {
    onEdit: (branch: BranchResponse) => void;
    refreshTrigger: number;
}

export function BranchList({ onEdit, refreshTrigger }: BranchListProps) {
    const [data, setData] = useState<BranchResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Deletion state
    const [deleteTarget, setDeleteTarget] = useState<BranchResponse | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Using getAllBranches for now. If pagination is needed, we'd switch to a paginated API if available.
            // The swagger shows getAllBranches returns Array<BranchResponse>.
            const response = await branchControllerApi.getAllBranches();
            setData(response);
        } catch (error) {
            console.error("Failed to fetch branches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const confirmDelete = async () => {
        if (!deleteTarget?.branchId) return;

        try {
            await branchControllerApi.deleteBranch({ branchId: deleteTarget.branchId });
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete branch:", error);
            alert("Failed to delete branch");
        }
    };

    if (loading && data.length === 0) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Branch Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((branch) => (
                            <TableRow key={branch.branchId} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{branch.branchName}</TableCell>
                                <TableCell>{branch.branchCode}</TableCell>
                                <TableCell>{branch.branchPhone || "-"}</TableCell>
                                <TableCell>{branch.branchAddress || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={branch.useAt === 'Y' ? 'default' : 'secondary'}>
                                        {branch.useAt === 'Y' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {branch.createdDate ? format(new Date(branch.createdDate), "yyyy-MM-dd") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(branch)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteTarget(branch)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No branches found.
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
                            This action cannot be undone. This will permanently delete the branch
                            <span className="font-semibold"> {deleteTarget?.branchName} </span>
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
