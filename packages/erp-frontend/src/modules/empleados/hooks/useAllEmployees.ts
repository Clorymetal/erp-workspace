import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const useAllEmployees = () => {
  return useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/empleados`);
      if (!res.ok) throw new Error('Failed to fetch all employees');
      const json = await res.json();
      return json.data || [];
    }
  });
};
