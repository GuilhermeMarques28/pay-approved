import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { customerService } from "../services/customerService";

const router = Router();

router.get("/me", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const customer = await customerService.getById(req.user.id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me/location", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { latitude, longitude } = req.body as { latitude: number; longitude: number };

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: "latitude and longitude are required" });
      return;
    }

    const customer = await customerService.updateLocation(req.user.id, latitude, longitude);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
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

    const customer = await customerService.getById(req.params.id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const customers = await customerService.getAll();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
