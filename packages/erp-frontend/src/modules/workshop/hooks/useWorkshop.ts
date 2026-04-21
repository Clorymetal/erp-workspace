import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface RepoTask {
  id: string;
  pieceName: string;
  serviceName: string;
  mechanicId: number | null;
  mechanic?: { name: string };
  laborPrice: number;
  partsCost: number;
  totalPrice: number;
  isCompleted: boolean;
}

export interface RepoOrder {
  id: string;
  orderNumber: number;
  patent: string | null;
  vehicleBrand: string | null;
  pieceSummary: string | null;
  problemDescription: string | null;
  status: 'INGRESADO' | 'PRESUPUESTO_PENDIENTE' | 'EN_REPARACION' | 'ESPERANDO_REPUESTOS' | 'LISTO' | 'ENTREGADO' | 'ANULADO';
  priority: 'NORMAL' | 'MEDIA' | 'ALTA' | 'URGENTE';
  client: { 
    businessName: string; 
    taxId: string; 
    phone?: string;
    address?: string;
    city?: string;
    taxCondition?: string;
  };
  tasks: RepoTask[];
  entryDate: string;
  createdAt: string;
}

const fetchOrders = async (filters: any): Promise<RepoOrder[]> => {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_BASE_URL}/workshop/orders?${query}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

export const useWorkshop = (filters: any = {}) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['workshop-orders', filters],
    queryFn: () => fetchOrders(filters),
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/workshop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error creating order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-orders'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`${API_BASE_URL}/workshop/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error updating status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-orders'] });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await fetch(`${API_BASE_URL}/workshop/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error updating order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-orders'] });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/workshop/orders/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error deleting order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-orders'] });
    }
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    createOrder: createOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isSubmitting: createOrderMutation.isPending || updateStatusMutation.isPending || updateOrderMutation.isPending || deleteOrderMutation.isPending
  };
};
