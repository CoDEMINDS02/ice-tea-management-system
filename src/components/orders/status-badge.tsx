import type { OrderStatus } from "@/types/order";

type StatusBadgeProps = {
  status: OrderStatus;
};

const STATUS_STYLES: Record<OrderStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700" },
  preparing: { label: "Preparing", classes: "bg-blue-50 text-blue-700" },
  ready: { label: "Ready", classes: "bg-violet-50 text-violet-700" },
  completed: { label: "Completed", classes: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-700" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.classes}`}
    >
      {style.label}
    </span>
  );
}