import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const useEmployees = (year: number, month: number) => {
  const queryClient = useQueryClient();

  const fetchEmployeesData = async () => {
    const res = await fetch(`${API_BASE_URL}/empleados/dashboard?year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Failed to fetch employees dashboard');
    const dashboardData = await res.json();
    return dashboardData.data;
  };

  const query = useQuery({
    queryKey: ['employees', year, month],
    queryFn: fetchEmployeesData,
  });

  const createAdvanceMutation = useMutation({
    mutationFn: async (advanceData: any) => {
      const res = await fetch(`${API_BASE_URL}/empleados/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advanceData)
      });
      if (!res.ok) throw new Error('Error creating advance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', year, month] });
    }
  });

  const deleteAdvanceMutation = useMutation({
    mutationFn: async (advanceId: number) => {
      const res = await fetch(`${API_BASE_URL}/empleados/advance/${advanceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting advance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', year, month] });
    }
  });

  const updateSalaryMutation = useMutation({
    mutationFn: async ({ periodId, salaryData }: { periodId: number, salaryData: any }) => {
      const res = await fetch(`${API_BASE_URL}/empleados/period/${periodId}/salary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salaryData)
      });
      if (!res.ok) throw new Error('Error updating salary');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', year, month] });
    }
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const res = await fetch(`${API_BASE_URL}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (!res.ok) throw new Error('Error creating employee');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Error updating employee');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  return {
    employees: query.data || [],
    isLoading: query.isLoading,
    createAdvance: createAdvanceMutation.mutateAsync,
    deleteAdvance: deleteAdvanceMutation.mutateAsync,
    updateSalary: updateSalaryMutation.mutateAsync,
    createEmployee: createEmployeeMutation.mutateAsync,
    updateEmployee: updateEmployeeMutation.mutateAsync
  };
};
