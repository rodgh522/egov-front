import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MenuControllerApi, MenuResponse, MenuUpdateRequest, MenuCreateRequest } from "@/api/generated";
import { apiConfig } from "@/lib/api-client";

const formSchema = z.object({
    menuName: z.string().min(1, "Menu name is required"),
    menuCode: z.string().min(1, "Menu code is required"),
    menuPath: z.string().optional(),
    iconName: z.string().optional(),
    menuOrder: z.coerce.number(),
    isVisible: z.boolean(),
    isActive: z.boolean(),
    menuDescription: z.string().optional(),
});

interface EditMenuSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menuNo: number | null;
    initialValues?: {
        upperMenuNo?: number;
        menuOrder?: number;
    };
    onSuccess: () => void;
}

export function EditMenuSheet({
    open,
    onOpenChange,
    menuNo,
    initialValues,
    onSuccess,
}: EditMenuSheetProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            menuName: "",
            menuCode: "",
            menuPath: "",
            iconName: "",
            menuOrder: 0,
            isVisible: true,
            isActive: true,
            menuDescription: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (menuNo) {
                loadMenu(menuNo);
            } else {
                form.reset({
                    menuName: "",
                    menuCode: "",
                    menuPath: "",
                    iconName: "",
                    menuOrder: initialValues?.menuOrder || 0,
                    isVisible: true,
                    isActive: true,
                    menuDescription: "",
                    // Hidden field implementation for upperMenuNo if needed, 
                    // or just pass it during submission if not in form schema.
                    // For now, let's assume valid form reset.
                });
            }
        }
    }, [open, menuNo, initialValues]);

    const loadMenu = async (id: number) => {
        try {
            const api = new MenuControllerApi(apiConfig);
            const menu = await api.getMenu({ menuNo: id });

            form.reset({
                menuName: menu.menuName,
                menuCode: menu.menuCode,
                menuPath: menu.menuPath || "",
                iconName: menu.iconName || "",
                menuOrder: menu.menuOrder,
                isVisible: menu.isVisible === 'Y',
                isActive: menu.isActive === 'Y',
                menuDescription: menu.menuDescription || "",
            });
        } catch (error) {
            console.error("Failed to load menu details:", error);
            // Could add toast error here
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const api = new MenuControllerApi(apiConfig);

            if (menuNo) {
                // Update existing menu
                const updateRequest: MenuUpdateRequest = {
                    menuName: values.menuName,
                    // menuCode: values.menuCode, // Read-only
                    menuPath: values.menuPath,
                    iconName: values.iconName,
                    menuOrder: values.menuOrder,
                    isVisible: values.isVisible ? 'Y' : 'N',
                    isActive: values.isActive ? 'Y' : 'N',
                    menuDescription: values.menuDescription,
                };

                await api.updateMenu({
                    menuNo: menuNo,
                    menuUpdateRequest: updateRequest,
                });
            } else {
                // Create new menu
                const createRequest: MenuCreateRequest = {
                    menuName: values.menuName,
                    menuCode: values.menuCode,
                    menuPath: values.menuPath,
                    iconName: values.iconName,
                    menuOrder: values.menuOrder,
                    isVisible: values.isVisible ? 'Y' : 'N',
                    isActive: values.isActive ? 'Y' : 'N', // Fixed: useAt -> isActive
                    menuDescription: values.menuDescription,
                    upperMenuNo: initialValues?.upperMenuNo,
                };

                await api.createMenu({
                    menuCreateRequest: createRequest,
                });
            }

            onSuccess();
        } catch (error) {
            console.error("Failed to save menu:", error);
            // Could add toast error here
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{menuNo ? "Edit Menu" : "Create Menu"}</SheetTitle>
                    <SheetDescription>
                        {menuNo ? "Make changes to the menu item here." : "Add a new menu item to the system."} Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="menuCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Menu Code</FormLabel>
                                    <FormControl>
                                        <Input {...field} readOnly={!!menuNo} className={menuNo ? "bg-muted" : ""} placeholder="UNIQUE-CODE" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="menuName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Menu Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="menuPath"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Path</FormLabel>
                                    <FormControl>
                                        <Input placeholder="/admin/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="iconName"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Icon</FormLabel>
                                        <FormControl>
                                            <Input placeholder="lucide-icon-name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="menuOrder"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormLabel>Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="isVisible"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                                        <div className="space-y-0.5">
                                            <FormLabel>Visible</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="menuDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe this menu item..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save changes</Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
