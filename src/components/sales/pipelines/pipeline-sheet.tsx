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
    FormDescription,
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
import { PipelineStageResponse } from "@/api/generated";
import { pipelineStageControllerApi } from "@/lib/api-client";
import {
    pipelineStageCreateSchema,
    pipelineStageUpdateSchema,
    PipelineStageCreateFormValues,
} from "@/lib/validations/pipeline";

interface PipelineSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stage: PipelineStageResponse | null;
    onSuccess: () => void;
}

export function PipelineSheet({ open, onOpenChange, stage, onSuccess }: PipelineSheetProps) {
    const isEditing = !!stage;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<PipelineStageCreateFormValues | any>({
        resolver: zodResolver(isEditing ? pipelineStageUpdateSchema : pipelineStageCreateSchema),
        defaultValues: {
            stageName: "",
            stageCode: "",
            stageOrder: 0,
            probability: 0,
            stageColor: "#000000",
            isWon: "N",
            isLost: "N",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (stage) {
            form.reset({
                stageName: stage.stageName || "",
                stageCode: stage.stageCode || "",
                stageOrder: stage.stageOrder || 0,
                probability: stage.probability || 0,
                stageColor: stage.stageColor || "#000000",
                isWon: (stage.isWon as "Y" | "N") || "N",
                isLost: (stage.isLost as "Y" | "N") || "N",
                useAt: (stage.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                stageName: "",
                stageCode: "",
                stageOrder: 0,
                probability: 0,
                stageColor: "#000000",
                isWon: "N",
                isLost: "N",
                useAt: "Y",
            });
        }
    }, [stage, form]);

    const onSubmit = async (values: PipelineStageCreateFormValues) => {
        try {
            if (isEditing && stage?.stageId) {
                // Update
                await pipelineStageControllerApi.updateStage({
                    stageId: stage.stageId,
                    pipelineStageUpdateRequest: {
                        stageName: values.stageName,
                        stageCode: values.stageCode,
                        stageOrder: Number(values.stageOrder),
                        probability: Number(values.probability),
                        stageColor: values.stageColor,
                        isWon: values.isWon,
                        isLost: values.isLost,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await pipelineStageControllerApi.createStage({
                    pipelineStageCreateRequest: {
                        stageName: values.stageName,
                        stageCode: values.stageCode,
                        stageOrder: Number(values.stageOrder),
                        probability: Number(values.probability),
                        stageColor: values.stageColor,
                        isWon: values.isWon,
                        isLost: values.isLost,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save pipeline stage:", error);
            alert("Failed to save pipeline stage. Please check console.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Stage" : "Add Stage"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update pipeline stage details."
                            : "Create a new pipeline stage."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 pb-10">
                        <FormField
                            control={form.control}
                            name="stageCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stage Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="PROSPECTING" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stageName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stage Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Prospecting" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stageOrder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="probability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Probability (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" max="100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="stageColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                                        </FormControl>
                                        <FormControl>
                                            <Input placeholder="#000000" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="isWon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Is Won Stage?</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Y">Yes</SelectItem>
                                                <SelectItem value="N">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isLost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Is Lost Stage?</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Y">Yes</SelectItem>
                                                <SelectItem value="N">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="useAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Stage"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
