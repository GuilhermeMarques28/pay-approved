import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstance } from '@/lib/api/instance';

interface Customer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  locationLat: number | null;
  locationLng: number | null;
  createdAt: string;
}

export function useCustomerRegistration() {
  const queryClient = useQueryClient();

  const register = useMutation<Customer, Error, Omit<Customer, 'id' | 'createdAt' | 'locationLat' | 'locationLng'>>({
    mutationFn: async (data) => {
      const response = await getInstance().post('/customers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return { register, isLoading: register.isPending, error: register.error };
}
