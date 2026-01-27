import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItem } from "@/lib/menu"; // Ensure this import path is correct
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, GripVertical, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableMenuItemProps {
    menu: MenuItem;
    depth?: number;
    isOpen: boolean;
    onToggle: () => void;
    onEdit: (menu: MenuItem) => void;
    onCreateChild: (menu: MenuItem) => void;
    onDelete: (menuNo: number) => void;
}

export function SortableMenuItem({
    menu,
    depth = 0,
    isOpen,
    onToggle,
    onEdit,
    onCreateChild,
    onDelete,
}: SortableMenuItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: menu.menuNo || 'unknown' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2 p-2 rounded-md border bg-card mb-2 group",
                isDragging && "opacity-50 border-primary border-dashed"
            )}
        >
            {/* Indentation spacer */}
            {depth > 0 && (
                <div style={{ width: `${depth * 24}px` }} className="shrink-0" />
            )}

            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Expand/Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onToggle}
                disabled={!menu.children || menu.children.length === 0}
            >
                {menu.children && menu.children.length > 0 ? (
                    isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                ) : <div className="w-4" />}
            </Button>

            {/* Menu Info */}
            <div className="flex-1 flex items-center gap-3 overflow-hidden">
                <span className="font-medium truncate">{menu.menuName}</span>
                <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex">
                    {menu.menuCode}
                </Badge>
                {menu.iconName && (
                    <Badge variant="secondary" className="font-mono text-xs hidden md:inline-flex">
                        {menu.iconName}
                    </Badge>
                )}
                <span className="text-muted-foreground text-xs font-mono hidden lg:inline-block truncate max-w-[200px]">
                    {menu.menuPath}
                </span>
            </div>

            {/* Status Badges */}
            <div className="flex gap-1 items-center mr-2">
                {menu.isActive === 'Y' ? (
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Active" />
                ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300" title="Inactive" />
                )}
                {menu.isVisible === 'N' && (
                    <Badge variant="outline" className="text-[10px] h-5 px-1">Hidden</Badge>
                )}
            </div>


            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(menu)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateChild(menu)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Sub-menu
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => menu.menuNo && onDelete(menu.menuNo)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
