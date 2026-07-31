import { supabaseAdmin } from "../db/supabase";
import { Customer, CustomerRegistrationData } from "../types";

export const customerService = {
  async register(data: CustomerRegistrationData): Promise<Customer> {
    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .insert({
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register customer: ${error.message}`);
    }

    return mapCustomerRow(customer);
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin.from("customers").select("*").eq("id", id).single();

    if (error || !data) {
      return null;
    }
    return mapCustomerRow(data);
  },

  async getByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return null;
    }
    return mapCustomerRow(data);
  },

  async updateLocation(id: string, lat: number, lng: number): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .update({ location_lat: lat, location_lng: lng })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return null;
    }
    return mapCustomerRow(data);
  },

  async getByAuthId(authId: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error || !data) {
      return null;
    }
    return mapCustomerRow(data);
  },

  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
    return (data ?? []).map(mapCustomerRow);
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
