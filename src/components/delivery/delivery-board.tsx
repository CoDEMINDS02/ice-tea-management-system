"use client";

import { useOrders } from "@/components/orders/orders-provider";
import { PaymentBadge } from "@/components/orders/payment-badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { METHOD_LABELS } from "@/lib/order-labels";
import { ACTION_LABELS, NEXT_STATUS } from "@/lib/order-workflow";
import type { Order, OrderStatus } from "@/types/order";

const ACTIVE: OrderStatus[] = ["pending", "preparing", "ready"];

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}

function DeliveryCard({
  order,
  onAdvance,
}: {
  order: Order;
  onAdvance: (status: OrderStatus) => void;
}) {
  const nextStatus = NEXT_STATUS[order.status];
  const buttonLabel =
    nextStatus === "completed"
      ? "Mark as delivered"
      : nextStatus
        ? (ACTION_LABELS[nextStatus] ?? "Update status")
        : "";
  const collectCash =
    order.paymentMethod === "cash" &&
    order.paymentStatus === "unpaid" &&
    !order.isComplimentary;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-900">{order.orderNumber}</p>
          <p className="mt-0.5 text-sm text-neutral-700">
            {order.customerName}
          </p>
          {order.customerPhone ? (
            <p className="text-xs text-neutral-500">{order.customerPhone}</p>
          ) : null}
        </div>
        <div className="text-right text-xs text-neutral-500">
          <p>{formatDateTime(order.createdAt)}</p>
          <p className="mt-0.5">{METHOD_LABELS[order.paymentMethod]}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm">
        {order.items.map((item) => (
          <li key={item.productId} className="flex gap-2 text-neutral-800">
            <span className="w-6 shrink-0 font-semibold text-neutral-900">
              {item.quantity}x
            </span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>

      {order.notes ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {order.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="ml-auto font-medium text-neutral-900">
          {formatCurrency(order.total)}
        </span>
      </div>

      {collectCash ? (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Collect {formatCurrency(order.total)} cash on delivery
        </p>
      ) : null}

      {nextStatus ? (
        <button
          type="button"
          onClick={() => onAdvance(nextStatus)}
          className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {buttonLabel}
        </button>
      ) : null}
    </div>
  );
}

export function DeliveryBoard() {
  const { orders, updateOrderStatus } = useOrders();

  const deliveries = orders.filter((order) => order.type === "delivery");

  const active = deliveries
    .filter((order) => ACTIVE.includes(order.status))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const history = deliveries
    .filter((order) => !ACTIVE.includes(order.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const delivered = deliveries.filter((o) => o.status === "completed").length;
  const cancelled = deliveries.filter((o) => o.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Active deliveries" value={active.length} />
        <SummaryCard title="Delivered" value={delivered} />
        <SummaryCard title="Cancelled" value={cancelled} />
      </div>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">
            Active deliveries
          </h3>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600">
            {active.length}
          </span>
        </div>

        {active.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-neutral-300 px-3 py-6 text-center text-sm text-neutral-500">
            No active deliveries.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {active.map((order) => (
              <DeliveryCard
                key={order.id}
                order={order}
                onAdvance={(status) => updateOrderStatus(order.id, status)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-semibold text-neutral-900">History</h3>
          <p className="text-sm text-neutral-500">{history.length}</p>
        </div>

        {history.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No past deliveries.</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-100">
            {history.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">
                    {order.orderNumber}
                    <span className="ml-2 font-normal text-neutral-500">
                      {order.customerName}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {order.customerPhone ? `${order.customerPhone} · ` : ""}
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                  <span className="w-24 text-right font-medium text-neutral-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
