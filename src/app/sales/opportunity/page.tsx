"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import { OpportunityResponse, CustomerResponse } from "@/api/generated";
import { opportunityControllerApi, customerControllerApi } from "@/lib/api-client";
import { OpportunitySheet } from "@/components/sales/opportunities/opportunity-sheet";
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

export default function OpportunityPage() {
    const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
    const [customers, setCustomers] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Sheet state
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityResponse | null>(null);

    // Delete dialog state
    const [opportunityToDelete, setOpportunityToDelete] = useState<OpportunityResponse | null>(null);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const [oppsData, customersData] = await Promise.all([
                opportunityControllerApi.getAllOpportunities(),
                customerControllerApi.getAllCustomers()
            ]);
            setOpportunities(oppsData);

            // Create a map of customerId -> customerName for easy lookup
            const custMap = new Map<string, string>();
            customersData.forEach(c => {
                if (c.customerId && c.customerName) {
                    custMap.set(c.customerId, c.customerName);
                }
            });
            setCustomers(custMap);

        } catch (error) {
            console.error("Failed to fetch opportunities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const handleCreate = () => {
        setSelectedOpportunity(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (opportunity: OpportunityResponse) => {
        setSelectedOpportunity(opportunity);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (opportunity: OpportunityResponse) => {
        setOpportunityToDelete(opportunity);
    };

    const confirmDelete = async () => {
        if (!opportunityToDelete?.opportunityId) return;

        try {
            await opportunityControllerApi.deleteOpportunity({ opportunityId: opportunityToDelete.opportunityId });
            setOpportunityToDelete(null);
            fetchOpportunities();
        } catch (error) {
            console.error("Failed to delete opportunity:", error);
            alert("Failed to delete opportunity.");
        }
    };

    const filteredOpportunities = opportunities.filter(opp =>
        opp.opportunityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.customerId && customers.get(opp.customerId)?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStageBadgeColor = (stageId?: string) => {
        switch (stageId) {
            case "CLOSED_WON": return "default"; // or green-ish if custom variants exist
            case "CLOSED_LOST": return "destructive";
            case "PROPOSAL": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your sales pipeline and deals.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Opportunity
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search opportunities..."
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
                            <TableHead>Opportunity Name</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Close Date</TableHead>
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
                        ) : filteredOpportunities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOpportunities.map((opp) => (
                                <TableRow key={opp.opportunityId}>
                                    <TableCell className="font-medium">{opp.opportunityName}</TableCell>
                                    <TableCell>{opp.customerId ? customers.get(opp.customerId) || "Unknown" : "-"}</TableCell>
                                    <TableCell>{opp.stageId}</TableCell>
                                    <TableCell>
                                        {opp.amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(opp.amount) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {opp.expectedCloseDate ? format(new Date(opp.expectedCloseDate), "PP") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={opp.useAt === 'Y' ? 'default' : 'secondary'}>
                                            {opp.useAt === 'Y' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(opp)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(opp)}>
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

            <OpportunitySheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                opportunity={selectedOpportunity}
                onSuccess={fetchOpportunities}
            />

            <AlertDialog open={!!opportunityToDelete} onOpenChange={(open) => !open && setOpportunityToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the opportunity
                            "{opportunityToDelete?.opportunityName}".
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
