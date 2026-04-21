import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export interface Proveedor {
  id: string;
  razonSocial: string;
  nombreFantasia: string;
  cuit: string;
  email: string;
  telefono: string;
  provincia: string;
  cp: string;
  condFisc: string;
  saldo: number;
  isCtaCte: boolean;
  expirationDays: number;
  netAmountCode: string;
  estado: 'Activo' | 'Inactivo';
}

const fetchProviders = async (): Promise<Proveedor[]> => {
  const res = await fetch(`${API_BASE_URL}/proveedores`);
  if (!res.ok) throw new Error('Failed to fetch providers');
  const data = await res.json();
  return data.map((p: any) => ({
    id: String(p.id),
    razonSocial: p.businessName,
    nombreFantasia: p.fantasyName || '',
    cuit: p.taxId,
    email: p.contacts?.[0]?.email || '',
    telefono: p.contacts?.[0]?.phone || '',
    provincia: p.province || '',
    cp: p.postalCode || '',
    condFisc: p.taxCondition || '',
    isCtaCte: !!p.isCtaCte,
    expirationDays: p.expirationDays || 0,
    netAmountCode: p.netAmountCode || '',
    saldo: p.balance || 0,
    estado: 'Activo'
  }));
};

const fetchParameters = async (category: string) => {
  const res = await fetch(`${API_BASE_URL}/parametros?category=${category}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}`);
  return res.json();
};

export const useProviders = () => {
  const queryClient = useQueryClient();

  const providersQuery = useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders,
  });

  const provincesQuery = useQuery({
    queryKey: ['parameters', 'PROVINCIA'],
    queryFn: () => fetchParameters('PROVINCIA'),
  });

  const taxConditionsQuery = useQuery({
    queryKey: ['parameters', 'COND_FISCAL'],
    queryFn: () => fetchParameters('COND_FISCAL'),
  });

  const saveProviderMutation = useMutation({
    mutationFn: async ({ provider, isEdit, id }: { provider: any, isEdit: boolean, id?: string }) => {
      const url = isEdit ? `${API_BASE_URL}/proveedores/${id}` : `${API_BASE_URL}/proveedores`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
      });
      if (!res.ok) throw new Error('Error saving provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/proveedores/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error deleting provider');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    }
  });

  return {
    providers: providersQuery.data || [],
    isLoading: providersQuery.isLoading,
    provinces: provincesQuery.data || [],
    taxConditions: taxConditionsQuery.data || [],
    saveProvider: saveProviderMutation.mutateAsync,
    deleteProvider: deleteProviderMutation.mutateAsync,
    isSubmitting: saveProviderMutation.isPending || deleteProviderMutation.isPending
  };
};

