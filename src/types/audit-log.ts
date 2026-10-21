export type AuditAction =
  | "order_created"
  | "status_changed"
  | "payment_recorded"
  | "refund_processed"
  | "demo_data_reset";

export type AuditLog = {
  id: string;
  action: AuditAction;
  /** Short readable sentence shown in the log table. */
  description: string;
  /** The related order, when the action is about one. */
  orderId?: string;
  /** Order number at the time of the action, e.g. "ITH-1013". */
  orderNumber?: string;
  /**
   * Who did it. This demo has no real login, so it is always the demo admin.
   * A real backend would store the signed-in user here.
   */
  actor: string;
  /** ISO date string, e.g. "2026-10-20T07:36:00.000Z". */
  createdAt: string;
};
