import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstance } from '@/lib/api/instance';

interface Contract {
  id: string;
  customerId: string;
  contractName: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  dueDay: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  signedAt: string;
}

export function useContracts() {
  return useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await getInstance().get('/contracts');
      return response.data;
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();

  const sign = useMutation<Contract, Error, Omit<Contract, 'id' | 'signedAt' | 'status'>>({
    mutationFn: async (data) => {
      const response = await getInstance().post('/contracts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  return { sign, isLoading: sign.isPending, error: sign.error };
}