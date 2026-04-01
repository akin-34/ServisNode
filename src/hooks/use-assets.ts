import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Asset, AssetStatus, AssetCondition } from "@prisma/client";
import { useAssetStore } from "@/store/use-asset-store";
import { toast } from "sonner";

/**
 * ServisNode Advanced Asset Hooks
 * 
 * Includes:
 * - Enterprise Asset Inventory Fetches.
 * - Paginated results with server-side filtering.
 * - Asset Lifecycle Management (Assign, Repair, Retire).
 * - Real-time validation and optimistic updates.
 * - Warranty & Maintenance window calculations.
 */

interface AssetResponse {
    assets: Asset[];
    total: number;
    pages: number;
    stats: {
        totalValue: number;
        statusCounts: Record<AssetStatus, number>;
        conditionCounts: Record<AssetCondition, number>;
    };
}

export function useAssets() {
  const queryClient = useQueryClient();
  const { filters, sort, pageSize, currentPage } = useAssetStore();

  // Primary Paginated Asset Query
  const {
    data,
    isLoading,
    isInitialLoading,
    isRefetching,
    error,
    refetch,
    isError
  } = useQuery<AssetResponse>({
    queryKey: ["assets", filters, sort, pageSize, currentPage],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: `${sort.field}:${sort.order}`,
        search: filters.search,
        status: filters.status.join(","),
        condition: filters.condition.join(","),
        organization: filters.organizationId || "",
        location: filters.locationId || "",
        department: filters.departmentId || "",
        warranty: filters.warrantyStatus
      });

      const response = await fetch(`/api/assets?${queryParams}`);
      if (!response.ok) {
        throw new Error("Sistem envanter listesini çekerken bir hata oluştu.");
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    placeholderData: (previousData) => previousData, // Maintain UI stability during fetch
  });

  // Infinite Scroll for Asset Picker / Lookup
  const infiniteAssets = useInfiniteQuery({
    queryKey: ["assets-infinite", filters.search],
    queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch(`/api/assets?page=${pageParam}&limit=10&search=${filters.search}`);
        return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });

  return {
    assets: data?.assets ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 0,
    stats: data?.stats,
    isLoading: isLoading || isInitialLoading,
    isRefetching,
    error,
    refetch,
    isError,
    infiniteAssets
  };
}

/**
 * Single Asset Details Fetching Hook
 */
export function useAsset(id: string) {
    return useQuery<Asset>({
        queryKey: ["asset", id],
        queryFn: async () => {
            const response = await fetch(`/api/assets/${id}`);
            if (!response.ok) throw new Error("Varlık ayrıntıları bulunamadı.");
            return response.json();
        },
        enabled: !!id,
        staleTime: 120000, // 2 minutes
    });
}

/**
 * Asset Lifecycle Actions (Mutations)
 */
export function useAssetActions() {
  const queryClient = useQueryClient();

  // Create New Asset
  const createAsset = useMutation({
    mutationFn: async (newAsset: any) => {
      const response = await fetch("/api/assets", {
        method: "POST",
        body: JSON.stringify(newAsset),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Varlık envantere başarıyla eklendi.");
    },
    onError: (err: any) => {
      toast.error(`Kayıt sırasında hata: ${err.message}`);
    }
  });

  // Update Asset Condition (Optimistic)
  const updateCondition = useMutation({
    mutationFn: async ({ id, condition }: { id: string; condition: AssetCondition }) => {
      const response = await fetch(`/api/assets/${id}/condition`, {
        method: "PATCH",
        body: JSON.stringify({ condition }),
      });
      return response.json();
    },
    onMutate: async ({ id, condition }) => {
        await queryClient.cancelQueries({ queryKey: ["assets"] });
        await queryClient.cancelQueries({ queryKey: ["asset", id] });

        const previousAsset = queryClient.getQueryData(["asset", id]);

        queryClient.setQueryData(["asset", id], (old: any) => ({
            ...old,
            condition
        }));

        return { previousAsset };
    },
    onSuccess: (data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        queryClient.setQueryData(["asset", id], data);
        toast.info("Varlık durumu güncellendi.");
    },
    onError: (err, { id }, context: any) => {
        queryClient.setQueryData(["asset", id], context.previousAsset);
        toast.error("Durum güncellenemedi.");
    }
  });

  // Retire Asset
  const retireAsset = useMutation({
      mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
          const response = await fetch(`/api/assets/${id}/retire`, {
              method: "POST",
              body: JSON.stringify({ reason })
          });
          return response.json();
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["assets"] });
          toast.warning("Varlık kullanım dışı bırakıldı.");
      }
  });

  return {
    createAsset,
    updateCondition,
    retireAsset
  };
}

/**
 * Asset Maintenance & Warranty Hook
 * Calculates upcoming expirations for dashboard alerts.
 */
export function useAssetMaintenance() {
    return useQuery({
        queryKey: ["asset-maintenance-alerts"],
        queryFn: async () => {
            const response = await fetch("/api/assets/maintenance-alerts");
            return response.json();
        },
        staleTime: 600000, // 10 minutes
    });
}
