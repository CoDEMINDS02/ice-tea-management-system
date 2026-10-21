import { PaymentsBoard } from "@/components/payments/payments-board";

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Payments</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Collect unpaid orders and refund cancelled ones.
        </p>
      </div>

      <PaymentsBoard />
    </div>
  );
}
