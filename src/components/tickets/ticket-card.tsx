"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  MoreVertical, 
  ShieldAlert, 
  Tag, 
  User,
  ExternalLink,
  History,
  Paperclip,
  Share2,
  Lock,
  Eye,
  TrendingUp,
  RefreshCw
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Ticket, TicketStatus, TicketPriority, TicketType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * ServisNode Advanced Ticket Card Component
 * 
 * Features:
 * - Real-time status indication via colors/icons.
 * - Priority-based styling (Glow effects for Critical).
 * - Interactive action menu for quick status flips.
 * - Detailed metadata (Assignee, Type, Tags, Due Date).
 * - Internal vs Public comment indication logic.
 * - History preview and attachment markers.
 * - Responsive layout optimizing for mobile lists.
 */

interface TicketCardProps {
    ticket: Ticket & {
        createdBy: { name: string | null; image: string | null; email: string | null };
        assignedTo?: { name: string | null; image: string | null } | null;
        tags: { name: string; color: string | null }[];
        _count: { comments: number; attachments: number; history: number };
    };
    onAction?: (action: string, id: string) => void;
    className?: string;
}

export function TicketCard({ ticket, onAction, className }: TicketCardProps) {
    const isCritical = ticket.priority === "CRITICAL";
    const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== "CLOSED";

    const getStatusConfig = (status: TicketStatus) => {
        switch(status) {
            case "OPEN": return { label: "Open", color: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: Clock };
            case "IN_PROGRESS": return { label: "In Progress", color: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: RefreshCw };
            case "RESOLVED": return { label: "Resolved", color: "bg-green-500/15 text-green-600 border-green-500/20", icon: CheckCircle2 };
            case "CLOSED": return { label: "Closed", color: "bg-gray-500/15 text-gray-600 border-gray-500/20", icon: Lock };
            default: return { label: status, color: "bg-slate-500/15 text-slate-600 border-slate-500/20", icon: AlertCircle };
        }
    };

    const StatusIcon = getStatusConfig(ticket.status).icon;

    return (
        <Card className={cn(
            "group relative transition-all duration-300 border-primary/10 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
            isCritical && "ring-2 ring-destructive ring-offset-2 animate-pulse-subtle",
            className
        )}>
            {/* Background Texture/Gradient for Premium Feel */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                                {ticket.ticketId}
                            </span>
                            <Badge variant="outline" className={cn("text-[10px] font-medium h-5", getStatusConfig(ticket.status).color)}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {getStatusConfig(ticket.status).label}
                            </Badge>
                            {isOverdue && (
                                <Badge variant="destructive" className="text-[10px] h-5 animate-bounce">
                                    OVERDUE
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {ticket.title}
                        </CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted group-hover:scale-110 transition-transform">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onAction?.("view", ticket.id)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction?.("edit", ticket.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction?.("assign", ticket.id)}>
                                <User className="mr-2 h-4 w-4" /> Assign To...
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onAction?.("share", ticket.id)}>
                                <Share2 className="mr-2 h-4 w-4" /> Share Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Escalation
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 pb-4">
                <CardDescription className="line-clamp-2 text-sm leading-relaxed mb-4">
                    {ticket.description || "No description provided for this incident..."}
                </CardDescription>

                <div className="flex flex-wrap gap-1.5 mb-4">
                    {ticket.tags.map(tag => (
                        <span key={tag.name} className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-transparent hover:border-slate-300 transition-colors cursor-default">
                            <Tag className="mr-1 h-3 w-3" />
                            {tag.name}
                        </span>
                    ))}
                    {ticket.tags.length === 0 && (
                        <span className="text-[11px] text-muted-foreground italic">No tags</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Created {formatDistanceToNow(new Date(ticket.createdAt))} ago</span>
                    </div>
                    {ticket.dueDate && (
                        <div className={cn("flex items-center gap-2", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Due {formatDistanceToNow(new Date(ticket.dueDate))}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <Separator className="bg-primary/5" />

            <CardFooter className="p-4 py-3 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-7 w-7 ring-2 ring-background border border-primary/10">
                                    <AvatarImage src={ticket.assignedTo?.image || ""} />
                                    <AvatarFallback className="bg-primary/10 text-[10px] font-bold">
                                        {ticket.assignedTo?.name?.[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Assigned to: {ticket.assignedTo?.name || "Unassigned"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 hover:text-foreground transition-colors cursor-default">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span className="text-xs">{ticket._count.comments}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">Comments</p></TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 hover:text-foreground transition-colors cursor-default">
                                        <Paperclip className="h-3.5 w-3.5" />
                                        <span className="text-xs">{ticket._count.attachments}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">File Attachments</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-semibold" onClick={() => onAction?.("quick-view", ticket.id)}>
                        QUICK VIEW
                    </Button>
                    <div className="h-4 w-px bg-muted-foreground/30 mx-0.5" />
                    <Button variant="primary-ghost" size="sm" className="h-7 px-2 text-[10px] font-semibold text-primary" onClick={() => onAction?.("open", ticket.id)}>
                        OPEN DETAIL <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </CardFooter>

            {/* Premium Glow Effect on Hover */}
            <div className="absolute inset-0 border border-primary/0 pointer-events-none group-hover:border-primary/20 transition-all rounded-xl" />
        </Card>
    );
}

/**
 * Enterprise Card Helper Logic
 * Calculations for visual density and priority weighting.
 */
export const ticketCardLogic = {
    getPriorityWeight: (priority: TicketPriority) => {
        const weights = {
            CRITICAL: 100,
            URGENT: 80,
            HIGH: 60,
            MEDIUM: 40,
            LOW: 20
        };
        return weights[priority] || 0;
    },
    
    shouldHighlight: (ticket: any) => {
        return ticket.priority === "CRITICAL" || ticket.status === "OPEN";
    },
    
    generateIncidentSlug: (id: string) => {
        return `SN-INC-${id.substring(0, 6).toUpperCase()}`;
    }
}
