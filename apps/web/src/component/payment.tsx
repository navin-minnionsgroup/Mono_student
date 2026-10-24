import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type Props = {
  studentId: number;
};

export default function PayButton({ studentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Could not start payment");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = result.action;

      for (const [name, value] of Object.entries(
        result.fields as Record<string, string>,
      )) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment could not start",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handlePayment} disabled={loading}>
        {loading ? "Redirecting..." : "Pay ₹200 registration fee"}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}