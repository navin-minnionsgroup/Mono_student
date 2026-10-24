export default function PaymentResult() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const txnid = params.get("txnid");

  return (
    <main>
      <h1>
        {status === "success"
          ? "Payment successful"
          : status === "failed"
            ? "Payment failed"
            : "Payment status pending"}
      </h1>

      <p>Transaction ID: {txnid ?? "Not provided"}</p>

      {status === "pending" && (
        <p>
          We could not confirm the payment yet. Check the payment status
          before attempting another payment.
        </p>
      )}

      <a href="/">Return to students</a>
    </main>
  );
}