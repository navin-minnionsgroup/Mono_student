import { createHash, timingSafeEqual } from "node:crypto";

export function sha512(value: string): string {
  return createHash("sha512").update(value).digest("hex");
}

export function safeHashEqual(
  expected: string,
  received: string,
): boolean {
  if (!/^[a-f0-9]{128}$/i.test(received)) return false;

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(received, "hex");

  return a.length === b.length && timingSafeEqual(a, b);
}

export function createPaymentHash(
  fields: Record<string, string>,
  salt: string,
): string {
  const input = [
    fields.key,
    fields.txnid,
    fields.amount,
    fields.productinfo,
    fields.firstname,
    fields.email,
    fields.udf1 ?? "",
    fields.udf2 ?? "",
    fields.udf3 ?? "",
    fields.udf4 ?? "",
    fields.udf5 ?? "",
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");

  return sha512(input);
}

export function verifyCallbackHash(
  body: Record<string, string>,
  salt: string,
  merchantKey: string,
): boolean {
  if (!body.hash || !body.status || !body.txnid) return false;
  if (body.key !== merchantKey) return false;

  const input = [
    ...(body.additionalCharges ? [body.additionalCharges] : []),
    salt,
    body.status,
    "",
    "",
    "",
    "",
    "",
    body.udf5 ?? "",
    body.udf4 ?? "",
    body.udf3 ?? "",
    body.udf2 ?? "",
    body.udf1 ?? "",
    body.email ?? "",
    body.firstname ?? "",
    body.productinfo ?? "",
    body.amount ?? "",
    body.txnid,
    body.key,
  ].join("|");

  return safeHashEqual(sha512(input), body.hash);
}

export async function verifyWithPayU(txnid: string) {
  const key = process.env.PAYU_MERCHANT_KEY!;
  const salt = process.env.PAYU_MERCHANT_SALT!;
  const isTest = process.env.PAYU_ENV !== "production";

  const hash = sha512(`${key}|verify_payment|${txnid}|${salt}`);

  const form = new URLSearchParams({
    key,
    command: "verify_payment",
    var1: txnid,
    hash,
  });

  const response = await fetch(
    isTest
      ? "https://test.payu.in/merchant/postservice.php?form=2"
      : "https://info.payu.in/merchant/postservice.php?form=2",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    },
  );

  if (!response.ok) {
    throw new Error(`PayU verification HTTP ${response.status}`);
  }

  return response.json() as Promise<Record<string, any>>;
}