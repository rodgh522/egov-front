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
import { ActivityResponse } from "@/api/generated";
import { activityControllerApi } from "@/lib/api-client";
import { ActivitySheet } from "@/components/sales/activities/activity-sheet";
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

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Sheet state
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<ActivityResponse | null>(null);

    // Delete dialog state
    const [activityToDelete, setActivityToDelete] = useState<ActivityResponse | null>(null);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await activityControllerApi.getAllActivities();
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleCreate = () => {
        setSelectedActivity(null);
        setIsSheetOpen(true);
    };

    const handleEdit = (activity: ActivityResponse) => {
        setSelectedActivity(activity);
        setIsSheetOpen(true);
    };

    const handleDeleteClick = (activity: ActivityResponse) => {
        setActivityToDelete(activity);
    };

    const confirmDelete = async () => {
        if (!activityToDelete?.activityId) return;

        try {
            await activityControllerApi.deleteActivity({ activityId: activityToDelete.activityId });
            setActivityToDelete(null);
            fetchActivities();
        } catch (error) {
            console.error("Failed to delete activity:", error);
            alert("Failed to delete activity.");
        }
    };

    const filteredActivities = activities.filter(act =>
        act.activitySubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.activityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.activityDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityBadgeVariant = (priority?: string) => {
        switch (priority) {
            case "HIGH": return "destructive";
            case "MEDIUM": return "default";
            case "LOW": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
                    <p className="text-muted-foreground mt-2">
                        Track and manage your sales activities.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Activity
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search activities..."
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
                            <TableHead>Subject</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredActivities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredActivities.map((act) => (
                                <TableRow key={act.activityId}>
                                    <TableCell className="font-medium">{act.activitySubject}</TableCell>
                                    <TableCell>{act.activityType}</TableCell>
                                    <TableCell>
                                        <Badge variant={getPriorityBadgeVariant(act.priority) as any}>
                                            {act.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {act.activityStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {act.dueDate ? format(new Date(act.dueDate), "PP") : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(act)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(act)}>
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

            <ActivitySheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                activity={selectedActivity}
                onSuccess={fetchActivities}
            />

            <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the activity
                            "{activityToDelete?.activitySubject}".
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
