import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import { adminService } from "../services/adminService";
import { documentService } from "../services/documentService";
import { contractService } from "../services/contractService";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  requireAdmin,
  async (req: any, res: any): Promise<void> => {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/customers",
  authMiddleware,
  requireAdmin,
  async (req: any, res: any): Promise<void> => {
    try {
      const customers = await adminService.getAllCustomers();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/contracts",
  authMiddleware,
  requireAdmin,
  async (req: any, res: any): Promise<void> => {
    try {
      const contracts = await adminService.getAllContracts();
      res.json(contracts);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/contracts/:id/installments",
  authMiddleware,
  requireAdmin,
  async (req: any, res: any): Promise<void> => {
    try {
      const installments = await contractService.getInstallments(req.params.id);
      res.json(installments);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.put(
  "/documents/:id/status",
  authMiddleware,
  requireAdmin,
  async (req: any, res: any): Promise<void> => {
    try {
      const { status } = req.body as { status: "approved" | "rejected" };
      const document = await documentService.updateStatus(req.params.id, status);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      res.json(document);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get(
  "/documents/pending",
  authMiddleware,
  requireAdmin,
  async (req: any, res: any): Promise<void> => {
    try {
      const documents = await documentService.getPending();
      res.json(documents);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
