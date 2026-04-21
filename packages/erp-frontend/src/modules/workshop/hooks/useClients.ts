import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface Cliente {
  id: string;
  businessName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  taxCondition: string;
  paymentTermsDays: number;
}

const fetchClients = async (search?: string): Promise<Cliente[]> => {
  const url = search ? `${API_BASE_URL}/workshop/clientes?search=${search}` : `${API_BASE_URL}/workshop/clientes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
};

const fetchParameters = async (category: string) => {
  const res = await fetch(`${API_BASE_URL}/parametros?category=${category}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}`);
  return res.json();
};

export const useClients = (search?: string) => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ['clients', search],
    queryFn: () => fetchClients(search),
  });

  const taxConditionsQuery = useQuery({
    queryKey: ['parameters', 'COND_FISCAL'],
    queryFn: () => fetchParameters('COND_FISCAL'),
  });

  const provincesQuery = useQuery({
    queryKey: ['parameters', 'PROVINCIA'],
    queryFn: () => fetchParameters('PROVINCIA'),
  });

  const saveClientMutation = useMutation({
    mutationFn: async ({ client, isEdit, id }: { client: any, isEdit: boolean, id?: string }) => {
      const url = isEdit ? `${API_BASE_URL}/workshop/clientes/${id}` : `${API_BASE_URL}/workshop/clientes`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error saving client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/workshop/clientes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error deleting client');
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    taxConditions: taxConditionsQuery.data || [],
    provinces: provincesQuery.data || [],
    saveClient: saveClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isSubmitting: saveClientMutation.isPending || deleteClientMutation.isPending
  };
};
