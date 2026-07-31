import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../db/supabase";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("id, email, role")
    .eq("auth_id", user.id)
    .single();

  if (customerError || !customer) {
    res.status(401).json({ error: "Customer not found" });
    return;
  }

  req.user = {
    id: customer.id,
    email: customer.email,
    role: customer.role as "admin" | "customer",
  };

  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
