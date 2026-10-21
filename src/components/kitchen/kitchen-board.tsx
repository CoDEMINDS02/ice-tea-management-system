"use client";

import { useOrders } from "@/components/orders/orders-provider";
import { formatTime } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/order-labels";
import { ACTION_LABELS, NEXT_STATUS } from "@/lib/order-workflow";
import type { Order, OrderStatus } from "@/types/order";

const COLUMNS: { status: OrderStatus; title: string; dot: string }[] = [
  { status: "pending", title: "Pending", dot: "bg-amber-500" },
  { status: "preparing", title: "Preparing", dot: "bg-blue-500" },
  { status: "ready", title: "Ready", dot: "bg-violet-500" },
];

function KitchenCard({
  order,
  onAdvance,
}: {
  order: Order;
  onAdvance: (status: OrderStatus) => void;
}) {
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-900">{order.orderNumber}</p>
          <p className="mt-0.5 text-sm text-neutral-500">
            {order.customerName}
          </p>
        </div>
        <div className="text-right text-xs text-neutral-500">
          <p>{formatTime(order.createdAt)}</p>
          <p className="mt-0.5">{TYPE_LABELS[order.type]}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-sm">
        {order.items.map((item) => (
          <li key={item.productId} className="flex gap-2 text-neutral-800">
            <span className="w-6 shrink-0 font-semibold text-neutral-900">
              {item.quantity}x
            </span>
            <span>
              {item.name}
              {item.ice ? ` · ${item.ice} ice` : ""}
              {item.bobas ? ` · ${item.bobas} bobas` : ""}
              {item.instructions ? ` · ${item.instructions}` : ""}
            </span>
          </li>
        ))}
      </ul>

      {order.notes ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {order.notes}
        </p>
      ) : null}

      {nextStatus ? (
        <button
          type="button"
          onClick={() => onAdvance(nextStatus)}
          className="mt-4 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {ACTION_LABELS[nextStatus] ?? "Update status"}
        </button>
      ) : null}
    </div>
  );
}

export function KitchenBoard() {
  const { orders, updateOrderStatus } = useOrders();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const columnOrders = orders
          .filter((order) => order.status === column.status)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        return (
          <section
            key={column.status}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${column.dot}`}
                  aria-hidden="true"
                />
                {column.title}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600">
                {columnOrders.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {columnOrders.length === 0 ? (
                <p className="rounded-lg border border-dashed border-neutral-300 px-3 py-6 text-center text-sm text-neutral-500">
                  Nothing here
                </p>
              ) : (
                columnOrders.map((order) => (
                  <KitchenCard
                    key={order.id}
                    order={order}
                    onAdvance={(status) => updateOrderStatus(order.id, status)}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
