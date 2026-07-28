import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstance } from '@/lib/api/instance';

interface Document {
  id: string;
  contractId: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await getInstance().get('/documents');
      return response.data;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  const upload = useMutation<Document, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await getInstance().post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return { upload, isLoading: upload.isPending, error: upload.error };
}