import type { PaymentStatus } from "@/types/order";

type PaymentBadgeProps = {
  status: PaymentStatus;
};

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; classes: string }> =
  {
    unpaid: { label: "Unpaid", classes: "bg-amber-50 text-amber-700" },
    paid: { label: "Paid", classes: "bg-green-50 text-green-700" },
    "due-on-delivery": { label: "Due on delivery", classes: "bg-amber-50 text-amber-700" },
    "due-on-collection": { label: "Due on collection", classes: "bg-amber-50 text-amber-700" },
    refunded: { label: "Refunded", classes: "bg-neutral-100 text-neutral-700" },
  };

export function PaymentBadge({ status }: PaymentBadgeProps) {
  const style = PAYMENT_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.classes}`}
    >
      {style.label}
    </span>
  );
}
