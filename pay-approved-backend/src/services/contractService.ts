import { supabaseAdmin } from "../db/supabase";
import { Contract, ContractSigningData, Installment } from "../types";
import { v4 as uuidv4 } from "uuid";

export const contractService = {
  async getByCustomerId(customerId: string): Promise<Contract[]> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }
    return (data ?? []).map(mapContractRow);
  },

  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabaseAdmin.from("contracts").select("*").eq("id", id).single();

    if (error || !data) {
      return null;
    }
    return mapContractRow(data);
  },

  async create(customerId: string, data: ContractSigningData): Promise<Contract> {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), data.dueDay);
    if (dueDate <= today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    const { data: contract, error } = await supabaseAdmin
      .from("contracts")
      .insert({
        customer_id: customerId,
        contract_name: data.contractName,
        total_amount: data.totalAmount,
        installments: data.installments,
        paid_installments: 0,
        due_day: data.dueDay,
        next_due_date: dueDate.toISOString().split("T")[0],
        status: "active",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create contract: ${error.message}`);
    }

    await generateInstallments(contract.id, data.totalAmount, data.installments, data.dueDay);

    return mapContractRow(contract);
  },

  async sign(id: string): Promise<Contract | null> {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("contracts")
      .update({ signed_at: now, status: "active" })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return null;
    }
    return mapContractRow(data);
  },

  async getInstallments(contractId: string): Promise<Installment[]> {
    const { data, error } = await supabaseAdmin
      .from("installments")
      .select("*")
      .eq("contract_id", contractId)
      .order("installment_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch installments: ${error.message}`);
    }
    return (data ?? []).map(mapInstallmentRow);
  },
};

async function generateInstallments(
  contractId: string,
  totalAmount: number,
  installmentsCount: number,
  dueDay: number,
): Promise<void> {
  const installments: Array<Record<string, unknown>> = [];
  const today = new Date();

  for (let i = 1; i <= installmentsCount; i++) {
    let dueDate = new Date(today.getFullYear(), today.getMonth() + i, dueDay);

    if (dueDate.getDate() !== dueDay) {
      dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0);
    }

    const amount = totalAmount / installmentsCount;
    installments.push({
      id: uuidv4(),
      contract_id: contractId,
      installment_number: i,
      due_date: dueDate.toISOString().split("T")[0],
      amount: parseFloat(amount.toFixed(2)),
      paid: false,
    });
  }

  const { error } = await supabaseAdmin.from("installments").insert(installments);
  if (error) {
    throw new Error(`Failed to generate installments: ${error.message}`);
  }
}

function mapContractRow(row: Record<string, unknown>): Contract {
  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    contractName: row.contract_name as string,
    totalAmount: parseFloat(row.total_amount as string),
    installments: row.installments as number,
    paidInstallments: row.paid_installments as number,
    dueDay: row.due_day as number,
    nextDueDate: row.next_due_date as string,
    status: row.status as Contract["status"],
    signedAt: row.signed_at as string | null,
    createdAt: row.created_at as string,
  };
}

function mapInstallmentRow(row: Record<string, unknown>): Installment {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    installmentNumber: row.installment_number as number,
    dueDate: row.due_date as string,
    amount: parseFloat(row.amount as string),
    paid: row.paid as boolean,
    paidAt: row.paid_at as string | null,
  };
}
