import { useQuery } from '@tanstack/react-query';
import { getInstance } from '@/lib/api/instance';

interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  totalDebt: number;
  nextPayment: string;
}

interface AdminStats {
  totalCustomers: number;
  activeContracts: number;
  overdueContracts: number;
  pendingDocuments: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await getInstance().get('/dashboard/stats');
      return response.data;
    },
  });
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await getInstance().get('/admin/stats');
      return response.data;
    },
  });
}