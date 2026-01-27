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
import { BranchResponse } from "@/api/generated";
import { branchControllerApi } from "@/lib/api-client";
import {
    branchCreateSchema,
    branchUpdateSchema,
    BranchCreateFormValues,
} from "@/lib/validations/branch";

interface BranchSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch: BranchResponse | null;
    onSuccess: () => void;
}

export function BranchSheet({ open, onOpenChange, branch, onSuccess }: BranchSheetProps) {
    const isEditing = !!branch;

    const form = useForm<BranchCreateFormValues | any>({
        resolver: zodResolver(isEditing ? branchUpdateSchema : branchCreateSchema),
        defaultValues: {
            branchName: "",
            branchCode: "",
            branchAddress: "",
            branchPhone: "",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (branch) {
            form.reset({
                branchName: branch.branchName || "",
                branchCode: branch.branchCode || "",
                branchAddress: branch.branchAddress || "",
                branchPhone: branch.branchPhone || "",
                useAt: (branch.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                branchName: "",
                branchCode: "",
                branchAddress: "",
                branchPhone: "",
                useAt: "Y",
            });
        }
    }, [branch, form]);

    const onSubmit = async (values: BranchCreateFormValues) => {
        try {
            if (isEditing && branch?.branchId) {
                // Update
                await branchControllerApi.updateBranch({
                    branchId: branch.branchId,
                    branchUpdateRequest: {
                        branchName: values.branchName,
                        branchAddress: values.branchAddress,
                        branchPhone: values.branchPhone,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await branchControllerApi.createBranch({
                    branchCreateRequest: {
                        branchName: values.branchName,
                        branchCode: values.branchCode,
                        branchAddress: values.branchAddress,
                        branchPhone: values.branchPhone,
                        parentBranchId: values.parentBranchId,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save branch:", error);
            alert("Failed to save branch. Please check console.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Branch" : "Add Branch"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update branch details."
                            : "Create a new branch."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
                        <FormField
                            control={form.control}
                            name="branchName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Main Branch" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Branch Code is strictly immutable in many systems, disabling if editing or omitting logic could be better, but kept simple here */}
                        <FormField
                            control={form.control}
                            name="branchCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="B001" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="branchPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="02-123-4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="branchAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seoul, Korea" {...field} />
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Branch"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
