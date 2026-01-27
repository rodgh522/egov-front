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
import { PositionResponse } from "@/api/generated";
import { positionControllerApi } from "@/lib/api-client";
import {
    positionCreateSchema,
    positionUpdateSchema,
    PositionCreateFormValues,
} from "@/lib/validations/position";

interface PositionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    position: PositionResponse | null;
    onSuccess: () => void;
}

export function PositionSheet({ open, onOpenChange, position, onSuccess }: PositionSheetProps) {
    const isEditing = !!position;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<PositionCreateFormValues | any>({
        resolver: zodResolver(isEditing ? positionUpdateSchema : positionCreateSchema),
        defaultValues: {
            positionName: "",
            positionCode: "",
            positionLevel: 0,
            positionDescription: "",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (position) {
            form.reset({
                positionName: position.positionName || "",
                positionCode: position.positionCode || "",
                positionLevel: position.positionLevel || 0,
                positionDescription: position.positionDescription || "",
                useAt: (position.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                positionName: "",
                positionCode: "",
                positionLevel: 0,
                positionDescription: "",
                useAt: "Y",
            });
        }
    }, [position, form]);

    const onSubmit = async (values: PositionCreateFormValues) => {
        try {
            if (isEditing && position?.positionId) {
                // Update
                await positionControllerApi.updatePosition({
                    positionId: position.positionId,
                    positionUpdateRequest: {
                        positionName: values.positionName,
                        positionCode: values.positionCode,
                        positionLevel: values.positionLevel,
                        positionDescription: values.positionDescription,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await positionControllerApi.createPosition({
                    positionCreateRequest: {
                        positionName: values.positionName,
                        positionCode: values.positionCode,
                        positionLevel: values.positionLevel,
                        positionDescription: values.positionDescription,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save position:", error);
            // Here we would show a toast
            alert("Failed to save position. Please check console.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Position" : "Add Position"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update position details."
                            : "Create a new position."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
                        <FormField
                            control={form.control}
                            name="positionCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="POS_001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="positionName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Manager" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="positionLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Level</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="positionDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Description..." {...field} />
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Position"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
