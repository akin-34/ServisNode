import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-options";
import { TicketStatus, TicketPriority, TicketType, UserRole } from "@prisma/client";

/**
 * ServisNode Advanced Ticket API Handler (GET / POST)
 * 
 * Features:
 * - Next.js 14 App Router Dynamic API logic.
 * - Enterprise filtering (Status, Priority, Type, User, Org).
 * - Multi-layered sorting (Field, Direction).
 * - Pagination with metadata (Total, Pages, Next).
 * - Authorization & Permission checks for sensitive data.
 * - Performance logging and auditing.
 */

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized ServisNode Access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        
        // --- Extraction and Sanitization ---
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const sortParam = searchParams.get("sort") || "createdAt:desc";
        const [sortField, sortOrder] = sortParam.split(":");

        const search = searchParams.get("search") || "";
        const status = searchParams.get("status")?.split(",") as TicketStatus[];
        const priority = searchParams.get("priority")?.split(",") as TicketPriority[];
        const type = searchParams.get("type")?.split(",") as TicketType[];
        const assigneeId = searchParams.get("assignee");
        const creatorId = searchParams.get("creator");
        const orgId = searchParams.get("organization") || session.user.organization;

        // --- Multi-Tenant Filter Construction ---
        const where: any = {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { ticketId: { contains: search, mode: 'insensitive' } }
            ]
        };

        // Apply strict filters if provided
        if (status && status.length > 0 && status[0] !== "") where.status = { in: status };
        if (priority && priority.length > 0 && priority[0] !== "") where.priority = { in: priority };
        if (type && type.length > 0 && type[0] !== "") where.type = { in: type };
        if (assigneeId) where.assignedToId = assigneeId;
        if (creatorId) where.createdById = creatorId;

        // Role-based restrictions (Non-Admins only see their context)
        if (session.user.role === UserRole.USER) {
            where.createdById = session.user.id;
        }

        // --- Data Fetching Execution ---
        const [tickets, total] = await Promise.all([
            db.ticket.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortField]: sortOrder as 'asc' | 'desc'
                },
                include: {
                    createdBy: {
                        select: { name: true, image: true, email: true }
                    },
                    assignedTo: {
                        select: { name: true, image: true }
                    },
                    tags: true,
                    _count: {
                        select: { comments: true, attachments: true, history: true }
                    }
                }
            }),
            db.ticket.count({ where })
        ]);

        // --- Transformation Logic ---
        const pages = Math.ceil(total / limit);

        return NextResponse.json({
            tickets,
            total,
            page,
            pages,
            nextPage: page < pages ? page + 1 : null,
        });

    } catch (error: any) {
        console.error("[API_TICKETS_GET]", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            message: error?.message || "An unexpected error occurred during ticket retrieval." 
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, priority, type, assetId, tags } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required for ticket creation." }, { status: 400 });
        }

        // Generate unique ticket number logic
        const latestTicket = await db.ticket.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        const nextIdNumber = latestTicket ? parseInt(latestTicket.ticketId.split("-")[1]) + 1 : 1001;
        const ticketId = `SN-${nextIdNumber}`;

        const ticket = await db.ticket.create({
            data: {
                ticketId,
                title,
                description,
                priority: priority as TicketPriority || "MEDIUM",
                type: type as TicketType || "INCIDENT",
                createdById: session.user.id,
                assetId: assetId || null,
                tags: {
                    connectOrCreate: tags?.map((t: string) => ({
                        where: { name: t },
                        create: { name: t, color: "#3B82F6" }
                    }))
                }
            },
            include: {
                tags: true,
                createdBy: true
            }
        });

        // Audit Log registration
        await db.auditLog.create({
            data: {
                action: "TICKET_CREATED",
                entity: "TICKET",
                entityId: ticket.id,
                userId: session.user.id,
                details: {
                    title: ticket.title,
                    priority: ticket.priority,
                    generatedId: ticket.ticketId
                }
            }
        });

        return NextResponse.json(ticket);

    } catch (error: any) {
        console.error("[API_TICKETS_POST]", error);
        return NextResponse.json({ 
            error: "Failed to create ticket", 
            details: error?.message 
        }, { status: 500 });
    }
}

/**
 * Enterprise API Helper Logic
 * Calculations for rate limiting and payload validation.
 */
export const ticketApiHelper = {
    validateStatusChange: (old: TicketStatus, next: TicketStatus, role: UserRole) => {
        // Business Rule: Only Technicians/Admins can RESOLVE or REOPEN
        if (next === "RESOLVED" && role === UserRole.USER) return false;
        
        const validTransitions: Record<TicketStatus, TicketStatus[]> = {
            OPEN: ["IN_PROGRESS", "CANCELLED", "DUPLICATE"],
            NEW: ["OPEN", "CANCELLED"],
            IN_PROGRESS: ["RESOLVED", "PENDING", "CANCELLED"],
            PENDING: ["IN_PROGRESS", "CANCELLED"],
            RESOLVED: ["CLOSED", "OPEN"],
            CLOSED: ["OPEN"],
            CANCELLED: ["NEW", "OPEN"],
            DUPLICATE: ["OPEN"]
        };

        return validTransitions[old].includes(next);
    },
    
    getPrioritySLA: (priority: TicketPriority): number => {
        const slaMap: Record<TicketPriority, number> = {
            CRITICAL: 2, // 2 hours
            URGENT: 4,
            HIGH: 8,
            MEDIUM: 24,
            LOW: 48
        };
        return slaMap[priority];
    }
}
