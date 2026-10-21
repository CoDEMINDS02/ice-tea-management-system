import type { Order } from "@/types/order";

/** An unpaid order that is still real (not cancelled, not free). */
export function canMarkPaid(order: Order): boolean {
  return (
    (order.paymentStatus === "unpaid" ||
      order.paymentStatus === "due-on-delivery" ||
      order.paymentStatus === "due-on-collection") &&
    order.status !== "cancelled" &&
    !order.isComplimentary
  );
}

/** A cancelled order whose money was already taken. */
export function needsRefund(order: Order): boolean {
  return order.status === "cancelled" && order.paymentStatus === "paid";
}
