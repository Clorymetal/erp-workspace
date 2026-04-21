import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface SaleOrder {
  id: string;
  invoiceNumber: string | null;
  remitoNumber: string | null;
  clientId: string;
  client: { businessName: string; city: string };
  status: 'PENDIENTE' | 'DESPACHADO' | 'EN_VIAJE' | 'COBRADO' | 'MUESTRA_PENDIENTE' | 'ANULADO';
  totalAmount: number;
  itemsDescription: string | null;
  saleDate: string;
  dueDate: string | null;
  createdAt: string;
}

export const useSales = (filters: any = {}) => {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ['sales-orders', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE_URL}/workshop/sales?${query}`);
      if (!res.ok) throw new Error('Error fetching sales');
      const json = await res.json();
      return json.data || [];
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/workshop/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error creating sale');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['client-balance'] });
    }
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    createSale: createSaleMutation.mutateAsync,
    isSubmitting: createSaleMutation.isPending
  };
};
