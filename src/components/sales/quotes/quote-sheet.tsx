import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { QuoteFormValues, quoteSchema } from "@/lib/validations/quote";
import {
    quoteControllerApi,
    customerControllerApi,
    opportunityControllerApi,
    productControllerApi,
    userManagementApi
} from "@/lib/api-client";
import { QuoteResponse, CustomerResponse, OpportunityResponse, ProductResponse, UserResponse } from "@/api/generated";

interface QuoteSheetProps {
    quoteId?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function QuoteSheet({
    quoteId,
    open,
    onOpenChange,
    onSuccess,
}: QuoteSheetProps) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [users, setUsers] = useState<UserResponse[]>([]);

    const form = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            quoteNumber: "",
            quoteStatus: "DRAFT",
            quoteDate: new Date(),
            items: [],
            currency: "KRW",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        if (open) {
            fetchDependencies();
            if (quoteId) {
                fetchQuote(quoteId);
            } else {
                form.reset({
                    quoteNumber: `QT-${Date.now()}`, // Temporary ID generation
                    quoteStatus: "DRAFT",
                    quoteDate: new Date(),
                    items: [],
                    currency: "KRW",
                });
            }
        }
    }, [open, quoteId, form]);

    const fetchDependencies = async () => {
        try {
            const [customersData, opportunitiesData, productsData, usersData] = await Promise.all([
                customerControllerApi.getAllCustomers(),
                opportunityControllerApi.getAllOpportunities(),
                productControllerApi.getAllProducts(),
                userManagementApi.getUsers({}),
            ]);
            setCustomers(customersData);
            setOpportunities(opportunitiesData);
            setProducts(productsData);
            setUsers(usersData.data?.content || []);
        } catch (error) {
            console.error("Failed to fetch dependencies", error);
            toast.error("Failed to load form data");
        }
    };

    const fetchQuote = async (id: string) => {
        try {
            setLoading(true);
            const quote = await quoteControllerApi.getQuote({ quoteId: id });

            form.reset({
                quoteNumber: quote.quoteNumber,
                opportunityId: quote.opportunityId,
                customerId: quote.customerId,
                contactId: quote.contactId,
                quoteStatus: quote.quoteStatus,
                quoteDate: quote.quoteDate ? new Date(quote.quoteDate) : new Date(),
                validUntil: quote.validUntil ? new Date(quote.validUntil) : undefined,
                currency: quote.currency,
                paymentTerms: quote.paymentTerms,
                deliveryTerms: quote.deliveryTerms,
                notes: quote.notes,
                assignedUserId: quote.assignedUserId,
                items: quote.items?.map(item => ({
                    productId: item.productId!,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountRate: item.discountRate,
                    taxRate: item.taxRate,
                    description: item.description,
                })) || [],
            });
        } catch (error) {
            console.error("Failed to fetch quote", error);
            toast.error("Failed to load quote details");
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: QuoteFormValues) => {
        try {
            setLoading(true);
            if (quoteId) {
                await quoteControllerApi.updateQuote({
                    quoteId,
                    quoteUpdateRequest: {
                        ...data,
                        quoteDate: data.quoteDate,
                        validUntil: data.validUntil,
                    },
                });
                toast.error("Quote updated successfully");
            } else {
                await quoteControllerApi.createQuote({
                    quoteCreateRequest: {
                        ...data,
                        quoteDate: data.quoteDate,
                        validUntil: data.validUntil,
                    },
                });
                toast.success("Quote created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to submit quote", error);
            toast.error(quoteId ? "Failed to update quote" : "Failed to create quote");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[800px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{quoteId ? "Edit Quote" : "Create Quote"}</SheetTitle>
                    <SheetDescription>
                        {quoteId
                            ? "Make changes to the quote details here."
                            : "Fill in the details to create a new quote."}
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quoteNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quote Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="QT-..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quoteStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="SENT">Sent</SelectItem>
                                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                                <SelectItem value="EXPIRED">Expired</SelectItem>
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
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem
                                                        key={customer.customerId}
                                                        value={customer.customerId!}
                                                    >
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
                                name="opportunityId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opportunity</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select opportunity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {opportunities.map((opp) => (
                                                    <SelectItem
                                                        key={opp.opportunityId}
                                                        value={opp.opportunityId!}
                                                    >
                                                        {opp.opportunityName}
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
                                name="quoteDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Quote Date</FormLabel>
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
                                name="validUntil"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Valid Until</FormLabel>
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

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            productId: "",
                                            quantity: 1,
                                            unitPrice: 0,
                                            discountRate: 0,
                                            taxRate: 0,
                                            description: "",
                                        })
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-4 rounded-md">
                                    <div className="col-span-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            const product = products.find(p => p.productId === value);
                                                            if (product) {
                                                                form.setValue(`items.${index}.unitPrice`, product.unitPrice || 0);
                                                                form.setValue(`items.${index}.description`, product.description || "");
                                                            }
                                                        }}
                                                        defaultValue={field.value}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Product" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map((product) => (
                                                                <SelectItem
                                                                    key={product.productId}
                                                                    value={product.productId!}
                                                                >
                                                                    {product.productName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Qty</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.discountRate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Disc %</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="assignedUserId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned User</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select user" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem
                                                        key={user.userId}
                                                        value={user.userId!}
                                                    >
                                                        {user.userName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {quoteId ? "Update Quote" : "Create Quote"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
