export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  detail: (id: string) => [...contractKeys.all, 'detail', id] as const,
  byCustomer: (customerId: string) => [...contractKeys.all, 'customer', customerId] as const,
};
