import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NewOrderForm } from "@/components/orders/new-order-form";

export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <Link
          href="/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to orders
        </Link>
        <h2 className="text-xl font-semibold text-neutral-900">New order</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pick products, add customer details, and create the order.
        </p>
      </div>

      <NewOrderForm />
    </div>
  );
}
