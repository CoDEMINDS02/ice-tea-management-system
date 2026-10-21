"use client";

import { useState } from "react";

import { PaymentBadge } from "@/components/orders/payment-badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { METHOD_LABELS, TYPE_LABELS } from "@/lib/order-labels";
import type { Order, OrderStatus, OrderType } from "@/types/order";

type OrdersTableProps = {
  orders: Order[];
};

type StatusFilter = OrderStatus | "all";
type TypeFilter = OrderType | "all";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "dine-in", label: TYPE_LABELS["dine-in"] },
  { value: "takeaway", label: TYPE_LABELS.takeaway },
  { value: "delivery", label: TYPE_LABELS.delivery },
];

function countItems(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {label} ({count})
    </button>
  );
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const sorted = [...orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const visible = sorted.filter(
    (order) =>
      (statusFilter === "all" || order.status === statusFilter) &&
      (typeFilter === "all" || order.type === typeFilter),
  );

  const isFiltered = statusFilter !== "all" || typeFilter !== "all";

  function clearFilters() {
    setStatusFilter("all");
    setTypeFilter("all");
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Status
          </span>
          {STATUS_FILTERS.map((filter) => (
            <FilterButton
              key={filter.value}
              label={filter.label}
              count={
                filter.value === "all"
                  ? orders.length
                  : orders.filter((o) => o.status === filter.value).length
              }
              active={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Type
          </span>
          {TYPE_FILTERS.map((filter) => (
            <FilterButton
              key={filter.value}
              label={filter.label}
              count={
                filter.value === "all"
                  ? orders.length
                  : orders.filter((o) => o.type === filter.value).length
              }
              active={typeFilter === filter.value}
              onClick={() => setTypeFilter(filter.value)}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-neutral-500">
        {visible.length} of {orders.length} orders
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">
            No orders match these filters.
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Order</th>
                <th className="pb-2 pr-4 font-medium">Customer</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Items</th>
                <th className="pb-2 pr-4 font-medium">Payment</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 text-right font-medium">Total</th>
                <th className="pb-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visible.map((order) => {
                const itemCount = countItems(order);

                return (
                  <tr key={order.id}>
                    <td className="py-3 pr-4 font-medium text-neutral-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 pr-4 text-neutral-700">
                      {order.customerName}
                      {order.customerPhone ? (
                        <span className="block text-xs text-neutral-500">
                          {order.customerPhone}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-neutral-700">
                      {TYPE_LABELS[order.type]}
                    </td>
                    <td className="py-3 pr-4 text-neutral-700">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="block text-neutral-700">
                        {METHOD_LABELS[order.paymentMethod]}
                      </span>
                      <PaymentBadge status={order.paymentStatus} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 pr-4 text-right text-neutral-900">
                      {formatCurrency(order.total)}
                      {order.isComplimentary ? (
                        <span className="block text-xs text-neutral-500">
                          Complimentary
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 whitespace-nowrap text-neutral-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}