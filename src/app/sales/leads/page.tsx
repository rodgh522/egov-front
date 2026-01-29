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
import { LeadResponse } from "@/api/generated";
import { leadControllerApi } from "@/lib/api-client";
import { LeadSheet } from "@/components/sales/leads/lead-sheet";
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

export default function LeadPage() {
    const [leads, setLeads] = useState<LeadResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Sheet state
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadResponse | null>(null);

    // Delete dialog state
    const [leadToDelete, setLeadToDelete] = useState<LeadResponse | null>(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await leadControllerApi.getAllLeads();
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleCreate = () => {
        setSelectedLead(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (lead: LeadResponse) => {
        setSelectedLead(lead);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (lead: LeadResponse) => {
        setLeadToDelete(lead);
    };

    const confirmDelete = async () => {
        if (!leadToDelete?.leadId) return;

        try {
            await leadControllerApi.deleteLead({ leadId: leadToDelete.leadId });
            setLeadToDelete(null);
            fetchLeads();
        } catch (error) {
            console.error("Failed to delete lead:", error);
            alert("Failed to delete lead.");
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your potential customers and sales leads.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Lead
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads..."
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
                            <TableHead>Lead Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
                                <TableRow key={lead.leadId}>
                                    <TableCell className="font-medium">{lead.leadName}</TableCell>
                                    <TableCell>{lead.companyName || "-"}</TableCell>
                                    <TableCell>{lead.email || "-"}</TableCell>
                                    <TableCell>{lead.phone || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{lead.leadStatus || "New"}</Badge>
                                    </TableCell>
                                    <TableCell>{lead.leadSource || "-"}</TableCell>
                                    <TableCell>
                                        {lead.createdDate ? format(new Date(lead.createdDate), "PP") : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(lead)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(lead)}>
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

            <LeadSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                lead={selectedLead}
                onSuccess={fetchLeads}
            />

            <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the lead
                            "{leadToDelete?.leadName}".
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
