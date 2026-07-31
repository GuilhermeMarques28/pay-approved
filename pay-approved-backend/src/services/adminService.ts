import { supabaseAdmin } from "../db/supabase";
import { AdminStats, DashboardStats, Customer, Contract } from "../types";

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { count: totalCustomers } = await supabaseAdmin
      .from("customers")
      .select("*", { count: "exact", head: true });

    const { count: activeContracts } = await supabaseAdmin
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: overdueContracts } = await supabaseAdmin
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("status", "overdue");

    const { count: pendingDocuments } = await supabaseAdmin
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    return {
      totalCustomers: totalCustomers ?? 0,
      activeContracts: activeContracts ?? 0,
      overdueContracts: overdueContracts ?? 0,
      pendingDocuments: pendingDocuments ?? 0,
    };
  },

  async getDashboardStats(customerId: string): Promise<DashboardStats> {
    const { data: contracts, error } = await supabaseAdmin
      .from("contracts")
      .select("*")
      .eq("customer_id", customerId)
      .eq("status", "active");

    if (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }

    const totalContracts = contracts?.length ?? 0;
    const activeContracts = contracts?.filter((c) => c.status === "active").length ?? 0;
    const totalDebt =
      contracts?.reduce(
        (sum, c) =>
          sum +
          parseFloat(c.total_amount as string) * (c.installments - (c.paid_installments as number)),
        0,
      ) ?? 0;

    const nextPayment = contracts?.[0]?.next_due_date ?? "";

    return {
      totalContracts,
      activeContracts,
      totalDebt,
      nextPayment,
    };
  },

  async getAllCustomers(): Promise<Customer[]> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
    return (data ?? []).map(mapCustomerRow);
  },

  async getAllContracts(): Promise<Contract[]> {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }
    return (data ?? []).map(mapContractRow);
  },
};

function mapCustomerRow(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    cpf: row.cpf as string,
    phone: row.phone as string,
    address: row.address as string,
    city: row.city as string,
    state: row.state as string,
    zipCode: row.zip_code as string,
    locationLat: row.location_lat as number | null,
    locationLng: row.location_lng as number | null,
    createdAt: row.created_at as string,
  };
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
