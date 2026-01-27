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
import { ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronNext } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { UserResponse, PageUserResponse } from "@/api/generated";
import { userManagementApi } from "@/lib/api-client";
import { UserActions } from "./user-actions";
import { format } from "date-fns";

interface UserListProps {
    onEdit: (user: UserResponse) => void;
    refreshTrigger: number; // Increment to trigger refresh
}

export function UserList({ onEdit, refreshTrigger }: UserListProps) {
    const [data, setData] = useState<PageUserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sort, setSort] = useState("createdDate,desc");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await userManagementApi.getUsers({
                page,
                size,
                sortBy: sort.split(",")[0],
                sortDir: sort.split(",")[1],
            });
            if (response.data) {
                setData(response.data);
            } else {
                setData(null);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, size, sort, refreshTrigger]);

    const toggleRow = (userId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedRows(newExpanded);
    };

    const confirmDelete = async () => {
        if (!deleteTarget?.esntlId) return;

        try {
            await userManagementApi.deleteUser({ esntlId: deleteTarget.esntlId });
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Failed to delete user");
        }
    };

    if (loading && !data) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.content?.map((user) => (
                            <>
                                <TableRow
                                    key={user.esntlId}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleRow(user.esntlId!)}
                                >
                                    <TableCell>
                                        {expandedRows.has(user.esntlId!) ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{user.userId}</TableCell>
                                    <TableCell>{user.userName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.useAt === 'Y' ? 'default' : 'secondary'}>
                                            {user.useAt === 'Y' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.createdDate ? format(new Date(user.createdDate), "yyyy-MM-dd") : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <UserActions
                                                user={user}
                                                onEdit={onEdit}
                                                onDelete={setDeleteTarget}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                                {expandedRows.has(user.esntlId!) && (
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableCell colSpan={7}>
                                            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Phone</p>
                                                    <p>{user.phone || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Group / Branch</p>
                                                    <p>{user.groupName || "-"} / {user.branchName || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Position</p>
                                                    <p>{user.positionName || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Manager</p>
                                                    <p>{user.managerName || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-muted-foreground">Internal ID (ESNTL_ID)</p>
                                                    <p className="font-mono text-xs">{user.esntlId}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        ))}
                        {(!data?.content || data.content.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {page + 1} of {data?.totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (data?.totalPages || 1) - 1}
                >
                    Next
                    <ChevronNext className="h-4 w-4 ml-2" />
                </Button>
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            <span className="font-semibold"> {deleteTarget?.userName} </span>
                            and remove their data from the server.
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
