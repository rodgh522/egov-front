import { useEffect, useState } from "react";
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
import { OpportunityResponse, CustomerResponse } from "@/api/generated";
import { opportunityControllerApi, customerControllerApi } from "@/lib/api-client";
import {
    opportunityCreateSchema,
    opportunityUpdateSchema,
    OpportunityCreateFormValues,
} from "@/lib/validations/opportunity";

interface OpportunitySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opportunity: OpportunityResponse | null;
    onSuccess: () => void;
}

const STAGES = [
    { value: "PROSPECTING", label: "Prospecting" },
    { value: "QUALIFICATION", label: "Qualification" },
    { value: "PROPOSAL", label: "Proposal" },
    { value: "NEGOTIATION", label: "Negotiation" },
    { value: "CLOSED_WON", label: "Closed Won" },
    { value: "CLOSED_LOST", label: "Closed Lost" },
];

export function OpportunitySheet({ open, onOpenChange, opportunity, onSuccess }: OpportunitySheetProps) {
    const isEditing = !!opportunity;
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await customerControllerApi.getAllCustomers();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            }
        };

        if (open) {
            fetchCustomers();
        }
    }, [open]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<OpportunityCreateFormValues | any>({
        resolver: zodResolver(isEditing ? opportunityUpdateSchema : opportunityCreateSchema),
        defaultValues: {
            opportunityName: "",
            customerId: "",
            stageId: "",
            amount: 0,
            useAt: "Y",
            description: "",
            nextStep: "",
            leadSource: "",
            competitorInfo: "",
        },
    });

    useEffect(() => {
        if (opportunity) {
            form.reset({
                opportunityName: opportunity.opportunityName || "",
                customerId: opportunity.customerId || "",
                stageId: opportunity.stageId || "",
                amount: opportunity.amount || 0,
                expectedCloseDate: opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate) : undefined,
                leadSource: opportunity.leadSource || "",
                description: opportunity.description || "",
                nextStep: opportunity.nextStep || "",
                competitorInfo: opportunity.competitorInfo || "",
                wonReason: opportunity.wonReason || "",
                lostReason: opportunity.lostReason || "",
                useAt: (opportunity.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                opportunityName: "",
                customerId: "",
                stageId: "PROSPECTING",
                amount: 0,
                useAt: "Y",
            });
        }
    }, [opportunity, form]);

    const onSubmit = async (values: OpportunityCreateFormValues) => {
        try {
            if (isEditing && opportunity?.opportunityId) {
                // Update
                await opportunityControllerApi.updateOpportunity({
                    opportunityId: opportunity.opportunityId,
                    opportunityUpdateRequest: {
                        opportunityName: values.opportunityName,
                        customerId: values.customerId,
                        contactId: values.contactId,
                        stageId: values.stageId,
                        amount: values.amount,
                        expectedCloseDate: values.expectedCloseDate,
                        leadSource: values.leadSource,
                        description: values.description,
                        nextStep: values.nextStep,
                        competitorInfo: values.competitorInfo,
                        // @ts-ignore
                        wonReason: values.wonReason,
                        // @ts-ignore
                        lostReason: values.lostReason,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await opportunityControllerApi.createOpportunity({
                    opportunityCreateRequest: {
                        opportunityName: values.opportunityName,
                        customerId: values.customerId,
                        contactId: values.contactId,
                        stageId: values.stageId,
                        amount: values.amount,
                        expectedCloseDate: values.expectedCloseDate,
                        leadSource: values.leadSource,
                        description: values.description,
                        nextStep: values.nextStep,
                        competitorInfo: values.competitorInfo,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save opportunity:", error);
            alert("Failed to save opportunity. Please check input values.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Opportunity" : "New Opportunity"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update opportunity details."
                            : "Create a new sales opportunity."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 pb-10">
                        <FormField
                            control={form.control}
                            name="opportunityName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Opportunity Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Q1 Software License Deal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.customerId} value={customer.customerId!}>
                                                        {customer.customerName}
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
                                name="stageId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stage <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select stage" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {STAGES.map((stage) => (
                                                    <SelectItem key={stage.value} value={stage.value}>
                                                        {stage.label}
                                                    </SelectItem>
                                                ))}
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="expectedCloseDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Expected Close Date</FormLabel>
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
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Opportunity details..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                name="competitorInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Competitor Info</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Competitor A, B" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="nextStep"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Next Step</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Send Proposal" {...field} />
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Opportunity"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
