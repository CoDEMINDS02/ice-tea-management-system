import { DeliveryBoard } from "@/components/delivery/delivery-board";

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Delivery</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Track delivery orders from the kitchen to the customer.
        </p>
      </div>

      <DeliveryBoard />
    </div>
  );
}
