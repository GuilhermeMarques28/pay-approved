export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  byContract: (contractId: string) => [...documentKeys.all, 'contract', contractId] as const,
};
