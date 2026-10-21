"use client";

import { useOrders } from "@/components/orders/orders-provider";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/order-labels";
import type { Order } from "@/types/order";

function SummaryCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-neutral-500">{note}</p>
    </div>
  );
}

function countItems(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function ComplimentaryBoard() {
  const { orders } = useOrders();

  const free = orders
    .filter((order) => order.isComplimentary)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Cancelled orders never left the kitchen, so they are not counted.
  const given = free.filter((order) => order.status !== "cancelled");
  const valueGiven = given.reduce((sum, order) => sum + order.subtotal, 0);
  const itemsGiven = given.reduce((sum, order) => sum + countItems(order), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Free orders"
          value={given.length}
          note="Cancelled orders are not counted"
        />
        <SummaryCard
          title="Value given away"
          value={formatCurrency(valueGiven)}
          note="At the normal menu price"
        />
        <SummaryCard
          title="Items given"
          value={itemsGiven}
          note="Total pieces served free"
        />
      </div>

      {free.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-500">
          No complimentary orders yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {free.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900">
                    {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-700">
                    {order.customerName}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {TYPE_LABELS[order.type]} · {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <ul className="mt-3 divide-y divide-neutral-100 border-t border-neutral-100 text-sm">
                {order.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="text-neutral-800">
                      <span className="mr-2 font-semibold text-neutral-900">
                        {item.quantity}x
                      </span>
                      {item.name}
                    </span>
                    <span className="text-neutral-500">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.notes ? (
                <p className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                  {order.notes}
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
                <span className="text-neutral-500">
                  Menu value{" "}
                  <span className="text-neutral-900 line-through">
                    {formatCurrency(order.subtotal)}
                  </span>
                </span>
                <span className="font-semibold text-neutral-900">
                  Charged {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
