import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { documentService } from "../services/documentService";
import { contractService } from "../services/contractService";
import { upload } from "../middleware/upload";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  async (req: any, res: any): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { contractId } = req.body as { contractId: string };
      if (!contractId) {
        res.status(400).json({ error: "contractId is required" });
        return;
      }

      const document = await documentService.upload(contractId, req.file, req.file.originalname);
      res.status(201).json(document);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user.role === "admin") {
      const documents = await documentService.getPending();
      res.json(documents);
      return;
    }

    const contracts = await contractService.getByCustomerId(req.user.id);
    if (contracts.length === 0) {
      res.json([]);
      return;
    }

    const documents = await documentService.getByContractId(contracts[0].id);
    res.json(documents);
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

    const document = await documentService.getById(req.params.id);
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/status", authMiddleware, async (req: any, res: any): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { status } = req.body as { status: "approved" | "rejected" };
    if (!status || !["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "Status must be approved or rejected" });
      return;
    }

    const document = await documentService.updateStatus(req.params.id, status);
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
