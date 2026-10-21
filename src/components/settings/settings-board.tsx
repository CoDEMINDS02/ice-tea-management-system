"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { useOrders } from "@/components/orders/orders-provider";

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{children}</dd>
    </div>
  );
}

export function SettingsBoard() {
  const { orders, resetDemoData } = useOrders();
  const [confirming, setConfirming] = useState(false);
  const [justReset, setJustReset] = useState(false);

  function handleReset() {
    resetDemoData();
    setConfirming(false);
    setJustReset(true);
  }

  return (
    <div className="grid max-w-3xl gap-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Shop details</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Fixed in this demo. These cannot be edited yet.
        </p>
        <dl className="mt-2 divide-y divide-neutral-100">
          <InfoRow label="Shop name">Iced Tea House</InfoRow>
          <InfoRow label="Currency">Pakistani Rupee (Rs)</InfoRow>
          <InfoRow label="Time zone">Asia/Karachi (UTC+5)</InfoRow>
          <InfoRow label="Order number prefix">ITH-</InfoRow>
        </dl>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900">Demo data</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Orders are saved in this browser only, so they survive a page refresh
          but are not shared with other devices or people.
        </p>

        <dl className="mt-2 divide-y divide-neutral-100">
          <InfoRow label="Orders saved in this browser">{orders.length}</InfoRow>
        </dl>

        {confirming ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-neutral-800">
              Reset all orders to the original demo data? Any orders you
              created and any status changes will be lost. Only orders are
              reset.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Yes, reset orders
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Keep my orders
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setJustReset(false);
                setConfirming(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset demo orders
            </button>
            <p className="mt-2 text-xs text-neutral-500">
              Also refreshes the sample order times, so the dashboard and
              reports show recent days again.
            </p>
          </div>
        )}

        {justReset ? (
          <p
            role="status"
            className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800"
          >
            Demo orders restored.
          </p>
        ) : null}
      </section>
    </div>
  );
}
