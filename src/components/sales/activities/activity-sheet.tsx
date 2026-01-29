import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ActivityResponse } from "@/api/generated";
import { activityControllerApi } from "@/lib/api-client";
import {
    activityCreateSchema,
    activityUpdateSchema,
    ActivityCreateFormValues,
} from "@/lib/validations/activity";

interface ActivitySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activity: ActivityResponse | null;
    onSuccess: () => void;
}

export function ActivitySheet({ open, onOpenChange, activity, onSuccess }: ActivitySheetProps) {
    const isEditing = !!activity;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<ActivityCreateFormValues | any>({
        resolver: zodResolver(isEditing ? activityUpdateSchema : activityCreateSchema),
        defaultValues: {
            activitySubject: "",
            activityType: "",
            activityStatus: "PENDING",
            priority: "MEDIUM",
            activityDescription: "",
            useAt: "Y",
            durationMinutes: 0,
        },
    });

    useEffect(() => {
        if (activity) {
            form.reset({
                activitySubject: activity.activitySubject || "",
                activityType: activity.activityType || "",
                activityStatus: activity.activityStatus || "PENDING",
                priority: activity.priority || "MEDIUM",
                activityDescription: activity.activityDescription || "",
                dueDate: activity.dueDate ? new Date(activity.dueDate) : undefined,
                durationMinutes: activity.durationMinutes || 0,
                // relatedType/Id could be complex, omitting for simple generic form for now or adding as text if needed
                // relatedType: activity.relatedType || "",
                // relatedId: activity.relatedId || "",
                useAt: (activity.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                activitySubject: "",
                activityType: "",
                activityStatus: "PENDING",
                priority: "MEDIUM",
                activityDescription: "",
                useAt: "Y",
                durationMinutes: 0,
            });
        }
    }, [activity, form]);

    const onSubmit = async (values: ActivityCreateFormValues) => {
        try {
            if (isEditing && activity?.activityId) {
                // Update
                await activityControllerApi.updateActivity({
                    activityId: activity.activityId,
                    activityUpdateRequest: {
                        activitySubject: values.activitySubject,
                        activityType: values.activityType,
                        activityStatus: values.activityStatus,
                        priority: values.priority,
                        activityDescription: values.activityDescription,
                        dueDate: values.dueDate,
                        durationMinutes: values.durationMinutes,
                        relatedType: values.relatedType,
                        relatedId: values.relatedId,
                        assignedUserId: values.assignedUserId,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await activityControllerApi.createActivity({
                    activityCreateRequest: {
                        activitySubject: values.activitySubject,
                        activityType: values.activityType,
                        activityStatus: values.activityStatus,
                        priority: values.priority,
                        activityDescription: values.activityDescription,
                        dueDate: values.dueDate,
                        durationMinutes: values.durationMinutes,
                        relatedType: values.relatedType,
                        relatedId: values.relatedId,
                        assignedUserId: values.assignedUserId,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save activity:", error);
            // alert("Failed to save activity. Please check input values.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Activity" : "New Activity"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update activity details."
                            : "Create a new activity."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 pb-10">
                        <FormField
                            control={form.control}
                            name="activitySubject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Client Meeting" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="activityType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CALL">Call</SelectItem>
                                                <SelectItem value="EMAIL">Email</SelectItem>
                                                <SelectItem value="MEETING">Meeting</SelectItem>
                                                <SelectItem value="TASK">Task</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="LOW">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="activityStatus"
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
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="activityDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Details..."
                                            className="resize-none"
                                            {...field}
                                        />
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
                                    <FormLabel>Active</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select usage" />
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

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Activity"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
