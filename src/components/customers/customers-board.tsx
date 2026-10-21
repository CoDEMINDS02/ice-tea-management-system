"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { useOrders } from "@/components/orders/orders-provider";
import {
  buildCustomers,
  matchesCustomerSearch,
  sortCustomers,
  type CustomerSort,
} from "@/lib/customers";
import { formatCurrency, formatDateTime } from "@/lib/format";

const SORT_OPTIONS: { value: CustomerSort; label: string }[] = [
  { value: "recent", label: "Most recent order" },
  { value: "spent", label: "Highest spending" },
  { value: "orders", label: "Most orders" },
  { value: "name", label: "Name (A to Z)" },
];

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}

export function CustomersBoard() {
  const { orders } = useOrders();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<CustomerSort>("recent");

  const customers = useMemo(() => buildCustomers(orders), [orders]);

  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const query = search.trim();

  const visible = useMemo(
    () =>
      sortCustomers(
        customers.filter((customer) => matchesCustomerSearch(customer, query)),
        sortBy,
      ),
    [customers, query, sortBy],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Customers" value={String(customers.length)} />
        <SummaryCard title="Orders" value={String(totalOrders)} />
        <SummaryCard title="Total spent" value={formatCurrency(totalSpent)} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or phone"
              aria-label="Search customers"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="customerSort"
              className="text-sm font-medium text-neutral-700"
            >
              Sort by
            </label>
            <select
              id="customerSort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as CustomerSort)
              }
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          {visible.length} of {customers.length} customers
        </p>

        {customers.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
            <p className="text-sm text-neutral-500">
              No customers yet. They appear here after you create orders with a
              customer name.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center">
            <p className="text-sm text-neutral-500">
              No customers match your search.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Orders</th>
                  <th className="pb-2 pr-4 text-right font-medium">
                    Total spent
                  </th>
                  <th className="pb-2 font-medium">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {visible.map((customer) => (
                  <tr key={customer.id}>
                    <td className="py-3 pr-4">
                      <span className="block font-medium text-neutral-900">
                        {customer.name}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {customer.phone ?? "No phone"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-neutral-700">
                      {customer.orderCount}
                      {customer.cancelledCount > 0 ? (
                        <span className="block text-xs text-neutral-500">
                          {customer.cancelledCount} cancelled
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-right text-neutral-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="whitespace-nowrap py-3 text-neutral-500">
                      {formatDateTime(customer.lastOrderAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400">
        Demo only. Customers are built from orders. Walk-in and complimentary
        orders are not counted.
      </p>
    </div>
  );
}