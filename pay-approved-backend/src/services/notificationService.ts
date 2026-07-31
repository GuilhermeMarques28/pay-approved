import axios from "axios";
import { supabaseAdmin } from "../db/supabase";
import { PaymentAlert } from "../types";
import { env } from "../config/env";

export const notificationService = {
  async sendPushNotification(customerId: string, title: string, message: string): Promise<void> {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (!customer) {
      return;
    }

    await supabaseAdmin.from("payment_alerts").insert({
      contract_id: (customer as Record<string, unknown>).id as string,
      customer_id: customerId,
      title,
      message,
      due_date: new Date().toISOString().split("T")[0],
      amount: 0,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  },

  async sendExpoPushNotification(pushToken: string, title: string, body: string): Promise<void> {
    if (!env.expoPushNotificationApiKey) {
      console.warn("EXPO_PUSH_NOTIFICATION_API_KEY not configured");
      return;
    }

    try {
      await axios.post(
        "https://exp.host/--api/v2/push/send",
        {
          to: pushToken,
          title,
          body,
          data: { type: "payment_alert" },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.expoPushNotificationApiKey}`,
          },
        },
      );
    } catch (err) {
      console.error("Failed to send push notification:", err);
    }
  },

  async getPaymentAlertsByCustomerId(customerId: string): Promise<PaymentAlert[]> {
    const { data, error } = await supabaseAdmin
      .from("payment_alerts")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payment alerts: ${error.message}`);
    }
    return (data ?? []).map(mapAlertRow);
  },

  async schedulePaymentAlerts(): Promise<void> {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: contracts, error } = await supabaseAdmin
      .from("contracts")
      .select(`
        id,
        customer_id,
        contract_name,
        total_amount,
        installments,
        due_day,
        next_due_date
      `)
      .eq("status", "active")
      .lte("next_due_date", tomorrowStr)
      .gte("next_due_date", todayStr);

    if (error) {
      console.error("Failed to fetch contracts for alerts:", error.message);
      return;
    }

    for (const contract of contracts ?? []) {
      const contractData = contract as unknown as Record<string, unknown>;
      const customerId = contractData.customer_id as string;
      const nextDueDate = contractData.next_due_date as string;
      const totalAmount = parseFloat(contractData.total_amount as string);
      const installments = contractData.installments as number;

      const { data: installmentsData, error: instError } = await supabaseAdmin
        .from("installments")
        .select("*")
        .eq("contract_id", contractData.id)
        .eq("paid", false)
        .lte("due_date", nextDueDate)
        .order("due_date", { ascending: true })
        .limit(1);

      if (instError || !installmentsData || installmentsData.length === 0) {
        continue;
      }

      const installment = installmentsData[0];
      const amount = parseFloat(installment.amount as string);
      const dueDate = installment.due_date as string;

      const title = "Lembrete de Pagamento";
      const message = `Seu pagamento de R$ ${amount.toFixed(2)} referente à parcela ${installment.installment_number} de ${installments} vence em ${dueDate}. Contrato: ${contractData.contract_name}`;

      await this.sendPushNotification(customerId, title, message);

      await supabaseAdmin.from("payment_alerts").insert({
        contract_id: contractData.id as string,
        customer_id: customerId,
        title,
        message,
        due_date: dueDate,
        amount,
        status: "pending",
      });
    }
  },
};

function mapAlertRow(row: Record<string, unknown>): PaymentAlert {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    customerId: row.customer_id as string,
    title: row.title as string,
    message: row.message as string,
    dueDate: row.due_date as string,
    amount: parseFloat(row.amount as string),
    status: row.status as PaymentAlert["status"],
    sentAt: row.sent_at as string | null,
    createdAt: row.created_at as string,
  };
}
