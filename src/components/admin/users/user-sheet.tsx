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
import { UserResponse } from "@/api/generated";
import { userManagementApi } from "@/lib/api-client";
import {
    userCreateSchema,
    userUpdateSchema,
    UserCreateFormValues,
} from "@/lib/validations/user";

interface UserSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResponse | null;
    onSuccess: () => void;
}

export function UserSheet({ open, onOpenChange, user, onSuccess }: UserSheetProps) {
    const isEditing = !!user;

    const form = useForm<UserCreateFormValues | any>({
        resolver: zodResolver(isEditing ? userUpdateSchema : userCreateSchema),
        defaultValues: {
            userId: "",
            userName: "",
            email: "",
            password: "",
            phone: "",
            useAt: "Y",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                userName: user.userName || "",
                email: user.email || "",
                phone: user.phone || "",
                useAt: (user.useAt as "Y" | "N") || "Y",
                // Password and userId cannot be edited directly in update typically, 
                // or handled separately. For this simple form, we might just omit them in edit modeUI
            });
        } else {
            form.reset({
                userId: "",
                userName: "",
                email: "",
                password: "",
                phone: "",
                useAt: "Y",
            });
        }
    }, [user, form]);

    const onSubmit = async (values: UserCreateFormValues) => {
        try {
            if (isEditing && user?.esntlId) {
                // Update
                await userManagementApi.updateUser({
                    esntlId: user.esntlId,
                    userUpdateRequest: {
                        userName: values.userName,
                        email: values.email,
                        phone: values.phone,
                        useAt: values.useAt,
                    }
                });
            } else {
                // Create
                await userManagementApi.createUser({
                    userCreateRequest: {
                        userId: values.userId,
                        userName: values.userName,
                        email: values.email,
                        password: values.password,
                        phone: values.phone,
                    }
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save user:", error);
            // Here we would show a toast
            alert("Failed to save user. Please check console.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px]">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit User" : "Add User"}</SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? "Update user details."
                            : "Create a new user account."}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="jdoe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="userName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="010-1234-5678" {...field} />
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
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create User"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
