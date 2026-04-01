import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TicketStatus, TicketPriority, TicketType } from "@prisma/client";

/**
 * ServisNode Advanced Ticket Store
 * 
 * Handles:
 * - Local state for ticket listings.
 * - Persistent configuration for view preferences (grid vs list).
 * - Advanced multi-layered filtering.
 * - Sorting and Pagination state.
 * - Temporary draft ticket state.
 * - Bulk action selections.
 */

interface TicketFilters {
  status: TicketStatus[];
  priority: TicketPriority[];
  type: TicketType[];
  search: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  assigneeId: string | null;
  creatorId: string | null;
  assetId: string | null;
  tags: string[];
}

interface TicketSort {
  field: "createdAt" | "updatedAt" | "priority" | "status" | "dueDate";
  order: "asc" | "desc";
}

interface TicketViewState {
  viewMode: "list" | "grid" | "kanban";
  filters: TicketFilters;
  sort: TicketSort;
  pageSize: number;
  currentPage: number;
  selectedTicketIds: string[];
  
  // Actions
  setFilters: (filters: Partial<TicketFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: TicketSort) => void;
  setViewMode: (mode: "list" | "grid" | "kanban") => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Selection Actions
  toggleTicketSelection: (id: string) => void;
  selectAllTickets: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Search state
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
}

const initialFilters: TicketFilters = {
  status: [],
  priority: [],
  type: [],
  search: "",
  dateRange: { from: undefined, to: undefined },
  assigneeId: null,
  creatorId: null,
  assetId: null,
  tags: [],
};

const initialSort: TicketSort = {
  field: "createdAt",
  order: "desc",
};

export const useTicketStore = create<TicketViewState>()(
  persist(
    (set) => ({
      viewMode: "list",
      filters: initialFilters,
      sort: initialSort,
      pageSize: 10,
      currentPage: 1,
      selectedTicketIds: [],
      isSearchActive: false,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset page on filter change
        })),

      resetFilters: () =>
        set(() => ({
          filters: initialFilters,
          currentPage: 1,
        })),

      setSort: (newSort) =>
        set(() => ({
          sort: newSort,
        })),

      setViewMode: (mode) =>
        set(() => ({
          viewMode: mode,
        })),

      setPage: (page) =>
        set(() => ({
          currentPage: page,
        })),

      setPageSize: (size) =>
        set(() => ({
          pageSize: size,
          currentPage: 1,
        })),

      toggleTicketSelection: (id) =>
        set((state) => ({
          selectedTicketIds: state.selectedTicketIds.includes(id)
            ? state.selectedTicketIds.filter((tId) => tId !== id)
            : [...state.selectedTicketIds, id],
        })),

      selectAllTickets: (ids) =>
        set(() => ({
          selectedTicketIds: ids,
        })),

      clearSelection: () =>
        set(() => ({
          selectedTicketIds: [],
        })),

      setIsSearchActive: (active) =>
        set(() => ({
          isSearchActive: active,
        })),
    }),
    {
      name: "servisnode-ticket-preferences", // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        sort: state.sort,
        pageSize: state.pageSize,
        filters: {
            ...state.filters,
            search: "", // Don't persist search string
            dateRange: { from: undefined, to: undefined } // Don't persist range
        }
      }),
    }
  )
);

/**
 * Enterprise Draft Logic
 * Used for storing unsaved ticket data during long creation sessions.
 */
interface DraftTicket {
    title: string;
    description: string;
    priority: TicketPriority;
    type: TicketType;
    assetId?: string;
    tags: string[];
}

interface TicketDraftStore {
    draft: DraftTicket | null;
    lastSaved: Date | null;
    saveDraft: (draft: DraftTicket) => void;
    clearDraft: () => void;
}

export const useTicketDraftStore = create<TicketDraftStore>()(
    persist(
        (set) => ({
            draft: null,
            lastSaved: null,
            saveDraft: (newDraft) => set(() => ({
                draft: newDraft,
                lastSaved: new Date()
            })),
            clearDraft: () => set(() => ({
                draft: null,
                lastSaved: null
            }))
        }),
        {
            name: "servisnode-ticket-draft",
            storage: createJSONStorage(() => localStorage)
        }
    )
);

/**
 * Performance Monitoring Logic for Ticket interactions
 */
export const ticketPerformanceHelper = {
    calculateSLA: (createdAt: Date, priority: TicketPriority) => {
        // High complexity SLA calculation
        const now = new Date();
        const diff = now.getTime() - createdAt.getTime();
        const hours = diff / (1000 * 60 * 60);

        const thresholds: Record<TicketPriority, number> = {
            CRITICAL: 2,
            URGENT: 4,
            HIGH: 8,
            MEDIUM: 24,
            LOW: 48
        };

        return hours > thresholds[priority];
    },
    
    getPriorityColor: (priority: TicketPriority) => {
        switch(priority) {
            case "CRITICAL": return "#EF4444"; // red-500
            case "URGENT": return "#F97316";   // orange-500
            case "HIGH": return "#EAB308";     // yellow-500
            case "MEDIUM": return "#3B82F6";   // blue-500
            case "LOW": return "#6B7280";      // gray-500
            default: return "#9CA3AF";
        }
    }
};
