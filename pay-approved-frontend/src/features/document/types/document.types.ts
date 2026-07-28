export interface Document {
  id: string;
  contractId: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export interface DocumentUploadData {
  contractId: string;
  file: File;
}