import { Router } from "express";
import { supabaseAdmin } from "../db/supabase";
import { CustomerRegistrationData } from "../types";

const router = Router();

router.post("/register", async (req: any, res: any): Promise<void> => {
  try {
    const { name, email, cpf, phone, address, city, state, zipCode } =
      req.body as CustomerRegistrationData;

    if (!name || !email || !cpf || !phone) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existing = await supabaseAdmin.from("customers").select("id").eq("email", email).single();

    if (existing.data) {
      res.status(409).json({ error: "Customer already exists" });
      return;
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password: email,
      options: {
        data: { name, cpf, phone },
      },
    });

    if (authError || !authUser.user) {
      res.status(500).json({ error: authError?.message ?? "Failed to create account" });
      return;
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        auth_id: authUser.user.id,
        name,
        email,
        cpf,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        role: "customer",
      })
      .select()
      .single();

    if (customerError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      res.status(500).json({ error: customerError.message });
      return;
    }

    const { data: tokenData } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: email,
    });

    const token = tokenData?.session?.access_token ?? "";

    res.status(201).json({ token, customer });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: any, res: any): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("auth_id", signInData.user.id)
      .single();

    if (customerError || !customer) {
      res.status(401).json({ error: "Customer not found" });
      return;
    }

    const token = signInData.session.access_token;

    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/login", async (req: any, res: any): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("auth_id", signInData.user.id)
      .single();

    if (customerError || !customer) {
      res.status(401).json({ error: "Customer not found" });
      return;
    }

    if (customer.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const token = signInData.session.access_token;

    res.json({ token, customer });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
