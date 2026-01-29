"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

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
import { Badge } from "@/components/ui/badge";
import { QuoteSheet } from "@/components/sales/quotes/quote-sheet";
import { quoteControllerApi } from "@/lib/api-client";
import { QuoteResponse } from "@/api/generated";

export default function QuotesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    // Sync URL params with state
    useEffect(() => {
        const view = searchParams.get("view");
        const detail = searchParams.get("detail");

        if (view === "create") {
            setSelectedQuoteId(null);
            setIsSheetOpen(true);
        } else if (detail) {
            setSelectedQuoteId(detail);
            setIsSheetOpen(true);
        } else {
            setIsSheetOpen(false);
            setSelectedQuoteId(null);
        }
    }, [searchParams]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const data = await quoteControllerApi.getAllQuotes();
            setQuotes(data);
        } catch (error) {
            console.error("Failed to fetch quotes", error);
            toast.error("Failed to fetch quotes");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchQuotes();
            return;
        }

        try {
            setLoading(true);
            const data = await quoteControllerApi.searchQuotes({ keyword: searchQuery });
            setQuotes(data);
        } catch (error) {
            console.error("Failed to search quotes", error);
            toast.error("Failed to search quotes");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        router.push("/sales/quotes?view=create");
    };

    const handleOpenEdit = (id: string) => {
        router.push(`/sales/quotes?detail=${id}`);
    };

    const handleSheetOpenChange = (open: boolean) => {
        if (!open) {
            router.push("/sales/quotes");
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "DRAFT":
                return "bg-gray-500";
            case "SENT":
                return "bg-blue-500";
            case "ACCEPTED":
                return "bg-green-500";
            case "REJECTED":
                return "bg-red-500";
            case "EXPIRED":
                return "bg-orange-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                    <p className="text-muted-foreground">
                        Manage sales quotes and estimates.
                    </p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quote
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="flex-1 max-w-sm flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search quotes..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quote Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No quotes found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((quote) => (
                                <TableRow key={quote.quoteId}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {quote.quoteNumber}
                                        </div>
                                    </TableCell>
                                    <TableCell>{quote.customerName}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(quote.quoteStatus)}>
                                            {quote.quoteStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {quote.quoteDate && format(new Date(quote.quoteDate), "PP")}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat("ko-KR", {
                                            style: "currency",
                                            currency: quote.currency || "KRW",
                                        }).format(quote.totalAmount || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenEdit(quote.quoteId!)}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <QuoteSheet
                quoteId={selectedQuoteId}
                open={isSheetOpen}
                onOpenChange={handleSheetOpenChange}
                onSuccess={fetchQuotes}
            />
        </div>
    );
}
