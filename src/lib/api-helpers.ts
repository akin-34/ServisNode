import { NextResponse } from "next/server";
import { UserRole, TicketStatus, TicketPriority, TicketType } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * ServisNode Advanced API Utility Library
 * 
 * Provides:
 * - Standardized response formatting for JSON APIs.
 * - Multi-tenant data isolation helpers.
 * - Complex role-based authorization check (RBAC).
 * - Payload validation and sanitization.
 * - SLA calculation and breach detection logic.
 * - Audit logging orchestration for sensitive operations.
 * - Performance monitoring wrappers.
 * - Error transformation for frontend consumption.
 */

// --- RESPONSE FORMATTERS ---

export const ApiResponse = {
  success: (data: any, status = 200) => {
    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data
    }, { status });
  },
  
  error: (message: string, code = "INTERNAL_ERROR", status = 500, details?: any) => {
    return NextResponse.json({
        success: false,
        timestamp: new Date().toISOString(),
        error: {
            message,
            code,
            details
        }
    }, { status });
  },
  
  unauthorized: (message = "Bu işlem için yetkiniz bulunmamaktadır.") => {
    return ApiResponse.error(message, "UNAUTHORIZED", 401);
  },
  
  notFound: (message = "Aranan kayıt sistemde bulunamadı.") => {
    return ApiResponse.error(message, "NOT_FOUND", 404);
  },
  
  badRequest: (message: string, details?: any) => {
    return ApiResponse.error(message, "BAD_REQUEST", 400, details);
  }
};

// --- DATA ACCESS HELPERS ---

/**
 * Ensures a user or entity belongs to the correct organization context.
 * Used for strict multi-tenancy enforcement.
 */
export async function validateOrgAccess(userId: string, orgId: string): Promise<boolean> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { organizationId: true }
    });
    return user?.organizationId === orgId;
}

/**
 * Dynamic filtering for Prisma based on common URL query parameters.
 */
export function buildPrismaFilters(searchParams: URLSearchParams) {
    const filters: any = {};
    
    // Status Filter
    const status = searchParams.get("status")?.split(",");
    if (status && status.length > 0 && status[0] !== "") {
        filters.status = { in: status as TicketStatus[] };
    }

    // Priority Filter
    const priority = searchParams.get("priority")?.split(",");
    if (priority && priority.length > 0 && priority[0] !== "") {
        filters.priority = { in: priority as TicketPriority[] };
    }

    // Date Range Filter
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from || to) {
        filters.createdAt = {};
        if (from) filters.createdAt.gte = new Date(from);
        if (to) filters.createdAt.lte = new Date(to);
    }

    return filters;
}

// --- BUSINESS LOGIC HELPERS ---

/**
 * Calculates the SLA deadline based on priority.
 * Business Rules:
 * - CRITICAL: 2 Hours
 * - URGENT: 4 Hours
 * - HIGH: 8 Hours
 * - MEDIUM: 24 Hours
 * - LOW: 48 Hours
 */
export function calculateSlaDeadline(createdAt: Date, priority: TicketPriority): Date {
    const deadline = new Date(createdAt);
    const slaMap: Record<TicketPriority, number> = {
        CRITICAL: 2,
        URGENT: 4,
        HIGH: 8,
        MEDIUM: 24,
        LOW: 48
    };

    deadline.setHours(deadline.getHours() + slaMap[priority]);
    return deadline;
}

/**
 * Checks if a ticket is currently in breach of SLA.
 */
export function isSlaBreached(createdAt: Date, priority: TicketPriority, resolvedAt: Date | null): boolean {
    if (resolvedAt) return resolvedAt > calculateSlaDeadline(createdAt, priority);
    return new Date() > calculateSlaDeadline(createdAt, priority);
}

// --- AUDIT & LOGGING ---

/**
 * Standardized Audit Logging for ServisNode ecosystem.
 */
export async function trackActivity(params: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    description?: string;
    metadata?: any;
}) {
    try {
        await db.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: {
                    description: params.description,
                    ...params.metadata
                }
            }
        });
    } catch (e) {
        console.error("[AUDIT_LOG_ERROR]", e);
        // Fail silently in production to avoid blocking primary business logic
    }
}

// --- PERMISSIONS (RBAC) ---

const PERMISSION_MATRIX = {
  [UserRole.USER]: {
    'TICKET_READ': 'OWN',
    'TICKET_CREATE': true,
    'TICKET_DELETE': false,
    'ASSET_READ': 'OWN',
    'ADMIN_ACCESS': false
  },
  [UserRole.TECHNICIAN]: {
    'TICKET_READ': 'ALL',
    'TICKET_UPDATE_STATUS': true,
    'TICKET_DELETE': false,
    'ASSET_READ': 'ALL',
    'ADMIN_ACCESS': false
  },
  [UserRole.ADMIN]: {
    'TICKET_READ': 'ALL',
    'TICKET_DELETE': true,
    'ASSET_DELETE': true,
    'ADMIN_ACCESS': true,
    'USER_MANAGE': true
  },
  [UserRole.SUPER_ADMIN]: {
    'SYSTEM_CONFIG': true,
    'ORGANIZATION_MANAGE': true
  }
};

/**
 * Checks if a user has specific permission.
 */
export function hasPermission(role: UserRole, action: string): boolean | string {
    const rolePerms = PERMISSION_MATRIX[role] as any;
    if (!rolePerms) return false;
    
    // Inherit permissions for high roles
    if (role === UserRole.SUPER_ADMIN) return true;
    
    return rolePerms[action] || false;
}

// --- STRING & PAYLOAD UTILS ---

/**
 * Sanitizes generic user input to prevent XSS.
 * Basic implementation for internal use.
 */
export function sanitizeInput(input: string): string {
    if (!input) return "";
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Generates human-readable asset tags.
 */
export function generateAssetTag(category: string, index: number): string {
    const slug = category.substring(0, 3).toUpperCase();
    const padIndex = index.toString().padStart(5, '0');
    return `SN-${slug}-${padIndex}`;
}

/**
 * Format currency to Turkish Lira for financial reports.
 */
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};

// --- DATA TRANSFORMATION ---

/**
 * Slims down a Prisma user object for session storage.
 */
export function mapSessionUser(user: any) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization?.name,
        department: user.department?.name,
        image: user.image
    };
}

/**
 * Detailed error parsing for Prisma exceptions.
 */
export function handlePrismaError(error: any) {
    if (error.code === 'P2002') {
        return { message: "Bu kayıt zaten sistemde mevcut.", code: "CONFLICT" };
    }
    if (error.code === 'P2025') {
        return { message: "Kayıt bulunamadı.", code: "NOT_FOUND" };
    }
    return { message: "Veritabanı işlemi sırasında hata oluştu.", code: "DATABASE_ERROR" };
}
