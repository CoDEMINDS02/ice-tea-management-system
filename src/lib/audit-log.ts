import type { AuditAction, AuditLog } from "@/types/audit-log";
import type { Order } from "@/types/order";

/** Change the version suffix if the AuditLog type changes. */
export const AUDIT_STORAGE_KEY = "iced-tea-house:audit-logs:v1";

/** There is no real login in this demo, so every action is by the demo admin. */
export const AUDIT_ACTOR = "Demo Admin";

/** Only the newest entries are kept, so browser storage never fills up. */
const MAX_LOGS = 500;

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  order_created: "Order created",
  status_changed: "Status changed",
  payment_recorded: "Payment recorded",
  refund_processed: "Refund processed",
  demo_data_reset: "Demo data reset",
};

const AUDIT_ACTIONS = Object.keys(AUDIT_ACTION_LABELS) as AuditAction[];

/** "preparing" -> "Preparing" */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Basic shape check so broken saved data never reaches the UI. */
function isAuditLog(value: unknown): value is AuditLog {
  if (typeof value !== "object" || value === null) return false;

  const log = value as Partial<AuditLog>;

  return (
    typeof log.id === "string" &&
    typeof log.action === "string" &&
    AUDIT_ACTIONS.includes(log.action) &&
    typeof log.description === "string" &&
    typeof log.actor === "string" &&
    typeof log.createdAt === "string"
  );
}

/** Saved logs if they look valid, otherwise an empty list. */
export function loadAuditLogs(): AuditLog[] {
  try {
    const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.every(isAuditLog)) {
        return parsed;
      }
    }
  } catch {
    // Storage blocked or data corrupted: start with an empty log.
  }

  return [];
}

/** Builds one log entry stamped with the current time. */
export function createAuditLog(
  action: AuditAction,
  description: string,
  order?: Order,
): AuditLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    description,
    orderId: order?.id,
    orderNumber: order?.orderNumber,
    actor: AUDIT_ACTOR,
    createdAt: new Date().toISOString(),
  };
}

/** Puts the new entry first and drops the oldest ones beyond the limit. */
export function addAuditLog(logs: AuditLog[], entry: AuditLog): AuditLog[] {
  return [entry, ...logs].slice(0, MAX_LOGS);
}
