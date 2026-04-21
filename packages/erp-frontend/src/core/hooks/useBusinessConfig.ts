import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/apiConfig';

export interface BusinessConfig {
  name: string;
  taxId: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  vatCondition: string;
  logoUrl?: string;
}

export const useBusinessConfig = () => {
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: ['business-config'],
    queryFn: async (): Promise<BusinessConfig> => {
      const res = await fetch(`${API_BASE_URL}/config/business`);
      if (!res.ok) throw new Error('Failed to fetch business config');
      return res.json();
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: BusinessConfig) => {
      const res = await fetch(`${API_BASE_URL}/config/business`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Failed to update business config');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-config'] });
    }
  });

  return {
    config: configQuery.data,
    isLoading: configQuery.isLoading,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending
  };
};
