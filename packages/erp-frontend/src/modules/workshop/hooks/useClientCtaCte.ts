import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface ClientMovement {
  id: string;
  date: string;
  type: string;
  number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const useClientCtaCte = (clientId: string) => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['client-cta-cte', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const res = await fetch(`${API_BASE_URL}/workshop/clientes/${clientId}/cta-cte`);
      if (!res.ok) throw new Error('Error fetching client movements');
      return res.json();
    },
    enabled: !!clientId
  });

  const balanceQuery = useQuery({
    queryKey: ['client-balance', clientId],
    queryFn: async () => {
      if (!clientId) return { balance: 0 };
      const res = await fetch(`${API_BASE_URL}/workshop/clientes/${clientId}/balance`);
      if (!res.ok) throw new Error('Error fetching client balance');
      return res.json();
    },
    enabled: !!clientId
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/workshop/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error registering payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-cta-cte', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-balance', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients-list'] });
    }
  });

  return {
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    balance: balanceQuery.data?.balance || 0,
    isLoadingBalance: balanceQuery.isLoading,
    createPayment: createPaymentMutation.mutateAsync,
    isSubmitting: createPaymentMutation.isPending,
    refreshHistory: () => queryClient.invalidateQueries({ queryKey: ['client-cta-cte', clientId] })
  };
};
