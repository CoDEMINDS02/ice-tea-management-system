import { CustomersBoard } from "@/components/customers/customers-board";

export default function CustomersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Customers</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Everyone who has ordered, with how often and how much.
        </p>
      </div>

      <CustomersBoard />
    </div>
  );
}