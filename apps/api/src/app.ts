
import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import studentRoutes from "./modules/students/student.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import { sql } from "drizzle-orm";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Student API is running",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);

    res.json({
      success: true,
      message: "MySQL connection is working",
    });
  } catch (error) {
    console.error(error);

    res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
});

app.use("/api/students", studentRoutes);

app.use("/api/payments", paymentRoutes);

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
