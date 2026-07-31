export interface Customer {
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

export interface CustomerRegistrationData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Contract {
  id: string;
  customerId: string;
  contractName: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  dueDay: number;
  nextDueDate: string;
  status: "active" | "completed" | "overdue";
  signedAt: string | null;
  createdAt: string;
}

export interface ContractSigningData {
  contractName: string;
  totalAmount: number;
  installments: number;
  dueDay: number;
}

export interface Installment {
  id: string;
  contractId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidAt: string | null;
}

export interface Document {
  id: string;
  contractId: string;
  name: string;
  type: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
}

export interface DocumentUploadData {
  contractId: string;
  file: Express.Multer.File;
}

export interface PaymentAlert {
  id: string;
  contractId: string;
  customerId: string;
  title: string;
  message: string;
  dueDate: string;
  amount: number;
  status: "pending" | "sent" | "paid" | "overdue";
  sentAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  totalDebt: number;
  nextPayment: string;
}

export interface AdminStats {
  totalCustomers: number;
  activeContracts: number;
  overdueContracts: number;
  pendingDocuments: number;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "customer";
  };
}

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}
