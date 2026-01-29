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
import { ProductResponse } from "@/api/generated";
import { productControllerApi } from "@/lib/api-client";
import {
    productCreateSchema,
    productUpdateSchema,
    ProductCreateFormValues,
} from "@/lib/validations/product";

interface ProductSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductResponse | null;
    onSuccess: () => void;
}

export function ProductSheet({ open, onOpenChange, product, onSuccess }: ProductSheetProps) {
    const isEditing = !!product;

    const form = useForm<ProductCreateFormValues>({
        resolver: zodResolver(isEditing ? productUpdateSchema : productCreateSchema),
        defaultValues: {
            productCode: "",
            productName: "",
            productCategory: "",
            productType: "",
            description: "",
            unitPrice: 0,
            costPrice: 0,
            currency: "KRW",
            taxRate: 0.1,
            stockQuantity: 0,
            isActive: "Y",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                productCode: product.productCode || "",
                productName: product.productName || "",
                productCategory: product.productCategory || "",
                productType: product.productType || "",
                description: product.description || "",
                unitPrice: product.unitPrice || 0,
                costPrice: product.costPrice || 0,
                currency: product.currency || "KRW",
                taxRate: product.taxRate || 0.1,
                stockQuantity: product.stockQuantity || 0,
                isActive: (product.isActive as "Y" | "N") || "Y",
                useAt: (product.useAt as "Y" | "N") || "Y",
            });
        } else {
            form.reset({
                productCode: "",
                productName: "",
                productCategory: "",
                productType: "",
                description: "",
                unitPrice: 0,
                costPrice: 0,
                currency: "KRW",
                taxRate: 0.1,
                stockQuantity: 0,
                isActive: "Y",
                useAt: "Y",
            });
        }
    }, [product, form]);

    const onSubmit = async (values: ProductCreateFormValues) => {
        try {
            if (isEditing && product?.productId) {
                // Update
                await productControllerApi.updateProduct({
                    productId: product.productId,
                    productUpdateRequest: values,
                });
            } else {
                // Create
                await productControllerApi.createProduct({
                    productCreateRequest: values,
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product. Please check input values.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Product" : "New Product"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update product details."
                            : "Create a new product."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 pb-10">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="productCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Code <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. PRD-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="productName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Software License" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="productCategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Software" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="productType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Service" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="unitPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Price <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
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
                                name="costPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl>
                                            <Input placeholder="KRW" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax Rate</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.1"
                                                step="0.01"
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
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
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
                                            placeholder="Product description..."
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
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Active</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="useAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Use At</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
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

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
