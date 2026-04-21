import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const useMechanics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['mechanics-list'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/empleados`);
      if (!res.ok) throw new Error('Error fetching employees');
      const json = await res.json();
      return json.data || [];
    }
  });

  return {
    mechanics: data || [],
    isLoading
  };
};
