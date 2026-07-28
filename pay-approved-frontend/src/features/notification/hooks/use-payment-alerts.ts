import { useQuery } from '@tanstack/react-query';
import { getInstance } from '@/lib/api/instance';

interface PaymentAlert {
  id: string;
  contractId: string;
  title: string;
  message: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  sentAt: string;
}

export function usePaymentAlerts() {
  return useQuery<PaymentAlert[]>({
    queryKey: ['payment-alerts'],
    queryFn: async () => {
      const response = await getInstance().get('/payment-alerts');
      return response.data;
    },
    refetchInterval: 60000,
  });
}
