import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AssetStatus, AssetCondition } from "@prisma/client";

/**
 * ServisNode Advanced Asset Store
 * 
 * Purpose:
 * - Enterprise Asset Inventory State Management.
 * - Complex Hierarchical Filtering (Org -> Location -> Dept).
 * - Lifecycle tracking for warranty and disposal.
 * - Barcode/AssetTag search optimization.
 * - Selection state for bulk operations (Zimmetleme, Reporting).
 */

interface AssetFilters {
  status: AssetStatus[];
  condition: AssetCondition[];
  category: string[];
  search: string;
  organizationId: string | null;
  locationId: string | null;
  departmentId: string | null;
  ownerId: string | null;
  warrantyStatus: "VALID" | "EXPIRED" | "EXPIRES_SOON" | "ANY";
}

interface AssetSort {
  field: "name" | "category" | "status" | "purchaseDate" | "purchaseCost" | "warrantyExpires";
  order: "asc" | "desc";
}

interface AssetViewState {
  // Appearance
  viewMode: "table" | "grid";
  isSidebarOpen: boolean;
  
  // Data State
  filters: AssetFilters;
  sort: AssetSort;
  pageSize: number;
  currentPage: number;
  selectedAssetIds: string[];
  
  // High-Level Actions
  setFilters: (filters: Partial<AssetFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: AssetSort) => void;
  setViewMode: (mode: "table" | "grid") => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Bulk Actions
  toggleAssetSelection: (id: string) => void;
  selectAllAssets: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Search Utility
  isSearching: boolean;
  setIsSearching: (val: boolean) => void;
}

const initialAssetFilters: AssetFilters = {
  status: [],
  condition: [],
  category: [],
  search: "",
  organizationId: null,
  locationId: null,
  departmentId: null,
  ownerId: null,
  warrantyStatus: "ANY",
};

const initialAssetSort: AssetSort = {
  field: "purchaseDate",
  order: "desc",
};

export const useAssetStore = create<AssetViewState>()(
  persist(
    (set) => ({
      viewMode: "table",
      isSidebarOpen: true,
      filters: initialAssetFilters,
      sort: initialAssetSort,
      pageSize: 25,
      currentPage: 1,
      selectedAssetIds: [],
      isSearching: false,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        })),

      resetFilters: () =>
        set(() => ({
          filters: initialAssetFilters,
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

      setSidebarOpen: (open) =>
        set(() => ({
          isSidebarOpen: open,
        })),

      toggleAssetSelection: (id) =>
        set((state) => ({
          selectedAssetIds: state.selectedAssetIds.includes(id)
            ? state.selectedAssetIds.filter((aId) => aId !== id)
            : [...state.selectedAssetIds, id],
        })),

      selectAllAssets: (ids) =>
        set(() => ({
          selectedAssetIds: ids,
        })),

      clearSelection: () =>
        set(() => ({
          selectedAssetIds: [],
        })),

      setIsSearching: (val) =>
        set(() => ({
          isSearching: val,
        })),
    }),
    {
      name: "servisnode-asset-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        pageSize: state.pageSize,
        isSidebarOpen: state.isSidebarOpen,
        sort: state.sort,
        filters: {
            ...state.filters,
            search: "" // Security/UX: don't persist specific searches
        }
      }),
    }
  )
);

/**
 * Asset Lifecycle Utilities
 * Logic for calculating depreciation, warranty alerts, and maintenance windows.
 */
export const assetUtils = {
    calculateDepreciation: (purchaseCost: number, purchaseDate: Date, lifespanYears: number = 5) => {
        const now = new Date();
        const yearsPassed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (yearsPassed >= lifespanYears) return 0;
        const remainingVal = purchaseCost * (1 - (yearsPassed / lifespanYears));
        return Math.max(0, remainingVal);
    },
    
    getWarrantyRemainingDays: (warrantyExpires: Date | null) => {
        if (!warrantyExpires) return -1;
        const now = new Date();
        const diff = warrantyExpires.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },
    
    getConditionSeverity: (condition: AssetCondition) => {
        switch(condition) {
            case "NEW": return "SUCCESS";
            case "EXCELLENT": return "INFO";
            case "GOOD": return "DEFAULT";
            case "FAIR": return "WARNING";
            case "POOR": return "DESTRUCTIVE";
            case "SCRAP": return "CRITICAL";
            default: return "DEFAULT";
        }
    }
};

/**
 * Specialized Store for Asset Importing / CSV Processing
 */
interface AssetImportState {
    isImporting: boolean;
    progress: number;
    errors: string[];
    importBuffer: any[];
    setImporting: (val: boolean) => void;
    setProgress: (val: number) => void;
    addError: (err: string) => void;
    clearErrors: () => void;
    setBuffer: (data: any[]) => void;
}

export const useAssetImportStore = create<AssetImportState>((set) => ({
    isImporting: false,
    progress: 0,
    errors: [],
    importBuffer: [],
    setImporting: (val) => set({ isImporting: val }),
    setProgress: (val) => set({ progress: val }),
    addError: (err) => set((s) => ({ errors: [...s.errors, err] })),
    clearErrors: () => set({ errors: [] }),
    setBuffer: (data) => set({ importBuffer: data })
}));
