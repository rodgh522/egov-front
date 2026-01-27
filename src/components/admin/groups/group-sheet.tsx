import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GroupResponse, BranchResponse } from "@/api/generated";
import { groupControllerApi, branchControllerApi } from "@/lib/api-client";
import {
    groupCreateSchema,
    groupUpdateSchema,
    GroupCreateFormValues,
} from "@/lib/validations/group";

interface GroupSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: GroupResponse | null;
    onSuccess: () => void;
}

export function GroupSheet({ open, onOpenChange, group, onSuccess }: GroupSheetProps) {
    const isEditing = !!group;
    const [branches, setBranches] = useState<BranchResponse[]>([]);

    const form = useForm<GroupCreateFormValues | any>({
        resolver: zodResolver(isEditing ? groupUpdateSchema : groupCreateSchema),
        defaultValues: {
            groupName: "",
            groupCode: "",
            groupDescription: "",
            branchId: "",
            useAt: "Y",
        },
    });

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await branchControllerApi.getActiveBranches(); // Expecting active branches only for simple dropdown
                // Or getAllBranches if active is not preferred. 'active' makes sense for creation.
                setBranches(response);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
            }
        };

        if (open) {
            fetchBranches();
        }
    }, [open]);

    useEffect(() => {
        if (group) {
            form.reset({
                groupName: group.groupName || "",
                groupCode: group.groupCode || "",
                groupDescription: group.groupDescription || "",
                branchId: group.branchId || "",
                useAt: (group.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                groupName: "",
                groupCode: "",
                groupDescription: "",
                branchId: "",
                useAt: "Y",
            });
        }
    }, [group, form, open]); // Added open to reset when reopening in Create mode if needed, though group=null usually handles it.

    const onSubmit = async (values: GroupCreateFormValues) => {
        try {
            if (isEditing && group?.groupId) {
                // Update
                await groupControllerApi.updateGroup({
                    groupId: group.groupId,
                    groupUpdateRequest: {
                        groupName: values.groupName,
                        groupCode: values.groupCode,
                        groupDescription: values.groupDescription,
                        branchId: values.branchId,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await groupControllerApi.createGroup({
                    groupCreateRequest: {
                        groupName: values.groupName,
                        groupCode: values.groupCode,
                        groupDescription: values.groupDescription,
                        branchId: values.branchId,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save group:", error);
            alert("Failed to save group.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Group" : "Add Group"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update group details."
                            : "Create a new user group."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
                        <FormField
                            control={form.control}
                            name="groupName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Engineering" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="groupCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ENG_01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="branchId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={branches.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a branch" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {branches.map(branch => (
                                                <SelectItem key={branch.branchId} value={branch.branchId!}>
                                                    {branch.branchName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="groupDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Group description..." {...field} />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Group"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
