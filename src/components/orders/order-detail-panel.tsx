"use client";

import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";

import { PaymentBadge } from "@/components/orders/payment-badge";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { METHOD_LABELS, TYPE_LABELS } from "@/lib/order-labels";
import { ACTION_LABELS, NEXT_STATUS, canCancel } from "@/lib/order-workflow";
import type { Order, OrderStatus } from "@/types/order";

type OrderDetailPanelProps = {
  order: Order;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{children}</dd>
    </div>
  );
}

export function OrderDetailPanel({
  order,
  onClose,
  onStatusChange,
}: OrderDetailPanelProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const nextStatus = NEXT_STATUS[order.status];
  const cancellable = canCancel(order.status);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${order.orderNumber}`}
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {order.orderNumber}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open full page
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
            {order.isComplimentary ? (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                Complimentary
              </span>
            ) : null}
          </div>

          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Order info
            </h4>
            <dl className="mt-2 divide-y divide-neutral-100">
              <InfoRow label="Customer">{order.customerName}</InfoRow>
              {order.customerPhone ? (
                <InfoRow label="Phone">{order.customerPhone}</InfoRow>
              ) : null}
              {order.deliveryAddress ? (
                <InfoRow label="Address">{order.deliveryAddress}</InfoRow>
              ) : null}
              {order.deliveryInstructions ? (
                <InfoRow label="Delivery notes">{order.deliveryInstructions}</InfoRow>
              ) : null}
              <InfoRow label="Type">{TYPE_LABELS[order.type]}</InfoRow>
              <InfoRow label="Payment method">
                {METHOD_LABELS[order.paymentMethod]}
              </InfoRow>
            </dl>
          </section>

          <section>
            <h4 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Items
            </h4>
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
                    {item.ice || item.bobas || item.instructions ? (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {[item.ice && `${item.ice} ice`, item.bobas && `${item.bobas} bobas`, item.instructions]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-neutral-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-2 border-t border-neutral-200 pt-2">
              <InfoRow label="Subtotal">{formatCurrency(order.subtotal)}</InfoRow>
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
              {order.manualExtraCharge ? (
                <InfoRow label={order.manualExtraDescription || "Manual extra"}>
                  + {formatCurrency(order.manualExtraCharge)}
                </InfoRow>
              ) : null}
              <div className="flex items-center justify-between gap-4 py-2 text-base font-semibold">
                <dt className="text-neutral-900">Total</dt>
                <dd className="text-neutral-900">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.notes ? (
            <section>
              <h4 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Notes
              </h4>
              <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                {order.notes}
              </p>
            </section>
          ) : null}

          {order.isComplimentary ? (
            <section>
              <h4 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Complimentary approval</h4>
              <dl className="mt-2 divide-y divide-neutral-100">
                {order.complimentaryRecipient ? <InfoRow label="Recipient">{order.complimentaryRecipient}</InfoRow> : null}
                {order.complimentaryCampaign ? <InfoRow label="Campaign">{order.complimentaryCampaign}</InfoRow> : null}
                {order.complimentaryApprovedBy ? <InfoRow label="Approved by">{order.complimentaryApprovedBy}</InfoRow> : null}
                <InfoRow label="Regular value">{formatCurrency(order.subtotal)}</InfoRow>
              </dl>
            </section>
          ) : null}
        </div>

        <div className="border-t border-neutral-200 px-5 py-4">
          {!nextStatus && !cancellable ? (
            <p className="text-sm text-neutral-500">
              This order is {order.status}. No further status changes.
            </p>
          ) : confirmingCancel ? (
            <div>
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
                    onStatusChange("cancelled");
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
            <div className="flex gap-2">
              {nextStatus ? (
                <button
                  type="button"
                  onClick={() => onStatusChange(nextStatus)}
                  className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  {ACTION_LABELS[nextStatus] ?? "Update status"}
                </button>
              ) : null}
              {cancellable ? (
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Cancel order
                </button>
              ) : null}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
