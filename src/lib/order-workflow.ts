import type { OrderStatus } from "@/types/order";

/** The next step in the normal flow. Completed and cancelled are the end. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
  completed: null,
  cancelled: null,
};

/** Button text for moving an order INTO each status. */
export const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  preparing: "Start preparing",
  ready: "Mark as ready",
  completed: "Mark as completed",
};

/** Only orders that are still being worked on can be cancelled. */
export function canCancel(status: OrderStatus): boolean {
  return status === "pending" || status === "preparing" || status === "ready";
}

/** True if an order may move from one status to another. */
export function canMove(from: OrderStatus, to: OrderStatus): boolean {
  if (to === "cancelled") return canCancel(from);

  return NEXT_STATUS[from] === to;
}
