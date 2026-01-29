"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CustomerResponse } from "@/api/generated";
import { customerControllerApi } from "@/lib/api-client";
import { CustomerSheet } from "@/components/sales/customers/customer-sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function CustomerPage() {
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Sheet state
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);

    // Delete dialog state
    const [customerToDelete, setCustomerToDelete] = useState<CustomerResponse | null>(null);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await customerControllerApi.getAllCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleCreate = () => {
        setSelectedCustomer(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (customer: CustomerResponse) => {
        setSelectedCustomer(customer);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (customer: CustomerResponse) => {
        setCustomerToDelete(customer);
    };

    const confirmDelete = async () => {
        if (!customerToDelete?.customerId) return;

        try {
            await customerControllerApi.deleteCustomer({ customerId: customerToDelete.customerId });
            setCustomerToDelete(null);
            fetchCustomers();
        } catch (error) {
            console.error("Failed to delete customer:", error);
            alert("Failed to delete customer.");
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your customer database and contacts.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Customer
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.customerId}>
                                    <TableCell className="font-medium">{customer.customerCode}</TableCell>
                                    <TableCell>{customer.customerName}</TableCell>
                                    <TableCell>{customer.customerType}</TableCell>
                                    <TableCell>{customer.industry}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={customer.useAt === 'Y' ? 'default' : 'secondary'}>
                                            {customer.useAt === 'Y' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(customer)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CustomerSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                customer={selectedCustomer}
                onSuccess={fetchCustomers}
            />

            <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer
                            "{customerToDelete?.customerName}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
