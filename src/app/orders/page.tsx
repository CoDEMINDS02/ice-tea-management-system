import Link from "next/link";
import { Plus } from "lucide-react";

import { OrdersTable } from "@/components/orders/orders-table";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Orders</h2>
          <p className="mt-1 text-sm text-neutral-500">
            All orders, newest first.
          </p>
        </div>

        <Link
          href="/orders/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New order
        </Link>
      </div>

      <OrdersTable />
    </div>
  );
}
