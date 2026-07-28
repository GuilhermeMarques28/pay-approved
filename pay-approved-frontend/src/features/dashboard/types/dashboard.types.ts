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