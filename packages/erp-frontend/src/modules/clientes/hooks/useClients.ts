import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface Client {
  id: string;
  businessName: string;
  taxId: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  balance: number;
  billingCycle: string;
  dueStatus: 'VENCIDO' | 'PROXIMO' | 'AL_DIA';
  nextDueDate: string | null;
}

export const useClients = () => {
  const queryClient = useQueryClient();

  const fetchClients = async (): Promise<Client[]> => {
    const res = await fetch(`${API_BASE_URL}/clientes`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  };

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClients,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const saveClientMutation = useMutation({
    mutationFn: async ({ client, isEdit, id }: { client: any, isEdit: boolean, id?: string }) => {
      const url = isEdit ? `${API_BASE_URL}/clientes/${id}` : `${API_BASE_URL}/clientes`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (!res.ok) throw new Error('Failed to save client');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });

  const createRemitoMutation = useMutation({
    mutationFn: async ({ clientId, remitoData }: { clientId: string, remitoData: any }) => {
      const res = await fetch(`${API_BASE_URL}/clientes/${clientId}/remitos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remitoData)
      });
      if (!res.ok) throw new Error('Failed to create remito');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clienteDetail', variables.clientId] });
    }
  });

  const createPaymentMutation = useMutation({
    mutationFn: async ({ clientId, paymentData }: { clientId: string, paymentData: any }) => {
      const res = await fetch(`${API_BASE_URL}/clientes/${clientId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (!res.ok) throw new Error('Failed to create payment');
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clienteDetail', variables.clientId] });
    }
  });

  return {
    clients,
    isLoading,
    saveClient: saveClientMutation.mutateAsync,
    isSubmitting: saveClientMutation.isPending,
    createRemito: createRemitoMutation.mutateAsync,
    isCreatingRemito: createRemitoMutation.isPending,
    createPayment: createPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending
  };
};

export const useClientDetail = (clientId: string | null) => {
  const fetchDetail = async () => {
    if (!clientId) return null;
    const res = await fetch(`${API_BASE_URL}/clientes/${clientId}`);
    if (!res.ok) throw new Error('Failed to fetch client detail');
    return res.json();
  };

  const { data: detail, isLoading } = useQuery({
    queryKey: ['clienteDetail', clientId],
    queryFn: fetchDetail,
    enabled: !!clientId,
  });

  return { detail, isLoading };
};
