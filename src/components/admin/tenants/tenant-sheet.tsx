import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TenantResponse } from "@/api/generated";
import { tenantControllerApi } from "@/lib/api-client";
import {
    tenantCreateSchema,
    tenantUpdateSchema,
    TenantCreateFormValues,
} from "@/lib/validations/tenant";

interface TenantSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: TenantResponse | null;
    onSuccess: () => void;
}

export function TenantSheet({ open, onOpenChange, tenant, onSuccess }: TenantSheetProps) {
    const isEditing = !!tenant;

    const form = useForm<TenantCreateFormValues | any>({
        resolver: zodResolver(isEditing ? tenantUpdateSchema : tenantCreateSchema),
        defaultValues: {
            tenantId: "",
            tenantName: "",
            tenantDescription: "",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (tenant) {
            form.reset({
                tenantName: tenant.tenantName || "",
                tenantDescription: tenant.tenantDescription || "",
                useAt: tenant.useAt || "Y",
                // tenantId is not editable in update
            });
        } else {
            form.reset({
                tenantId: "",
                tenantName: "",
                tenantDescription: "",
                useAt: "Y",
            });
        }
    }, [tenant, form]);

    const onSubmit = async (values: TenantCreateFormValues) => {
        try {
            if (isEditing && tenant?.tenantId) {
                // Update
                await tenantControllerApi.updateTenant({
                    tenantId: tenant.tenantId,
                    tenantUpdateRequest: {
                        tenantName: values.tenantName,
                        tenantDescription: values.tenantDescription,
                        useAt: values.useAt,
                    },
                });
            } else {
                // Create
                await tenantControllerApi.createTenant({
                    tenantCreateRequest: {
                        tenantId: values.tenantId,
                        tenantName: values.tenantName,
                        tenantDescription: values.tenantDescription,
                        useAt: values.useAt,
                    },
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save tenant:", error);
            alert("Failed to save tenant. Please check console.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Tenant" : "Add Tenant"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update tenant details."
                            : "Create a new tenant."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="tenantId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tenant ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter tenant ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="tenantName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tenant Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter tenant name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tenantDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="useAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Y">Active</SelectItem>
                                            <SelectItem value="N">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Tenant"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
