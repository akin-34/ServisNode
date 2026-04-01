import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Ticket, TicketStatus, TicketPriority, TicketType } from "@prisma/client";
import { useTicketStore } from "@/store/use-ticket-store";
import { toast } from "sonner";

/**
 * ServisNode Advanced Ticket Hooks
 * 
 * Includes:
 * - Paginated ticket fetching.
 * - Infinite query for mobile/scroll views.
 * - Optimistic updates for status changes.
 * - Complex mutation for ticket creation with attachments.
 * - Cache invalidation strategy for multi-user environments.
 */

interface TicketResponse {
    tickets: Ticket[];
    total: number;
    pages: number;
}

export function useTickets() {
  const queryClient = useQueryClient();
  const { filters, sort, pageSize, currentPage } = useTicketStore();

  // Primary Paginated Query
  const {
    data,
    isLoading,
    isInitialLoading,
    isRefetching,
    error,
    refetch,
    isError
  } = useQuery<TicketResponse>({
    queryKey: ["tickets", filters, sort, pageSize, currentPage],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: `${sort.field}:${sort.order}`,
        search: filters.search,
        status: filters.status.join(","),
        priority: filters.priority.join(","),
        type: filters.type.join(","),
        assignee: filters.assigneeId || "",
        creator: filters.creatorId || ""
      });

      const response = await fetch(`/api/tickets?${queryParams}`);
      if (!response.ok) {
        throw new Error("Sistem biletleri çekerken bir hata oluştu.");
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
    refetchOnWindowFocus: true,
  });

  // Infinite Query for Mobile/Timeline view
  const infiniteTickets = useInfiniteQuery({
    queryKey: ["tickets-infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
        const response = await fetch(`/api/tickets?page=${pageParam}&limit=20`);
        return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });

  return {
    tickets: data?.tickets ?? [],
    total: data?.total ?? 0,
    pages: data?.pages ?? 0,
    isLoading: isLoading || isInitialLoading,
    isRefetching,
    error,
    refetch,
    isError,
    infiniteTickets
  };
}

/**
 * Single Ticket Fetching Hook
 */
export function useTicket(id: string) {
    return useQuery<Ticket>({
        queryKey: ["ticket", id],
        queryFn: async () => {
            const response = await fetch(`/api/tickets/${id}`);
            if (!response.ok) throw new Error("Bilet detayı bulunamadı.");
            return response.json();
        },
        enabled: !!id,
        staleTime: 60000,
    });
}

/**
 * Ticket Actions (Mutations)
 */
export function useTicketActions() {
  const queryClient = useQueryClient();

  // Create Ticket
  const createTicket = useMutation({
    mutationFn: async (newTicket: any) => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify(newTicket),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Bilet başarıyla oluşturuldu.");
    },
    onError: (err: any) => {
      toast.error(`Kayıt sırasında hata: ${err.message}`);
    }
  });

  // Update Status (Optimistic Update Demo)
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const response = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onMutate: async ({ id, status }) => {
        // Cancel refetches
        await queryClient.cancelQueries({ queryKey: ["tickets"] });
        await queryClient.cancelQueries({ queryKey: ["ticket", id] });

        // Snapshot current state
        const previousTicket = queryClient.getQueryData(["ticket", id]);

        // Optimistically update to the new value
        queryClient.setQueryData(["ticket", id], (old: any) => ({
            ...old,
            status
        }));

        return { previousTicket };
    },
    onSuccess: (data, { id }) => {
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
        queryClient.setQueryData(["ticket", id], data);
        toast.info("Durum güncellendi.");
    },
    onError: (err, { id }, context: any) => {
        queryClient.setQueryData(["ticket", id], context.previousTicket);
        toast.error("Durum güncellenemedi.");
    }
  });

  // Assign Ticket
  const assignTicket = useMutation({
      mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
          const response = await fetch(`/api/tickets/${id}/assign`, {
              method: "POST",
              body: JSON.stringify({ userId })
          });
          return response.json();
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tickets"] });
          toast.success("Bilet teknisyene atandı.");
      }
  });

  return {
    createTicket,
    updateStatus,
    assignTicket
  };
}

/**
 * Ticket Statistics Hook
 */
export function useTicketStats() {
    return useQuery({
        queryKey: ["ticket-stats"],
        queryFn: async () => {
            const response = await fetch("/api/tickets/stats");
            return response.json();
        },
        staleTime: 300000, // 5 minutes
    });
}
