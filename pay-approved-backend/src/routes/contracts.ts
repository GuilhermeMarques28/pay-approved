import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { contractService } from "../services/contractService";

const router = Router();

router.get("/", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const contracts = await contractService.getByCustomerId(req.user.id);
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const contract = await contractService.getById(req.params.id);
    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    if (req.user.role !== "admin" && contract.customerId !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { contractName, totalAmount, installments, dueDay } = req.body as {
      contractName: string;
      totalAmount: number;
      installments: number;
      dueDay: number;
    };

    if (!contractName || !totalAmount || !installments || !dueDay) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const contract = await contractService.create(req.user.id, {
      contractName,
      totalAmount,
      installments,
      dueDay,
    });

    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/sign", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const contract = await contractService.getById(req.params.id);
    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    if (req.user.role !== "admin" && contract.customerId !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const signed = await contractService.sign(req.params.id);
    if (!signed) {
      res.status(500).json({ error: "Failed to sign contract" });
      return;
    }

    res.json(signed);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/installments", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const contract = await contractService.getById(req.params.id);
    if (!contract) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    if (req.user.role !== "admin" && contract.customerId !== req.user.id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const installments = await contractService.getInstallments(req.params.id);
    res.json(installments);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
