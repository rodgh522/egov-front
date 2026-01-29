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
import { Textarea } from "@/components/ui/textarea";
import { LeadResponse } from "@/api/generated";
import { leadControllerApi } from "@/lib/api-client";
import {
    leadCreateSchema,
    leadUpdateSchema,
    LeadCreateFormValues,
} from "@/lib/validations/lead";

interface LeadSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadResponse | null;
    onSuccess: () => void;
}

export function LeadSheet({ open, onOpenChange, lead, onSuccess }: LeadSheetProps) {
    const isEditing = !!lead;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<LeadCreateFormValues | any>({
        resolver: zodResolver(isEditing ? leadUpdateSchema : leadCreateSchema),
        defaultValues: {
            leadName: "",
            companyName: "",
            contactName: "",
            email: "",
            phone: "",
            leadSource: "",
            leadStatus: "",
            leadScore: 0,
            industry: "",
            estimatedRevenue: 0,
            description: "",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (lead) {
            form.reset({
                leadName: lead.leadName || "",
                companyName: lead.companyName || "",
                contactName: lead.contactName || "",
                email: lead.email || "",
                phone: lead.phone || "",
                leadSource: lead.leadSource || "",
                leadStatus: lead.leadStatus || "",
                leadScore: lead.leadScore || 0,
                industry: lead.industry || "",
                estimatedRevenue: lead.estimatedRevenue || 0,
                description: lead.description || "",
                useAt: (lead.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                leadName: "",
                companyName: "",
                contactName: "",
                email: "",
                phone: "",
                leadSource: "",
                leadStatus: "",
                leadScore: 0,
                industry: "",
                estimatedRevenue: 0,
                description: "",
                useAt: "Y",
            });
        }
    }, [lead, form]);

    const onSubmit = async (values: LeadCreateFormValues) => {
        try {
            if (isEditing && lead?.leadId) {
                // Update
                await leadControllerApi.updateLead({
                    leadId: lead.leadId,
                    leadUpdateRequest: {
                        leadName: values.leadName,
                        companyName: values.companyName,
                        contactName: values.contactName,
                        email: values.email,
                        phone: values.phone,
                        leadSource: values.leadSource,
                        leadStatus: values.leadStatus,
                        leadScore: values.leadScore,
                        industry: values.industry,
                        estimatedRevenue: values.estimatedRevenue,
                        description: values.description,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await leadControllerApi.createLead({
                    leadCreateRequest: {
                        leadName: values.leadName,
                        companyName: values.companyName,
                        contactName: values.contactName,
                        email: values.email,
                        phone: values.phone,
                        leadSource: values.leadSource,
                        leadStatus: values.leadStatus,
                        leadScore: values.leadScore,
                        industry: values.industry,
                        estimatedRevenue: values.estimatedRevenue,
                        description: values.description,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save lead:", error);
            alert("Failed to save lead. Please check input values.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Lead" : "New Lead"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update lead details."
                            : "Create a new sales lead."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 pb-10">
                        <FormField
                            control={form.control}
                            name="leadName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lead Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. John Doe / Company X" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Acme Corp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Jane Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="jane@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. +1 555-0123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="leadSource"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lead Source</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Website, Referral" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="leadStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. New, Qualified" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Industry</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Technology" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="estimatedRevenue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Est. Revenue</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Lead details..."
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
                                    <FormLabel>Active Status</FormLabel>
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Lead"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
