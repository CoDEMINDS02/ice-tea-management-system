"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { OrderDetailPanel } from "@/components/orders/order-detail-panel";
import { useOrders } from "@/components/orders/orders-provider";
import { PaymentBadge } from "@/components/orders/payment-badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { METHOD_LABELS, TYPE_LABELS } from "@/lib/order-labels";
import type { Order, OrderStatus, OrderType } from "@/types/order";

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

/** True if the order number, customer name or phone contains the search text. */
function matchesSearch(order: Order, query: string): boolean {
  if (!query) return true;

  const text = query.toLowerCase();
  const digits = text.replace(/\D/g, "");

  if (order.orderNumber.toLowerCase().includes(text)) return true;
  if (order.customerName.toLowerCase().includes(text)) return true;

  if (order.customerPhone) {
    if (order.customerPhone.toLowerCase().includes(text)) return true;
    if (digits && order.customerPhone.replace(/\D/g, "").includes(digits)) {
      return true;
    }
  }

  return false;
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

export function OrdersTable() {
  const { orders, updateOrderStatus } = useOrders();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = search.trim();

  const sorted = [...orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const visible = sorted.filter(
    (order) =>
      matchesSearch(order, query) &&
      (statusFilter === "all" || order.status === statusFilter) &&
      (typeFilter === "all" || order.type === typeFilter),
  );

  // Looked up in the full list, so the panel stays open even if a status
  // change makes the order drop out of the filtered table behind it.
  const selectedOrder = orders.find((order) => order.id === selectedId);

  const isFiltered =
    query !== "" || statusFilter !== "all" || typeFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order number, customer or phone"
          aria-label="Search orders"
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
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
            No orders match your search or filters.
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
                  <tr
                    key={order.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`View order ${order.orderNumber}`}
                    onClick={() => setSelectedId(order.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(order.id);
                      }
                    }}
                    className="cursor-pointer hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
                  >
                                        <td className="py-3 pr-4 font-medium text-neutral-900">
                      <Link
                        href={`/orders/${order.id}`}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        aria-label={`Open details page for order ${order.orderNumber}`}
                        className="text-brand-700 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
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

      {selectedOrder ? (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedId(null)}
          onStatusChange={(status) =>
            updateOrderStatus(selectedOrder.id, status)
          }
        />
      ) : null}
    </div>
  );
}
