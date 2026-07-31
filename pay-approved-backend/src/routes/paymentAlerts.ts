import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { notificationService } from "../services/notificationService";

const router = Router();

router.get("/", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const alerts = await notificationService.getPaymentAlertsByCustomerId(req.user.id);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { contractId, title, message } = req.body as {
      contractId: string;
      title: string;
      message: string;
    };

    if (!contractId || !title || !message) {
      res.status(400).json({ error: "contractId, title, and message are required" });
      return;
    }

    await notificationService.sendPushNotification(req.user.id, title, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
