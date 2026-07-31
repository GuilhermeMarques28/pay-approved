import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { validateEnv } from "./config/env";
import { startScheduler } from "./scheduler/alertScheduler";
import authRoutes from "./routes/auth";
import customerRoutes from "./routes/customers";
import contractRoutes from "./routes/contracts";
import documentRoutes from "./routes/documents";
import adminRoutes from "./routes/admin";
import paymentAlertRoutes from "./routes/paymentAlerts";

validateEnv();

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// CORS configuration
const allowedOrigins = env.allowedOrigins
  ? env.allowedOrigins.split(",").map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin:
      env.nodeEnv === "production"
        ? (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          }
        : true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment-alerts", paymentAlertRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Pay Approved Backend running on port ${PORT}`);
  startScheduler();
});
