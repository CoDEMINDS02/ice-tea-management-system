"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useOrders } from "@/components/orders/orders-provider";
import { PaymentBadge } from "@/components/orders/payment-badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { METHOD_LABELS, TYPE_LABELS } from "@/lib/order-labels";
import { ACTION_LABELS, NEXT_STATUS, canCancel } from "@/lib/order-workflow";
import { canMarkPaid, needsRefund } from "@/lib/payment-workflow";

type OrderDetailViewProps = {
  orderId: string;
};

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{children}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/orders"
      className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to orders
    </Link>
  );
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { orders, updateOrderStatus, markOrderPaid, refundOrder } = useOrders();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackLink />
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-neutral-900">
            Order not found
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            This order does not exist, or the demo data was reset.
          </p>
          <Link
            href="/orders"
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            Go to all orders
          </Link>
        </div>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[order.status];
  const cancellable = canCancel(order.status);
  const showMarkPaid = canMarkPaid(order);
  const showRefund = needsRefund(order);
  const hasActions = Boolean(nextStatus) || cancellable || showMarkPaid || showRefund;

  const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
          {order.isComplimentary ? (
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
              Complimentary
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Left: items and notes */}
        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">
              Items ({pieces})
            </h3>
            <ul className="mt-2 divide-y divide-neutral-100">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-start justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{item.name}</p>
                    <p className="mt-0.5 text-neutral-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-neutral-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-2 border-t border-neutral-200 pt-2">
              <InfoRow label="Subtotal">
                {formatCurrency(order.subtotal)}
              </InfoRow>
              {order.discount ? (
                <InfoRow label="Discount">
                  - {formatCurrency(order.discount)}
                </InfoRow>
              ) : null}
              {order.deliveryFee ? (
                <InfoRow label="Delivery fee">
                  + {formatCurrency(order.deliveryFee)}
                </InfoRow>
              ) : null}
              <div className="flex items-center justify-between gap-4 py-2 text-base font-semibold">
                <dt className="text-neutral-900">Total</dt>
                <dd className="text-neutral-900">
                  {formatCurrency(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          {order.notes ? (
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">Notes</h3>
              <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                {order.notes}
              </p>
            </section>
          ) : null}
        </div>

        {/* Right: info and actions */}
        <aside className="space-y-6 lg:self-start">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">
              Order info
            </h3>
            <dl className="mt-2 divide-y divide-neutral-100">
              <InfoRow label="Customer">{order.customerName}</InfoRow>
              {order.customerPhone ? (
                <InfoRow label="Phone">{order.customerPhone}</InfoRow>
              ) : null}
              <InfoRow label="Type">{TYPE_LABELS[order.type]}</InfoRow>
              <InfoRow label="Payment method">
                {METHOD_LABELS[order.paymentMethod]}
              </InfoRow>
            </dl>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Actions</h3>

            {!hasActions ? (
              <p className="mt-2 text-sm text-neutral-500">
                This order is {order.status}. No further actions.
              </p>
            ) : confirmingCancel ? (
              <div className="mt-3">
                <p className="text-sm text-neutral-700">
                  Cancel order {order.orderNumber}? This cannot be undone.
                </p>
                {order.paymentStatus === "paid" ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    The payment is not refunded automatically.
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateOrderStatus(order.id, "cancelled");
                      setConfirmingCancel(false);
                    }}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Yes, cancel order
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(false)}
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Keep order
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {nextStatus ? (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                    className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    {ACTION_LABELS[nextStatus] ?? "Update status"}
                  </button>
                ) : null}
                {showMarkPaid ? (
                  <button
                    type="button"
                    onClick={() => markOrderPaid(order.id)}
                    className="w-full rounded-lg border border-brand-600 bg-white px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    Mark as paid
                  </button>
                ) : null}
                {showRefund ? (
                  <button
                    type="button"
                    onClick={() => refundOrder(order.id)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    Mark as refunded
                  </button>
                ) : null}
                {cancellable ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Cancel order
                  </button>
                ) : null}
              </div>
            )}

            <p className="mt-3 text-xs text-neutral-400">
              Demo only. No real payment is processed.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
