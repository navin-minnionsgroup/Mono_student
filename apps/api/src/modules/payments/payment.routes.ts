import { Router } from "express";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { students, payments } from "../../db/schema";
import {
  createPaymentHash,
  verifyCallbackHash,
  verifyWithPayU,
} from "./payu";

const router = Router();

const AMOUNT = "200.00";
const PRODUCT_INFO = "Student Registration Fee";

function getPayUUrl() {
  return process.env.PAYU_ENV === "production"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";
}

function redirectToFrontend(
  res: Parameters<Parameters<typeof router.post>[1]>[1],
  status: string,
  txnid: string,
) {
  const frontendUrl =
    process.env.FRONTEND_URL ?? "http://localhost:5173";

  const url = new URL("/payment-result", frontendUrl);
  url.searchParams.set("status", status);
  url.searchParams.set("txnid", txnid);

  return res.redirect(303, url.toString());
}

// POST /api/payments/initiate
router.post("/initiate", async (req, res) => {
  try {
    const studentId = Number(req.body?.studentId);

    if (!Number.isSafeInteger(studentId) || studentId <= 0) {
      return res.status(400).json({
        message: "A valid studentId is required",
      });
    }

    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;
    const publicApiUrl = process.env.PUBLIC_API_URL;

    console.log(key, salt, publicApiUrl)

    if (!key || !salt || !publicApiUrl) {
      return res.status(500).json({
        message: "PayU environment configuration is incomplete",
      });
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.email || !student.name) {
      return res.status(400).json({
        message: "Student name and email are required for payment",
      });
    }

    // PayU requires a phone number for this checkout flow.
    if (!student.phoneNo) {
      return res.status(400).json({
        message: "Add a phone number to this student before payment",
      });
    }

    const txnid =
      `st${Date.now().toString(36)}${randomBytes(5).toString("hex")}`;

    console.log('txnid', txnid)
    await db.insert(payments).values({
      studentId,
      txnid,
      amount: AMOUNT,
      status: "pending",
    });

    const fields: Record<string, string> = {
      key,
      txnid,
      amount: AMOUNT,
      productinfo: PRODUCT_INFO,
      firstname: student.name.trim(),
      email: student.email,
      phone: student.phoneNo,
      surl: `${publicApiUrl}/api/payments/callback`,
      furl: `${publicApiUrl}/api/payments/callback`,
      udf1: String(studentId),
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
    };
    console.log('txnid2', txnid)
    fields.hash = createPaymentHash(fields, salt);

    return res.json({
      action: getPayUUrl(),
      fields,
    });
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return res.status(500).json({
      message: "Could not initiate payment",
    });
  }
});

// PayU POSTs URL-encoded callback data here.
router.post("/callback", async (req, res) => {
  const body = req.body as Record<string, string>;
  const txnid = body.txnid;

  if (!txnid) {
    return res.status(400).send("Missing transaction ID");
  }

  try {
    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;

    if (!key || !salt) {
      return res.status(500).send("PayU is not configured");
    }

    const validHash = verifyCallbackHash(body, salt, key);

    if (!validHash) {
      console.error("Invalid PayU callback hash", { txnid });
      return res.status(400).send("Invalid payment response");
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.txnid, txnid))
      .limit(1);

    if (!payment) {
      return res.status(404).send("Payment transaction not found");
    }

    // Do not trust the callback alone. Confirm transaction with PayU.
    const verification = await verifyWithPayU(txnid);
    const details = verification.transaction_details?.[txnid];

    const verifiedAmount = Number(details?.amt ?? details?.amount);
    const expectedAmount = Number(payment.amount);

    const confirmed =
      verification.status === 1 &&
      details?.status?.toLowerCase() === "success" &&
      Number.isFinite(verifiedAmount) &&
      verifiedAmount === expectedAmount &&
      details?.txnid === txnid;

    if (confirmed) {
      await db
        .update(payments)
        .set({
          status: "success",
          mihpayid: String(details.mihpayid ?? body.mihpayid ?? ""),
        })
        .where(eq(payments.txnid, txnid));

      return redirectToFrontend(res, "success", txnid);
    }

    // A failed/unconfirmed verification must never mark a payment as paid.
    if (
      verification.status === 1 &&
      details?.status &&
      details.status.toLowerCase() !== "success"
    ) {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.txnid, txnid));

      return redirectToFrontend(res, "failed", txnid);
    }

    // PayU couldn't confirm it; leave it pending for reconciliation.
    return redirectToFrontend(res, "pending", txnid);
  } catch (error) {
    console.error("PayU callback processing failed:", error);

    // Don't mark the payment failed just because verification had an error.
    return redirectToFrontend(res, "pending", txnid);
  }
});

export default router;