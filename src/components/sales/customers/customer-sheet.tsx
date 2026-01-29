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
import { CustomerResponse } from "@/api/generated";
import { customerControllerApi } from "@/lib/api-client";
import {
    customerCreateSchema,
    customerUpdateSchema,
    CustomerCreateFormValues,
} from "@/lib/validations/customer";
import { CUSTOMER_TYPES, INDUSTRIES, COMPANY_SIZES } from "@/lib/constants";

interface CustomerSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: CustomerResponse | null;
    onSuccess: () => void;
}

export function CustomerSheet({ open, onOpenChange, customer, onSuccess }: CustomerSheetProps) {
    const isEditing = !!customer;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<CustomerCreateFormValues | any>({
        resolver: zodResolver(isEditing ? customerUpdateSchema : customerCreateSchema),
        defaultValues: {
            customerName: "",
            customerCode: "",
            customerType: "",
            industry: "",
            companySize: "",
            website: "",
            phone: "",
            email: "",
            address: "",
            annualRevenue: 0,
            employeeCount: 0,
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (customer) {
            form.reset({
                customerName: customer.customerName || "",
                customerCode: customer.customerCode || "",
                customerType: customer.customerType || "",
                industry: customer.industry || "",
                companySize: customer.companySize || "",
                website: customer.website || "",
                phone: customer.phone || "",
                email: customer.email || "",
                address: customer.address || "",
                annualRevenue: customer.annualRevenue || 0,
                employeeCount: customer.employeeCount || 0,
                useAt: (customer.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                customerName: "",
                customerCode: "",
                customerType: "",
                industry: "",
                companySize: "",
                website: "",
                phone: "",
                email: "",
                address: "",
                annualRevenue: 0,
                employeeCount: 0,
                useAt: "Y",
            });
        }
    }, [customer, form]);

    const onSubmit = async (values: CustomerCreateFormValues) => {
        try {
            if (isEditing && customer?.customerId) {
                // Update
                await customerControllerApi.updateCustomer({
                    customerId: customer.customerId,
                    customerUpdateRequest: {
                        customerName: values.customerName,
                        customerCode: values.customerCode,
                        customerType: values.customerType,
                        industry: values.industry,
                        companySize: values.companySize,
                        website: values.website,
                        phone: values.phone,
                        email: values.email,
                        address: values.address,
                        annualRevenue: values.annualRevenue,
                        employeeCount: values.employeeCount,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await customerControllerApi.createCustomer({
                    customerCreateRequest: {
                        customerName: values.customerName,
                        customerCode: values.customerCode,
                        customerType: values.customerType,
                        industry: values.industry,
                        companySize: values.companySize,
                        website: values.website,
                        phone: values.phone,
                        email: values.email,
                        address: values.address,
                        annualRevenue: values.annualRevenue,
                        employeeCount: values.employeeCount,
                        useAt: values.useAt,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save customer:", error);
            // Here we would show a toast - assuming toast is handled elsewhere or we add it later
            alert("Failed to save customer. Please check input values.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Customer" : "Add Customer"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update customer details."
                            : "Register a new customer."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 pb-10">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customerCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Code <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="CUST-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Acme Corp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customerType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CUSTOMER_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
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
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Industry</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {INDUSTRIES.map((ind) => (
                                                    <SelectItem key={ind.value} value={ind.value}>
                                                        {ind.label}
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
                                name="companySize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Size</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select size" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COMPANY_SIZES.map((size) => (
                                                    <SelectItem key={size.value} value={size.value}>
                                                        {size.label}
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
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
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
                                            <Input type="email" placeholder="contact@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, City, Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="annualRevenue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Annual Revenue</FormLabel>
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
                                name="employeeCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Customer"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
