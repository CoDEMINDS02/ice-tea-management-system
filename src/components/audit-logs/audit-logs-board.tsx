"use client";

import Link from "next/link";
import { useState } from "react";

import { useOrders } from "@/components/orders/orders-provider";
import { AUDIT_ACTION_LABELS } from "@/lib/audit-log";
import { formatDateTime } from "@/lib/format";
import type { AuditAction } from "@/types/audit-log";

type ActionFilter = AuditAction | "all";

const ACTION_FILTERS: ActionFilter[] = [
  "all",
  "order_created",
  "status_changed",
  "payment_recorded",
  "refund_processed",
  "demo_data_reset",
];

const ACTION_STYLES: Record<AuditAction, string> = {
  order_created: "bg-blue-50 text-blue-700",
  status_changed: "bg-amber-50 text-amber-700",
  payment_recorded: "bg-brand-50 text-brand-700",
  refund_processed: "bg-red-50 text-red-700",
  demo_data_reset: "bg-neutral-100 text-neutral-700",
};

export function AuditLogsBoard() {
  const { auditLogs } = useOrders();
  const [filter, setFilter] = useState<ActionFilter>("all");

  const visible =
    filter === "all"
      ? auditLogs
      : auditLogs.filter((log) => log.action === filter);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {ACTION_FILTERS.map((value) => {
          const count =
            value === "all"
              ? auditLogs.length
              : auditLogs.filter((log) => log.action === value).length;
          const active = filter === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {value === "all" ? "All" : AUDIT_ACTION_LABELS[value]} ({count})
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-neutral-500">
        {visible.length} of {auditLogs.length} entries, newest first
      </p>

      {auditLogs.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">
            No activity recorded yet. Create an order or change an order status
            and it will appear here.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">
            No entries for this action.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-3 text-sm font-medium text-brand-600 hover:underline"
          >
            Show all entries
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Action</th>
                <th className="pb-2 pr-4 font-medium">Order</th>
                <th className="pb-2 pr-4 font-medium">Details</th>
                <th className="pb-2 font-medium">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visible.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap py-3 pr-4 text-neutral-500">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_STYLES[log.action]}`}
                    >
                      {AUDIT_ACTION_LABELS[log.action]}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {log.orderId && log.orderNumber ? (
                      <Link
                        href={`/orders/${log.orderId}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {log.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-neutral-700">
                    {log.description}
                  </td>
                  <td className="whitespace-nowrap py-3 text-neutral-700">
                    {log.actor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-400">
        Demo only. Logs are saved in this browser, and the latest 500 entries
        are kept. There is no real login, so every action is recorded as the
        demo admin.
      </p>
    </div>
  );
}
