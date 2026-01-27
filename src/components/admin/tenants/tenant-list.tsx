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
import { TenantResponse } from "@/api/generated";
import { tenantControllerApi } from "@/lib/api-client";
import { TenantActions } from "./tenant-actions";
import { format } from "date-fns";

interface TenantListProps {
    onEdit: (tenant: TenantResponse) => void;
    refreshTrigger: number;
}

export function TenantList({ onEdit, refreshTrigger }: TenantListProps) {
    const [data, setData] = useState<TenantResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<TenantResponse | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await tenantControllerApi.getAllTenants();
            setData(response);
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const confirmDelete = async () => {
        if (!deleteTarget?.tenantId) return;

        try {
            await tenantControllerApi.deleteTenant({ tenantId: deleteTarget.tenantId });
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete tenant:", error);
            alert("Failed to delete tenant");
        }
    };

    if (loading && data.length === 0) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((tenant) => (
                            <TableRow key={tenant.tenantId} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{tenant.tenantId}</TableCell>
                                <TableCell>{tenant.tenantName}</TableCell>
                                <TableCell>{tenant.tenantDescription}</TableCell>
                                <TableCell>
                                    <Badge variant={tenant.useAt === 'Y' ? 'default' : 'secondary'}>
                                        {tenant.useAt === 'Y' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {tenant.createdDate ? format(new Date(tenant.createdDate), "yyyy-MM-dd") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <TenantActions
                                        tenant={tenant}
                                        onEdit={onEdit}
                                        onDelete={setDeleteTarget}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No tenants found.
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
                            This action cannot be undone. This will permanently delete the tenant
                            <span className="font-semibold"> {deleteTarget?.tenantName} </span>
                            and remove all associated data.
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
