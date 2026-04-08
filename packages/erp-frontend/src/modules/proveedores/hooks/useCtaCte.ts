import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface Movement {
  id: string;
  date: string;
  type: string;
  number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  status?: string;
}

export const useCtaCte = (providerId: string) => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['cta-cte', providerId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/proveedores/${providerId}/cta-cte`);
      if (!res.ok) throw new Error('Failed to fetch movement history');
      return res.json();
    },
    enabled: !!providerId
  });

  const pendingItemsQuery = useQuery({
    queryKey: ['pending-items', providerId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/proveedores/${providerId}/items-pendientes`);
      if (!res.ok) throw new Error('Failed to fetch pending items');
      return res.json();
    },
    enabled: !!providerId
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const res = await fetch(`${API_BASE_URL}/proveedores/${providerId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (!res.ok) throw new Error('Error creating payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cta-cte', providerId] });
      queryClient.invalidateQueries({ queryKey: ['pending-items', providerId] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  const annulPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await fetch(`${API_BASE_URL}/proveedores/pagos/${paymentId}/annul`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Error annulling payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cta-cte', providerId] });
      queryClient.invalidateQueries({ queryKey: ['pending-items', providerId] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  return {
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    pendingItems: pendingItemsQuery.data || { invoices: [], credits: [] },
    isLoadingPending: pendingItemsQuery.isLoading,
    createPayment: createPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending,
    annulPayment: annulPaymentMutation.mutateAsync,
    isAnnullingPayment: annulPaymentMutation.isPending
  };
};
