"use client";

import { useState, type ReactNode } from "react";

import { useOrders } from "@/components/orders/orders-provider";
import { PaymentBadge } from "@/components/orders/payment-badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { METHOD_LABELS } from "@/lib/order-labels";
import { canMarkPaid, needsRefund } from "@/lib/payment-workflow";
import type { Order } from "@/types/order";

function sumTotals(list: Order[]): number {
  return list.reduce((sum, order) => sum + order.total, 0);
}

function newestFirst(list: Order[]): Order[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function SummaryCard({
  title,
  amount,
  note,
}: {
  title: string;
  amount: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        {formatCurrency(amount)}
      </p>
      <p className="mt-1 text-sm text-neutral-500">{note}</p>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-500">{count}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function OrderLine({
  order,
  action,
}: {
  order: Order;
  action?: ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium text-neutral-900">
          {order.orderNumber}
          <span className="ml-2 font-normal text-neutral-500">
            {order.customerName}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {METHOD_LABELS[order.paymentMethod]} · {formatDateTime(order.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="w-24 text-right font-medium text-neutral-900">
          {formatCurrency(order.total)}
        </span>
        {action}
      </div>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-neutral-300 px-3 py-6 text-center text-sm text-neutral-500">
      {text}
    </p>
  );
}

export function PaymentsBoard() {
  const { orders, markOrderPaid, refundOrder } = useOrders();
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const unpaid = newestFirst(orders.filter(canMarkPaid));
  const refunds = newestFirst(orders.filter(needsRefund));
  const history = newestFirst(
    orders.filter(
      (order) =>
        (order.paymentStatus === "paid" || order.paymentStatus === "refunded") &&
        !needsRefund(order),
    ),
  );

  const collected = sumTotals(
    orders.filter(
      (order) => order.paymentStatus === "paid" && order.status !== "cancelled",
    ),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Collected"
          amount={collected}
          note="Paid orders that are not cancelled"
        />
        <SummaryCard
          title="Outstanding"
          amount={sumTotals(unpaid)}
          note="Unpaid orders still to collect"
        />
        <SummaryCard
          title="Refund due"
          amount={sumTotals(refunds)}
          note="Cancelled orders that were paid"
        />
      </div>

      <Section title="Unpaid orders" count={unpaid.length}>
        {unpaid.length === 0 ? (
          <Empty text="No unpaid orders." />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {unpaid.map((order) => (
              <OrderLine
                key={order.id}
                order={order}
                action={
                  <button
                    type="button"
                    onClick={() => markOrderPaid(order.id)}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Mark as paid
                  </button>
                }
              />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Needs refund" count={refunds.length}>
        {refunds.length === 0 ? (
          <Empty text="No refunds due." />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {refunds.map((order) => (
              <OrderLine
                key={order.id}
                order={order}
                action={
                  refundingId === order.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          refundOrder(order.id);
                          setRefundingId(null);
                        }}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Yes, refund
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefundingId(null)}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRefundingId(order.id)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Refund
                    </button>
                  )
                }
              />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Recent payments" count={history.length}>
        {history.length === 0 ? (
          <Empty text="No payments yet." />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {history.map((order) => (
              <OrderLine key={order.id} order={order} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
