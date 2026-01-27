"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TenantList } from "@/components/admin/tenants/tenant-list";
import { TenantSheet } from "@/components/admin/tenants/tenant-sheet";
import { TenantResponse } from "@/api/generated";
import { tenantControllerApi } from "@/lib/api-client";

export default function TenantManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedTenant, setSelectedTenant] = useState<TenantResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // URL Params
    const detailId = searchParams.get("detail");
    const isCreate = searchParams.get("view") === "create";

    const isSheetOpen = !!detailId || isCreate;

    useEffect(() => {
        const fetchTenant = async (id: string) => {
            try {
                // Assuming we have getTenant defined in api-client or generated
                const response = await tenantControllerApi.getTenant({ tenantId: id });
                if (response) {
                    setSelectedTenant(response);
                }
            } catch (error) {
                console.error("Failed to fetch tenant for detail:", error);
                // Optionally redirect back to list if not found
            }
        };

        if (detailId) {
            fetchTenant(detailId);
        } else if (isCreate) {
            setSelectedTenant(null);
        } else {
            setSelectedTenant(null);
        }
    }, [detailId, isCreate, pathname, router]);

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

    const handleEdit = (tenant: TenantResponse) => {
        if (tenant.tenantId) {
            updateRoute({ detail: tenant.tenantId, view: null });
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
                    <h1 className="text-2xl font-bold tracking-tight">Tenant Management</h1>
                    <p className="text-muted-foreground">
                        Manage system tenants.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tenant
                </Button>
            </div>

            <TenantList onEdit={handleEdit} refreshTrigger={refreshTrigger} />

            <TenantSheet
                open={isSheetOpen}
                onOpenChange={(open) => {
                    if (!open) handleClose();
                }}
                tenant={selectedTenant}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
