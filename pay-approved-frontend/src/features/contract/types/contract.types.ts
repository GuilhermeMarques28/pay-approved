export interface Contract {
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

export interface ContractSigningData {
  contractName: string;
  totalAmount: number;
  installments: number;
  dueDay: number;
}
